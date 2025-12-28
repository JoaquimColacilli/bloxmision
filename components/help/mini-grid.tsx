"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"

interface MiniGridProps {
  cells: string[][]
  size?: "sm" | "md"
}

const cellColors: Record<string, string> = {
  "⬜": "bg-sand-100",
  "🏴‍☠️→": "bg-ocean-200",
  "🏴‍☠️←": "bg-ocean-200",
  "🏴‍☠️↑": "bg-ocean-200",
  "🏴‍☠️↓": "bg-ocean-200",
  "📦": "bg-amber-100",
  "💰": "bg-yellow-100",
  "🪨": "bg-stone-300",
  "🪙": "bg-yellow-200",
  "🧱": "bg-stone-400",
  "🔴": "bg-red-200",
  "🟢": "bg-green-200",
  "✅": "bg-green-100",
  "❓": "bg-purple-100",
}

export const MiniGrid = memo(function MiniGrid({ cells, size = "md" }: MiniGridProps) {
  const cellSize = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base"

  return (
    <div className="inline-flex flex-col gap-0.5 rounded-lg border border-ocean-200 bg-ocean-50 p-1">
      {cells.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0.5">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(cellSize, "flex items-center justify-center rounded", cellColors[cell] || "bg-sand-100")}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
})
