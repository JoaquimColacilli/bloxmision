/**
 * Progress Service - Client-Side
 * Handles level completion, XP updates, and progress tracking
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    query,
    where,
    getDocs,
    serverTimestamp,
    increment,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { validateSolution, countBlocks } from "@/lib/game/blockValidator"
import { calculateXP, calculateStars, getPlayerLevel, getXPToNextLevel, getCurrentLevelXP } from "@/lib/game/xpCalculator"
import type { BlockInstance, LevelData } from "@/lib/types"

export interface SubmitProgressParams {
    userId: string
    levelId: string
    worldId: string
    level: LevelData
    blocks: BlockInstance[]
    usedHints: boolean
    executionTime: number
}

export interface SubmitProgressResult {
    success: boolean
    message: string
    xpEarned?: number
    totalXP?: number
    stars?: 1 | 2 | 3
    isOptimal?: boolean
    leveledUp?: boolean
    previousLevel?: string
    newLevel?: string
    isFirstCompletion?: boolean
}

/**
 * Submit level progress to Firestore
 */
export async function submitLevelProgress(
    params: SubmitProgressParams
): Promise<SubmitProgressResult> {
    const { userId, levelId, worldId, level, blocks, usedHints, executionTime } = params

    try {
        // 1. Validate solution client-side
        const validation = validateSolution(blocks, level)

        if (!validation.success) {
            return {
                success: false,
                message: validation.error?.message || "Error de validación",
            }
        }

        if (!validation.objectivesMet) {
            return {
                success: false,
                message: "No completaste todos los objetivos del nivel",
            }
        }

        // 2. Check if first completion
        const isFirstCompletion = await checkIsFirstCompletion(userId, levelId)

        // 3. Calculate XP
        const xpResult = calculateXP({
            baseXP: level.xpReward ?? 50,
            usedHints,
            isOptimal: validation.isOptimal,
            isFirstCompletion,
        })

        // 4. Calculate stars
        const optimalBlockCount = level.optimalSolution?.blockCount ?? validation.blockCount
        const stars = calculateStars(validation.blockCount, optimalBlockCount, usedHints)

        // 5. Get current user XP for level calculation
        const userDoc = await import("firebase/firestore").then(({ getDoc }) =>
            getDoc(doc(db, "users", userId))
        )
        const currentTotalXP = userDoc.exists() ? userDoc.data().totalXP || 0 : 0
        const previousLevel = getPlayerLevel(currentTotalXP)

        // 6. Save progress record (immutable)
        await addDoc(collection(db, "progress"), {
            userId,
            levelId,
            worldId,
            completed: true,
            attempts: 1,
            usedHints: usedHints ? 1 : 0,
            blockCount: validation.blockCount,
            isOptimal: validation.isOptimal,
            stars,
            xpEarned: xpResult.totalXP,
            executionTime,
            isFirstCompletion,
            completedAt: serverTimestamp(),
        })

        // 7. Update user XP
        const newTotalXP = currentTotalXP + xpResult.totalXP
        const newLevel = getPlayerLevel(newTotalXP)
        const leveledUp = previousLevel !== newLevel

        await updateDoc(doc(db, "users", userId), {
            totalXP: increment(xpResult.totalXP),
            currentXP: getCurrentLevelXP(newTotalXP),
            xpToNextLevel: getXPToNextLevel(newTotalXP),
            playerLevel: newLevel,
            updatedAt: serverTimestamp(),
        })

        // 8. Build success message
        let message = `¡Nivel completado! +${xpResult.totalXP} XP`
        if (leveledUp) {
            message = `🎉 ¡Subiste a ${newLevel}! +${xpResult.totalXP} XP`
        }
        if (stars === 3) {
            message += " ⭐⭐⭐"
        }

        return {
            success: true,
            message,
            xpEarned: xpResult.totalXP,
            totalXP: newTotalXP,
            stars,
            isOptimal: validation.isOptimal,
            leveledUp,
            previousLevel,
            newLevel,
            isFirstCompletion,
        }
    } catch (error) {
        console.error("Error submitting progress:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "Error al guardar progreso",
        }
    }
}

/**
 * Check if this is the first time user completes this level
 */
async function checkIsFirstCompletion(
    userId: string,
    levelId: string
): Promise<boolean> {
    const q = query(
        collection(db, "progress"),
        where("userId", "==", userId),
        where("levelId", "==", levelId)
    )

    const snapshot = await getDocs(q)
    return snapshot.empty
}

/**
 * Get user's progress for a specific level
 */
export async function getLevelProgress(
    userId: string,
    levelId: string
): Promise<{ completed: boolean; bestStars: number; attempts: number } | null> {
    const q = query(
        collection(db, "progress"),
        where("userId", "==", userId),
        where("levelId", "==", levelId)
    )

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
        return null
    }

    let bestStars = 0
    let totalAttempts = 0

    snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.stars > bestStars) {
            bestStars = data.stars
        }
        totalAttempts++
    })

    return {
        completed: true,
        bestStars,
        attempts: totalAttempts,
    }
}

/**
 * Get all progress for a user in a world
 */
export async function getWorldProgress(
    userId: string,
    worldId: string
): Promise<Map<string, { stars: number; completed: boolean }>> {
    const q = query(
        collection(db, "progress"),
        where("userId", "==", userId),
        where("worldId", "==", worldId)
    )

    const snapshot = await getDocs(q)
    const progressMap = new Map<string, { stars: number; completed: boolean }>()

    snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const existing = progressMap.get(data.levelId)

        if (!existing || data.stars > existing.stars) {
            progressMap.set(data.levelId, {
                stars: data.stars,
                completed: true,
            })
        }
    })

    return progressMap
}
