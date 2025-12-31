"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Lock, Check } from "lucide-react"
import Image from "next/image"
import { PLAYER_LEVELS, getCurrentLevelXP, getCurrentLevelTotalXP } from "@/lib/game/xpCalculator"
import { isValidPlayerLevel, getRankIconPath, type PlayerLevel } from "@/lib/types/player-level"
import { cn } from "@/lib/utils"

interface LevelProgressCardProps {
    totalXP: number
    playerLevel: string
    variant?: "compact" | "full"
    className?: string
}

export function LevelProgressCard({
    totalXP,
    playerLevel,
    variant = "compact",
    className
}: LevelProgressCardProps) {
    const currentLevelXP = getCurrentLevelXP(totalXP)
    const currentLevelTotalXP = getCurrentLevelTotalXP(totalXP)
    const xpProgress = currentLevelTotalXP > 0 ? (currentLevelXP / currentLevelTotalXP) * 100 : 100

    // Find current level index
    const currentLevelIndex = PLAYER_LEVELS.findIndex(
        (l, i, arr) => totalXP >= l.minXP && (i === arr.length - 1 || totalXP < arr[i + 1].minXP)
    )

    const rankIcon = isValidPlayerLevel(playerLevel)
        ? getRankIconPath(playerLevel as PlayerLevel)
        : null

    return (
        <Card className={cn("border-2 border-ocean-200 bg-white/80 backdrop-blur", className)}>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-ocean-800">
                    <Sparkles className="size-5 text-gold-500" />
                    Nivel de Pirata
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {/* Current Level Display */}
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-ocean-100 to-gold-100 p-4">
                    {rankIcon && (
                        <div className="relative size-14 shrink-0">
                            <Image
                                src={rankIcon}
                                alt={playerLevel}
                                fill
                                className="object-contain"
                                style={{ imageRendering: "pixelated" }}
                            />
                        </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1">
                        <span className="text-lg font-bold text-ocean-800">{playerLevel}</span>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-ocean-600">{totalXP} XP total</span>
                            {currentLevelTotalXP > 0 && (
                                <span className="text-ocean-500">
                                    {currentLevelXP}/{currentLevelTotalXP} XP
                                </span>
                            )}
                        </div>
                        <Progress value={xpProgress} className="h-2.5 bg-ocean-100" />
                    </div>
                </div>

                {/* All Levels Display */}
                {variant === "full" && (
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-ocean-700">Todos los rangos</span>
                        <div className="flex flex-col gap-1.5">
                            {PLAYER_LEVELS.map((level, index) => {
                                const isCurrentLevel = index === currentLevelIndex
                                const isUnlocked = index <= currentLevelIndex
                                const levelIcon = isValidPlayerLevel(level.name)
                                    ? getRankIconPath(level.name as PlayerLevel)
                                    : null

                                return (
                                    <div
                                        key={level.name}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                            isCurrentLevel && "bg-gradient-to-r from-gold-100 to-ocean-100 ring-2 ring-gold-400",
                                            isUnlocked && !isCurrentLevel && "bg-ocean-50",
                                            !isUnlocked && "bg-gray-50 opacity-60"
                                        )}
                                    >
                                        {/* Rank Icon */}
                                        <div className="relative size-8 shrink-0">
                                            {levelIcon ? (
                                                <Image
                                                    src={levelIcon}
                                                    alt={level.name}
                                                    fill
                                                    className={cn(
                                                        "object-contain",
                                                        !isUnlocked && "grayscale"
                                                    )}
                                                    style={{ imageRendering: "pixelated" }}
                                                />
                                            ) : (
                                                <div className="flex size-8 items-center justify-center rounded-full bg-ocean-200">
                                                    <Sparkles className="size-4 text-ocean-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Level Name */}
                                        <div className="flex flex-1 flex-col">
                                            <span className={cn(
                                                "font-medium",
                                                isCurrentLevel && "text-ocean-800",
                                                isUnlocked && !isCurrentLevel && "text-ocean-700",
                                                !isUnlocked && "text-gray-500"
                                            )}>
                                                {level.name}
                                            </span>
                                            <span className={cn(
                                                "text-xs",
                                                isUnlocked ? "text-ocean-500" : "text-gray-400"
                                            )}>
                                                {level.minXP.toLocaleString()} XP
                                            </span>
                                        </div>

                                        {/* Status Icon */}
                                        <div className="shrink-0">
                                            {isCurrentLevel ? (
                                                <div className="flex size-6 items-center justify-center rounded-full bg-gold-400">
                                                    <Sparkles className="size-3.5 text-white" />
                                                </div>
                                            ) : isUnlocked ? (
                                                <div className="flex size-6 items-center justify-center rounded-full bg-green-500">
                                                    <Check className="size-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="flex size-6 items-center justify-center rounded-full bg-gray-300">
                                                    <Lock className="size-3.5 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
