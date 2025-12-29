"use client"

import { useMemo } from "react"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { TreasureMap } from "@/components/map/treasure-map"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import type { TreasureFragment } from "@/lib/types"

// Fragment definitions - the 15 pieces of the treasure map
const FRAGMENT_DEFINITIONS: Omit<TreasureFragment, "unlocked">[] = [
  { id: "fragment-1-1", order: 1, revealedText: "En el este, donde el sol nace, comienza tu viaje...", unlockedByLevel: "1-4" },
  { id: "fragment-1-2", order: 2, revealedText: "Cruza el puente de madera antigua...", unlockedByLevel: "1-8" },
  { id: "fragment-1-3", order: 3, revealedText: "La palmera solitaria guarda secretos...", unlockedByLevel: "1-12" },
  { id: "fragment-2-1", order: 4, revealedText: "Bajo la roca con forma de calavera...", unlockedByLevel: "2-4" },
  { id: "fragment-2-2", order: 5, revealedText: "El arrecife de coral esconde la entrada...", unlockedByLevel: "2-8" },
  { id: "fragment-2-3", order: 6, revealedText: "Tres pasos al norte desde el ancla oxidada...", unlockedByLevel: "2-12" },
  { id: "fragment-3-1", order: 7, revealedText: "La cueva susurra historias de oro...", unlockedByLevel: "3-4" },
  { id: "fragment-3-2", order: 8, revealedText: "Donde las olas besan la arena negra...", unlockedByLevel: "3-8" },
  { id: "fragment-3-3", order: 9, revealedText: "El faro abandonado marca el camino...", unlockedByLevel: "3-12" },
  { id: "fragment-4-1", order: 10, revealedText: "Entre las rocas gemelas, busca la grieta...", unlockedByLevel: "4-4" },
  { id: "fragment-4-2", order: 11, revealedText: "El barco hundido guarda la llave...", unlockedByLevel: "4-8" },
  { id: "fragment-4-3", order: 12, revealedText: "Sigue la estrella del norte...", unlockedByLevel: "4-12" },
  { id: "fragment-5-1", order: 13, revealedText: "El volcán dormido protege el secreto...", unlockedByLevel: "5-4" },
  { id: "fragment-5-2", order: 14, revealedText: "La cascada oculta revela la entrada...", unlockedByLevel: "5-8" },
  { id: "fragment-5-3", order: 15, revealedText: "X marca el lugar del tesoro del Dargholl!", unlockedByLevel: "5-12" },
]

export default function MapPage() {
  const { user } = useAuth()

  // Build fragments array based on user's unlockedFragmentsMap
  const fragments = useMemo((): TreasureFragment[] => {
    const unlockedMap = user?.unlockedFragmentsMap || {}

    return FRAGMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlocked: !!unlockedMap[def.id],
    }))
  }, [user?.unlockedFragmentsMap])

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-8">
          <TreasureMap
            fragments={fragments}
            onFragmentClick={(id) => console.log("Fragment clicked:", id)}
          />
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
