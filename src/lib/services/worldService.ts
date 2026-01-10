import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface WorldDefinition {
    id: string;
    numericId: string; // Numeric prefix for level IDs (e.g., "1" for levels 1-1, 1-2, etc.)
    name: string;
    description: string;
    concept: string;
    totalLevels: number;
    order: number;
    requiredWorld?: string; // ID of world that must be completed first
}

// Static world definitions (these could also come from Firestore)
export const WORLD_DEFINITIONS: WorldDefinition[] = [
    {
        id: "secuencia",
        numericId: "1",  // Levels are 1-1, 1-2, etc.
        name: "Costa del Primer Rumbo",
        description: "Aprende a dar ordenes paso a paso",
        concept: "Secuencias",
        totalLevels: 12,
        order: 1,
    },
    {
        id: "bucle",
        numericId: "2",  // Levels are 2-1, 2-2, etc.
        name: "Remolino de las Mareas",
        description: "Domina los ciclos y repeticiones",
        concept: "Bucles",
        totalLevels: 14,
        order: 2,
        requiredWorld: "secuencia",
    },
    {
        id: "decision",
        numericId: "3",  // Levels are 3-1, 3-2, etc.
        name: "Arrecife del Juicio",
        description: "Toma decisiones con condiciones",
        concept: "Condicionales",
        totalLevels: 15,
        order: 3,
        requiredWorld: "bucle",
    },
    {
        id: "memoria",
        numericId: "4",  // Levels are 4-1, 4-2, etc.
        name: "Santuario de la Memoria",
        description: "Usa tu astucia para recordar patrones",
        concept: "Patrones y Memoria",
        totalLevels: 12,
        order: 4,
        requiredWorld: "decision",
    },
    {
        id: "funcion",
        numericId: "5",  // Levels are 5-1, 5-2, etc.
        name: "Taller de los Encantamientos",
        description: "Crea bloques de codigo reutilizables",
        concept: "Funciones",
        totalLevels: 15,
        order: 5,
        requiredWorld: "memoria",
    },
];

export interface WorldProgress {
    worldId: string;
    completedLevels: number;
    totalLevels: number;
    isUnlocked: boolean;
    isCurrent: boolean;
}

/**
 * Get user's progress for all worlds
 */
export async function getUserWorldsProgress(userId: string): Promise<WorldProgress[]> {
    // Get all progress records for this user from subcollection
    const progressRef = collection(db, `users/${userId}/progress`);
    const snapshot = await getDocs(progressRef);

    // Helper to convert numeric world ID to semantic (e.g., "1" -> "secuencia")
    const numericToSemantic: Record<string, string> = {
        "1": "secuencia",
        "2": "bucle",
        "3": "decision",
        "4": "memoria",
        "5": "funcion",
    };

    // Count completed levels per world using doc.id as levelId
    const completedByWorld: Record<string, Set<string>> = {};

    snapshot.forEach(doc => {
        // doc.id is the levelId (e.g. "1-6")
        const levelId = doc.id;
        const [worldNumStr] = levelId.split('-');
        const worldId = numericToSemantic[worldNumStr] || worldNumStr;

        if (!completedByWorld[worldId]) {
            completedByWorld[worldId] = new Set();
        }
        completedByWorld[worldId].add(levelId);
    });

    // Build world progress list
    const worldsProgress: WorldProgress[] = [];
    const completedWorlds = new Set<string>();

    for (const world of WORLD_DEFINITIONS) {
        const completedLevels = completedByWorld[world.id]?.size || 0;
        const isWorldComplete = completedLevels >= world.totalLevels;

        if (isWorldComplete) {
            completedWorlds.add(world.id);
        }

        // Check if unlocked (first world is always unlocked, others need previous complete)
        let isUnlocked = world.order === 1;
        if (world.requiredWorld) {
            isUnlocked = completedWorlds.has(world.requiredWorld);
        }

        // Determine if current (first unlocked incomplete world)
        const isCurrent = isUnlocked && !isWorldComplete &&
            !worldsProgress.some(w => w.isCurrent);

        worldsProgress.push({
            worldId: world.id,
            completedLevels,
            totalLevels: world.totalLevels,
            isUnlocked,
            isCurrent,
        });
    }

    // If no current world is set and user hasn't completed anything, set first world as current
    if (!worldsProgress.some(w => w.isCurrent)) {
        const firstUnlocked = worldsProgress.find(w => w.isUnlocked && w.completedLevels < w.totalLevels);
        if (firstUnlocked) {
            firstUnlocked.isCurrent = true;
        }
    }

    return worldsProgress;
}

