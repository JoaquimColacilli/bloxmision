"use client"

import { cn } from "@/lib/utils"
import type { LetterState, KeyboardState } from "@/lib/wordle/types"
import { Delete, CornerDownLeft } from "lucide-react"

interface WordleKeyboardProps {
    onKey: (key: string) => void
    onEnter: () => void
    onBackspace: () => void
    keyStates: KeyboardState
    disabled?: boolean
}

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
]

const stateStyles: Record<LetterState | 'unused', string> = {
    correct: "bg-green-500 text-white border-green-600 hover:bg-green-600",
    present: "bg-yellow-500 text-white border-yellow-600 hover:bg-yellow-600",
    absent: "bg-slate-500 text-white border-slate-600 hover:bg-slate-600",
    empty: "bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300",
    unused: "bg-slate-200 text-slate-800 border-slate-300 hover:bg-slate-300"
}

export function WordleKeyboard({
    onKey,
    onEnter,
    onBackspace,
    keyStates,
    disabled = false
}: WordleKeyboardProps) {

    const handleClick = (key: string) => {
        if (disabled) return

        if (key === 'ENTER') {
            onEnter()
        } else if (key === 'BACK') {
            onBackspace()
        } else {
            onKey(key)
        }
    }

    return (
        <div className="flex flex-col gap-2 items-center w-full max-w-lg mx-auto">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 justify-center">
                    {row.map((key) => {
                        const isSpecial = key === 'ENTER' || key === 'BACK'
                        const state = keyStates[key] || 'unused'

                        return (
                            <button
                                key={key}
                                onClick={() => handleClick(key)}
                                disabled={disabled}
                                className={cn(
                                    "flex items-center justify-center rounded-lg border-2 font-bold",
                                    "transition-all duration-100 active:scale-95",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    isSpecial
                                        ? "px-3 py-4 text-xs sm:px-4 sm:text-sm"
                                        : "w-8 h-12 sm:w-10 sm:h-14 text-sm sm:text-base",
                                    stateStyles[state]
                                )}
                            >
                                {key === 'ENTER' ? (
                                    <CornerDownLeft className="size-5" />
                                ) : key === 'BACK' ? (
                                    <Delete className="size-5" />
                                ) : (
                                    key
                                )}
                            </button>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
