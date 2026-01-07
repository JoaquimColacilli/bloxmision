"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { WordleGrid } from "./wordle-grid"
import { WordleKeyboard } from "./wordle-keyboard"
import { WordleResult } from "./wordle-result"
import { Loader2, AlertCircle } from "lucide-react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { awardJorCoins } from "@/src/lib/services/shopService"
import type {
    DailyChallengeInfo,
    DailyChallengeProgress,
    LetterState,
    KeyboardState,
    GuessResponse
} from "@/lib/wordle/types"
import { createEmptyProgress } from "@/lib/wordle/types"

interface WordleGameProps {
    userId: string
}

// Firestore-safe progress (serialize nested arrays)
interface FirestoreProgress {
    dayNumber: number
    guesses: string[]
    feedbackJson: string // JSON serialized feedback to avoid nested arrays
    status: 'playing' | 'won' | 'lost'
    attempts: number
    rewardClaimed: boolean
    updatedAt: number
    hint?: string
}

function toFirestoreProgress(progress: DailyChallengeProgress, hint?: string): FirestoreProgress {
    const data: FirestoreProgress = {
        dayNumber: progress.dayNumber,
        guesses: progress.guesses,
        feedbackJson: JSON.stringify(progress.feedback),
        status: progress.status,
        attempts: progress.attempts,
        rewardClaimed: progress.rewardClaimed,
        updatedAt: progress.updatedAt
    }
    // Only include hint if it has a value (Firestore rejects undefined)
    if (hint) {
        data.hint = hint
    }
    return data
}

function fromFirestoreProgress(data: FirestoreProgress): DailyChallengeProgress {
    return {
        dayNumber: data.dayNumber,
        guesses: data.guesses,
        feedback: data.feedbackJson ? JSON.parse(data.feedbackJson) : [],
        status: data.status,
        attempts: data.attempts,
        rewardClaimed: data.rewardClaimed,
        updatedAt: data.updatedAt
    }
}

