"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Direction } from "@/lib/types"

/**
 * Sprite frame configuration per direction
 * - Up (north): frames 3-4 (alternating walk animation)
 * - Right (east): frames 13-16 (walk cycle)
 * - Left (west): frames 17-18 (walk cycle)  
 * - Down (south): frames 3-4 (fallback, no dedicated frames)
 */
const SPRITE_FRAMES: Record<string, string[]> = {
    north: [
        '/sprites/jorc_raw/frame-03.png',
        '/sprites/jorc_raw/frame-04.png',
        '/sprites/jorc_raw/frame-06.png',
        '/sprites/jorc_raw/frame-09.png',
        '/sprites/jorc_raw/frame-10.png',
        '/sprites/jorc_raw/frame-11.png',
        '/sprites/jorc_raw/frame-12.png'
    ],
    east: [
        '/sprites/jorc_raw/frame-13.png',
        '/sprites/jorc_raw/frame-14.png',
        '/sprites/jorc_raw/frame-15.png',
        '/sprites/jorc_raw/frame-16.png'
    ],
    west: [
        '/sprites/jorc_raw/frame-17.png',
        '/sprites/jorc_raw/frame-18.png'
    ],
    south: [
        '/sprites/jorc_raw/frame-03.png',
        '/sprites/jorc_raw/frame-04.png',
        '/sprites/jorc_raw/frame-06.png',
        '/sprites/jorc_raw/frame-09.png',
        '/sprites/jorc_raw/frame-10.png',
        '/sprites/jorc_raw/frame-11.png',
        '/sprites/jorc_raw/frame-12.png'
    ]
}

interface DemoStep {
    jorcState: { x: number; y: number; facing: string }
    message: string
    highlightLine: number // -1 = no highlight, 0+ = line index to highlight
}

interface InteractiveDemoPanelProps {
    gridSize?: number
    code?: string[]
    steps?: DemoStep[]
    targetPosition?: { x: number; y: number } | null
}

