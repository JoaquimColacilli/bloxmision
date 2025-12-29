export { submitLevelProgress } from './progressService';
export type { SubmitProgressResult } from './progressService';

export {
    calculateXP,
    calculateXPBreakdown,
    getPlayerLevel,
    getXPToNextLevel,
    getProgressToNextLevel,
    XP_CONSTANTS,
    PLAYER_LEVELS
} from './xpCalculator';
export type { XPCalculationParams, XPBreakdown } from './xpCalculator';

export { updateUserStreak, getUserStreak } from './streakService';
export type { StreakData } from './streakService';

export {
    checkAndAwardBadges,
    getBadgeInfo,
    getUserBadges,
    BADGES
} from './badgeService';
export type { Badge, BadgeContext } from './badgeService';

export {
    getUserWorldsProgress,
    getWorldProgress,
    getUserLevelsForWorld,
    WORLD_DEFINITIONS
} from './worldService';
export type { WorldDefinition, WorldProgress, LevelStatus } from './worldService';
