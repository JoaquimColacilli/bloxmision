"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { LevelGrid } from "@/components/worlds/level-grid"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { getWorldProgress, getUserLevelsForWorld, WORLD_DEFINITIONS, type LevelStatus } from "@/src/lib/services/worldService"
import type { World, Level } from "@/lib/types"


export default function WorldPage() {
  const params = useParams()
  const worldId = params.worldId as string
  const router = useRouter()
  const { user } = useAuth()

  const [world, setWorld] = useState<World | null>(null)
  const [levels, setLevels] = useState<LevelStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorldData() {
      if (!user) return

      try {
        // Find world definition
        const worldDef = WORLD_DEFINITIONS.find(w => w.id === worldId)
        if (!worldDef) {
          setLoading(false)
          return
        }

        // Get progress
        const [worldProgress, levelsProgress] = await Promise.all([
          getWorldProgress(user.id, worldId),
          getUserLevelsForWorld(user.id, worldId)
        ])

        setWorld({
          id: worldDef.id,
          name: worldDef.name,
          description: worldDef.description,
          concept: worldDef.concept,
          totalLevels: worldDef.totalLevels,
          completedLevels: worldProgress?.completedLevels || 0,
          isUnlocked: worldProgress?.isUnlocked ?? (worldDef.order === 1),
          isCurrent: worldProgress?.isCurrent || false,
        })

        setLevels(levelsProgress)
      } catch (error) {
        console.error("Error loading world data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWorldData()
  }, [user, worldId])

  const handlePlayLevel = (levelId: string) => {
    router.push(`/play/${levelId}`)
  }

  const handleBack = () => {
    router.push("/worlds")
  }

  if (loading) {
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
