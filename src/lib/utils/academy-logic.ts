import { LessonProgress } from "../types/academy"

// Constantes para calibrar dificultad
const MAX_STARS = 3

/**
 * Calcula las estrellas ganadas (0-3) basándose en el desempeño.
 * 
 * Reglas:
 * 3 Estrellas:
 * - Quiz perfecto (3/3)
 * - 0 Hints usados
 * - Intentos totales <= cantidad de ejercicios (es decir, 1 intento por ejercicio, perfecto a la primera)
 * 
 * 2 Estrellas:
 * - Quiz aprobado (>= 2/3)
 * - Max 1 Hint usado
 * - Intentos totales <= ejercicios * 2
 * 
 * 1 Estrella:
 * - Completó la lección (todos los ejercicios resueltos)
 * - No cumple criterios anteriores
 * 
 * 0 Estrellas:
 * - No completó la lección
 */
export function calculateStars(
    quizScore: number,
    totalQuestions: number,
    hintsUsed: number,
    attempts: number,
    totalExercises: number
): number {
    // Si no completó suficientes preguntas del quiz (ej. < 2 en un quiz de 3), max 1 estrella si completó la práctica
    // Pero asumimos que esta función se llama al FINALIZAR con éxito la práctica.

    // Regla 3 Estrellas
    const isQuizPerfect = quizScore === totalQuestions
    const noHints = hintsUsed === 0
    const perfectAttempts = attempts <= totalExercises

    if (isQuizPerfect && noHints && perfectAttempts) {
        return 3
    }

    // Regla 2 Estrellas
    const isQuizGood = quizScore >= Math.ceil(totalQuestions * 0.66) // >= 2 de 3
    const lowHints = hintsUsed <= 1
    const reasonableAttempts = attempts <= (totalExercises * 2)

    if (isQuizGood && lowHints && reasonableAttempts) {
        return 2
    }

    // Si llegó hasta aquí (completó la lección), al menos 1 estrella
    return 1
}

/**
 * Determina si el usuario paso el quiz lo suficiente para aprobar la leccion
 * aunque el requerimiento suele ser solo completar la practica.
 */
export function hasPassedQuiz(score: number, total: number): boolean {
    return score >= Math.ceil(total * 0.5)
}