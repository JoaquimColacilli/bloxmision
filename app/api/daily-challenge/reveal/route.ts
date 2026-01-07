/**
 * GET /api/daily-challenge/reveal
 * 
 * Reveals the word for a specific day (only for post-game)
 * Used when restoring a completed game
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDayNumber, VALIDATED_WORDS } from '@/lib/wordle/words.server'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const dayNumberParam = searchParams.get('dayNumber')

        if (!dayNumberParam) {
            return NextResponse.json(
                { error: 'Missing dayNumber parameter' },
                { status: 400 }
            )
        }

        const dayNumber = parseInt(dayNumberParam, 10)

        if (isNaN(dayNumber)) {
            return NextResponse.json(
                { error: 'Invalid dayNumber' },
                { status: 400 }
            )
        }

        // Get word for that day
        const word = VALIDATED_WORDS[dayNumber % VALIDATED_WORDS.length]

        return NextResponse.json({ word, dayNumber })

    } catch (error) {
        console.error('[daily-challenge/reveal] Error:', error)
        return NextResponse.json(
            { error: 'Error al revelar palabra' },
            { status: 500 }
        )
    }
}
