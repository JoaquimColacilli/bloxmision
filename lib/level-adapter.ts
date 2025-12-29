import type { LevelData, LevelObjective, BlockInstance } from "@/lib/types"
import type { Level, Objective, Block } from "@/src/types"

// Map BlockInstance IDs to Block types expected by validator
const BLOCK_ID_TO_TYPE: Record<string, Block['type']> = {
    'forward': 'move',
    'backward': 'move',
    'turn-right': 'turnRight',
    'turn-left': 'turnLeft',
    'open-chest': 'openChest',
    'collect-coin': 'collectCoin',
    'repeat': 'loop',
    'if': 'conditional',
}

/**
 * Converts BlockInstance[] (from PlayPage) to Block[] (expected by BlockValidator)
 */
export function blockInstancesToBlocks(instances: BlockInstance[]): Block[] {
    return instances.map((instance) => {
        const blockType = BLOCK_ID_TO_TYPE[instance.definition.id] || 'move'
        const steps = Number(instance.params?.steps || instance.params?.count || 1)

        const block: Block = {
            type: blockType,
            params: {
                steps: instance.definition.id === 'backward' ? -steps : steps,
                count: Number(instance.params?.count || 1),
            }
        }

        // Handle loop blocks with children
        if (blockType === 'loop' && instance.children) {
            block.params = {
                count: Number(instance.params?.count || 1),
                blocks: blockInstancesToBlocks(instance.children),
            }
        }

        return block
    })
}

// Map level ID prefix to world ID
function getWorldIdFromLevelId(levelId: string): string {
    const prefix = levelId.split("-")[0]

    // Map numeric prefixes to world names
    const prefixMap: Record<string, string> = {
        "1": "secuencia",
        "2": "bucle",
        "3": "decision",
        "4": "memoria",
        "5": "funcion",
    }

    return prefixMap[prefix] || prefix // "secuencia" stays "secuencia", "1" becomes "secuencia"
}

/**
 * Converts LevelData (from mock-level-data) to Level (expected by BlockValidator)
 */
export function levelDataToLevel(data: LevelData): Level {
    const validObjectives: Objective[] = data.objectives
        .filter((obj) => obj.type !== "avoid")
        .map((obj) => ({
            id: obj.id,
            type: obj.type as "reach" | "collect" | "collectAll" | "activate",
            target: obj.target,
            item: obj.item,
            count: obj.count,
        }))

    const worldId = getWorldIdFromLevelId(data.id)

    return {
        id: data.id,
        worldId: worldId,
        levelNumber: parseInt(data.id.split("-")[1] || "1", 10),
        title: data.title,
        description: data.title,
        difficulty: "easy" as const,
        gridSize: data.gridSize,
        startPosition: data.startPosition,
        objectives: validObjectives,
        obstacles: data.obstacles.map((obs) => ({
            type: obs.type as "rock" | "wall" | "water",
            position: { x: obs.x, y: obs.y },
        })),
        collectibles: data.collectibles.map((col) => ({
            id: col.id,
            type: col.type as "chest" | "coin" | "key",
            position: { x: col.x, y: col.y },
        })),
        availableBlocks: data.availableBlocks,
        optimalSolution: {
            blockCount: data.optimalSolution?.blockCount || 10,
            code: [],
        },
        hints: data.hints || [],
        xpReward: data.xpReward || 50,
        concept: "sequences" as const,
    }
}
