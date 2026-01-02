"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/src/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { WORLD_DEFINITIONS } from "@/src/lib/services/worldService"

/**
 * ProgressContext - Centralized caching for user progress data
 * 
 * This context loads the user's progress ONCE when they log in,
 * and provides computed values without additional Firestore reads.
 * 
 * Call `invalidateCache()` after completing a level to trigger a refresh.
 */

interface ProgressData {
    levelId: string
    stars: number
    xpEarned: number
    completedAt: any
}

interface ProgressContextValue {
    /** Whether progress data is still loading */
    isLoading: boolean

    /** Set of completed level IDs (e.g., "1-1", "1-2", "2-1") */
    completedLevels: Set<string>

    /** Map of levelId -> progress data */
    progressMap: Map<string, ProgressData>

    /** Check if a specific level is completed */
    isLevelCompleted: (levelId: string) => boolean

    /** Get max unlocked level number for a world (returns next playable level) */
    getMaxUnlockedLevel: (worldNumericId: string) => number

    /** Get completed level count for a world */
    getWorldCompletedCount: (worldId: string) => number

    /** Check if a world is unlocked */
    isWorldUnlocked: (worldId: string) => boolean

    /** Get the current world (first unlocked but incomplete) */
    getCurrentWorldId: () => string | null

    /** Invalidate cache and reload from Firestore */
    invalidateCache: () => Promise<void>

    /** Last time the cache was updated */
    lastUpdated: number | null
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

// Helper to convert numeric world ID to semantic
const numericToSemantic: Record<string, string> = {
    "1": "secuencia",
    "2": "bucle",
    "3": "decision",
    "4": "memoria",
    "5": "funcion",
}

const semanticToNumeric: Record<string, string> = {
    "secuencia": "1",
    "bucle": "2",
    "decision": "3",
    "memoria": "4",
    "funcion": "5",
}

export function ProgressProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(true)
    const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set())
    const [progressMap, setProgressMap] = useState<Map<string, ProgressData>>(new Map())
    const [lastUpdated, setLastUpdated] = useState<number | null>(null)

    // Load progress once when user logs in
    const loadProgress = useCallback(async () => {
        if (!user) {
            setCompletedLevels(new Set())
            setProgressMap(new Map())
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            const progressRef = collection(db, `users/${user.id}/progress`)
            const snapshot = await getDocs(progressRef)

            const levels = new Set<string>()
            const pMap = new Map<string, ProgressData>()

            snapshot.forEach(doc => {
                const levelId = doc.id
                levels.add(levelId)
                pMap.set(levelId, {
                    levelId,
                    stars: doc.data().stars || 0,
                    xpEarned: doc.data().xpEarned || 0,
                    completedAt: doc.data().completedAt,
                })
            })

            setCompletedLevels(levels)
            setProgressMap(pMap)
            setLastUpdated(Date.now())
        } catch (error) {
            console.error("[ProgressContext] Error loading progress:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    // Load on mount and when user changes
    useEffect(() => {
        loadProgress()
    }, [loadProgress])

    // Check if a level is completed
    const isLevelCompleted = useCallback((levelId: string): boolean => {
        return completedLevels.has(levelId)
    }, [completedLevels])

    // Get the max unlocked level for a world (next playable)
    const getMaxUnlockedLevel = useCallback((worldNumericId: string): number => {
        let maxCompleted = 0

        completedLevels.forEach(levelId => {
            const [worldNum, levelNumStr] = levelId.split('-')
            if (worldNum === worldNumericId) {
                const levelNum = parseInt(levelNumStr, 10)
                if (!isNaN(levelNum) && levelNum > maxCompleted) {
                    maxCompleted = levelNum
                }
            }
        })

        // Return next level (maxCompleted + 1), minimum 1
        return maxCompleted + 1
    }, [completedLevels])

    // Get completed count for a world
    const getWorldCompletedCount = useCallback((worldId: string): number => {
        const numericId = semanticToNumeric[worldId] || worldId
        let count = 0

        completedLevels.forEach(levelId => {
            const [worldNum] = levelId.split('-')
            if (worldNum === numericId) {
                count++
            }
        })

        return count
    }, [completedLevels])

    // Check if world is unlocked
    const isWorldUnlocked = useCallback((worldId: string): boolean => {
        const worldDef = WORLD_DEFINITIONS.find(w => w.id === worldId)
        if (!worldDef) return false

        // First world is always unlocked
        if (worldDef.order === 1) return true

        // Check if required world is complete
        if (worldDef.requiredWorld) {
            const requiredDef = WORLD_DEFINITIONS.find(w => w.id === worldDef.requiredWorld)
            if (!requiredDef) return false

            const completedCount = getWorldCompletedCount(worldDef.requiredWorld)
            return completedCount >= requiredDef.totalLevels
        }

        return false
    }, [getWorldCompletedCount])

    // Get current world (first unlocked but incomplete)
    const getCurrentWorldId = useCallback((): string | null => {
        for (const world of WORLD_DEFINITIONS) {
            if (isWorldUnlocked(world.id)) {
                const completedCount = getWorldCompletedCount(world.id)
                if (completedCount < world.totalLevels) {
                    return world.id
                }
            }
        }
        return null
    }, [isWorldUnlocked, getWorldCompletedCount])

    // Invalidate and reload cache
    const invalidateCache = useCallback(async () => {
        await loadProgress()
    }, [loadProgress])

    return (
        <ProgressContext.Provider
            value={{
                isLoading,
                completedLevels,
                progressMap,
                isLevelCompleted,
                getMaxUnlockedLevel,
                getWorldCompletedCount,
                isWorldUnlocked,
                getCurrentWorldId,
                invalidateCache,
                lastUpdated,
            }}
        >
            {children}
        </ProgressContext.Provider>
    )
}

export function useProgress() {
    const context = useContext(ProgressContext)
    if (!context) {
        throw new Error("useProgress must be used within a ProgressProvider")
    }
    return context
}
