"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import type { TileType, Entity, Direction } from "@/lib/types"
import { cn } from "@/lib/utils"

export type GameTheme = "default" | "night"

interface GameCellProps {
  x: number
  y: number
  tileType: TileType
  entity?: Entity
  isPath?: boolean
  pathDirection?: Direction
  onClick?: (x: number, y: number) => void
  cellSize: number
  theme?: GameTheme
}

const tileStyles: Record<TileType, Record<GameTheme, string>> = {
  water: {
    default: "bg-blue-400",
    night: "bg-blue-900",
  },
  sand: {
    default: "bg-amber-200",
    night: "bg-amber-900/60",
  },
  grass: {
    default: "bg-green-400",
    night: "bg-green-900",
  },
  rock: {
    default: "bg-stone-400",
    night: "bg-stone-700",
  },
  wood: {
    default: "bg-amber-600",
    night: "bg-amber-800",
  },
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

// Sprites del Kraken según la dirección de ataque (idle por defecto)
const krakenSprites: Record<Direction | "idle", string> = {
  idle: "/sprites/kraken/idle.png",
  north: "/sprites/kraken/attack-up.png",
  east: "/sprites/kraken/attack-right.png",
  south: "/sprites/kraken/attack-down.png",
  west: "/sprites/kraken/attack-left.png",
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
  theme = "default",
}: GameCellProps) {
  const handleClick = () => onClick?.(x, y)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.(x, y)
    }
  }

  // Kraken animation state
  const [krakenFrame, setKrakenFrame] = useState<keyof typeof krakenSprites>("idle")

  useEffect(() => {
    if (entity?.type !== "kraken") return

    // Sequence: Idle -> Attack Up -> Idle -> Attack Right -> Idle -> Attack Down -> Idle -> Attack Left
    const sequence: (keyof typeof krakenSprites)[] = ["idle", "north", "idle", "east", "idle", "south", "idle", "west"]
    let index = 0

    // Random start delay to desynchronize multiple krakens
    const startDelay = Math.random() * 1000
    let intervalId: NodeJS.Timeout

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index = (index + 1) % sequence.length
        setKrakenFrame(sequence[index])
      }, 600) // Change frame every 600ms
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [entity?.type])

  const tileStyle = tileStyles[tileType]?.[theme] || tileStyles[tileType]?.default || "bg-blue-400"

  return (
    <div
      role="gridcell"
      tabIndex={onClick ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Celda ${x},${y}: ${tileType}${entity ? `, contiene ${entity.type}` : ""}`}
      className={cn(
        "relative flex items-center justify-center border transition-all",
        tileStyle,
        theme === "night" ? "border-cyan-900/50" : "border-black/10",
        onClick &&
        "cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-gold-400 focus:ring-offset-1 focus:outline-none",
        isPath && (theme === "night" ? "ring-2 ring-inset ring-cyan-400/60" : "ring-2 ring-inset ring-gold-400/60"),
      )}
      style={{ width: cellSize, height: cellSize }}
    >
      {/* Night theme stars effect */}
      {theme === "night" && Math.random() > 0.85 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-0.5 h-0.5 bg-white/40 rounded-full" style={{ top: '20%', left: '30%' }} />
          <div className="absolute w-0.5 h-0.5 bg-white/30 rounded-full" style={{ top: '60%', left: '70%' }} />
        </div>
      )}

      {/* Path direction indicator */}
      {isPath && pathDirection && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            theme === "night" ? "text-cyan-400/70" : "text-gold-500/70",
            directionRotation[pathDirection],
          )}
          aria-hidden="true"
        >
          <svg width="60%" height="60%" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </div>
      )}

      {/* Kraken rendering */}
      {entity?.type === "kraken" && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Kraken - Peligroso!"
        >
          <img
            src={krakenSprites[krakenFrame]}
            alt="Kraken"
            className="w-[95%] h-[95%] object-contain drop-shadow-lg transition-transform duration-200"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      )}

      {/* Entity rendering (non-Kraken, non-Jorc) */}
      {entity && entity.type !== "jorc" && entity.type !== "kraken" && !entity.collected && (
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

