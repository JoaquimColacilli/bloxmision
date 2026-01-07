import { Timestamp } from "firebase/firestore"

export type AcademyTab = "story" | "demo" | "practice" | "summary"

export interface AcademyLesson {
    id: string
    title: string
    description: string
    duration: string // e.g. "5 min"
    icon: string // Lucide icon name
    category: "basic" | "loop" | "conditional"
    order: number
    requiredLessonId?: string

    content: {
        story: {
            dialogue: string // Markdown
            character: "jorc" | "pirate"
        }
        demo: {
            gridSize: number
            steps: Array<{
                code: string[] // Code visible in block list
                activeLineIndex: number
                jorcState: { x: number; y: number; facing: "north" | "south" | "east" | "west" }
                message: string
            }>
        }
        practice: {
            exercises: PracticeExercise[]
        }
        summary: {
            keyPoints: string[]
            quiz: {
                questions: QuizQuestion[]
            }
        }
    }
}

export type PracticeType = "choice" | "order" | "fill"

export interface PracticeExercise {
    id: string
    type: PracticeType
    prompt: string
    // For multiple choice
    options?: Array<{ id: string; label: string; isCorrect: boolean }>
    // For order/drag (correct sequence of IDs)
    correctOrder?: string[]
    items?: Array<{ id: string; label: string }> // items to order
    // For fill in gap
    codeTemplate?: string // "Avanzar, [?], Giro"
    correctFill?: string

    hint: string
}

export interface QuizQuestion {
    id: string
    question: string
    options: Array<{ id: string; label: string; isCorrect: boolean }>
    explanation: string
}

export interface ExerciseStat {
    exerciseId: string
    attempts: number
    hintsUsed: number
    solved: boolean
}

export interface LessonProgress {
    lessonId: string
    userId: string
    status: "locked" | "unlocked" | "completed"

    // Granular stats for stars
    attemptsTotal: number
    hintsUsedTotal: number
    quizScore: number // 0 to 3
    timeSpentSec: number

    // Per-exercise details
    exerciseStats: ExerciseStat[]

    // Rewards tracking (Critical for idempotency)
    rewardsGranted: {
        jorCoins: boolean
        grantedAt?: Timestamp
    }

    starsEarned: number // 0, 1, 2, 3
    updatedAt: Timestamp
}

export interface AcademyUserProgress {
    completedLessons: string[]
    totalStars: number
    lastPlayedLessonId?: string
}