/**
 * GET /api/daily-challenge/progress
 * 
 * Returns user's progress for today's challenge
 * Used to restore state on page load
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDayNumber, getTodayWord } from '@/lib/wordle/words.server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { DailyChallengeProgress } from '@/lib/wordle/types'
import { createEmptyProgress } from '@/lib/wordle/types'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'Usuario no autenticado' },
                { status: 401 }
            )
        }

        const dayNumber = getDayNumber()
        const progressRef = doc(db, 'users', userId, 'dailyChallenge', String(dayNumber))
        const progressSnap = await getDoc(progressRef)

        if (progressSnap.exists()) {
            const progress = progressSnap.data() as DailyChallengeProgress

            // Include word if game is over
            const todayWord = getTodayWord()
            const response: any = { ...progress }

            if (progress.status !== 'playing') {
                response.word = todayWord
            }

            return NextResponse.json(response)
        }

        // No progress yet, return empty
        return NextResponse.json(createEmptyProgress(dayNumber))

    } catch (error) {
        console.error('[daily-challenge/progress] Error:', error)
        return NextResponse.json(
            { error: 'Error al obtener progreso' },
            { status: 500 }
        )
    }
}
