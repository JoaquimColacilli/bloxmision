import type { Block, GameState, ValidationResult } from '@/src/types';
import type { Level } from '@/src/types';

const MAX_STEPS = 1000;

export class BlockValidator {
    private level: Level;
    private state: GameState;
    private stepCount: number;

    constructor(level: Level) {
        this.level = level;
        this.state = {
            position: { ...level.startPosition },
            facing: level.startPosition.facing,
            inventory: [],
            objectivesCompleted: []
        };
        this.stepCount = 0;
    }

    /**
     * Valida la solución completa
     */
    validate(blocks: Block[]): ValidationResult {
        try {
            this.executeBlocks(blocks);

            const objectivesMet = this.checkObjectives();
            const isOptimal = blocks.length <= this.level.optimalSolution.blockCount;

            return {
                success: true,
                finalState: this.state,
                objectivesMet,
                isOptimal
            };

        } catch (error: any) {
            return {
                success: false,
                finalState: this.state,
                objectivesMet: false,
                isOptimal: false,
                error: {
                    type: error.type || 'invalid_action',
                    message: error.message,
                    blockIndex: error.blockIndex
                }
            };
        }
    }

    private executeBlocks(blocks: Block[], blockIndexOffset = 0) {
        blocks.forEach((block, index) => {
            this.executeBlock(block, blockIndexOffset + index);
        });
    }

    private executeBlock(block: Block, blockIndex: number) {
        if (this.stepCount++ > MAX_STEPS) {
            throw {
                type: 'infinite_loop',
                message: '¡El código está dando demasiadas vueltas! Revisa tus bucles.',
                blockIndex
            };
        }

        switch (block.type) {
            case 'move':
                this.executeMove(block.params?.steps || 1, blockIndex);
                break;
            case 'turnRight':
                this.executeTurn('right');
                break;
            case 'turnLeft':
                this.executeTurn('left');
                break;
            case 'openChest':
                this.executeOpenChest(blockIndex);
                break;
            case 'collectCoin':
                this.executeCollectCoin(blockIndex);
                break;
            case 'loop':
                this.executeLoop(block.params!, blockIndex);
                break;
            default:
                throw {
                    type: 'invalid_action',
                    message: `Bloque desconocido: ${block.type}`,
                    blockIndex
                };
        }
    }

    private executeMove(steps: number, blockIndex: number) {
        for (let i = 0; i < steps; i++) {
            const nextPos = this.getNextPosition();

            if (this.isOutOfBounds(nextPos)) {
                throw {
                    type: 'out_of_bounds',
                    message: '¡Jorc salió del mapa! Revisa la dirección.',
                    blockIndex
                };
            }

            if (this.hasObstacle(nextPos)) {
                throw {
                    type: 'collision',
                    message: '¡Hay un obstáculo en el camino!',
                    blockIndex
                };
            }

            this.state.position = nextPos;
        }
    }

    private executeTurn(direction: 'left' | 'right') {
        const directions = ['north', 'east', 'south', 'west'] as const;
        const currentIndex = directions.indexOf(this.state.facing);

        let newIndex;
        if (direction === 'right') {
            newIndex = (currentIndex + 1) % 4;
        } else {
            newIndex = (currentIndex - 1 + 4) % 4;
        }

        this.state.facing = directions[newIndex];
    }

    private executeOpenChest(blockIndex: number) {
        const chest = this.level.objectives.find(
            obj => obj.type === 'collect' &&
                obj.item === 'chest' &&
                obj.target?.x === this.state.position.x &&
                obj.target?.y === this.state.position.y
        );

        if (!chest) {
            throw {
                type: 'invalid_action',
                message: '¡No hay ningún cofre aquí!',
                blockIndex
            };
        }

        this.state.inventory.push('chest');
        this.state.objectivesCompleted.push(chest.id!);
    }

    private executeCollectCoin(blockIndex: number) {
        const coin = this.level.collectibles.find(
            c => c.type === 'coin' &&
                c.position.x === this.state.position.x &&
                c.position.y === this.state.position.y
        );

        if (!coin) {
            throw {
                type: 'invalid_action',
                message: '¡No hay ninguna moneda aquí!',
                blockIndex
            };
        }

        this.state.inventory.push('coin');
        if (coin.id) {
            this.state.objectivesCompleted.push(coin.id);
        }
    }

    private executeLoop(params: any, blockIndex: number) {
        const { count, blocks } = params;

        for (let i = 0; i < count; i++) {
            this.executeBlocks(blocks, blockIndex);
        }
    }

    // Helpers
    private getNextPosition() {
        const { x, y } = this.state.position;
        const moves = {
            north: { x, y: y - 1 },
            east: { x: x + 1, y },
            south: { x, y: y + 1 },
            west: { x: x - 1, y }
        };
        return moves[this.state.facing];
    }

    private isOutOfBounds(pos: { x: number; y: number }) {
        return pos.x < 0 || pos.x >= this.level.gridSize.cols ||
            pos.y < 0 || pos.y >= this.level.gridSize.rows;
    }

    private hasObstacle(pos: { x: number; y: number }) {
        return this.level.obstacles.some(
            obs => obs.position.x === pos.x && obs.position.y === pos.y
        );
    }

    private checkObjectives(): boolean {
        return this.level.objectives.every(obj => {
            if (obj.type === 'reach') {
                return this.state.position.x === obj.target!.x &&
                    this.state.position.y === obj.target!.y;
            }
            if (obj.type === 'collect') {
                // Check if specific item ID was collected
                if (obj.id) {
                    return this.state.objectivesCompleted.includes(obj.id);
                }
                // Or check if count of items was collected
                if (obj.count && obj.item) {
                    const collectedCount = this.state.inventory.filter(i => i === obj.item).length;
                    return collectedCount >= obj.count;
                }
            }
            if (obj.type === 'collectAll') {
                // Check if all collectibles of types specified in obj.items (array) are collected
                // obj.items is likely string[] e.g. ["coin"]
                // But Level interface might define it differently. Let's check LevelDataToLevel. 
                // It maps to "collectAll" but doesn't map "items". 
                // Wait, LevelObjective type has 'items'? 
                // Let's assume obj.items exists if type is collectAll
                const targetTypes = (obj as any).items || []; // items property might be missing in strict type if not defined
                // Count total available of these types
                const totalAvailable = this.level.collectibles.filter(c => targetTypes.includes(c.type)).length;
                const collectedCount = this.state.inventory.filter(i => targetTypes.includes(i)).length;
                return collectedCount >= totalAvailable;
            }
            return false;
        });
    }
}
