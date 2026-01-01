/**
 * Block Progression System
 * 
 * Auto-detects which level introduces each block for the first time,
 * using canonical level ordering: 1-1..1-12, 2-1..2-12, 3-1..3-12, 4-1..4-12, 5-1..5-12
 */

import { getLevelConfig } from "./mock-level-data"

// Canonical level order for detection
const WORLDS = [1, 2, 3, 4, 5]
const LEVELS_PER_WORLD = 12

function getCanonicalLevelOrder(): string[] {
    const order: string[] = []
    for (const world of WORLDS) {
        for (let level = 1; level <= LEVELS_PER_WORLD; level++) {
            order.push(`${world}-${level}`)
        }
    }
    return order
}

export const CANONICAL_LEVEL_ORDER = getCanonicalLevelOrder()

/**
 * Parse levelId into world and level numbers for sorting
 */
export function parseLevelId(levelId: string): { world: number; level: number } {
    const parts = levelId.split("-")
    return {
        world: parseInt(parts[0] || "1", 10),
        level: parseInt(parts[1] || "1", 10),
    }
}

/**
 * Compare two levelIds by canonical order
 */
export function compareLevelIds(a: string, b: string): number {
    const parsedA = parseLevelId(a)
    const parsedB = parseLevelId(b)
    if (parsedA.world !== parsedB.world) {
        return parsedA.world - parsedB.world
    }
    return parsedA.level - parsedB.level
}

/**
 * Build the map of blockId -> first levelId that introduces it
 * Scans all levels in canonical order and tracks cumulative block set
 */
function buildFirstIntroLevelByBlock(): Record<string, string> {
    const result: Record<string, string> = {}
    const seenBlocks = new Set<string>()

    for (const levelId of CANONICAL_LEVEL_ORDER) {
        try {
            const config = getLevelConfig(levelId)
            const availableBlocks = config.availableBlocks || []

            for (const blockId of availableBlocks) {
                if (!seenBlocks.has(blockId)) {
                    // First time this block appears in the progression
                    result[blockId] = levelId
                    seenBlocks.add(blockId)
                }
            }
        } catch {
            // Level might not exist (sparse config), skip
        }
    }

    return result
}

/**
 * Map of blockId -> levelId where it's introduced for the first time
 */
export const FIRST_INTRO_LEVEL_BY_BLOCK = buildFirstIntroLevelByBlock()

/**
 * Get blocks that are introduced for the first time in a specific level
 * Returns empty array if no new blocks, or array of blockIds if there are new ones
 */
export function getNewBlocksIntroducedIn(levelId: string): string[] {
    const newBlocks: string[] = []

    for (const [blockId, introLevelId] of Object.entries(FIRST_INTRO_LEVEL_BY_BLOCK)) {
        if (introLevelId === levelId) {
            newBlocks.push(blockId)
        }
    }

    // Sort by a predefined teaching order (define before call, etc.)
    const teachingOrder = [
        "forward",
        "turn-right",
        "turn-left",
        "collect-coin",
        "repeat",
        "if-blocked",
        "variable",
        "function-define",
        "function-call",
    ]

    return newBlocks.sort((a, b) => {
        const indexA = teachingOrder.indexOf(a)
        const indexB = teachingOrder.indexOf(b)
        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
    })
}

/**
 * Check if a level requires a specific block to be used for victory
 * Only applies to levels that introduce the block
 */
export function getRequiredBlocksForLevel(levelId: string): string[] {
    return getNewBlocksIntroducedIn(levelId)
}

/**
 * Full lesson content for each block
 */
export interface BlockLesson {
    blockId: string
    name: string
    icon: string
    whatItDoes: string
    howToUse: string[]
    example: string
    tips: string[]
    commonMistake: string
}

