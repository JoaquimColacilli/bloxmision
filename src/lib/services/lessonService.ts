import {
    doc,
    getDoc,
    setDoc,
    runTransaction,
    Timestamp,
    collection,
    getDocs
} from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { LessonProgress, AcademyLesson, AcademyUserProgress } from "../types/academy"
import { calculateStars } from "../utils/academy-logic"
import { allLessons } from "@/lib/lessons-data" // All lessons in unified array

// Collection References
const USERS_COLLECTION = "users"
const LESSON_PROGRESS_COLLECTION = "lessonProgress"

/**
 * Get a lesson by ID.
 * Searches through all lessons (basic, loop, conditional)
 */
export async function getLessonById(lessonId: string): Promise<AcademyLesson | null> {
    const lesson = allLessons.find(l => l.id === lessonId)
    if (lesson) {
        return lesson as unknown as AcademyLesson
    }
    return null
}

/**
 * Get granular lesson progress for a user
 */
export async function getLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const ref = doc(db, USERS_COLLECTION, userId, LESSON_PROGRESS_COLLECTION, lessonId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
        return snap.data() as LessonProgress
    }
    return null
}

/**
 * Save partial progress (e.g. updating current exercise, attempts)
 * This is a simple merge, NOT for critical rewards.
 */
export async function saveLessonProgress(
    userId: string,
    lessonId: string,
    data: Partial<LessonProgress>
): Promise<void> {
    const ref = doc(db, USERS_COLLECTION, userId, LESSON_PROGRESS_COLLECTION, lessonId)

    await setDoc(ref, {
        ...data,
        updatedAt: Timestamp.now(),
    }, { merge: true })
}

/**
 * Award Rewards Transactionally
 * 
 * CRITICAL: This method governs the +15 Coins logic.
 * It uses a Firestore Transaction to ensure consistency.
 * 
 * Logic:
 * 1. Read User DOC and LessonProgress DOC
 * 2. Check if rewards already granted
 * 3. Calculate Stars
 * 4. Update LessonProgress (set completed, stars, rewardsGranted=true)
 * 5. Update User (add coins, update summary stats)
 */
export async function awardLessonRewards(
    userId: string,
    lessonId: string,
    finalStats: {
        quizScore: number
        totalQuestions: number
        hintsUsed: number
        attempts: number
        totalExercises: number
    }
): Promise<{ coinsAwarded: number; starsEarned: number }> {
    return runTransaction(db, async (transaction) => {
        const userRef = doc(db, USERS_COLLECTION, userId)
        const progressRef = doc(db, USERS_COLLECTION, userId, LESSON_PROGRESS_COLLECTION, lessonId)

        const userDoc = await transaction.get(userRef)
        const progressDoc = await transaction.get(progressRef)

        if (!userDoc.exists()) {
            throw new Error("User does not exist")
        }

        const existingProgress = progressDoc.exists() ? (progressDoc.data() as LessonProgress) : null

        // 1. Calculate Stars
        const stars = calculateStars(
            finalStats.quizScore,
            finalStats.totalQuestions,
            finalStats.hintsUsed,
            finalStats.attempts,
            finalStats.totalExercises
        )

        // 2. Check overlap
        const alreadyGranted = existingProgress?.rewardsGranted?.jorCoins === true
        const coinsToAdd = alreadyGranted ? 0 : 15

        // 3. Prepare Progress Update
        const progressUpdate: any = {
            lessonId,
            userId,
            status: "completed",
            quizScore: finalStats.quizScore,
            attemptsTotal: finalStats.attempts + (existingProgress?.attemptsTotal || 0), // Accumulate
            hintsUsedTotal: finalStats.hintsUsed + (existingProgress?.hintsUsedTotal || 0), // Accumulate
            starsEarned: Math.max(stars, existingProgress?.starsEarned || 0), // Keep best score
            updatedAt: Timestamp.now(),
        }

        if (!alreadyGranted) {
            progressUpdate.rewardsGranted = {
                jorCoins: true,
                grantedAt: Timestamp.now()
            }
        }

        transaction.set(progressRef, progressUpdate, { merge: true })

        // 4. Update User Coins & Summary
        const userData = userDoc.data()
        const currentCoins = userData.jorCoins || 0
        const currentAcademy = userData.academyProgress || {
            completedLessons: [],
            totalStars: 0,
            unlockedSections: ["basics"]
        }

        const isNewCompletion = !currentAcademy.completedLessons.includes(lessonId)

        const newAcademyProgress: AcademyUserProgress = {
            ...currentAcademy,
            completedLessons: isNewCompletion
                ? [...currentAcademy.completedLessons, lessonId]
                : currentAcademy.completedLessons,
            totalStars: currentAcademy.totalStars + (stars - (existingProgress?.starsEarned || 0)), // Add delta
            lastPlayedLessonId: lessonId
        }

        transaction.update(userRef, {
            jorCoins: currentCoins + coinsToAdd,
            academyProgress: newAcademyProgress
        })

        return { coinsAwarded: coinsToAdd, starsEarned: stars }
    })
}
