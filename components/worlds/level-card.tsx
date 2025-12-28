"use client"

import { Star, Lock, Play, CheckCircle, Sparkles } from "lucide-react"
import type { Level } from "@/lib/types"

interface LevelCardProps {
  level: Level
  index: number
  onPlayLevel: (levelId: string) => void
}

export function LevelCard({ level, index, onPlayLevel }: LevelCardProps) {
  const displayNumber = index + 1

  // Determinar estilo basado en estado
  const getCardStyles = () => {
    if (!level.isUnlocked) {
      return "border-ocean-200 bg-ocean-100/50 cursor-not-allowed"
    }
    if (level.isCurrent) {
      return "border-gold-400 bg-gradient-to-br from-gold-50 to-sand-50 shadow-md ring-2 ring-gold-200 cursor-pointer hover:shadow-lg"
    }
    if (level.isCompleted) {
      return "border-green-300 bg-green-50 cursor-pointer hover:border-green-400 hover:shadow-md"
    }
    return "border-ocean-200 bg-white cursor-pointer hover:border-ocean-300 hover:shadow-md"
  }

  const handleClick = () => {
    if (level.isUnlocked) {
      onPlayLevel(level.id)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!level.isUnlocked}
      className={`group relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 ${getCardStyles()}`}
      aria-label={
        level.isUnlocked
          ? `${level.name}, ${level.isCompleted ? `completado con ${level.stars || 0} estrellas` : "disponible"}`
          : `${level.name}, bloqueado`
      }
    >
      {/* Nivel actual indicator - pulso animado */}
      {level.isCurrent && <div className="absolute -inset-1 animate-pulse rounded-xl bg-gold-400/20" />}

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center">
        {level.isUnlocked ? (
          <>
            {/* Numero del nivel */}
            <span
              className={`text-xl font-bold ${
                level.isCurrent ? "text-gold-700" : level.isCompleted ? "text-green-700" : "text-ocean-700"
              }`}
            >
              {displayNumber}
            </span>

            {/* Estrellas (solo si completado) */}
            {level.isCompleted && (
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3 transition-all ${
                      i < (level.stars || 0) ? "fill-gold-400 text-gold-400" : "fill-ocean-200 text-ocean-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <Lock className="size-5 text-ocean-400" />
        )}
      </div>

      {/* Badge de estado */}
      {level.isCompleted && (
        <CheckCircle className="absolute -right-1 -top-1 size-5 rounded-full bg-white text-green-500 shadow-sm" />
      )}
      {level.isCurrent && (
        <div className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold-500 shadow-sm">
          <Sparkles className="size-3 text-white" />
        </div>
      )}
      {!level.isCompleted && level.isUnlocked && !level.isCurrent && (
        <Play className="absolute -right-1 -top-1 size-5 rounded-full bg-ocean-500 p-0.5 text-white shadow-sm" />
      )}

      {/* Hover effect para niveles desbloqueados */}
      {level.isUnlocked && (
        <div className="absolute inset-0 rounded-xl bg-ocean-500/0 transition-all group-hover:bg-ocean-500/5" />
      )}
    </button>
  )
}
