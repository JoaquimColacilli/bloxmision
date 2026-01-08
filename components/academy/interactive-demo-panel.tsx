"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Direction } from "@/lib/types"

/**
 * CORRECT Sprite Mapping (from slice-grid row-major order)
 * 
 * jorc_raw (16 frames):
 *   - DOWN idle: 01-06, walk: 09-12
 *   - RIGHT walk: 13-16
 *   - 07/08 are EMPTY
 *   - NO LEFT or UP
 * 
 * jorc_looking_up (32 frames):
 *   - UP idle: 01-06, walk: 09-12
 *   - RIGHT walk: 13-16
 *   - 07/08 are EMPTY
 *   - 25-32 are special actions, NOT movement
 * 
 * WEST/LEFT: Use RIGHT sprites with CSS mirror (scaleX -1)
 */
const SPRITE_CONFIG = {
    // UP/NORTH - use jorc_looking_up (back view)
    north: {
        idle: ['/sprites/jorc_looking_up/action-01.png'],
        walk: [
            '/sprites/jorc_looking_up/action-09.png',
            '/sprites/jorc_looking_up/action-10.png',
            '/sprites/jorc_looking_up/action-11.png',
            '/sprites/jorc_looking_up/action-12.png'
        ],
        mirror: false
    },
    // DOWN/SOUTH - use jorc_raw (front view)
    south: {
        idle: ['/sprites/jorc_raw/action-01.png'],
        walk: [
            '/sprites/jorc_raw/action-09.png',
            '/sprites/jorc_raw/action-10.png',
            '/sprites/jorc_raw/action-11.png',
            '/sprites/jorc_raw/action-12.png'
        ],
        mirror: false
    },
    // RIGHT/EAST - use jorc_raw (side view)
    east: {
        idle: ['/sprites/jorc_raw/action-13.png'],
        walk: [
            '/sprites/jorc_raw/action-13.png',
            '/sprites/jorc_raw/action-14.png',
            '/sprites/jorc_raw/action-15.png',
            '/sprites/jorc_raw/action-16.png'
        ],
        mirror: false
    },
    // LEFT/WEST - use SAME sprites as EAST but with CSS mirror
    west: {
        idle: ['/sprites/jorc_raw/action-13.png'],
        walk: [
            '/sprites/jorc_raw/action-13.png',
            '/sprites/jorc_raw/action-14.png',
            '/sprites/jorc_raw/action-15.png',
            '/sprites/jorc_raw/action-16.png'
        ],
        mirror: true // Flip horizontally with scaleX(-1)
    }
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
    obstacle?: { x: number; y: number } | null
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
    targetPosition = null,
    obstacle = null
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
            }, 200) // 5 FPS as recommended
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

    // Preload images
    useEffect(() => {
        const allSprites = Object.values(SPRITE_CONFIG).flatMap(d => [...d.idle, ...d.walk])
        allSprites.forEach(src => {
            const img = new Image()
            img.src = src
        })
    }, [])

    // Get sprite and mirror state for current facing direction
    const getSpriteInfo = () => {
        const facing = (currentStep.jorcState.facing as keyof typeof SPRITE_CONFIG) || 'east'
        const config = SPRITE_CONFIG[facing] || SPRITE_CONFIG.east

        const sprite = isPlaying
            ? config.walk[animFrame % config.walk.length]
            : config.idle[0]

        return { sprite, mirror: config.mirror }
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
                        const isObstacleHere = obstacle && cell.x === obstacle.x && cell.y === obstacle.y

                        return (
                            <div
                                key={`${cell.x}-${cell.y}`}
                                className={cn(
                                    "aspect-square rounded-lg relative",
                                    isJorcHere ? "bg-ocean-300/60" : isObstacleHere ? "bg-red-100" : "bg-sky-100"
                                )}
                            >
                                {/* Jorc sprite */}
                                {isJorcHere && (() => {
                                    const { sprite, mirror } = getSpriteInfo()
                                    return (
                                        <div
                                            className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
                                            style={{
                                                backgroundImage: `url(${sprite})`,
                                                transform: `scale(1.3) translateY(-10%)${mirror ? ' scaleX(-1)' : ''}`,
                                                imageRendering: 'pixelated'
                                            }}
                                        />
                                    )
                                })()}

                                {/* Obstacle (rock) */}
                                {isObstacleHere && !isJorcHere && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl">🪨</span>
                                    </div>
                                )}

                                {/* Target (treasure) - only show if not occupied by Jorc */}
                                {isTargetHere && !isJorcHere && !isObstacleHere && (
                                    <div className="absolute inset-2 rounded bg-amber-500 border-2 border-amber-700 shadow-sm" />
                                )}

                                {/* Empty cell indicator */}
                                {!isJorcHere && !isTargetHere && !isObstacleHere && (
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

                {/* Code lines - ALWAYS show all lines with visual structure */}
                <div className="flex-1 p-5 font-mono text-sm">
                    {code.map((line, index) => {
                        const isHighlighted = currentStep.highlightLine === index
                        const wasExecuted = index < currentStep.highlightLine
                        const isIndented = line.startsWith('  ')
                        const trimmedLine = line.trimStart()

                        // Check if next line is indented (this line is a parent block)
                        const nextLine = code[index + 1]
                        const isParentBlock = nextLine && nextLine.startsWith('  ') && !line.startsWith('  ')

                        return (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-center rounded-lg transition-all duration-200 relative",
                                    isHighlighted && "bg-yellow-500/20",
                                    wasExecuted && "opacity-40",
                                    isIndented ? "ml-4 pl-3 border-l-2 border-slate-600 py-1.5" : "px-3 py-2",
                                    isParentBlock && "mb-0"
                                )}
                            >
                                <span className="w-6 text-right text-slate-500 select-none mr-4 text-xs">
                                    {index + 1}
                                </span>

                                {/* Bracket indicator for parent blocks */}
                                {isParentBlock && (
                                    <span className="text-purple-400 mr-1">{'{'}</span>
                                )}

                                <span className={cn(
                                    isHighlighted ? "text-yellow-200 font-bold" :
                                        isIndented ? "text-cyan-300" : "text-slate-300",
                                    isParentBlock && "text-purple-300"
                                )}>
                                    {trimmedLine}
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
