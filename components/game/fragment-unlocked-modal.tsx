"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Map, Sparkles, Trophy } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"

interface FragmentUnlockedModalProps {
    isOpen: boolean
    onClose: () => void
    fragmentId: string
    fragmentDescription?: string
    currentCount: number       // Total fragments including this one
    totalFragments?: number    // Always 15
    isMapComplete: boolean     // True if this was the final fragment
}

export function FragmentUnlockedModal({
    isOpen,
    onClose,
    fragmentId,
    fragmentDescription,
    currentCount,
    totalFragments = 15,
    isMapComplete
}: FragmentUnlockedModalProps) {
    const [isAnimated, setIsAnimated] = useState(false)
    const [progressWidth, setProgressWidth] = useState(((currentCount - 1) / totalFragments) * 100)

    // Extract world and fragment number from fragmentId (e.g., "fragment-1-2" -> World 1, Fragment 2)
    const parts = fragmentId.split('-')
    const worldNum = parts[1] || '?'
    const fragNum = parts[2] || '?'

    // The fragment image is based on the total count (order 1-15)
    const fragmentImagePath = `/fragments/fragment-${currentCount}.png`

    // Animate on open
    useEffect(() => {
        if (isOpen) {
            setIsAnimated(false)
            setProgressWidth(((currentCount - 1) / totalFragments) * 100)
            const timer = setTimeout(() => {
                setIsAnimated(true)
                setProgressWidth((currentCount / totalFragments) * 100)
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isOpen, currentCount, totalFragments])

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-400">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl text-amber-800">
                        {isMapComplete ? (
                            <>
                                <Trophy className="h-8 w-8 text-yellow-500" />
                                ¡Mapa Completo!
                            </>
                        ) : (
                            <>
                                <Map className="h-7 w-7 text-amber-600" />
                                ¡Fragmento Encontrado!
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 space-y-4">
                    {/* Animated fragment image */}
                    <div
                        className={`relative p-3 rounded-2xl shadow-lg transition-all duration-700 ${isAnimated ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'
                            } ${isMapComplete
                                ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                                : "bg-gradient-to-br from-amber-400 to-orange-500"
                            }`}
                    >
                        <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse z-10" />
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-amber-200/50">
                            <Image
                                src={fragmentImagePath}
                                alt={`Fragmento ${currentCount} del mapa`}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {isMapComplete && (
                            <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-300 animate-pulse z-10" />
                        )}
                    </div>

                    {/* Fragment info */}
                    <div className="text-center space-y-2">
                        <p className="text-lg font-semibold text-amber-800">
                            {isMapComplete
                                ? "¡Has encontrado todos los fragmentos!"
                                : fragmentDescription || `Fragmento ${fragNum} del Mundo ${worldNum}`
                            }
                        </p>

                        {/* Progress bar */}
                        <div className="w-64 mx-auto">
                            <div className="flex justify-between text-sm text-amber-700 mb-1">
                                <span>Progreso del mapa</span>
                                <span className="font-bold">{currentCount}/{totalFragments}</span>
                            </div>
                            <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                                <div
                                    style={{ width: `${progressWidth}%` }}
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${isMapComplete
                                        ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                        : "bg-gradient-to-r from-amber-400 to-orange-500"
                                        }`}
                                />
                            </div>
                        </div>

                        {/* XP bonus message */}
                        <p className="text-amber-600 font-medium mt-2">
                            +100 XP de bonificación 🎉
                        </p>

                        {isMapComplete && (
                            <div
                                className={`mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300 transition-all duration-500 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                    }`}
                            >
                                <p className="text-yellow-800 font-medium">
                                    ¡Desbloqueaste el Tesoro del Dargholl!
                                </p>
                                <p className="text-sm text-yellow-700">
                                    Visita el Mapa del Tesoro para ver tu recompensa
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={onClose}
                        className={`px-8 ${isMapComplete
                            ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                            } text-white font-semibold`}
                    >
                        {isMapComplete ? "¡Ver el Tesoro!" : "¡Continuar!"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
