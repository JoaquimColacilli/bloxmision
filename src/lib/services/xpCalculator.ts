export interface XPCalculationParams {
    baseXP: number;
    usedHints: boolean;
    isOptimal: boolean;
    isFragment?: boolean;
}

export interface XPBreakdown {
    base: number;
    noHintBonus: number;
    optimalBonus: number;
    fragmentBonus: number;
    total: number;
}

export const XP_CONSTANTS = {
    BASE: 50,
    NO_HINT_BONUS: 20,
    OPTIMAL_BONUS: 30,
    FRAGMENT_BONUS: 100
};

export const PLAYER_LEVELS = [
    { min: 0, max: 499, name: 'Grumete', icon: '🏴‍☠️' },
    { min: 500, max: 1499, name: 'Marinero', icon: '⚓' },
    { min: 1500, max: 2999, name: 'Navegante', icon: '🧭' },
    { min: 3000, max: 4999, name: 'Capitán Junior', icon: '🎖️' },
    { min: 5000, max: Infinity, name: 'Capitán Experto', icon: '👑' }
] as const;

/**
 * Calcula XP ganado
 */
export function calculateXP(params: XPCalculationParams): number {
    const breakdown = calculateXPBreakdown(params);
    return breakdown.total;
}

/**
 * Calcula XP con desglose
 */
export function calculateXPBreakdown(params: XPCalculationParams): XPBreakdown {
    const { baseXP, usedHints, isOptimal, isFragment } = params;

    const noHintBonus = !usedHints ? XP_CONSTANTS.NO_HINT_BONUS : 0;
    const optimalBonus = isOptimal ? XP_CONSTANTS.OPTIMAL_BONUS : 0;
    const fragmentBonus = isFragment ? XP_CONSTANTS.FRAGMENT_BONUS : 0;

    return {
        base: baseXP,
        noHintBonus,
        optimalBonus,
        fragmentBonus,
        total: baseXP + noHintBonus + optimalBonus + fragmentBonus
    };
}

/**
 * Obtiene nivel de jugador según XP
 */
export function getPlayerLevel(totalXP: number) {
    return PLAYER_LEVELS.find(
        level => totalXP >= level.min && totalXP <= level.max
    ) || PLAYER_LEVELS[0];
}

/**
 * XP necesario para siguiente nivel
 */
export function getXPToNextLevel(totalXP: number): number {
    const currentLevel = getPlayerLevel(totalXP);
    const currentIndex = PLAYER_LEVELS.indexOf(currentLevel);

    if (currentIndex === PLAYER_LEVELS.length - 1) {
        return 0;
    }

    const nextLevel = PLAYER_LEVELS[currentIndex + 1];
    return nextLevel.min - totalXP;
}

/**
 * Progreso hacia siguiente nivel (%)
 */
export function getProgressToNextLevel(totalXP: number): number {
    const currentLevel = getPlayerLevel(totalXP);

    if (currentLevel.max === Infinity) {
        return 100;
    }

    const levelRange = currentLevel.max - currentLevel.min + 1;
    const currentProgress = totalXP - currentLevel.min;

    return Math.min(100, (currentProgress / levelRange) * 100);
}
