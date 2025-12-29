import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { calculateXP, getPlayerLevel, getCurrentLevelXP, getNextLevelThreshold, FRAGMENT_BONUS } from './xpCalculator';
import { updateUserStreak } from './streakService';
import type { Block, Level, TreasureFragmentConfig } from '@/src/types';

const MAX_FRAGMENTS = 15;  // Used in submitLevelProgress

export interface SubmitProgressResult {
    success: boolean;
    xpEarned?: number;
    isOptimal?: boolean;
    fragmentUnlocked?: string;  // fragmentId if a new fragment was unlocked
    totalFragments?: number;     // Total fragments after this completion
    mapCompleted?: boolean;      // True if this was the 15th fragment
    message?: string;
}

/**
 * Guarda el progreso del nivel usando transacciones atómicas.
 * 
 * Usa docId determinístico: /users/{uid}/progress/{levelId}
 * Si el doc ya existe, retorna success=true con xpEarned=0 (idempotencia).
 * 
 * La transacción:
 * 1. Verifica si /users/{uid}/progress/{levelId} ya existe
 * 2. Calcula XP base + bonus fragmento si aplica
 * 3. Crea progress doc Y actualiza user doc atómicamente
 */
export async function submitLevelProgress(
    userId: string,
    levelId: string,
    level: Level,
    blocks: Block[],
    attempts: number,
    usedHints: number
): Promise<SubmitProgressResult> {
    // Deterministic document references
    const userRef = doc(db, 'users', userId);
    const progressRef = doc(db, 'users', userId, 'progress', levelId);

    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Check if progress already exists (idempotency)
            const progressSnap = await transaction.get(progressRef);
            if (progressSnap.exists()) {
                return {
                    success: true,
                    xpEarned: 0,
                    message: 'Nivel ya completado anteriormente'
                };
            }

            // 2. Get current user data
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) {
                throw new Error('Usuario no encontrado');
            }
            const userData = userSnap.data();

            // 3. Calculate if solution is optimal
            const isOptimal = blocks.length <= (level.optimalSolution?.blockCount || 999);

            // 4. Check if this level grants a fragment
            const fragment = level.treasureFragment;
            const currentFragmentsMap = userData.unlockedFragmentsMap || {};
            const willUnlockFragment = fragment && !currentFragmentsMap[fragment.fragmentId];

            // 5. Calculate XP (includes fragment bonus if applicable)
            const xpResult = calculateXP({
                baseXP: level.xpReward || 50,
                usedHints: usedHints > 0,
                isOptimal: isOptimal,
                isFirstCompletion: true,
                fragmentBonus: willUnlockFragment
            });

            // 6. Calculate new user values
            const currentTotalXP = userData.totalXP || 0;
            const newTotalXP = currentTotalXP + xpResult.totalXP;

            // 7. Update fragments map if unlocking new fragment
            const newFragmentsMap = { ...currentFragmentsMap };
            if (willUnlockFragment && fragment) {
                newFragmentsMap[fragment.fragmentId] = true;
            }
            const newFragmentsCount = Object.keys(newFragmentsMap).length;
            const isMapComplete = newFragmentsCount === MAX_FRAGMENTS;

            // 8. Calculate stars
            const stars = isOptimal ? 3 : (usedHints === 0 ? 2 : 1);

            // 9. Create progress document (ATOMIC)
            transaction.set(progressRef, {
                levelId,
                worldId: String(level.worldId || "1"),
                completed: true,
                attempts,
                usedHints,
                blockCount: blocks.length,
                isOptimal: isOptimal,
                stars,
                xpEarned: xpResult.totalXP,
                completedAt: serverTimestamp(),
                isFirstCompletion: true,
                grantedFragmentId: willUnlockFragment && fragment ? fragment.fragmentId : null
            });

            // 10. Update user document (ATOMIC - same transaction)
            const userUpdate: Record<string, any> = {
                totalXP: newTotalXP,
                playerLevel: getPlayerLevel(newTotalXP),
                currentXP: getCurrentLevelXP(newTotalXP),
                nextLevelThreshold: getNextLevelThreshold(newTotalXP),
                updatedAt: serverTimestamp()
            };

            // Only update fragment fields if unlocking new fragment
            if (willUnlockFragment) {
                userUpdate.unlockedFragmentsMap = newFragmentsMap;
                userUpdate.treasureFragmentsCount = newFragmentsCount;
                if (isMapComplete) {
                    userUpdate.mapCompleted = true;
                }
            }

            transaction.update(userRef, userUpdate);

            return {
                success: true,
                xpEarned: xpResult.totalXP,
                isOptimal: isOptimal,
                fragmentUnlocked: willUnlockFragment && fragment ? fragment.fragmentId : undefined,
                totalFragments: newFragmentsCount,
                mapCompleted: isMapComplete
            };
        });

        // Update streak outside transaction (non-critical)
        try {
            await updateUserStreak(userId);
        } catch (e) {
            console.warn('Failed to update streak:', e);
        }

        return result;

    } catch (error: any) {
        console.error('Error submitting progress:', error);
        return {
            success: false,
            message: 'Error al guardar el progreso: ' + (error.message || 'Error desconocido')
        };
    }
}

/**
 * Recalculate user's XP from all progress records.
 * This fixes any XP mismatch from previous buggy saves.
 * Note: This now reads from subcollection /users/{uid}/progress/*
 */
export async function recalculateUserXP(userId: string): Promise<number> {
    // Import collection and getDocs only when needed
    const { collection, getDocs, updateDoc } = await import('firebase/firestore');

    try {
        // 1. Query all progress records from subcollection
        const progressRef = collection(db, 'users', userId, 'progress');
        const snapshot = await getDocs(progressRef);

        // 2. Sum xpEarned from all unique level completions
        let totalXP = 0;

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const xpEarned = data.xpEarned as number || 0;
            totalXP += xpEarned;
        });

        // 3. Calculate derived values
        const playerLevel = getPlayerLevel(totalXP);
        const nextLevelThreshold = getNextLevelThreshold(totalXP);
        const currentXP = getCurrentLevelXP(totalXP);

        // 4. Update user document (only XP-related fields)
        // NOTE: We do NOT update fragment fields here because Firestore rules
        // only allow the fragment map to grow, not be rewritten. Fragment
        // updates happen atomically during level completion.
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            totalXP,
            playerLevel,
            nextLevelThreshold,
            currentXP,
            updatedAt: serverTimestamp()
        });

        console.log(`[XP Sync] Recalculated XP for user ${userId}: ${totalXP} XP from ${snapshot.size} levels`);

        return totalXP;
    } catch (error) {
        console.error('[XP Sync] Error recalculating XP:', error);
        throw error;
    }
}
