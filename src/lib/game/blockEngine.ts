import type { Block, Level } from '@/src/types';

export interface Position {
    x: number;
    y: number;
}

export interface GameState {
    position: Position;
    facing: 'north' | 'east' | 'south' | 'west';
    inventory: string[];
}

export interface StepEvent {
    type: 'move' | 'turn' | 'action' | 'error';
    position?: Position;
    facing?: string;
    message?: string;
}

export class BlockEngine {
    private level: Level;
    private state: GameState;
    private aborted: boolean;

    constructor(level: Level) {
        this.level = level;
        this.state = {
            position: { ...level.startPosition },
            facing: level.startPosition.facing,
            inventory: []
        };
        this.aborted = false;
    }

    async executeBlocks(
        blocks: Block[],
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>,
        onComplete: (state: GameState) => void,
        onError: (error: { message: string; blockIndex: number }) => void
    ) {
        this.aborted = false;

        try {
            for (let i = 0; i < blocks.length; i++) {
                if (this.aborted) break;
                await this.executeBlock(blocks[i], i, onStep);
            }

            if (!this.aborted) {
                onComplete(this.state);
            }
        } catch (error: any) {
            onError({
                message: error.message,
                blockIndex: error.blockIndex
            });
        }
    }

    abort() {
        this.aborted = true;
    }

    getState(): GameState {
        return { ...this.state };
    }

    private async executeBlock(
        block: Block,
        blockIndex: number,
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>
    ) {
        switch (block.type) {
            case 'move':
                await this.executeMove(block.params?.steps || 1, blockIndex, onStep);
                break;
            case 'turnRight':
                await this.executeTurn('right', blockIndex, onStep);
                break;
            case 'turnLeft':
                await this.executeTurn('left', blockIndex, onStep);
                break;
            case 'loop':
                await this.executeLoop(block, blockIndex, onStep);
                break;
            case 'openChest':
            case 'collectCoin':
                await this.executeAction(block.type, blockIndex, onStep);
                break;
            default:
                throw { message: `Bloque desconocido: ${block.type}`, blockIndex };
        }
    }

    private async executeMove(
        steps: number,
        blockIndex: number,
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>
    ) {
        for (let i = 0; i < steps; i++) {
            if (this.aborted) break;

            const nextPos = this.getNextPosition();

            if (this.isOutOfBounds(nextPos)) {
                throw { message: '¡Jorc salió del mapa!', blockIndex };
            }

            if (this.hasObstacle(nextPos)) {
                throw { message: '¡Hay un obstáculo!', blockIndex };
            }

            this.state.position = nextPos;

            await onStep({ type: 'move', position: nextPos }, blockIndex);
            await this.delay(500);
        }
    }

    private async executeTurn(
        direction: 'left' | 'right',
        blockIndex: number,
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>
    ) {
        const directions = ['north', 'east', 'south', 'west'] as const;
        const currentIndex = directions.indexOf(this.state.facing);

        let newIndex;
        if (direction === 'right') {
            newIndex = (currentIndex + 1) % 4;
        } else {
            newIndex = (currentIndex - 1 + 4) % 4;
        }

        this.state.facing = directions[newIndex];

        await onStep({ type: 'turn', facing: this.state.facing }, blockIndex);
        await this.delay(300);
    }

    private async executeLoop(
        block: Block,
        blockIndex: number,
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>
    ) {
        const count = block.params?.count || 1;
        const innerBlocks = block.params?.blocks || [];

        for (let i = 0; i < count; i++) {
            if (this.aborted) break;

            for (const innerBlock of innerBlocks) {
                if (this.aborted) break;
                await this.executeBlock(innerBlock, blockIndex, onStep);
            }
        }
    }

    private async executeAction(
        actionType: string,
        blockIndex: number,
        onStep: (event: StepEvent, blockIndex: number) => Promise<void>
    ) {
        await onStep({ type: 'action', message: actionType }, blockIndex);
        await this.delay(400);
    }

    private getNextPosition(): Position {
        const { x, y } = this.state.position;
        const moves = {
            north: { x, y: y - 1 },
            east: { x: x + 1, y },
            south: { x, y: y + 1 },
            west: { x: x - 1, y }
        };
        return moves[this.state.facing];
    }

    private isOutOfBounds(pos: Position): boolean {
        return pos.x < 0 || pos.x >= this.level.gridSize.cols ||
            pos.y < 0 || pos.y >= this.level.gridSize.rows;
    }

    private hasObstacle(pos: Position): boolean {
        return this.level.obstacles.some(
            obs => obs.position.x === pos.x && obs.position.y === pos.y
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
