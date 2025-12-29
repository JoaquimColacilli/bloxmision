/**
 * XP Calculator - Client-Side Game Logic
 * Calculates XP rewards for level completion
 */

export interface XPCalculationParams {
    baseXP: number
    usedHints: boolean
    isOptimal: boolean
    isFirstCompletion?: boolean
    fragmentBonus?: boolean  // +100 XP for unlocking a new fragment
}

export interface XPCalculationResult {
    totalXP: number
    baseXP: number
    hintBonus: number
    optimalBonus: number
    fragmentBonus: number
    breakdown: string[]
}

// XP Constants
const HINT_BONUS = 20        // Bonus for NOT using hints
const OPTIMAL_BONUS = 30     // Bonus for optimal solution
const REPLAY_MULTIPLIER = 0.25  // 25% XP on replay
export const FRAGMENT_BONUS = 100  // Bonus for unlocking a treasure fragment

/**
 * Calculate XP for a level completion
 */
export function calculateXP(params: XPCalculationParams): XPCalculationResult {
    const { baseXP, usedHints, isOptimal, isFirstCompletion = true, fragmentBonus: grantFragment = false } = params

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

    // Fragment bonus (only on first completion AND if fragment was unlocked)
    let fragmentBonusXP = 0
    if (grantFragment && isFirstCompletion) {
        fragmentBonusXP = FRAGMENT_BONUS
        breakdown.push(`¡Fragmento del mapa!: +${fragmentBonusXP} XP`)
    }

    const totalXP = actualBaseXP + hintBonus + optimalBonus + fragmentBonusXP

    return {
        totalXP,
        baseXP: actualBaseXP,
        hintBonus,
        optimalBonus,
        fragmentBonus: fragmentBonusXP,
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
 * Get the XP threshold for the next level (the minXP of the next player level)
 * For example, if at 410 XP (Navegante), returns 600 (Timonel threshold)
 */
export function getNextLevelThreshold(totalXP: number): number {
    const currentIndex = PLAYER_LEVELS.findIndex(
        (l, i, arr) => totalXP >= l.minXP && (i === arr.length - 1 || totalXP < arr[i + 1].minXP)
    )

    if (currentIndex === PLAYER_LEVELS.length - 1) {
        return PLAYER_LEVELS[currentIndex].minXP // Already at max level
    }

    return PLAYER_LEVELS[currentIndex + 1].minXP
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

/**
 * Get total XP span of the current level (max XP needed to complete this level)
 * For example, Navegante spans 300-600, so totalXP for this level is 300
 */
export function getCurrentLevelTotalXP(totalXP: number): number {
    const currentIndex = PLAYER_LEVELS.findIndex(
        (l, i, arr) => totalXP >= l.minXP && (i === arr.length - 1 || totalXP < arr[i + 1].minXP)
    )

    if (currentIndex === PLAYER_LEVELS.length - 1) {
        return 0 // Max level - no more XP needed
    }

    const currentLevelMinXP = PLAYER_LEVELS[currentIndex].minXP
    const nextLevelMinXP = PLAYER_LEVELS[currentIndex + 1].minXP

    return nextLevelMinXP - currentLevelMinXP
}
