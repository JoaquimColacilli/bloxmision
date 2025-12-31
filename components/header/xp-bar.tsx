"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { isValidPlayerLevel, getRankIconPath, type PlayerLevel } from "@/lib/types/player-level"

interface XPBarProps {
  totalXP: number
  nextLevelThreshold: number
  playerLevel: string
  variant?: "full" | "compact"
  className?: string
}

export function XPBar({ totalXP, nextLevelThreshold, playerLevel, variant = "full", className }: XPBarProps) {
  const progress = nextLevelThreshold > 0 ? Math.min((totalXP / nextLevelThreshold) * 100, 100) : 100

  // Get rank icon if valid level
  const rankIcon = isValidPlayerLevel(playerLevel) ? getRankIconPath(playerLevel as PlayerLevel) : null

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-label={`${totalXP} de ${nextLevelThreshold} XP`}>
        {rankIcon && (
          <div className="relative size-6 shrink-0">
            <Image
              src={rankIcon}
              alt={playerLevel}
              fill
              className="object-contain"
              style={{ imageRendering: "pixelated" }}
            />
          </div>
        )}
        <div className="h-2 w-16 overflow-hidden rounded-full bg-ocean-200">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={totalXP}
            aria-valuemin={0}
            aria-valuemax={nextLevelThreshold}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {rankIcon && (
            <div className="relative size-5 shrink-0">
              <Image
                src={rankIcon}
                alt={playerLevel}
                fill
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          )}
          <span className="font-medium text-ocean-700">{playerLevel}</span>
        </div>
        <span className="text-ocean-600">
          {totalXP}/{nextLevelThreshold} XP
        </span>
      </div>
      <div className="h-2.5 w-40 overflow-hidden rounded-full bg-ocean-200">
        <div
          className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={totalXP}
          aria-valuemin={0}
          aria-valuemax={nextLevelThreshold}
          aria-label={`Progreso de experiencia: ${totalXP} de ${nextLevelThreshold} XP`}
        />
      </div>
    </div>
  )
}
