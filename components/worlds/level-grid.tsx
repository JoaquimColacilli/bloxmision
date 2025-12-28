"use client"

import { LevelCard } from "./level-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trophy } from "lucide-react"
import type { Level, World } from "@/lib/types"

interface LevelGridProps {
  world: World
  levels: Level[]
  onPlayLevel: (levelId: string) => void
  onBack: () => void
}

export function LevelGrid({ world, levels, onPlayLevel, onBack }: LevelGridProps) {
  const completedCount = levels.filter((l) => l.isCompleted).length
  const totalStars = levels.reduce((acc, l) => acc + (l.stars || 0), 0)
  const maxStars = levels.length * 3
  const progress = levels.length > 0 ? (completedCount / levels.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 text-ocean-600 hover:bg-ocean-100 hover:text-ocean-800"
        >
          <ArrowLeft className="size-4" />
          Volver a Islas
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-ocean-800 sm:text-3xl">{world.name}</h1>
            <p className="mt-1 text-ocean-600">{world.description}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-4 rounded-xl bg-ocean-50 p-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-ocean-800">
                {completedCount}/{levels.length}
              </p>
              <p className="text-xs text-ocean-500">Niveles</p>
            </div>
            <div className="w-px bg-ocean-200" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="size-4 text-gold-500" />
                <p className="text-2xl font-bold text-ocean-800">{totalStars}</p>
              </div>
              <p className="text-xs text-ocean-500">de {maxStars} estrellas</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-ocean-100">
            <div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-right text-xs text-ocean-500">{Math.round(progress)}% completado</p>
        </div>
      </header>

      {/* Level grid */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {levels.map((level, index) => (
          <LevelCard key={level.id} level={level} index={index} onPlayLevel={onPlayLevel} />
        ))}
      </div>

      {/* Help text */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ocean-500">
        <div className="flex items-center gap-1.5">
          <div className="size-4 rounded-md border-2 border-gold-400 bg-gold-50" />
          <span>Nivel actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-4 rounded-md border-2 border-green-300 bg-green-50" />
          <span>Completado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-4 rounded-md border-2 border-ocean-200 bg-white" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-4 rounded-md border-2 border-ocean-200 bg-ocean-100/50" />
          <span>Bloqueado</span>
        </div>
      </div>
    </div>
  )
}
