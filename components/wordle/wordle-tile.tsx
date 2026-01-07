"use client"

import { cn } from "@/lib/utils"
import type { LetterState } from "@/lib/wordle/types"

interface WordleTileProps {
    letter: string
    state: LetterState
    isCurrentRow?: boolean
    delay?: number
}

const stateStyles: Record<LetterState, string> = {
    correct: "bg-green-500 border-green-600 text-white",
    present: "bg-yellow-500 border-yellow-600 text-white",
    absent: "bg-slate-500 border-slate-600 text-white",
    empty: "bg-white border-slate-300 text-slate-800"
}

export function WordleTile({ letter, state, isCurrentRow = false, delay = 0 }: WordleTileProps) {
    const hasLetter = letter.length > 0
    const isRevealed = state !== 'empty'

    return (
        <div
            className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center",
                "text-2xl sm:text-3xl font-bold uppercase",
                "border-2 rounded-lg transition-all duration-200",
                stateStyles[state],
                hasLetter && state === 'empty' && "border-slate-400 scale-105",
                isRevealed && "animate-flip"
            )}
            style={{
                animationDelay: isRevealed ? `${delay * 100}ms` : '0ms'
            }}
        >
            {letter}
        </div>
    )
}
