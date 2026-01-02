"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { LevelGrid } from "@/components/worlds/level-grid"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { useProgress } from "@/contexts/progress-context"
import { WORLD_DEFINITIONS, type LevelStatus } from "@/src/lib/services/worldService"
import type { World } from "@/lib/types"

export default function WorldPage() {
  const params = useParams()
  const worldId = params.worldId as string
  const router = useRouter()
  const { user } = useAuth()
  const {
    isWorldUnlocked,
    getWorldCompletedCount,
    getCurrentWorldId,
    isLevelCompleted,
    progressMap,
    isLoading
  } = useProgress()

  // Compute world data from cached progress (no Firestore reads)
  const world = useMemo((): World | null => {
    const worldDef = WORLD_DEFINITIONS.find(w => w.id === worldId)
    if (!worldDef) return null

    const currentWorldId = getCurrentWorldId()

    return {
      id: worldDef.id,
      name: worldDef.name,
      description: worldDef.description,
      concept: worldDef.concept,
      totalLevels: worldDef.totalLevels,
      completedLevels: getWorldCompletedCount(worldDef.id),
      isUnlocked: isWorldUnlocked(worldDef.id),
      isCurrent: worldDef.id === currentWorldId,
    }
  }, [worldId, isWorldUnlocked, getWorldCompletedCount, getCurrentWorldId])

  // Compute levels data from cached progress
  const levels = useMemo((): LevelStatus[] => {
    const worldDef = WORLD_DEFINITIONS.find(w => w.id === worldId)
    if (!worldDef) return []

    const levelsList: LevelStatus[] = []
    let previousLevelCompleted = true

    for (let i = 1; i <= worldDef.totalLevels; i++) {
      const levelId = `${worldDef.numericId}-${i}`
      const progress = progressMap.get(levelId)
      const completed = !!progress

      const isUnlocked = i === 1 || previousLevelCompleted
      const isCurrent = isUnlocked && !completed && previousLevelCompleted

      levelsList.push({
        id: levelId,
        worldId: worldId,
        name: `Nivel ${i}`,
        order: i,
        isCompleted: completed,
        isUnlocked,
        isCurrent,
        stars: progress?.stars || 0,
        xpReward: 50 + (i * 10),
      })

      previousLevelCompleted = completed
    }

    return levelsList
  }, [worldId, progressMap])

  const handlePlayLevel = (levelId: string) => {
    router.push(`/play/${levelId}`)
  }

  const handleBack = () => {
    router.push("/worlds")
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <MenuLayout>
          <div className="flex justify-center p-8 text-ocean-600">Cargando niveles...</div>
        </MenuLayout>
      </ProtectedRoute>
    )
  }

  if (!world) {
    return (
      <ProtectedRoute>
        <MenuLayout>
          <div className="container mx-auto px-4 py-8 text-center">
            <h2 className="text-2xl font-bold text-ocean-800">Isla no encontrada</h2>
            <button onClick={handleBack} className="mt-4 text-gold-600 hover:underline">
              Volver al mapa
            </button>
          </div>
        </MenuLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <LevelGrid world={world} levels={levels as any} onPlayLevel={handlePlayLevel} onBack={handleBack} />
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
