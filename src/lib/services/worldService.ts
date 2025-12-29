import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface WorldDefinition {
    id: string;
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
        name: "Isla Secuencia",
        description: "Aprende a dar ordenes paso a paso",
        concept: "Secuencias",
        totalLevels: 12,
        order: 1,
    },
    {
        id: "bucle",
        name: "Isla Bucle",
        description: "Domina los ciclos y repeticiones",
        concept: "Bucles",
        totalLevels: 14,
        order: 2,
        requiredWorld: "secuencia",
    },
    {
        id: "decision",
        name: "Isla Decision",
        description: "Toma decisiones con condiciones",
        concept: "Condicionales",
        totalLevels: 15,
        order: 3,
        requiredWorld: "bucle",
    },
    {
        id: "memoria",
        name: "Isla Memoria",
        description: "Guarda y recuerda valores",
        concept: "Variables",
        totalLevels: 12,
        order: 4,
        requiredWorld: "decision",
    },
    {
        id: "funcion",
        name: "Isla Funcion",
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
    // Get all progress records for this user
    const q = query(
        collection(db, 'progress'),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    // Count completed levels per world
    const completedByWorld: Record<string, Set<string>> = {};

    snapshot.forEach(doc => {
        const data = doc.data();
        const worldId = data.worldId;
        const levelId = data.levelId;

        if (worldId && levelId) {
            if (!completedByWorld[worldId]) {
                completedByWorld[worldId] = new Set();
            }
            completedByWorld[worldId].add(levelId);
        }
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

    // Get user progress for this world
    const q = query(
        collection(db, 'progress'),
        where('userId', '==', userId),
        where('worldId', '==', worldId)
    );

    const snapshot = await getDocs(q);
    const progressMap = new Map();

    snapshot.forEach(doc => {
        const data = doc.data();
        progressMap.set(data.levelId, data);
    });

    // Generate level list combining static definition with progress
    const levels: LevelStatus[] = [];
    let previousLevelCompleted = true; // First level unlocked by default if world is unlocked

    for (let i = 1; i <= worldDef.totalLevels; i++) {
        const levelId = `${worldId}-${i}`;
        // Support legacy ID format if needed, though clean format is preferred
        // const legacyId = i === 1 ? `${worldId}-1` : `${worldId}-${i}`; 

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
