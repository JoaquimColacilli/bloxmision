"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { WorldSelect } from "@/components/worlds/world-select"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { getUserWorldsProgress, WORLD_DEFINITIONS } from "@/src/lib/services/worldService"
import type { World } from "@/lib/types"

export default function WorldsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [worlds, setWorlds] = useState<World[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadWorlds() {
      if (!user) return

      try {
        const progress = await getUserWorldsProgress(user.id)

        // Merge definitions with progress
        const worldsData: World[] = WORLD_DEFINITIONS.map(def => {
          const userProgress = progress.find(p => p.worldId === def.id)

          return {
            id: def.id,
            name: def.name,
            description: def.description,
            concept: def.concept,
            totalLevels: def.totalLevels,
            completedLevels: userProgress?.completedLevels || 0,
            isUnlocked: userProgress?.isUnlocked ?? (def.order === 1),
            isCurrent: userProgress?.isCurrent || false
          }
        })

        setWorlds(worldsData)
      } catch (error) {
        console.error("Error loading worlds:", error)
      } finally {
        setLoading(false)
      }
    }

    loadWorlds()
  }, [user])

  const handleEnterWorld = (worldId: string) => {
    router.push(`/world/${worldId}`)
  }

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="text-ocean-600">Cargando islas...</div>
            </div>
          ) : (
            <WorldSelect worlds={worlds} onEnterWorld={handleEnterWorld} />
          )}
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