export function InteractiveDemoPanel({
    gridSize = 4,
    code = ["Avanzar", "Girar", "Avanzar"],
    steps = [
        { jorcState: { x: 0, y: 0, facing: "east" }, message: "Jorc está listo en la posición inicial.", highlightLine: -1 },
        { jorcState: { x: 1, y: 0, facing: "east" }, message: "'Avanzar' → Jorc camina un paso hacia la derecha.", highlightLine: 0 },
        { jorcState: { x: 1, y: 0, facing: "south" }, message: "'Girar' → Jorc gira 90° a la derecha.", highlightLine: 1 },
        { jorcState: { x: 1, y: 1, facing: "south" }, message: "'Avanzar' → Jorc camina hacia abajo. ¡Listo!", highlightLine: 2 }
    ],
    targetPosition = null
}: InteractiveDemoPanelProps) {
    // State
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [animFrame, setAnimFrame] = useState(0)

    // Refs for intervals
    const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const currentStep = steps[currentStepIndex]
    const isFirstStep = currentStepIndex === 0
    const isLastStep = currentStepIndex === steps.length - 1

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (playTimerRef.current) clearTimeout(playTimerRef.current)
            if (animTimerRef.current) clearInterval(animTimerRef.current)
        }
    }, [])

    // Advance to next step
    const advanceStep = useCallback(() => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1)
        } else {
            setIsPlaying(false)
        }
    }, [currentStepIndex, steps.length])

    // Handle play/pause - stop immediately when reaching last step
    useEffect(() => {
        // If we're on the last step, stop playing
        if (isLastStep && isPlaying) {
            setIsPlaying(false)
            return
        }

        if (isPlaying && !isLastStep) {
            playTimerRef.current = setTimeout(() => {
                advanceStep()
            }, 1000)
        }

        return () => {
            if (playTimerRef.current) {
                clearTimeout(playTimerRef.current)
                playTimerRef.current = null
            }
        }
    }, [isPlaying, currentStepIndex, isLastStep, advanceStep])

    // Handle sprite animation while playing
    useEffect(() => {
        if (isPlaying) {
            animTimerRef.current = setInterval(() => {
                setAnimFrame(prev => prev + 1)
            }, 150)
        } else {
            setAnimFrame(0)
            if (animTimerRef.current) {
                clearInterval(animTimerRef.current)
                animTimerRef.current = null
            }
        }

        return () => {
            if (animTimerRef.current) {
                clearInterval(animTimerRef.current)
            }
        }
    }, [isPlaying])

    // Get sprite for current state
    const getSprite = () => {
        const facing = currentStep.jorcState.facing
        const frames = SPRITE_FRAMES[facing] || SPRITE_FRAMES.east
        const frameIndex = isPlaying ? (animFrame % frames.length) : 0
        return frames[frameIndex]
    }

    // Button handlers
    const handlePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false)
        } else if (isLastStep) {
            // Reset and play
            setCurrentStepIndex(0)
            setTimeout(() => setIsPlaying(true), 50)
        } else {
            setIsPlaying(true)
        }
    }

    const handleNext = () => {
        if (!isLastStep && !isPlaying) {
            setCurrentStepIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (!isFirstStep && !isPlaying) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }

    const handleReset = () => {
        setIsPlaying(false)
        setCurrentStepIndex(0)
    }

    // Generate grid cells
    const cells = []
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            cells.push({ x, y })
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT: Grid Visualization */}
            <div className="rounded-2xl border border-ocean-200 bg-white p-6 shadow-sm">
                {/* Step indicator */}
                <div className="mb-4 text-center">
                    <span className="inline-block rounded-full bg-ocean-100 px-4 py-1 text-sm font-medium text-ocean-700">
                        Paso {currentStepIndex + 1} de {steps.length}
                    </span>
                    <p className="mt-3 text-sm text-gray-600 min-h-[44px]">
                        {currentStep.message}
                    </p>
                </div>

                {/* Grid */}
                <div
                    className="mx-auto rounded-xl bg-ocean-200/50 p-2 shadow-inner"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                        gap: '4px',
                        maxWidth: '260px'
                    }}
                >
                    {cells.map(cell => {
                        const isJorcHere = cell.x === currentStep.jorcState.x && cell.y === currentStep.jorcState.y
                        const isTargetHere = targetPosition && cell.x === targetPosition.x && cell.y === targetPosition.y

                        return (
                            <div
                                key={`${cell.x}-${cell.y}`}
                                className={cn(
                                    "aspect-square rounded-lg relative",
                                    isJorcHere ? "bg-ocean-300/60" : "bg-sky-100"
                                )}
                            >
                                {/* Jorc sprite */}
                                {isJorcHere && (
                                    <div
                                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                                        style={{
                                            backgroundImage: `url(${getSprite()})`,
                                            transform: 'scale(1.3)',
                                            imageRendering: 'pixelated'
                                        }}
                                    />
                                )}

                                {/* Target (treasure) - only show if not occupied by Jorc */}
                                {isTargetHere && !isJorcHere && (
                                    <div className="absolute inset-2 rounded bg-amber-500 border-2 border-amber-700 shadow-sm" />
                                )}

                                {/* Empty cell indicator */}
                                {!isJorcHere && !isTargetHere && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="size-1.5 rounded-full bg-ocean-300/40" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Controls */}
                <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrev}
                        disabled={isFirstStep || isPlaying}
                        className="size-10"
                    >
                        <ChevronLeft className="size-5" />
                    </Button>

                    <Button
                        onClick={handlePlayPause}
                        className={cn(
                            "w-28 h-10",
                            isPlaying ? "bg-orange-500 hover:bg-orange-600" : "bg-ocean-600 hover:bg-ocean-700"
                        )}
                    >
                        {isPlaying ? (
                            <><Pause className="mr-2 size-4" /> Pausa</>
                        ) : isLastStep ? (
                            <><RotateCcw className="mr-2 size-4" /> Repetir</>
                        ) : (
                            <><Play className="mr-2 size-4" fill="currentColor" /> Play</>
                        )}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        disabled={isLastStep || isPlaying}
                        className="size-10"
                    >
                        <ChevronRight className="size-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        disabled={isFirstStep && !isPlaying}
                        className="size-10"
                    >
                        <RotateCcw className="size-4" />
                    </Button>
                </div>
            </div>

            {/* RIGHT: Code display */}
            <div className="flex flex-col rounded-2xl bg-slate-900 overflow-hidden shadow-lg">
                {/* Window header */}
                <div className="flex items-center gap-2 bg-slate-800 px-4 py-3 border-b border-slate-700">
                    <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-red-500" />
                        <div className="size-3 rounded-full bg-yellow-500" />
                        <div className="size-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-slate-400 ml-2">programa_pirata.js</span>
                </div>

                {/* Code lines - ALWAYS show all lines */}
                <div className="flex-1 p-5 font-mono text-sm">
                    {code.map((line, index) => {
                        const isHighlighted = currentStep.highlightLine === index
                        const wasExecuted = index < currentStep.highlightLine

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg mb-1 transition-all duration-200",
                                    isHighlighted && "bg-yellow-500/20 border-l-4 border-yellow-400",
                                    wasExecuted && "opacity-40"
                                )}
                            >
                                <span className="w-6 text-right text-slate-500 select-none mr-4 text-xs">
                                    {index + 1}
                                </span>
                                <span className={cn(
                                    isHighlighted ? "text-yellow-200 font-bold" : "text-slate-300"
                                )}>
                                    {line}
                                </span>
                                {isHighlighted && (
                                    <span className="ml-4 text-xs text-yellow-400 animate-pulse">
                                        ← ejecutando
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
