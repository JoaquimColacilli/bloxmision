"use client"

import { useState } from "react"
import { Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MiniGrid } from "@/components/help/mini-grid"
import type { LessonSectionData } from "@/lib/types"

interface LessonDemoProps {
  data: LessonSectionData
}

export function LessonDemo({ data }: LessonDemoProps) {
  const [showAfter, setShowAfter] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handlePlayDemo = () => {
    setIsAnimating(true)
    setShowAfter(false)
    // Simulate animation
    setTimeout(() => {
      setShowAfter(true)
      setIsAnimating(false)
    }, 1500)
  }

  const handleReset = () => {
    setShowAfter(false)
    setIsAnimating(false)
  }

  // Create grid based on setup
  const gridCells = createGridFromSetup(data.gridSetup, showAfter)

  return (
    <div className="space-y-6">
      {data.message && <p className="text-center text-lg font-medium text-gray-700">{data.message}</p>}

      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
        {/* Before/After code comparison */}
        {data.beforeCode && data.afterCode && (
          <div className="flex flex-col gap-4 md:flex-row md:gap-8">
            <div className="rounded-lg bg-red-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-red-700">Antes (largo):</h4>
              <div className="space-y-1 font-mono text-sm">
                {data.beforeCode.map((line, i) => (
                  <div key={i} className="rounded bg-red-100 px-2 py-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-green-700">Despues (corto):</h4>
              <div className="space-y-1 font-mono text-sm">
                {data.afterCode.map((line, i) => (
                  <div key={i} className="rounded bg-green-100 px-2 py-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Demo code only */}
        {data.demoCode && !data.beforeCode && (
          <div className="rounded-lg bg-ocean-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-ocean-700">Codigo:</h4>
            <div className="space-y-1 font-mono text-sm">
              {data.demoCode.map((line, i) => (
                <div key={i} className="rounded bg-ocean-100 px-2 py-1">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid visualization */}
      {data.gridSetup && (
        <div className="flex flex-col items-center gap-4">
          <MiniGrid cells={gridCells} size="md" />

          <div className="flex gap-2">
            <Button onClick={handlePlayDemo} disabled={isAnimating} className="gap-2">
              <Play className="size-4" />
              {isAnimating ? "Ejecutando..." : "Ver animacion"}
            </Button>
            {showAfter && (
              <Button variant="outline" onClick={handleReset} className="gap-2 bg-transparent">
                <RotateCcw className="size-4" />
                Reiniciar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function createGridFromSetup(setup: LessonSectionData["gridSetup"], showAfter: boolean): string[][] {
  if (!setup) return [["⬜"]]

  const { size, jorc, target, obstacles } = setup
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill("⬜"))

  // Add obstacles
  obstacles?.forEach((obs) => {
    if (obs.x < size && obs.y < size) {
      grid[obs.y][obs.x] = obs.type === "rock" ? "🪨" : "🧱"
    }
  })

  // Add target
  if (target && target.x < size && target.y < size) {
    const targetIcon = target.type === "chest" ? "📦" : target.type === "coin" ? "💰" : "⭐"
    grid[target.y][target.x] = showAfter ? "✅" : targetIcon
  }

  // Add Jorc
  const jorcPos = showAfter && target ? { x: target.x, y: target.y } : { x: jorc.x, y: jorc.y }
  const directionArrow =
    jorc.facing === "east" ? "→" : jorc.facing === "west" ? "←" : jorc.facing === "north" ? "↑" : "↓"
  if (jorcPos.x < size && jorcPos.y < size) {
    grid[jorcPos.y][jorcPos.x] = `🏴‍☠️${directionArrow}`
  }

  return grid
}
