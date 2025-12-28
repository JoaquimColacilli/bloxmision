/**
 * XP Calculator - Client-Side Game Logic
 * Calculates XP rewards for level completion
 */

export interface XPCalculationParams {
    baseXP: number
    usedHints: boolean
    isOptimal: boolean
    isFirstCompletion?: boolean
}

export interface XPCalculationResult {
    totalXP: number
    baseXP: number
    hintBonus: number
    optimalBonus: number
    breakdown: string[]
}

// XP Constants
const HINT_BONUS = 20      // Bonus for NOT using hints
const OPTIMAL_BONUS = 30   // Bonus for optimal solution
const REPLAY_MULTIPLIER = 0.25  // 25% XP on replay

/**
 * Calculate XP for a level completion
 */
export function calculateXP(params: XPCalculationParams): XPCalculationResult {
    const { baseXP, usedHints, isOptimal, isFirstCompletion = true } = params

    const breakdown: string[] = []

    // Base XP (reduced for replays)
    let actualBaseXP = baseXP
    if (!isFirstCompletion) {
        actualBaseXP = Math.floor(baseXP * REPLAY_MULTIPLIER)
        breakdown.push(`Base (replay): +${actualBaseXP} XP`)
    } else {
        breakdown.push(`Base: +${actualBaseXP} XP`)
    }

    // Hint bonus (only if didn't use hints AND first completion)
    let hintBonus = 0
    if (!usedHints && isFirstCompletion) {
        hintBonus = HINT_BONUS
        breakdown.push(`Sin pistas: +${hintBonus} XP`)
    }

    // Optimal bonus (only on first completion)
    let optimalBonus = 0
    if (isOptimal && isFirstCompletion) {
        optimalBonus = OPTIMAL_BONUS
        breakdown.push(`Código óptimo: +${optimalBonus} XP`)
    }

    const totalXP = actualBaseXP + hintBonus + optimalBonus

    return {
        totalXP,
        baseXP: actualBaseXP,
        hintBonus,
        optimalBonus,
        breakdown,
    }
}

/**
 * Calculate stars based on performance
 */
export function calculateStars(
    blockCount: number,
    optimalBlockCount: number,
    usedHints: boolean
): 1 | 2 | 3 {
    const ratio = blockCount / Math.max(optimalBlockCount, 1)

    // 3 stars: optimal or near-optimal without hints
    if (ratio <= 1.0 && !usedHints) {
        return 3
    }

    // 2 stars: good solution (up to 1.5x optimal)
    if (ratio <= 1.5) {
        return 2
    }

    // 1 star: completed
    return 1
}

/**
 * Player level thresholds
 */
export const PLAYER_LEVELS = [
    { name: "Grumete", minXP: 0 },
    { name: "Marinero", minXP: 100 },
    { name: "Navegante", minXP: 300 },
    { name: "Timonel", minXP: 600 },
    { name: "Contramaestre", minXP: 1000 },
    { name: "Piloto", minXP: 1500 },
    { name: "Primer Oficial", minXP: 2200 },
    { name: "Capitán", minXP: 3000 },
    { name: "Almirante", minXP: 4000 },
    { name: "Leyenda Pirata", minXP: 5500 },
] as const

/**
 * Get player level name based on total XP
 */
export function getPlayerLevel(totalXP: number): string {
    const level = [...PLAYER_LEVELS]
        .reverse()
        .find((l) => totalXP >= l.minXP)

    return level?.name ?? "Grumete"
}

/**
 * Get XP needed to reach next level
 */
export function getXPToNextLevel(totalXP: number): number {
    const currentIndex = PLAYER_LEVELS.findIndex(
        (l, i, arr) => totalXP >= l.minXP && (i === arr.length - 1 || totalXP < arr[i + 1].minXP)
    )

    if (currentIndex === PLAYER_LEVELS.length - 1) {
        return 0 // Max level
    }

    return PLAYER_LEVELS[currentIndex + 1].minXP - totalXP
}

/**
 * Get current XP progress within current level
 */
export function getCurrentLevelXP(totalXP: number): number {
    const currentLevel = [...PLAYER_LEVELS]
        .reverse()
        .find((l) => totalXP >= l.minXP)

    return totalXP - (currentLevel?.minXP ?? 0)
}
