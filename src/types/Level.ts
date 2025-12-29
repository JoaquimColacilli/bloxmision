export interface TreasureFragmentConfig {
    fragmentId: string;           // "fragment-{world}-{n}" e.g. "fragment-1-1"
    worldId: number;              // 1-5
    fragmentNumber: number;       // 1-3 within the world
    description: string;          // "Fragmento 1 del Mundo 1"
}

export interface Level {
    id: string;
    worldId: string | number;
    levelNumber: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    gridSize: { rows: number; cols: number };
    startPosition: {
        x: number;
        y: number;
        facing: 'north' | 'east' | 'south' | 'west'
    };
    objectives: Objective[];
    obstacles: Obstacle[];
    collectibles: Collectible[];
    availableBlocks: string[];
    optimalSolution: {
        blockCount: number;
        code: string[];
    };
    hints: string[];
    xpReward: number;
    concept: 'sequences' | 'loops' | 'conditionals' | 'variables' | 'functions';
    treasureFragment?: TreasureFragmentConfig;
}

export interface Objective {
    id?: string;
    type: 'reach' | 'collect' | 'collectAll' | 'activate';
    target?: { x: number; y: number };
    item?: string;
    count?: number;
}

export interface Obstacle {
    type: 'rock' | 'wall' | 'water';
    position: { x: number; y: number };
}

export interface Collectible {
    id?: string;
    type: 'chest' | 'coin' | 'key';
    position: { x: number; y: number };
}
