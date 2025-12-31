"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Lock, Check } from "lucide-react"
import Image from "next/image"
import { PLAYER_LEVELS } from "@/lib/game/xpCalculator"
import { isValidPlayerLevel, getRankIconPath, type PlayerLevel } from "@/lib/types/player-level"
import { cn } from "@/lib/utils"

interface RanksModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    totalXP: number
    playerLevel: string
}

export function RanksModal({ open, onOpenChange, totalXP, playerLevel }: RanksModalProps) {
    // Find current level index
    const currentLevelIndex = PLAYER_LEVELS.findIndex(
        (l, i, arr) => totalXP >= l.minXP && (i === arr.length - 1 || totalXP < arr[i + 1].minXP)
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[80vh] overflow-y-auto border-2 border-ocean-300 bg-sand-50 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-ocean-800">
                        <Sparkles className="size-5 text-gold-500" />
                        Rangos de Pirata
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2 py-4">
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
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                                    isCurrentLevel && "bg-gradient-to-r from-gold-100 to-ocean-100 ring-2 ring-gold-400",
                                    isUnlocked && !isCurrentLevel && "bg-ocean-50",
                                    !isUnlocked && "bg-gray-100 opacity-70"
                                )}
                            >
                                {/* Rank Icon */}
                                <div className="relative size-10 shrink-0">
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
                                        <div className="flex size-10 items-center justify-center rounded-full bg-ocean-200">
                                            <Sparkles className="size-5 text-ocean-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Level Name & XP */}
                                <div className="flex flex-1 flex-col">
                                    <span className={cn(
                                        "font-semibold",
                                        isCurrentLevel && "text-ocean-800",
                                        isUnlocked && !isCurrentLevel && "text-ocean-700",
                                        !isUnlocked && "text-gray-500"
                                    )}>
                                        {level.name}
                                    </span>
                                    <span className={cn(
                                        "text-sm",
                                        isUnlocked ? "text-ocean-500" : "text-gray-400"
                                    )}>
                                        {level.minXP.toLocaleString()} XP
                                    </span>
                                </div>

                                {/* Status Icon */}
                                <div className="shrink-0">
                                    {isCurrentLevel ? (
                                        <div className="flex size-7 items-center justify-center rounded-full bg-gold-400 shadow-sm">
                                            <Sparkles className="size-4 text-white" />
                                        </div>
                                    ) : isUnlocked ? (
                                        <div className="flex size-7 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                            <Check className="size-4 text-white" />
                                        </div>
                                    ) : (
                                        <div className="flex size-7 items-center justify-center rounded-full bg-gray-300">
                                            <Lock className="size-4 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}
