/**
 * POST /api/daily-challenge/guess
 * 
 * Validates a guess against today's word.
 * Uses Spanish dictionary API for word validation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDayNumber, getTodayWord, VALID_GUESSES, getHint } from '@/lib/wordle/words.server'
import { isValidGuess, processGuess } from '@/lib/wordle/game-logic.server'
import { validateGuessWord } from '@/lib/wordle/dictionary-api'
import type { GuessResponse } from '@/lib/wordle/types'

const MAX_ATTEMPTS = 6

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { guess, dayNumber, attemptsUsed = 0 } = body

        // Validate guess format (5 letters, A-Z only)
        const validation = isValidGuess(guess)
        if (!validation.valid) {
            return NextResponse.json({
                success: false,
                error: validation.error,
                status: 'playing',
                attemptsUsed
            } as GuessResponse)
        }

        const normalizedGuess = guess.toUpperCase().trim()

        // Validate word using local list + Spanish dictionary API
        const wordValidation = await validateGuessWord(normalizedGuess, VALID_GUESSES)

        if (!wordValidation.isValid) {
            return NextResponse.json({
                success: false,
                error: 'Palabra no válida. Probá con otra.',
                status: 'playing',
                attemptsUsed
            } as GuessResponse)
        }

        // Use server's day number for security
        const serverDayNumber = getDayNumber()
        const todayWord = getTodayWord()

        // Process the guess
        const result = processGuess(normalizedGuess, todayWord)

        // Calculate new attempts
        const newAttempts = attemptsUsed + 1

        // Determine status
        let status: 'playing' | 'won' | 'lost' = 'playing'
        if (result.isCorrect) {
            status = 'won'
        } else if (newAttempts >= MAX_ATTEMPTS) {
            status = 'lost'
        }

        // Get hint for next attempt (if still playing)
        const hint = status === 'playing' ? getHint(todayWord, newAttempts + 1) : null

        // Build response
        const response: GuessResponse = {
            success: true,
            feedback: result.feedback,
            isCorrect: result.isCorrect,
            status,
            attemptsUsed: newAttempts,
            hint: hint || undefined
        }

        // Only reveal word when game is over
        if (status !== 'playing') {
            response.word = todayWord
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('[daily-challenge/guess] Error:', error)
        return NextResponse.json(
            { error: 'Error al procesar el intento', success: false } as GuessResponse,
            { status: 500 }
        )
    }
}
