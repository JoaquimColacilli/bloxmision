export interface Block {
    type: 'move' | 'turnRight' | 'turnLeft' | 'openChest' | 'collectCoin' | 'loop' | 'conditional';
    params?: {
        steps?: number;
        count?: number;
        condition?: string;
        blocks?: Block[];
    };
}

export interface GameState {
    position: { x: number; y: number };
    facing: 'north' | 'east' | 'south' | 'west';
    inventory: string[];
    objectivesCompleted: string[];
}

export interface ValidationResult {
    success: boolean;
    finalState: GameState;
    objectivesMet: boolean;
    isOptimal: boolean;
    error?: {
        type: 'collision' | 'out_of_bounds' | 'invalid_action' | 'infinite_loop';
        message: string;
        blockIndex?: number;
    };
}
