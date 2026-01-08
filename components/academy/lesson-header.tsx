"use client"

import { ArrowLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { JorCoinIcon } from "@/components/header/jorcoin-display"

interface LessonHeaderProps {
    title: string
    completedSteps: number
    totalSteps: number
    jorCoins: number
    totalStars: number // Cumulative for the user
    onExit: () => void
}

export function LessonHeader({
    title,
    completedSteps,
    totalSteps,
    jorCoins,
    totalStars,
    onExit
}: LessonHeaderProps) {
    const progressPercent = Math.min(100, (completedSteps / totalSteps) * 100)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-ocean-200 bg-ocean-50/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-ocean-50/60">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
                {/* Left: Exit & Title */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onExit}
                        className="text-ocean-700 hover:bg-ocean-100 hover:text-ocean-900"
                        aria-label="Volver a la academia"
                    >
                        <ArrowLeft className="size-5" />
                    </Button>

                    <div className="hidden sm:block">
                        <h1 className="text-sm font-bold text-ocean-900 md:text-base">{title}</h1>
                        <div className="flex items-center gap-2 text-xs text-ocean-600">
                            <span>Paso {completedSteps} de {totalSteps}</span>
                        </div>
                    </div>
                </div>

                {/* Center: Progress Bar (Mobile/Desktop) */}
                <div className="flex-1 max-w-xs md:max-w-md">
                    <Progress value={progressPercent} className="h-2 bg-ocean-200" indicatorClassName="bg-ocean-600 transition-all duration-500" />
                </div>

                {/* Right: Wallet (Coins & Stars) */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-yellow-100/80 px-2 py-1 border border-yellow-200 shadow-sm">
                        <JorCoinIcon className="size-4" />
                        <span className="font-bold text-yellow-700 text-sm">{jorCoins}</span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2 py-1 border border-indigo-200 shadow-sm">
                        <Star className="size-4 text-indigo-600 fill-indigo-500" />
                        <span className="font-bold text-indigo-700 text-sm">{totalStars}</span>
                    </div>
                </div>
            </div>
        </header>
    )
}
