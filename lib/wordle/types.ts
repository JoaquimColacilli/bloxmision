/**
 * Wordle Types - Safe to import from client
 */

export type LetterState = 'correct' | 'present' | 'absent' | 'empty'

export interface LetterResult {
    letter: string
    state: LetterState
}

export interface GuessResult {
    guess: string
    feedback: LetterState[]
    isCorrect: boolean
}

export interface DailyChallengeInfo {
    dayNumber: number
    wordLength: number
    maxAttempts: number
    nextResetUtc: number
    initialHint?: string // Hint for 0 attempts
}

export interface DailyChallengeProgress {
    dayNumber: number
    guesses: string[]
    feedback: LetterState[][]
    status: 'playing' | 'won' | 'lost'
    attempts: number
    rewardClaimed: boolean
    updatedAt: number
}

export interface GuessResponse {
    success: boolean
    feedback?: LetterState[]
    isCorrect?: boolean
    status: 'playing' | 'won' | 'lost'
    attemptsUsed: number
    error?: string
    word?: string // Only revealed when game is over
    hint?: string // Progressive hint for next attempt
}

export interface KeyboardState {
    [key: string]: LetterState
}

// Helper to create empty progress
export function createEmptyProgress(dayNumber: number): DailyChallengeProgress {
    return {
        dayNumber,
        guesses: [],
        feedback: [],
        status: 'playing',
        attempts: 0,
        rewardClaimed: false,
        updatedAt: Date.now()
    }
}
