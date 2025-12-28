"use client"

import { useState } from "react"
import { Play, RotateCcw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MiniGrid } from "@/components/help/mini-grid"
import { cn } from "@/lib/utils"
import type { LessonSectionData } from "@/lib/types"

interface LessonPracticeProps {
  data: LessonSectionData
  onComplete: () => void
}

export function LessonPractice({ data, onComplete }: LessonPracticeProps) {
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([])
  const [result, setResult] = useState<"success" | "fail" | null>(null)
  const [showHint, setShowHint] = useState(false)

  const blockLabels: Record<string, string> = {
    move: "Avanzar",
    turnRight: "Girar Derecha",
    turnLeft: "Girar Izquierda",
    loop: "Repetir",
    conditional: "Si...",
    sensorObstacle: "Hay obstaculo?",
  }

  const handleAddBlock = (block: string) => {
    if (data.maxBlocks && selectedBlocks.length >= data.maxBlocks) return
    setSelectedBlocks([...selectedBlocks, block])
    setResult(null)
  }

  const handleRemoveBlock = (index: number) => {
    setSelectedBlocks(selectedBlocks.filter((_, i) => i !== index))
    setResult(null)
  }

  const handleRun = () => {
    // Simple validation - check if blocks match expected solution pattern
    const isCorrect = validateSolution(selectedBlocks, data.solution || [])
    setResult(isCorrect ? "success" : "fail")
    if (isCorrect) {
      setTimeout(onComplete, 1000)
    }
  }

  const handleReset = () => {
    setSelectedBlocks([])
    setResult(null)
  }

  const gridCells = createGridFromSetup(data.gridSetup, result === "success")

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 p-4 text-center">
        <h3 className="text-lg font-bold text-amber-800">Tu turno!</h3>
        <p className="text-amber-700">{data.challenge}</p>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        {/* Grid */}
        {data.gridSetup && <MiniGrid cells={gridCells} size="md" />}

        {/* Block selection area */}
        <div className="w-full max-w-sm space-y-4">
          {/* Available blocks */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-600">Bloques disponibles:</h4>
            <div className="flex flex-wrap gap-2">
              {data.availableBlocks?.map((block) => (
                <button
                  key={block}
                  onClick={() => handleAddBlock(block)}
                  disabled={data.maxBlocks ? selectedBlocks.length >= data.maxBlocks : false}
                  className="rounded-lg bg-ocean-500 px-3 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
                >
                  {blockLabels[block] || block}
                </button>
              ))}
            </div>
          </div>

          {/* Selected blocks */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-600">Tu codigo:</h4>
              <span className="text-xs text-gray-500">
                {selectedBlocks.length}/{data.maxBlocks || "∞"} bloques
              </span>
            </div>
            <div className="min-h-[100px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-2">
              {selectedBlocks.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">Arrastra bloques aqui</p>
              ) : (
                <div className="space-y-1">
                  {selectedBlocks.map((block, index) => (
                    <div key={index} className="flex items-center justify-between rounded bg-ocean-100 px-3 py-2">
                      <span className="text-sm font-medium text-ocean-800">{blockLabels[block] || block}</span>
                      <button onClick={() => handleRemoveBlock(index)} className="text-ocean-600 hover:text-red-500">
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={handleRun} disabled={selectedBlocks.length === 0} className="flex-1 gap-2">
              <Play className="size-4" />
              Probar
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="size-4" />
            </Button>
          </div>

          {/* Result feedback */}
          {result && (
            <div
              className={cn(
                "rounded-lg p-4 text-center",
                result === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
              )}
            >
              {result === "success" ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="size-5" />
                  <span className="font-bold">Perfecto, grumete!</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <X className="size-5" />
                    <span className="font-bold">Casi! Intenta de nuevo</span>
                  </div>
                  <button onClick={() => setShowHint(true)} className="mt-2 text-sm underline">
                    Ver pista
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hint */}
          {showHint && data.solution && (
            <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-800">
              <strong>Pista:</strong> Necesitas {data.solution.length} bloques. Piensa en el camino que debe seguir
              Jorc.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function validateSolution(selected: string[], expected: string[]): boolean {
  // Simple validation - just check block count for demo
  // In real implementation, would validate actual execution
  if (selected.length === 0) return false
  return selected.length <= (expected.length || 10)
}

function createGridFromSetup(setup: LessonSectionData["gridSetup"], completed: boolean): string[][] {
  if (!setup) return [["⬜"]]

  const { size, jorc, target, obstacles } = setup
  const grid: string[][] = Array(size)
    .fill(null)
    .map(() => Array(size).fill("⬜"))

  obstacles?.forEach((obs) => {
    if (obs.x < size && obs.y < size) {
      grid[obs.y][obs.x] = obs.type === "rock" ? "🪨" : "🧱"
    }
  })

  if (target && target.x < size && target.y < size) {
    const icon = target.type === "chest" ? "📦" : target.type === "coin" ? "💰" : "⭐"
    grid[target.y][target.x] = completed ? "✅" : icon
  }

  const jorcPos = completed && target ? { x: target.x, y: target.y } : { x: jorc.x, y: jorc.y }
  const arrow = jorc.facing === "east" ? "→" : jorc.facing === "west" ? "←" : jorc.facing === "north" ? "↑" : "↓"
  if (jorcPos.x < size && jorcPos.y < size) {
    grid[jorcPos.y][jorcPos.x] = `🏴‍☠️${arrow}`
  }

  return grid
}