export const BLOCK_LESSONS: Record<string, BlockLesson> = {
    forward: {
        blockId: "forward",
        name: "Avanzar",
        icon: "⬆️",
        whatItDoes: "Mueve el barco un paso hacia donde está mirando.",
        howToUse: [
            "Arrastrá el bloque 'Avanzar' al área de código",
            "El barco se moverá una casilla en la dirección que mira",
            "Podés poner varios seguidos para avanzar más",
        ],
        example: "Avanzar → Avanzar → Avanzar = 3 pasos",
        tips: ["Antes de avanzar, asegurate de que no hay obstáculos adelante"],
        commonMistake: "Avanzar sin fijarse hacia dónde mira el barco. ¡Primero verificá la dirección!",
    },

    "turn-right": {
        blockId: "turn-right",
        name: "Girar Derecha",
        icon: "↩️",
        whatItDoes: "Gira el barco 90° hacia la derecha, sin moverse de lugar.",
        howToUse: [
            "Arrastrá 'Girar Derecha' al área de código",
            "El barco rotará en el lugar (no avanza)",
            "Después de girar, 'Avanzar' irá en la nueva dirección",
        ],
        example: "Mirando ↑ + Girar Derecha = Ahora mira →",
        tips: ["Usalo para cambiar de dirección cuando necesites ir a otro lado"],
        commonMistake: "Pensar que girar también mueve. ¡Girar solo rota, no avanza!",
    },

    "turn-left": {
        blockId: "turn-left",
        name: "Girar Izquierda",
        icon: "↪️",
        whatItDoes: "Gira el barco 90° hacia la izquierda, sin moverse de lugar.",
        howToUse: [
            "Arrastrá 'Girar Izquierda' al área de código",
            "El barco rotará hacia la izquierda",
            "Combiná con 'Girar Derecha' para maniobras complejas",
        ],
        example: "Mirando ↑ + Girar Izquierda = Ahora mira ←",
        tips: ["A veces es más corto girar a la izquierda que girar 3 veces a la derecha"],
        commonMistake: "Confundir izquierda y derecha. ¡Pensá desde el punto de vista del barco!",
    },

    "collect-coin": {
        blockId: "collect-coin",
        name: "Recoger Moneda",
        icon: "🪙",
        whatItDoes: "Recoge la moneda o tesoro de la casilla donde está el barco.",
        howToUse: [
            "Primero mové el barco hasta la casilla con la moneda",
            "Cuando estés arriba de la moneda, usá 'Recoger Moneda'",
            "La moneda se suma a tu inventario",
        ],
        example: "Avanzar → Avanzar → Recoger Moneda",
        tips: ["Si pasás por la moneda sin recogerla, no cuenta"],
        commonMistake: "Usar 'Recoger' antes de llegar a la moneda. ¡Primero mové el barco!",
    },

    repeat: {
        blockId: "repeat",
        name: "Repetir",
        icon: "🔄",
        whatItDoes: "Ejecuta los bloques de adentro N veces. ¡Ahorra código!",
        howToUse: [
            "Arrastrá 'Repetir' al área de código",
            "Poné el número de veces que querés repetir",
            "Arrastrá otros bloques ADENTRO del Repetir",
            "Esos bloques se ejecutarán N veces",
        ],
        example: "Repetir 4 veces { Avanzar } = Avanzar 4 casillas",
        tips: ["Buscá patrones: si repetís lo mismo varias veces, usá Repetir"],
        commonMistake: "Dejar el Repetir vacío. ¡Tenés que poner bloques adentro!",
    },

    "if-blocked": {
        blockId: "if-blocked",
        name: "Si Bloqueado",
        icon: "🚧",
        whatItDoes: "Ejecuta los bloques de adentro solo si hay un obstáculo adelante.",
        howToUse: [
            "Arrastrá 'Si Bloqueado' al área de código",
            "Poné bloques adentro (ej: Girar)",
            "Si adelante hay roca/borde, ejecuta los bloques",
            "Si no hay nada, los salta",
        ],
        example: "Si Bloqueado { Girar Derecha } → El barco gira solo si hay obstáculo",
        tips: ["Combinalo con Repetir para navegar laberintos automáticamente"],
        commonMistake: "Pensar que siempre ejecuta. ¡Solo ejecuta si realmente hay algo bloqueando!",
    },

    variable: {
        blockId: "variable",
        name: "Variable",
        icon: "📝",
        whatItDoes: "Guarda un número en la memoria para usarlo después.",
        howToUse: [
            "Arrastrá 'Variable' al área de código",
            "Dale un nombre (ej: 'monedas')",
            "Usá 'Cambiar Variable' para sumar o restar",
            "El valor se guarda durante toda la ejecución",
        ],
        example: "monedas = 0 → Recoger → monedas = monedas + 1",
        tips: ["Usá variables para contar cuántas monedas recogiste"],
        commonMistake: "Olvidarse de crear la variable antes de usarla.",
    },

    "function-define": {
        blockId: "function-define",
        name: "Definir Función",
        icon: "📦",
        whatItDoes: "Crea tu propio bloque reutilizable con varios pasos adentro.",
        howToUse: [
            "Arrastrá 'Definir Función' al área de código",
            "Dale un nombre descriptivo (ej: 'avanzar3')",
            "Poné los bloques que querés agrupar adentro",
            "Después usá 'Llamar Función' para ejecutarla",
        ],
        example: "Definir 'avanzar3' { Avanzar, Avanzar, Avanzar }",
        tips: ["Si repetís la misma secuencia, convertila en función"],
        commonMistake: "Definir pero nunca llamar. ¡La función no hace nada hasta que la llamás!",
    },

    "function-call": {
        blockId: "function-call",
        name: "Llamar Función",
        icon: "📞",
        whatItDoes: "Ejecuta una función que definiste antes.",
        howToUse: [
            "Primero definí una función con 'Definir Función'",
            "Arrastrá 'Llamar Función' donde quieras usarla",
            "Elegí el nombre de la función a llamar",
            "Se ejecutarán todos los bloques de esa función",
        ],
        example: "Llamar 'avanzar3' → Ejecuta Avanzar 3 veces",
        tips: ["Podés llamar la misma función muchas veces"],
        commonMistake: "Llamar una función que no existe. ¡Primero definila!",
    },
}

/**
 * Get the lesson for a specific block
 */
export function getBlockLesson(blockId: string): BlockLesson | null {
    return BLOCK_LESSONS[blockId] || null
}
