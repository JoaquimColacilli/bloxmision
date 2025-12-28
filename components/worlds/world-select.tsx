"use client"

import { Lock } from "lucide-react"
import { WorldCard } from "./world-card"
import type { World } from "@/lib/types"

interface WorldSelectProps {
  worlds: World[]
  onEnterWorld: (worldId: string) => void
}

export function WorldSelect({ worlds, onEnterWorld }: WorldSelectProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl font-bold text-ocean-800 sm:text-3xl">Islas de Aventura</h1>
        <p className="mt-2 text-ocean-600">Explora cada isla y domina nuevas habilidades de programacion</p>
      </header>

      {/* World grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {worlds.map((world, index) => (
          <WorldCard
            key={world.id}
            world={world}
            previousWorldName={index > 0 ? worlds[index - 1].name : undefined}
            onEnterWorld={onEnterWorld}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ocean-500">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-gradient-to-r from-gold-400 to-gold-500" />
          <span>En progreso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
          <span>Completada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="size-3 text-ocean-400" />
          <span>Bloqueada</span>
        </div>
      </div>
    </div>
  )
}
