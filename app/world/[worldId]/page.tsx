"use client"

import { useParams, useRouter } from "next/navigation"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { LevelGrid } from "@/components/worlds/level-grid"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import type { World, Level } from "@/lib/types"

// Mock data - en produccion vendria de la API/Firebase
const mockWorldsData: Record<string, { world: World; levels: Level[] }> = {
  secuencia: {
    world: {
      id: "secuencia",
      name: "Isla Secuencia",
      description: "Aprende a dar ordenes paso a paso",
      totalLevels: 12,
      completedLevels: 12,
      isUnlocked: true,
    },
    levels: Array.from({ length: 12 }, (_, i) => ({
      id: `secuencia-${i + 1}`,
      worldId: "secuencia",
      name: `Nivel ${i + 1}`,
      order: i + 1,
      isCompleted: true,
      isUnlocked: true,
      isCurrent: false,
      stars: 3,
      xpReward: 50,
    })),
  },
  bucle: {
    world: {
      id: "bucle",
      name: "Isla Bucle",
      description: "Domina los ciclos y repeticiones",
      totalLevels: 14,
      completedLevels: 8,
      isUnlocked: true,
      isCurrent: true,
    },
    levels: Array.from({ length: 14 }, (_, i) => ({
      id: `bucle-${i + 1}`,
      worldId: "bucle",
      name: `Nivel ${i + 1}`,
      order: i + 1,
      isCompleted: i < 8,
      isUnlocked: i <= 8,
      isCurrent: i === 8,
      stars: i < 8 ? (i < 5 ? 3 : 2) : 0,
      xpReward: 75,
    })),
  },
  decision: {
    world: {
      id: "decision",
      name: "Isla Decision",
      description: "Toma decisiones con condiciones",
      totalLevels: 15,
      completedLevels: 0,
      isUnlocked: false,
    },
    levels: Array.from({ length: 15 }, (_, i) => ({
      id: `decision-${i + 1}`,
      worldId: "decision",
      name: `Nivel ${i + 1}`,
      order: i + 1,
      isCompleted: false,
      isUnlocked: false,
      isCurrent: false,
      stars: 0,
      xpReward: 100,
    })),
  },
  memoria: {
    world: {
      id: "memoria",
      name: "Isla Memoria",
      description: "Guarda y recuerda valores",
      totalLevels: 12,
      completedLevels: 0,
      isUnlocked: false,
    },
    levels: Array.from({ length: 12 }, (_, i) => ({
      id: `memoria-${i + 1}`,
      worldId: "memoria",
      name: `Nivel ${i + 1}`,
      order: i + 1,
      isCompleted: false,
      isUnlocked: false,
      isCurrent: false,
      stars: 0,
      xpReward: 125,
    })),
  },
  funcion: {
    world: {
      id: "funcion",
      name: "Isla Funcion",
      description: "Crea bloques de codigo reutilizables",
      totalLevels: 15,
      completedLevels: 0,
      isUnlocked: false,
    },
    levels: Array.from({ length: 15 }, (_, i) => ({
      id: `funcion-${i + 1}`,
      worldId: "funcion",
      name: `Nivel ${i + 1}`,
      order: i + 1,
      isCompleted: false,
      isUnlocked: false,
      isCurrent: false,
      stars: 0,
      xpReward: 150,
    })),
  },
}

export default function WorldPage() {
  const params = useParams()
  const worldId = params.worldId as string
  const router = useRouter()

  const data = mockWorldsData[worldId] || {
    world: {
      id: "unknown",
      name: "Isla Desconocida",
      description: "Esta isla no existe",
      totalLevels: 0,
      completedLevels: 0,
      isUnlocked: false,
    },
    levels: [],
  }

  const handlePlayLevel = (levelId: string) => {
    router.push(`/play/${levelId}`)
  }

  const handleBack = () => {
    router.push("/worlds")
  }

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <LevelGrid world={data.world} levels={data.levels} onPlayLevel={handlePlayLevel} onBack={handleBack} />
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
