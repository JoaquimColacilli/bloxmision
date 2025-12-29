export { submitLevelProgress, recalculateUserXP } from './progressService';
export type { SubmitProgressResult } from './progressService';

export {
    calculateXP,
    calculateStars,
    getPlayerLevel,
    getXPToNextLevel,
    getCurrentLevelXP,
    PLAYER_LEVELS
} from './xpCalculator';
export type { XPCalculationParams, XPCalculationResult } from './xpCalculator';

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
    getMaxUnlockedLevelNum,
    WORLD_DEFINITIONS
} from './worldService';
export type { WorldDefinition, WorldProgress, LevelStatus } from './worldService';

