"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, Play, Sparkles } from "lucide-react"
import type { World } from "@/lib/types"

interface WorldCardProps {
  world: World
  previousWorldName?: string
  onEnterWorld: (worldId: string) => void
}

const worldIcons: Record<string, string> = {
  secuencia: "/placeholder.svg?height=80&width=80",
  bucle: "/placeholder.svg?height=80&width=80",
  decision: "/placeholder.svg?height=80&width=80",
  memoria: "/placeholder.svg?height=80&width=80",
  funcion: "/placeholder.svg?height=80&width=80",
}

export function WorldCard({ world, previousWorldName, onEnterWorld }: WorldCardProps) {
  const progress = world.totalLevels > 0 ? (world.completedLevels / world.totalLevels) * 100 : 0
  const isCompleted = world.completedLevels === world.totalLevels && world.totalLevels > 0

  return (
    <Card
      className={`group relative overflow-hidden border-2 transition-all duration-300 ${
        world.isCurrent
          ? "border-gold-400 bg-gradient-to-br from-gold-50 to-sand-50 shadow-lg ring-2 ring-gold-200"
          : world.isUnlocked
            ? "border-ocean-200 bg-white hover:border-ocean-300 hover:shadow-lg"
            : "border-ocean-100 bg-ocean-50/50"
      }`}
    >
      {/* Current world indicator */}
      {world.isCurrent && <div className="absolute -right-8 -top-8 size-16 rounded-full bg-gold-400/20" />}

      {/* Completed badge */}
      {isCompleted && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          <CheckCircle className="size-3" />
          Completada
        </div>
      )}

      <CardHeader className="pb-3">
        {/* World illustration */}
        <div className="relative mx-auto mb-3 size-20 overflow-hidden rounded-xl bg-ocean-100 p-2">
          <img
            src={worldIcons[world.id] || "/placeholder.svg?height=80&width=80&query=mystery island pixel art"}
            alt={`Ilustracion de ${world.name}`}
            className={`size-full object-contain transition-transform duration-300 ${
              world.isUnlocked ? "group-hover:scale-110" : "opacity-50 grayscale"
            }`}
          />
          {!world.isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-ocean-900/30">
              <Lock className="size-8 text-white drop-shadow-lg" />
            </div>
          )}
        </div>

        <CardTitle className={`text-center text-lg ${world.isUnlocked ? "text-ocean-800" : "text-ocean-400"}`}>
          {world.name}
        </CardTitle>
        <CardDescription className={`text-center text-sm ${world.isUnlocked ? "text-ocean-600" : "text-ocean-400"}`}>
          {world.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className={world.isUnlocked ? "text-ocean-600" : "text-ocean-400"}>Progreso</span>
            <span className={`font-medium ${world.isUnlocked ? "text-ocean-800" : "text-ocean-400"}`}>
              {world.completedLevels}/{world.totalLevels}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ocean-100">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-green-400 to-green-500"
                  : "bg-gradient-to-r from-gold-400 to-gold-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action button */}
        {world.isUnlocked ? (
          <Button
            onClick={() => onEnterWorld(world.id)}
            className={`w-full gap-2 transition-all ${
              world.isCurrent
                ? "bg-gold-500 text-ocean-900 hover:bg-gold-600"
                : "bg-ocean-500 text-white hover:bg-ocean-600"
            }`}
          >
            {world.isCurrent ? (
              <>
                <Sparkles className="size-4" />
                Continuar aventura
              </>
            ) : world.completedLevels > 0 ? (
              <>
                <Play className="size-4" />
                Continuar
              </>
            ) : (
              <>
                <Play className="size-4" />
                Explorar isla
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button disabled className="w-full gap-2 bg-ocean-200 text-ocean-500">
              <Lock className="size-4" />
              Isla bloqueada
            </Button>
            {previousWorldName && (
              <p className="text-center text-xs text-ocean-400">Completa {previousWorldName} primero</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
