/**
 * GET /api/daily-challenge/info
 * 
 * Returns daily challenge metadata
 */

import { NextResponse } from 'next/server'
import { getDayNumber, getNextResetUtc, getTodayWord, getHint } from '@/lib/wordle/words.server'
import type { DailyChallengeInfo } from '@/lib/wordle/types'

export async function GET() {
    const dayNumber = getDayNumber()
    const nextResetUtc = getNextResetUtc()
    const word = getTodayWord()

    // Get initial hint (attempt 1/0)
    const initialHint = getHint(word, 1)

    const info: DailyChallengeInfo = {
        dayNumber,
        wordLength: 5,
        maxAttempts: 6,
        nextResetUtc,
        // Add initial hint if available
        initialHint: initialHint || undefined
    }

    // Cache for 60 seconds
    return NextResponse.json(info, {
        headers: {
            'Cache-Control': 'public, max-age=60, s-maxage=60'
        }
    })
}
