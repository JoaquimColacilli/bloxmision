/**
 * Player Level Types and Validation
 */

// All valid player level names
export const PLAYER_LEVEL_NAMES = [
    "Grumete",
    "Marinero",
    "Navegante",
    "Timonel",
    "Contramaestre",
    "Piloto",
    "Primer Oficial",
    "Capitán",
    "Almirante",
    "Leyenda Pirata",
] as const;

// Union type of all valid player levels
export type PlayerLevel = (typeof PLAYER_LEVEL_NAMES)[number];

// Map level name to icon filename
export const LEVEL_TO_ICON: Record<PlayerLevel, string> = {
    "Grumete": "/ranks/grumete.png",
    "Marinero": "/ranks/marinero.png",
    "Navegante": "/ranks/navegante.png",
    "Timonel": "/ranks/timonel.png",
    "Contramaestre": "/ranks/contramaestre.png",
    "Piloto": "/ranks/piloto.png",
    "Primer Oficial": "/ranks/primer-oficial.png",
    "Capitán": "/ranks/capitan.png",
    "Almirante": "/ranks/almirante.png",
    "Leyenda Pirata": "/ranks/leyenda-pirata.png",
};

/**
 * Type guard to validate if a string is a valid PlayerLevel
 */
export function isValidPlayerLevel(level: unknown): level is PlayerLevel {
    return typeof level === "string" && PLAYER_LEVEL_NAMES.includes(level as PlayerLevel);
}

/**
 * Get the rank icon path for a given level
 */
export function getRankIconPath(level: PlayerLevel): string {
    return LEVEL_TO_ICON[level];
}

/**
 * Get level index (0-9) for comparison
 */
export function getLevelIndex(level: PlayerLevel): number {
    return PLAYER_LEVEL_NAMES.indexOf(level);
}

/**
 * Check if newLevel is higher than oldLevel
 */
export function isLevelUp(oldLevel: PlayerLevel, newLevel: PlayerLevel): boolean {
    return getLevelIndex(newLevel) > getLevelIndex(oldLevel);
}
