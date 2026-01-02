/**
 * Lesson Persistence Service - OPTIMIZED
 * 
 * Tracks which block lessons the user has seen.
 * 
 * OPTIMIZATION STRATEGY:
 * - localStorage is the PRIMARY source for reads (instant, no Firestore cost)
 * - Firestore is used for persistence (writes only, synced in background)
 * - In-memory cache to avoid repeated localStorage reads
 * - Batch writes to minimize Firestore operations
 * 
 * Silent failure: never blocks the game flow
 */

import { doc, updateDoc, setDoc } from "firebase/firestore"
import { db } from "@/src/lib/firebase"

const STORAGE_VERSION = "v1"
const STORAGE_PREFIX = `bloxmision.lessons.${STORAGE_VERSION}`

// In-memory cache for the current session
let seenLessonsCache: Set<string> | null = null

/**
 * Initialize cache from localStorage
 */
function initCacheFromLocalStorage(): Set<string> {
    if (seenLessonsCache) return seenLessonsCache

    seenLessonsCache = new Set()

    try {
        if (typeof window !== "undefined" && window.localStorage) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i)
                if (key?.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === "true") {
                    const blockId = key.replace(`${STORAGE_PREFIX}.`, "")
                    seenLessonsCache.add(blockId)
                }
            }
        }
    } catch {
        // Silent failure
    }

    return seenLessonsCache
}

/**
 * Mark a lesson as seen for a user
 * 
 * OPTIMIZED: 
 * - Writes to localStorage FIRST (instant, no network)
 * - Updates cache
 * - Syncs to Firestore in background (no getDoc needed)
 */
export async function markLessonSeen(userId: string | null, blockId: string): Promise<void> {
    // 1. Update localStorage and cache immediately (no Firestore read needed)
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(`${STORAGE_PREFIX}.${blockId}`, "true")
        }
        initCacheFromLocalStorage().add(blockId)
    } catch {
        // Silent failure
    }

    // 2. Sync to Firestore in background (fire-and-forget, no await needed for UX)
    if (userId) {
        syncLessonToFirestore(userId, blockId).catch(err => {
            console.warn("[LessonService] Firebase sync failed:", err)
        })
    }
}

/**
 * Sync a single lesson to Firestore (background, no blocking)
 */
async function syncLessonToFirestore(userId: string, blockId: string): Promise<void> {
    const userRef = doc(db, "users", userId)

    try {
        // Use setDoc with merge to avoid needing a getDoc first
        await setDoc(userRef, {
            seenLessons: { [blockId]: true },
        }, { merge: true })
    } catch (error) {
        // If setDoc fails, try updateDoc (document might exist with different structure)
        try {
            await updateDoc(userRef, {
                [`seenLessons.${blockId}`]: true,
            })
        } catch {
            // Both failed, give up silently
        }
    }
}

/**
 * Check if a user has seen a specific lesson
 * 
 * OPTIMIZED: Uses cache/localStorage ONLY (no Firestore read)
 */
export async function hasSeenLesson(userId: string | null, blockId: string): Promise<boolean> {
    // Check cache first (instant)
    const cache = initCacheFromLocalStorage()
    return cache.has(blockId)
}

/**
 * Get all seen lessons for a user
 * 
 * OPTIMIZED: Uses cache/localStorage ONLY (no Firestore read)
 */
export async function getSeenLessons(userId: string | null): Promise<string[]> {
    const cache = initCacheFromLocalStorage()
    return Array.from(cache)
}

/**
 * Get unseen lessons from a list of blocks
 * Non-blocking check using cache
 */
export async function getUnseenLessons(userId: string | null, blockIds: string[]): Promise<string[]> {
    const cache = initCacheFromLocalStorage()
    return blockIds.filter((id) => !cache.has(id))
}

/**
 * Mark multiple lessons as seen at once (batch)
 * 
 * OPTIMIZED: 
 * - Updates localStorage/cache for all at once
 * - Single Firestore write with all lessons
 */
export async function markMultipleLessonsSeen(userId: string | null, blockIds: string[]): Promise<void> {
    if (blockIds.length === 0) return

    // 1. Update localStorage and cache for all blocks
    const cache = initCacheFromLocalStorage()

    for (const blockId of blockIds) {
        try {
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem(`${STORAGE_PREFIX}.${blockId}`, "true")
            }
            cache.add(blockId)
        } catch {
            // Silent failure
        }
    }

    // 2. Single batch write to Firestore
    if (userId) {
        try {
            const userRef = doc(db, "users", userId)
            const updates = blockIds.reduce((acc, blockId) => ({
                ...acc,
                [blockId]: true
            }), {} as Record<string, boolean>)

            await setDoc(userRef, {
                seenLessons: updates,
            }, { merge: true })
        } catch (error) {
            console.warn("[LessonService] Batch Firebase sync failed:", error)
        }
    }
}

/**
 * Clear the in-memory cache (useful for logout)
 */
export function clearLessonCache(): void {
    seenLessonsCache = null
}
