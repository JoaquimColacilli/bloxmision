"use client"

import { WordleTile } from "./wordle-tile"
import type { LetterState } from "@/lib/wordle/types"

interface WordleGridProps {
    guesses: string[]
    feedback: LetterState[][]
    currentGuess: string
    maxAttempts?: number
    wordLength?: number
}

export function WordleGrid({
    guesses,
    feedback,
    currentGuess,
    maxAttempts = 6,
    wordLength = 5
}: WordleGridProps) {
    // Build rows: past guesses + current input + empty future rows
    const rows: { letters: string[]; states: LetterState[] }[] = []

    // Add completed guesses with their feedback
    for (let i = 0; i < guesses.length; i++) {
        const guess = guesses[i]
        const states = feedback[i] || []
        rows.push({
            letters: guess.split(''),
            states: states.length > 0 ? states : new Array(wordLength).fill('empty')
        })
    }

    // Add current guess row if still playing
    if (guesses.length < maxAttempts) {
        const currentLetters = currentGuess.padEnd(wordLength, ' ').split('').slice(0, wordLength)
        rows.push({
            letters: currentLetters.map(l => l.trim()),
            states: new Array(wordLength).fill('empty')
        })
    }

    // Fill remaining empty rows
    while (rows.length < maxAttempts) {
        rows.push({
            letters: new Array(wordLength).fill(''),
            states: new Array(wordLength).fill('empty')
        })
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            {rows.map((row, rowIndex) => {
                const isCurrentRow = rowIndex === guesses.length && guesses.length < maxAttempts
                const isRevealedRow = rowIndex < guesses.length

                return (
                    <div key={rowIndex} className="flex gap-2">
                        {row.letters.map((letter, colIndex) => (
                            <WordleTile
                                key={`${rowIndex}-${colIndex}`}
                                letter={letter}
                                state={row.states[colIndex]}
                                isCurrentRow={isCurrentRow}
                                delay={isRevealedRow ? colIndex : 0}
                            />
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
