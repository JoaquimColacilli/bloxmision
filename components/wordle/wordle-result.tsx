"use client"

import { useState, useEffect } from "react"
import { Trophy, X, Clock, Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LetterState } from "@/lib/wordle/types"

interface WordleResultProps {
    status: 'won' | 'lost'
    word: string
    attempts: number
    feedback: LetterState[][]
    dayNumber: number
    nextResetUtc: number
    onClose: () => void
}

export function WordleResult({
    status,
    word,
    attempts,
    feedback,
    dayNumber,
    nextResetUtc,
    onClose
}: WordleResultProps) {
    const [copied, setCopied] = useState(false)
    const [countdown, setCountdown] = useState('')

    // Countdown timer
    useEffect(() => {
        const updateCountdown = () => {
            const now = Date.now()
            const diff = nextResetUtc - now

            if (diff <= 0) {
                setCountdown('¡Ya está listo!')
                return
            }

            const hours = Math.floor(diff / 3600000)
            const minutes = Math.floor((diff % 3600000) / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)

            setCountdown(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            )
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)
        return () => clearInterval(interval)
    }, [nextResetUtc])

    // Generate share text
    const generateShareText = () => {
        const emojiMap: Record<LetterState, string> = {
            correct: '🟩',
            present: '🟨',
            absent: '⬛',
            empty: '⬜'
        }

        const emojiGrid = feedback
            .map(row => row.map(state => emojiMap[state]).join(''))
            .join('\n')

        return `Desafío BloxMision #${dayNumber}\n${status === 'won' ? attempts : 'X'}/6\n\n${emojiGrid}\n\nbloxmision.com/desafio`
    }

    const handleShare = async () => {
        const text = generateShareText()

        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Fallback for older browsers
            console.log('Share text:', text)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        {status === 'won' ? (
                            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Trophy className="size-6 text-green-600" />
                            </div>
                        ) : (
                            <div className="size-12 rounded-full bg-red-100 flex items-center justify-center">
                                <X className="size-6 text-red-600" />
                            </div>
                        )}
                        <div>
                            <h2 className={cn(
                                "text-xl font-bold",
                                status === 'won' ? "text-green-700" : "text-red-700"
                            )}>
                                {status === 'won' ? '¡Genial!' : '¡Casi!'}
                            </h2>
                            <p className="text-sm text-slate-600">
                                {status === 'won'
                                    ? `La adivinaste en ${attempts} intento${attempts > 1 ? 's' : ''}`
                                    : 'Mejor suerte mañana'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Word reveal */}
                <div className="text-center py-4 bg-slate-50 rounded-xl mb-6">
                    <p className="text-sm text-slate-500 mb-1">La palabra era</p>
                    <p className="text-3xl font-bold tracking-widest text-slate-800">{word}</p>
                </div>

                {/* Stats for won */}
                {status === 'won' && (
                    <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gold-50 rounded-lg border border-gold-200">
                        <span className="text-2xl">💰</span>
                        <span className="text-gold-700 font-medium">+5 JorCoins</span>
                    </div>
                )}

                {/* Countdown */}
                <div className="flex items-center justify-center gap-2 text-slate-600 mb-6">
                    <Clock className="size-4" />
                    <span className="text-sm">Próximo desafío en</span>
                    <span className="font-mono font-bold text-ocean-600">{countdown}</span>
                </div>

                {/* Share button */}
                <Button
                    onClick={handleShare}
                    className="w-full bg-ocean-600 hover:bg-ocean-700"
                >
                    {copied ? (
                        <>
                            <Check className="mr-2 size-4" />
                            ¡Copiado!
                        </>
                    ) : (
                        <>
                            <Share2 className="mr-2 size-4" />
                            Compartir resultado
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
