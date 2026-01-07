/**
 * Wordle Game Logic - SERVER ONLY
 * 
 * Implements 2-pass matching algorithm for correct duplicate handling
 */

import type { LetterState, GuessResult } from './types'

/**
 * Validates if a guess is valid (5 letters A-Z only)
 */
export function isValidGuess(guess: string): { valid: boolean; error?: string } {
    if (!guess) {
        return { valid: false, error: 'Ingresá una palabra' }
    }

    const normalized = guess.toUpperCase().trim()

    if (normalized.length !== 5) {
        return { valid: false, error: 'La palabra debe tener 5 letras' }
    }

    if (!/^[A-Z]+$/.test(normalized)) {
        return { valid: false, error: 'Solo letras A-Z (sin tildes)' }
    }

    return { valid: true }
}

/**
 * 2-pass matching algorithm for Wordle
 * 
 * Pass 1: Mark all CORRECT positions first
 * Pass 2: Mark PRESENT only for remaining unmatched letters
 * 
 * This correctly handles duplicate letters
 */
export function evaluateGuess(guess: string, answer: string): LetterState[] {
    const guessArr = guess.toUpperCase().split('')
    const answerArr = answer.toUpperCase().split('')

    const result: LetterState[] = new Array(5).fill('absent')
    const answerLetterCount: Record<string, number> = {}

    // Count letters in answer
    for (const letter of answerArr) {
        answerLetterCount[letter] = (answerLetterCount[letter] || 0) + 1
    }

    // PASS 1: Mark correct positions (exact matches)
    for (let i = 0; i < 5; i++) {
        if (guessArr[i] === answerArr[i]) {
            result[i] = 'correct'
            answerLetterCount[guessArr[i]]-- // Consume this letter
        }
    }

    // PASS 2: Mark present letters (in word but wrong position)
    for (let i = 0; i < 5; i++) {
        // Skip already correct letters
        if (result[i] === 'correct') continue

        const letter = guessArr[i]
        // If this letter exists in answer and we haven't used all occurrences
        if (answerLetterCount[letter] && answerLetterCount[letter] > 0) {
            result[i] = 'present'
            answerLetterCount[letter]-- // Consume this letter
        }
        // Otherwise it stays 'absent'
    }

    return result
}

/**
 * Full guess evaluation with result object
 */
export function processGuess(guess: string, answer: string): GuessResult {
    const normalizedGuess = guess.toUpperCase()
    const normalizedAnswer = answer.toUpperCase()

    const feedback = evaluateGuess(normalizedGuess, normalizedAnswer)
    const isCorrect = normalizedGuess === normalizedAnswer

    return {
        guess: normalizedGuess,
        feedback,
        isCorrect
    }
}
