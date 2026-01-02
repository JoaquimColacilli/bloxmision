"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { WorldSelect } from "@/components/worlds/world-select"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { useProgress } from "@/contexts/progress-context"
import { WORLD_DEFINITIONS } from "@/src/lib/services/worldService"
import type { World } from "@/lib/types"

export default function WorldsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isWorldUnlocked, getWorldCompletedCount, getCurrentWorldId, isLoading } = useProgress()

  // Compute worlds data from cached progress (no Firestore reads)
  const worlds = useMemo((): World[] => {
    const currentWorldId = getCurrentWorldId()

    return WORLD_DEFINITIONS.map(def => ({
      id: def.id,
      name: def.name,
      description: def.description,
      concept: def.concept,
      totalLevels: def.totalLevels,
      completedLevels: getWorldCompletedCount(def.id),
      isUnlocked: isWorldUnlocked(def.id),
      isCurrent: def.id === currentWorldId
    }))
  }, [isWorldUnlocked, getWorldCompletedCount, getCurrentWorldId])

  const handleEnterWorld = (worldId: string) => {
    router.push(`/world/${worldId}`)
  }

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {isLoading ? (
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
