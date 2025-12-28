/**
 * Block Validator - Client-Side Game Logic
 * Validates block solutions for level completion
 */

import type { BlockInstance, LevelData, Direction } from "@/lib/types"

export interface ValidationResult {
    success: boolean
    objectivesMet: boolean
    isOptimal: boolean
    blockCount: number
    error?: {
        type: "collision" | "out_of_bounds" | "invalid_action" | "infinite_loop" | "syntax_error"
        message: string
        blockIndex?: number
    }
}

export interface ExecutionState {
    x: number
    y: number
    facing: Direction
    inventory: string[]
    collectedItems: string[]
    activatedLevers: string[]
    stepCount: number
}

const MAX_EXECUTION_STEPS = 1000 // Prevent infinite loops

/**
 * Validate a solution for a level
 */
export function validateSolution(
    blocks: BlockInstance[],
    level: LevelData
): ValidationResult {
    const blockCount = countBlocks(blocks)

    // Check if there are any blocks
    if (blockCount === 0) {
        return {
            success: false,
            objectivesMet: false,
            isOptimal: false,
            blockCount: 0,
            error: {
                type: "syntax_error",
                message: "Debes usar al menos un bloque",
            },
        }
    }

    // Initialize execution state
    const state: ExecutionState = {
        x: level.startPosition.x,
        y: level.startPosition.y,
        facing: level.startPosition.facing,
        inventory: [],
        collectedItems: [],
        activatedLevers: [],
        stepCount: 0,
    }

    // Execute blocks
    const executionResult = executeBlocks(blocks, level, state)

    if (!executionResult.success) {
        return {
            success: false,
            objectivesMet: false,
            isOptimal: false,
            blockCount,
            error: executionResult.error,
        }
    }

    // Check if all objectives are met
    const objectivesMet = checkObjectives(level, executionResult.finalState)
    const isOptimal = level.optimalSolution
        ? blockCount <= level.optimalSolution.blockCount
        : true

    return {
        success: true,
        objectivesMet,
        isOptimal,
        blockCount,
    }
}

/**
 * Execute blocks and return final state
 */
function executeBlocks(
    blocks: BlockInstance[],
    level: LevelData,
    state: ExecutionState
): { success: boolean; finalState: ExecutionState; error?: ValidationResult["error"] } {

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]

        // Check for infinite loop
        if (state.stepCount >= MAX_EXECUTION_STEPS) {
            return {
                success: false,
                finalState: state,
                error: {
                    type: "infinite_loop",
                    message: "¡Loop infinito detectado! Tu código se ejecutó demasiadas veces.",
                    blockIndex: i,
                },
            }
        }

        const result = executeBlock(block, level, state, i)
        if (!result.success) {
            return result
        }

        state.stepCount++
    }

    return { success: true, finalState: state }
}

/**
 * Execute a single block
 */
function executeBlock(
    block: BlockInstance,
    level: LevelData,
    state: ExecutionState,
    blockIndex: number
): { success: boolean; finalState: ExecutionState; error?: ValidationResult["error"] } {

    const { type } = block.definition

    switch (type) {
        case "move-forward": {
            const newPos = getNewPosition(state.x, state.y, state.facing)
            if (!isValidPosition(newPos.x, newPos.y, level)) {
                return {
                    success: false,
                    finalState: state,
                    error: {
                        type: "out_of_bounds",
                        message: "¡Jorc se salió del mapa!",
                        blockIndex,
                    },
                }
            }
            if (hasObstacle(newPos.x, newPos.y, level)) {
                return {
                    success: false,
                    finalState: state,
                    error: {
                        type: "collision",
                        message: "¡Jorc chocó con un obstáculo!",
                        blockIndex,
                    },
                }
            }
            state.x = newPos.x
            state.y = newPos.y
            break
        }

        case "turn-left":
            state.facing = turnLeft(state.facing)
            break

        case "turn-right":
            state.facing = turnRight(state.facing)
            break

        case "collect": {
            const collectible = level.collectibles.find(
                (c) => c.x === state.x && c.y === state.y && !state.collectedItems.includes(c.id)
            )
            if (collectible) {
                state.collectedItems.push(collectible.id)
                state.inventory.push(collectible.type)
            }
            break
        }

        case "repeat": {
            const times = typeof block.params.times === "number" ? block.params.times : 1
            if (block.children) {
                for (let i = 0; i < times; i++) {
                    for (const child of block.children) {
                        const result = executeBlock(child, level, state, blockIndex)
                        if (!result.success) return result
                        state.stepCount++
                        if (state.stepCount >= MAX_EXECUTION_STEPS) {
                            return {
                                success: false,
                                finalState: state,
                                error: {
                                    type: "infinite_loop",
                                    message: "¡Loop infinito detectado!",
                                    blockIndex,
                                },
                            }
                        }
                    }
                }
            }
            break
        }

        // Add more block types as needed...
    }

    return { success: true, finalState: state }
}

/**
 * Check if all level objectives are met
 */
function checkObjectives(level: LevelData, state: ExecutionState): boolean {
    for (const objective of level.objectives) {
        switch (objective.type) {
            case "reach":
                if (objective.target) {
                    if (state.x !== objective.target.x || state.y !== objective.target.y) {
                        return false
                    }
                }
                break

            case "collect":
                if (objective.item && !state.inventory.includes(objective.item)) {
                    return false
                }
                break

            case "collectAll":
                if (objective.items) {
                    for (const item of objective.items) {
                        if (!state.collectedItems.includes(item)) {
                            return false
                        }
                    }
                }
                break

            case "activate":
                if (objective.id && !state.activatedLevers.includes(objective.id)) {
                    return false
                }
                break
        }
    }
    return true
}

/**
 * Count total blocks including nested children
 */
export function countBlocks(blocks: BlockInstance[]): number {
    let count = 0

    function countRecursive(block: BlockInstance): void {
        count++
        if (block.children) {
            for (const child of block.children) {
                countRecursive(child)
            }
        }
    }

    for (const block of blocks) {
        countRecursive(block)
    }

    return count
}

// ============ HELPER FUNCTIONS ============

function getNewPosition(x: number, y: number, facing: Direction): { x: number; y: number } {
    switch (facing) {
        case "north": return { x, y: y - 1 }
        case "south": return { x, y: y + 1 }
        case "east": return { x: x + 1, y }
        case "west": return { x: x - 1, y }
    }
}

function isValidPosition(x: number, y: number, level: LevelData): boolean {
    return x >= 0 && x < level.gridSize.cols && y >= 0 && y < level.gridSize.rows
}

function hasObstacle(x: number, y: number, level: LevelData): boolean {
    return level.obstacles.some((obs) => obs.x === x && obs.y === y)
}

function turnLeft(facing: Direction): Direction {
    const turns: Record<Direction, Direction> = {
        north: "west",
        west: "south",
        south: "east",
        east: "north",
    }
    return turns[facing]
}

function turnRight(facing: Direction): Direction {
    const turns: Record<Direction, Direction> = {
        north: "east",
        east: "south",
        south: "west",
        west: "north",
    }
    return turns[facing]
}
