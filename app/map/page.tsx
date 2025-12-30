"use client"

import { useMemo } from "react"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { TreasureMap } from "@/components/map/treasure-map"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import type { TreasureFragment } from "@/lib/types"

// Fragment definitions - the 15 pieces of the treasure map
const FRAGMENT_DEFINITIONS: Omit<TreasureFragment, "unlocked">[] = [
  { id: "fragment-1-1", order: 1, imageUrl: "/fragments/fragment-1.png", revealedText: "En el este, donde el sol nace, comienza tu viaje...", unlockedByLevel: "1-4" },
  { id: "fragment-1-2", order: 2, imageUrl: "/fragments/fragment-2.png", revealedText: "Cruza el puente de madera antigua...", unlockedByLevel: "1-8" },
  { id: "fragment-1-3", order: 3, imageUrl: "/fragments/fragment-3.png", revealedText: "La palmera solitaria guarda secretos...", unlockedByLevel: "1-12" },
  { id: "fragment-2-1", order: 4, imageUrl: "/fragments/fragment-4.png", revealedText: "Bajo la roca con forma de calavera...", unlockedByLevel: "2-4" },
  { id: "fragment-2-2", order: 5, imageUrl: "/fragments/fragment-5.png", revealedText: "El arrecife de coral esconde la entrada...", unlockedByLevel: "2-8" },
  { id: "fragment-2-3", order: 6, imageUrl: "/fragments/fragment-6.png", revealedText: "Tres pasos al norte desde el ancla oxidada...", unlockedByLevel: "2-12" },
  { id: "fragment-3-1", order: 7, imageUrl: "/fragments/fragment-7.png", revealedText: "La cueva susurra historias de oro...", unlockedByLevel: "3-4" },
  { id: "fragment-3-2", order: 8, imageUrl: "/fragments/fragment-8.png", revealedText: "Donde las olas besan la arena negra...", unlockedByLevel: "3-8" },
  { id: "fragment-3-3", order: 9, imageUrl: "/fragments/fragment-9.png", revealedText: "Las rocas gemelas apuntan al tesoro...", unlockedByLevel: "3-12" },
  { id: "fragment-4-1", order: 10, imageUrl: "/fragments/fragment-10.png", revealedText: "La brújula nunca miente, sigue el norte...", unlockedByLevel: "4-4" },
  { id: "fragment-4-2", order: 11, imageUrl: "/fragments/fragment-11.png", revealedText: "Donde el agua cae desde lo alto...", unlockedByLevel: "4-8" },
  { id: "fragment-4-3", order: 12, imageUrl: "/fragments/fragment-12.png", revealedText: "La cruz marca el camino, no el destino...", unlockedByLevel: "4-12" },
  { id: "fragment-5-1", order: 13, imageUrl: "/fragments/fragment-13.png", revealedText: "Bajo el arco de piedra milenaria...", unlockedByLevel: "5-4" },
  { id: "fragment-5-2", order: 14, imageUrl: "/fragments/fragment-14.png", revealedText: "La X marca el lugar exacto...", unlockedByLevel: "5-8" },
  { id: "fragment-5-3", order: 15, imageUrl: "/fragments/fragment-15.png", revealedText: "¡El cofre del tesoro espera al valiente navegante!", unlockedByLevel: "5-12" },
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
