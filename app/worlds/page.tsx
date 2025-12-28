"use client"

import { useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { WorldSelect } from "@/components/worlds/world-select"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import type { World } from "@/lib/types"

// Mock data - en produccion vendria de la API/Firebase
const mockWorlds: World[] = [
  {
    id: "secuencia",
    name: "Isla Secuencia",
    description: "Aprende a dar ordenes paso a paso",
    concept: "Secuencias",
    totalLevels: 12,
    completedLevels: 12,
    isUnlocked: true,
    isCurrent: false,
  },
  {
    id: "bucle",
    name: "Isla Bucle",
    description: "Domina los ciclos y repeticiones",
    concept: "Bucles",
    totalLevels: 14,
    completedLevels: 8,
    isUnlocked: true,
    isCurrent: true,
  },
  {
    id: "decision",
    name: "Isla Decision",
    description: "Toma decisiones con condiciones",
    concept: "Condicionales",
    totalLevels: 15,
    completedLevels: 0,
    isUnlocked: false,
    isCurrent: false,
  },
  {
    id: "memoria",
    name: "Isla Memoria",
    description: "Guarda y recuerda valores",
    concept: "Variables",
    totalLevels: 12,
    completedLevels: 0,
    isUnlocked: false,
    isCurrent: false,
  },
  {
    id: "funcion",
    name: "Isla Funcion",
    description: "Crea bloques de codigo reutilizables",
    concept: "Funciones",
    totalLevels: 15,
    completedLevels: 0,
    isUnlocked: false,
    isCurrent: false,
  },
]

export default function WorldsPage() {
  const router = useRouter()

  const handleEnterWorld = (worldId: string) => {
    router.push(`/world/${worldId}`)
  }

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <WorldSelect worlds={mockWorlds} onEnterWorld={handleEnterWorld} />
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
