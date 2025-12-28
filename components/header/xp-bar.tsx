"use client"

import { cn } from "@/lib/utils"

interface XPBarProps {
  currentXP: number
  xpToNextLevel: number
  playerLevel: string
  variant?: "full" | "compact"
  className?: string
}

export function XPBar({ currentXP, xpToNextLevel, playerLevel, variant = "full", className }: XPBarProps) {
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100)

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-label={`${currentXP} de ${xpToNextLevel} XP`}>
        <div className="h-2 w-16 overflow-hidden rounded-full bg-ocean-200">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={currentXP}
            aria-valuemin={0}
            aria-valuemax={xpToNextLevel}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ocean-700">{playerLevel}</span>
        <span className="text-ocean-600">
          {currentXP}/{xpToNextLevel} XP
        </span>
      </div>
      <div className="h-2.5 w-32 overflow-hidden rounded-full bg-ocean-200">
        <div
          className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentXP}
          aria-valuemin={0}
          aria-valuemax={xpToNextLevel}
          aria-label={`Progreso de experiencia: ${currentXP} de ${xpToNextLevel} XP`}
        />
      </div>
    </div>
  )
}