/**
 * Level status interface
 */
export interface LevelStatus {
    id: string;
    worldId: string;
    name: string;
    order: number;
    isCompleted: boolean;
    isUnlocked: boolean;
    isCurrent: boolean;
    stars: number;
    xpReward: number;
}

/**
 * Get progress for all levels in a world
 */
export async function getUserLevelsForWorld(userId: string, worldId: string): Promise<LevelStatus[]> {
    const worldDef = WORLD_DEFINITIONS.find(w => w.id === worldId);
    if (!worldDef) return [];

    // Get ALL user progress from subcollection (no worldId filter - use doc.id)
    const progressRef = collection(db, `users/${userId}/progress`);
    const snapshot = await getDocs(progressRef);
    const progressMap = new Map();

    // Map by doc.id which is the levelId (e.g. "1-1", "1-6")
    snapshot.forEach(doc => {
        progressMap.set(doc.id, doc.data());
    });

    // Generate level list combining static definition with progress
    const levels: LevelStatus[] = [];
    let previousLevelCompleted = true; // First level unlocked by default if world is unlocked

    for (let i = 1; i <= worldDef.totalLevels; i++) {
        // Use numeric format for level IDs (e.g., "1-1", "1-2", "2-1", etc.)
        const levelId = `${worldDef.numericId}-${i}`;

        const progress = progressMap.get(levelId);
        const isCompleted = !!progress;

        // Level is unlocked if previous was completed OR it's the first level
        const isUnlocked = i === 1 || previousLevelCompleted;

        // Level is current if it's unlocked but not completed
        const isCurrent = isUnlocked && !isCompleted && previousLevelCompleted;

        levels.push({
            id: levelId,
            worldId,
            name: `Nivel ${i}`,
            order: i,
            isCompleted,
            isUnlocked,
            isCurrent,
            stars: progress?.stars || 0,
            xpReward: 50 + (i * 10), // Base reward logic (50, 60, 70...)
        });

        previousLevelCompleted = isCompleted;
    }

    return levels;
}

/**
 * Get progress for a specific world
 */
export async function getWorldProgress(userId: string, worldId: string): Promise<WorldProgress | null> {
    const allProgress = await getUserWorldsProgress(userId);
    return allProgress.find(w => w.worldId === worldId) || null;
}

/**
 * Get the maximum level number that a user can access in a world.
 * Returns the highest completed level + 1, or 1 if no levels completed.
 * 
 * @param userId - The user's ID
 * @param worldNumericId - The numeric world ID (e.g., "1" for secuencia)
 * @returns The maximum accessible level number (1-based)
 */
export async function getMaxUnlockedLevelNum(userId: string, worldNumericId: string): Promise<number> {
    try {
        // Leer de la subcolección del usuario
        const progressRef = collection(db, `users/${userId}/progress`);
        const snapshot = await getDocs(progressRef);

        if (snapshot.empty) {
            return 1;
        }

        let maxCompletedLevel = 0;

        snapshot.forEach(doc => {
            // doc.id es el levelId (ej: "1-6")
            const levelId = doc.id;
            const [worldNum, levelNumStr] = levelId.split('-');

            // Solo contar niveles de este mundo
            if (worldNum === worldNumericId) {
                const levelNum = parseInt(levelNumStr, 10);
                if (!isNaN(levelNum) && levelNum > maxCompletedLevel) {
                    maxCompletedLevel = levelNum;
                }
            }
        });

        return maxCompletedLevel + 1;

    } catch (error) {
        console.error('Error getting max unlocked level:', error);
        return 1;
    }
}
