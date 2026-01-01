/**
 * Lesson Persistence Service
 * 
 * Tracks which block lessons the user has seen.
 * Priority: Firebase/Firestore if user is authenticated
 * Fallback: localStorage with versioned keys
 * Silent failure: never blocks the game flow
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/src/lib/firebase"

const STORAGE_VERSION = "v1"
const STORAGE_PREFIX = `bloxmision.lessons.${STORAGE_VERSION}`

/**
 * Mark a lesson as seen for a user
 */
export async function markLessonSeen(userId: string | null, blockId: string): Promise<void> {
    // Try Firebase first if authenticated
    if (userId) {
        try {
            const userRef = doc(db, "users", userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const data = userDoc.data()
                const seenLessons = data?.seenLessons || {}

                if (!seenLessons[blockId]) {
                    await updateDoc(userRef, {
                        [`seenLessons.${blockId}`]: true,
                    })
                }
            } else {
                // Create the document with seenLessons
                await setDoc(userRef, {
                    seenLessons: { [blockId]: true },
                }, { merge: true })
            }
            return
        } catch (error) {
            console.warn("[LessonService] Firebase write failed, falling back to localStorage:", error)
        }
    }

    // Fallback to localStorage
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            const key = `${STORAGE_PREFIX}.${blockId}`
            localStorage.setItem(key, "true")
        }
    } catch {
        // Silent failure - don't block the game
    }
}

/**
 * Check if a user has seen a specific lesson
 */
export async function hasSeenLesson(userId: string | null, blockId: string): Promise<boolean> {
    // Try Firebase first if authenticated
    if (userId) {
        try {
            const userRef = doc(db, "users", userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const data = userDoc.data()
                const seenLessons = data?.seenLessons || {}
                return seenLessons[blockId] === true
            }
            return false
        } catch (error) {
            console.warn("[LessonService] Firebase read failed, falling back to localStorage:", error)
        }
    }

    // Fallback to localStorage
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            const key = `${STORAGE_PREFIX}.${blockId}`
            return localStorage.getItem(key) === "true"
        }
    } catch {
        // Silent failure
    }

    return false
}

/**
 * Get all seen lessons for a user
 */
export async function getSeenLessons(userId: string | null): Promise<string[]> {
    const seenBlockIds: string[] = []

    // Try Firebase first if authenticated
    if (userId) {
        try {
            const userRef = doc(db, "users", userId)
            const userDoc = await getDoc(userRef)

            if (userDoc.exists()) {
                const data = userDoc.data()
                const seenLessons = data?.seenLessons || {}
                return Object.keys(seenLessons).filter((key) => seenLessons[key] === true)
            }
        } catch (error) {
            console.warn("[LessonService] Firebase read failed, falling back to localStorage:", error)
        }
    }

    // Fallback to localStorage
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key?.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === "true") {
                    const blockId = key.replace(`${STORAGE_PREFIX}.`, "")
                    seenBlockIds.push(blockId)
                }
            }
        }
    } catch {
        // Silent failure
    }

    return seenBlockIds
}

/**
 * Get unseen lessons from a list of blocks
 * Non-blocking async check
 */
export async function getUnseenLessons(userId: string | null, blockIds: string[]): Promise<string[]> {
    const seenLessons = await getSeenLessons(userId)
    return blockIds.filter((id) => !seenLessons.includes(id))
}

/**
 * Mark multiple lessons as seen at once (batch)
 */
export async function markMultipleLessonsSeen(userId: string | null, blockIds: string[]): Promise<void> {
    for (const blockId of blockIds) {
        await markLessonSeen(userId, blockId)
    }
}
