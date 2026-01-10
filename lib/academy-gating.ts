import { getLevelConfig } from "./mock-level-data"
import { getLessonById } from "./lessons-data"

export interface GatingResult {
    allowed: boolean
    missingLessonId: string | null
    reason?: string
}

// 1. Matriz de Fuente de Verdad: Bloque -> Lección Requerida
// Esta matriz define qué lección es DUEÑA de cada bloque.
export const BLOCK_LESSON_OWNERSHIP: Record<string, string> = {
    // Básicos (Onboarding)
    "forward": "onboarding",
    "turn-right": "onboarding",
    "turn-left": "onboarding",
    "collect-coin": "onboarding", // Aparece en 1-4, pero es básico

    // Control Intermedio
    "repeat": "loop-1",

    // Condicionales
    "if-blocked": "cond-1",

    // Funciones (World 5)
    "function-define": "functions-1",
    "function-call": "functions-1",

    // Variables (World 5 avanzado)
    "variable": "variables-1",
}

// 2. Orden de Prioridad de Lecciones (para mensajes de error consistentes)
// Si faltan varias, pedimos la primera de esta lista.
const LESSON_PRIORITY = [
    "onboarding",
    "loop-1",
    "cond-1",
    "functions-1",
    "variables-1",
]

/**
 * Determina si un usuario puede acceder a un nivel basado en sus lecciones completadas.
 * Lógica determinística pura: Level Blocks -> Required Lessons -> User Progress
 */
export function canAccessLevel(
    levelId: string,
    completedLessons: string[] = [] // Default a array vacío por seguridad
): GatingResult {

    // Paso 0: Siempre verificar Onboarding (salvo que sea la lección misma, pero esto es gating de niveles)
    if (!completedLessons.includes("onboarding")) {
        return {
            allowed: false,
            missingLessonId: "onboarding",
            reason: "Debes completar el entrenamiento básico primero."
        }
    }

    // Paso 1: Obtener bloques reales del nivel
    // Esto es la fuente de verdad del contenido del nivel.
    const config = getLevelConfig(levelId)
    if (!config) {
        // Si el nivel no existe configuración (ej: dev), dejamos pasar o bloqueamos.
        // Por seguridad en prod, mejor bloquear o loguear. Asumimos permitido si es dev/test.
        console.warn(`[Gating] Level config not found for ${levelId}`)
        return { allowed: true, missingLessonId: null }
    }

    const levelBlocks = config.availableBlocks || []

    // Paso 2: Identificar lecciones faltantes
    const missingLessons = new Set<string>()

    for (const block of levelBlocks) {
        const requiredLesson = BLOCK_LESSON_OWNERSHIP[block]
        if (requiredLesson) {
            if (!completedLessons.includes(requiredLesson)) {
                missingLessons.add(requiredLesson)
            }
        }
    }

    // Paso 3: Determinar bloqueo determinístico por prioridad
    if (missingLessons.size > 0) {
        // Buscar la primera lección faltante según la lista de prioridad
        const firstMissing = LESSON_PRIORITY.find(lessonId => missingLessons.has(lessonId))

        if (firstMissing) {
            const lessonDef = getLessonById(firstMissing)
            return {
                allowed: false,
                missingLessonId: firstMissing,
                reason: `Este nivel usa bloques nuevos. Completa la lección "${lessonDef?.title || firstMissing}" para continuar.`
            }
        }
    }

    // Acceso concedido
    return { allowed: true, missingLessonId: null }
}
