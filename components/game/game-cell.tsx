"use client"

import type React from "react"

import { memo } from "react"
import type { TileType, Entity, Direction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface GameCellProps {
  x: number
  y: number
  tileType: TileType
  entity?: Entity
  isPath?: boolean
  pathDirection?: Direction
  onClick?: (x: number, y: number) => void
  cellSize: number
}

const tileStyles: Record<TileType, string> = {
  water: "bg-blue-400",
  sand: "bg-amber-200",
  grass: "bg-green-400",
  rock: "bg-stone-400",
  wood: "bg-amber-600",
}

const entityIcons: Record<string, string> = {
  rock: "🪨",
  tree: "🌴",
  wall: "🧱",
  chest: "📦",
  coin: "🪙",
  gem: "💎",
  lever: "🔧",
  door: "🚪",
  bridge: "🌉",
}

const directionRotation: Record<Direction, string> = {
  north: "-rotate-90",
  east: "rotate-0",
  south: "rotate-90",
  west: "rotate-180",
}

// Sprites del barco según la dirección
const boatSprites: Record<Direction, string> = {
  north: "/sprites/boat_raw/frame-05.png",
  east: "/sprites/boat_raw/frame-06.png",
  south: "/sprites/boat_raw/frame-07.png",
  west: "/sprites/boat_raw/frame-08.png",
}

function GameCellComponent({
  x,
  y,
  tileType,
  entity,
  isPath,
  pathDirection,
  onClick,
  cellSize,
}: GameCellProps) {
  const handleClick = () => onClick?.(x, y)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.(x, y)
    }
  }

  return (
    <div
      role="gridcell"
      tabIndex={onClick ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Celda ${x},${y}: ${tileType}${entity ? `, contiene ${entity.type}` : ""}`}
      className={cn(
        "relative flex items-center justify-center border border-black/10 transition-all",
        tileStyles[tileType],
        onClick &&
        "cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-gold-400 focus:ring-offset-1 focus:outline-none",
        isPath && "ring-2 ring-inset ring-gold-400/60",
      )}
      style={{ width: cellSize, height: cellSize }}
    >
      {/* Path direction indicator */}
      {isPath && pathDirection && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-gold-500/70 pointer-events-none",
            directionRotation[pathDirection],
          )}
          aria-hidden="true"
        >
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </div>
      )}

      {/* Entity rendering */}
      {entity && entity.type !== "jorc" && !entity.collected && (
        <span
          className="text-[60%] sm:text-[70%] drop-shadow-sm select-none"
          style={{ fontSize: cellSize * 0.5 }}
          aria-hidden="true"
        >
          {entityIcons[entity.type] || "❓"}
        </span>
      )}

      {/* Barco/Jorc character */}
      {entity?.type === "jorc" && (
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
          aria-label={`Barco mirando al ${entity.facing || "este"}`}
        >
          <img
            src={boatSprites[entity.facing || "east"]}
            alt={`Barco mirando al ${entity.facing || "este"}`}
            className="w-[90%] h-[90%] object-contain drop-shadow-md"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      )}
    </div>
  )
}

export const GameCell = memo(GameCellComponent)
