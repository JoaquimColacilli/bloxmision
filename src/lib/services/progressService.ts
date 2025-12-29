import {
    collection,
    addDoc,
    doc,
    updateDoc,
    increment,
    serverTimestamp,
    query,
    where,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { BlockValidator } from '../game/blockValidator';
import { calculateXP } from './xpCalculator';
import { updateUserStreak } from './streakService';
import type { Block, Level } from '@/src/types';

export interface SubmitProgressResult {
    success: boolean;
    xpEarned?: number;
    isOptimal?: boolean;
    message?: string;
}

/**
 * Guarda el progreso del nivel
 */
export async function submitLevelProgress(
    userId: string,
    levelId: string,
    level: Level,
    blocks: Block[],
    attempts: number,
    usedHints: number
): Promise<SubmitProgressResult> {
    try {
        // 1. Validar solución client-side
        const validator = new BlockValidator(level);
        const result = validator.validate(blocks);

        if (!result.success || !result.objectivesMet) {
            return {
                success: false,
                message: result.error?.message || 'No se completaron todos los objetivos'
            };
        }

        // 2. Verificar si ya completó este nivel (idempotencia)
        const existingProgress = await checkIfAlreadyCompleted(userId, levelId);
        if (existingProgress) {
            return {
                success: true,
                message: 'Nivel ya completado anteriormente',
                xpEarned: 0
            };
        }

        // 3. Calcular XP
        const xp = calculateXP({
            baseXP: level.xpReward,
            usedHints: usedHints > 0,
            isOptimal: result.isOptimal
        });

        // 4. Guardar progreso
        await addDoc(collection(db, 'progress'), {
            userId,
            levelId,
            completed: true,
            attempts,
            usedHints,
            codeUsed: blocks,
            isOptimal: result.isOptimal,
            completedAt: serverTimestamp(),
            xpEarned: xp
        });

        // 5. Actualizar user doc (XP y nivel)
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            totalXP: increment(xp),
            currentLevel: increment(1)
        });

        // 6. Actualizar streak
        await updateUserStreak(userId);

        return {
            success: true,
            xpEarned: xp,
            isOptimal: result.isOptimal
        };

    } catch (error: any) {
        console.error('Error submitting progress:', error);
        return {
            success: false,
            message: 'Error al guardar el progreso'
        };
    }
}

/**
 * Verificar si ya completó el nivel
 */
async function checkIfAlreadyCompleted(
    userId: string,
    levelId: string
): Promise<boolean> {
    const q = query(
        collection(db, 'progress'),
        where('userId', '==', userId),
        where('levelId', '==', levelId),
        limit(1)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
}