export function WordleGame({ userId }: WordleGameProps) {
    // Game state
    const [info, setInfo] = useState<DailyChallengeInfo | null>(null)
    const [progress, setProgress] = useState<DailyChallengeProgress | null>(null)
    const [currentGuess, setCurrentGuess] = useState('')
    const [keyStates, setKeyStates] = useState<KeyboardState>({})
    const [revealedWord, setRevealedWord] = useState<string | null>(null)
    const [currentHint, setCurrentHint] = useState<string | null>(null)

    // UI state
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(false)

    // Load game info and progress on mount
    useEffect(() => {
        async function loadGame() {
            try {
                setLoading(true)
                setError(null)

                // Fetch info (dayNumber from server)
                const infoRes = await fetch('/api/daily-challenge/info')
                if (!infoRes.ok) throw new Error('Error al cargar info')
                const infoData = await infoRes.json()
                setInfo(infoData)

                // Fetch user progress directly from Firestore (client-side has auth)
                const progressRef = doc(db, 'users', userId, 'dailyChallenge', String(infoData.dayNumber))
                const progressSnap = await getDoc(progressRef)

                let progressData: DailyChallengeProgress
                let savedHint: string | null = null

                if (progressSnap.exists()) {
                    const firestoreData = progressSnap.data() as FirestoreProgress
                    // Check for legacy hint format (old technical categories) -> Reset if found
                    const legacyKeywords = ['DevOps', 'Infra', 'Seguridad', 'Arquitectura', 'Datos/Storage', 'Messaging']
                    const isLegacy = firestoreData.hint && legacyKeywords.some(kw => firestoreData.hint?.includes(kw))

                    if (isLegacy) {
                        console.log('Legacy hint detected, resetting progress')
                        progressData = createEmptyProgress(infoData.dayNumber)
                        savedHint = null
                        // Force save reset
                        await setDoc(progressRef, toFirestoreProgress(progressData))
                    } else {
                        progressData = fromFirestoreProgress(firestoreData)
                        savedHint = firestoreData.hint || null
                    }
                } else {
                    progressData = createEmptyProgress(infoData.dayNumber)
                }

                setProgress(progressData)
                setCurrentHint(savedHint || infoData.initialHint || null)

                // Update keyboard states from previous guesses
                if (progressData.guesses && progressData.feedback) {
                    updateKeyboardStates(progressData.guesses, progressData.feedback)
                }

                // If game is already over, fetch the word from API
                if (progressData.status !== 'playing') {
                    const revealRes = await fetch(`/api/daily-challenge/reveal?dayNumber=${infoData.dayNumber}`)
                    if (revealRes.ok) {
                        const { word } = await revealRes.json()
                        setRevealedWord(word)
                        setShowResult(true)
                    }
                }

            } catch (err) {
                console.error('Error loading game:', err)
                setError('No pudimos cargar el desafío. Intentá de nuevo.')
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            loadGame()
        }
    }, [userId])

    // Update keyboard state based on all guesses
    const updateKeyboardStates = (guesses: string[], feedback: LetterState[][]) => {
        const newStates: KeyboardState = {}

        guesses.forEach((guess, guessIdx) => {
            const states = feedback[guessIdx] || []
            guess.split('').forEach((letter, letterIdx) => {
                const state = states[letterIdx]
                if (!state) return

                // Priority: correct > present > absent
                const currentState = newStates[letter]
                if (state === 'correct') {
                    newStates[letter] = 'correct'
                } else if (state === 'present' && currentState !== 'correct') {
                    newStates[letter] = 'present'
                } else if (state === 'absent' && !currentState) {
                    newStates[letter] = 'absent'
                }
            })
        })

        setKeyStates(newStates)
    }

    // Save progress to Firestore
    const saveProgress = useCallback(async (newProgress: DailyChallengeProgress, hint?: string) => {
        if (!info) return

        try {
            const progressRef = doc(db, 'users', userId, 'dailyChallenge', String(info.dayNumber))
            await setDoc(progressRef, toFirestoreProgress(newProgress, hint || undefined))
        } catch (err) {
            console.error('Error saving progress:', err)
        }
    }, [userId, info])

    // Handle letter input
    const handleKey = useCallback((key: string) => {
        if (!progress || progress.status !== 'playing') return
        if (currentGuess.length >= 5) return

        setCurrentGuess(prev => prev + key)
        setError(null)
    }, [progress, currentGuess])

    // Handle backspace
    const handleBackspace = useCallback(() => {
        if (!progress || progress.status !== 'playing') return
        setCurrentGuess(prev => prev.slice(0, -1))
        setError(null)
    }, [progress])

    // Handle enter (submit guess)
    const handleEnter = useCallback(async () => {
        if (!progress || progress.status !== 'playing' || !info) return
        if (currentGuess.length !== 5) {
            setError('La palabra debe tener 5 letras')
            return
        }

        try {
            setSubmitting(true)
            setError(null)

            // Validate guess via API (keeps word secret)
            const res = await fetch('/api/daily-challenge/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guess: currentGuess,
                    dayNumber: info.dayNumber,
                    attemptsUsed: progress.attempts
                })
            })

            const data: GuessResponse = await res.json()

            if (!data.success && data.error) {
                setError(data.error)
                return
            }

            // Update progress with new guess
            const newProgress: DailyChallengeProgress = {
                ...progress,
                guesses: [...progress.guesses, currentGuess.toUpperCase()],
                feedback: [...progress.feedback, data.feedback || []],
                status: data.status,
                attempts: data.attemptsUsed,
                updatedAt: Date.now()
            }

            setProgress(newProgress)

            // Update hint
            if (data.hint) {
                setCurrentHint(data.hint)
            }

            // Save to Firestore
            await saveProgress(newProgress, data.hint)

            // Update keyboard
            if (data.feedback) {
                updateKeyboardStates(
                    [...progress.guesses, currentGuess.toUpperCase()],
                    [...progress.feedback, data.feedback]
                )
            }

            // Clear current guess
            setCurrentGuess('')

            // Show result if game ended
            if (data.status !== 'playing' && data.word) {
                setRevealedWord(data.word)
                setTimeout(() => setShowResult(true), 500)

                // Award JorCoins if won (idempotent - uses dayNumber as unique rewardId)
                if (data.status === 'won' && info) {
                    const rewardId = `wordle-day-${info.dayNumber}`
                    awardJorCoins(userId, 5, rewardId, 'Desafío Diario completado')
                        .then(result => {
                            if (result.awarded) {
                                console.log('[Wordle] Awarded 5 JorCoins for day', info.dayNumber)
                            }
                        })
                        .catch(err => console.error('[Wordle] Error awarding coins:', err))
                }
            }

        } catch (err) {
            console.error('Error submitting guess:', err)
            setError('Error al enviar. Intentá de nuevo.')
        } finally {
            setSubmitting(false)
        }
    }, [currentGuess, progress, info, saveProgress])

    // Physical keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading || submitting || !progress || progress.status !== 'playing') return

            if (e.key === 'Enter') {
                e.preventDefault()
                handleEnter()
            } else if (e.key === 'Backspace') {
                e.preventDefault()
                handleBackspace()
            } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
                e.preventDefault()
                handleKey(e.key.toUpperCase())
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [loading, submitting, progress, handleEnter, handleBackspace, handleKey])

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="size-8 animate-spin text-ocean-600" />
                <p className="text-slate-600">Cargando desafío...</p>
            </div>
        )
    }

    // Error state (no progress loaded)
    if (!progress || !info) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center p-4">
                <AlertCircle className="size-12 text-red-500" />
                <p className="text-slate-700 font-medium">No pudimos cargar el desafío</p>
                <p className="text-sm text-slate-500">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-ocean-600 hover:underline"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-6 py-4">
            {/* Attempts counter */}
            <div className="text-center">
                <p className="text-sm text-slate-500">
                    {progress.status === 'playing'
                        ? `Intento ${progress.attempts + 1} de ${info.maxAttempts}`
                        : progress.status === 'won'
                            ? `¡Ganaste en ${progress.attempts} intento${progress.attempts > 1 ? 's' : ''}!`
                            : `Sin intentos restantes`
                    }
                </p>
            </div>

            {/* Jorc Hint Display */}
            {currentHint && progress.status === 'playing' && (
                <div className="flex flex-row items-end gap-3 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Avatar */}
                    <div className="shrink-0 relative size-12 overflow-hidden rounded-full border-2 border-ocean-500 bg-ocean-100 shadow-sm">
                        <Image
                            src="/sprites/jorc_raw/frame-02.png"
                            alt="Jorc"
                            fill
                            className="object-cover scale-125 translate-y-1"
                        />
                    </div>

                    {/* Speech Bubble */}
                    <div className="relative rounded-2xl rounded-bl-none bg-white p-3 shadow-md border border-ocean-100 text-sm text-ocean-800">
                        <p className="font-medium mb-0.5 text-xs text-ocean-500 uppercase tracking-wider">Pista de Jorc</p>
                        {currentHint}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-700 text-sm animate-shake">
                    {error}
                </div>
            )}

            {/* Grid */}
            <WordleGrid
                guesses={progress.guesses}
                feedback={progress.feedback}
                currentGuess={currentGuess}
                maxAttempts={info.maxAttempts}
                wordLength={info.wordLength}
            />

            {/* Keyboard */}
            <WordleKeyboard
                onKey={handleKey}
                onEnter={handleEnter}
                onBackspace={handleBackspace}
                keyStates={keyStates}
                disabled={submitting || progress.status !== 'playing'}
            />

            {/* Result modal */}
            {showResult && revealedWord && (
                <WordleResult
                    status={progress.status as 'won' | 'lost'}
                    word={revealedWord}
                    attempts={progress.attempts}
                    feedback={progress.feedback}
                    dayNumber={info.dayNumber}
                    nextResetUtc={info.nextResetUtc}
                    onClose={() => setShowResult(false)}
                />
            )}
        </div>
    )
}
