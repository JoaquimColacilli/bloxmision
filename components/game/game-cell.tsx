"use client"

import type React from "react"

import { memo, useState, useEffect } from "react"
import type { TileType, Entity, Direction } from "@/lib/types"
import { cn } from "@/lib/utils"

export type GameTheme = "default" | "night" | "reef" | "sanctuary"

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
    reef: "bg-[#0B1628]", // Deep ocean
    sanctuary: "bg-[#7CB68E]", // Forest stream / mossy water
  },
  sand: {
    default: "bg-amber-200",
    night: "bg-amber-900/60",
    reef: "bg-[#1A4D52]", // Sandy with algae tint
    sanctuary: "bg-[#D4C4A8]", // Leaf-covered earth path
  },
  grass: {
    default: "bg-green-400",
    night: "bg-green-900",
    reef: "bg-[#00A896]", // Seaweed green
    sanctuary: "bg-[#8FBC8F]", // Mossy stone / forest floor
  },
  rock: {
    default: "bg-stone-400",
    night: "bg-stone-700",
    reef: "bg-[#2D3A4A]", // Dark reef rock
    sanctuary: "bg-[#9CAF88]", // Mossy rock tile
  },
  wood: {
    default: "bg-amber-600",
    night: "bg-amber-800",
    reef: "bg-[#5D4037]", // Shipwreck wood
    sanctuary: "bg-[#DEB887]", // Sanctuary wood planks
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

// Sprites del barco según la dirección (World 1 & 2)
const boatSprites: Record<Direction, string> = {
  north: "/sprites/boat_raw/frame-05.png",
  east: "/sprites/boat_raw/frame-06.png",
  south: "/sprites/boat_raw/frame-07.png",
  west: "/sprites/boat_raw/frame-08.png",
}

// Sprites de Jorc según la dirección (World 3 - Reef)
// IMPORTANT: Each direction uses ONE consistent sprite set. No mixing.
// WEST uses EAST sprites with CSS mirror (no dedicated LEFT set exists)
const jorcSprites: Record<Direction, { src: string; mirror: boolean }> = {
  north: { src: "/sprites/jorc_looking_up/action-01.png", mirror: false },
  south: { src: "/sprites/jorc_raw/action-01.png", mirror: false },
  east: { src: "/sprites/jorc_raw/action-13.png", mirror: false },
  west: { src: "/sprites/jorc_raw/action-13.png", mirror: true },
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

  // Border color based on theme
  const borderColor = theme === "night"
    ? "border-cyan-900/50"
    : theme === "reef"
      ? "border-cyan-800/40"
      : theme === "sanctuary"
        ? "border-[#6B8E23]/50"
        : "border-black/10"

  // Path ring color based on theme
  const pathRing = theme === "night"
    ? "ring-2 ring-inset ring-cyan-400/60"
    : theme === "reef"
      ? "ring-2 ring-inset ring-teal-400/50"
      : theme === "sanctuary"
        ? "ring-2 ring-inset ring-amber-400/50"
        : "ring-2 ring-inset ring-gold-400/60"

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
        borderColor,
        onClick &&
        "cursor-pointer hover:brightness-110 focus:ring-2 focus:ring-gold-400 focus:ring-offset-1 focus:outline-none",
        isPath && pathRing,
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

      {/* Reef theme bubble effect (subtle, not distracting) */}
      {theme === "reef" && Math.random() > 0.92 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-1 h-1 rounded-full bg-cyan-300/20 animate-pulse"
            style={{ top: `${20 + Math.random() * 60}%`, left: `${20 + Math.random() * 60}%` }}
          />
        </div>
      )}

      {/* Sanctuary theme forest light effect (subtle sun rays) */}
      {theme === "sanctuary" && Math.random() > 0.88 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-0.5 h-3 bg-gradient-to-b from-yellow-200/20 to-transparent rotate-45"
            style={{ top: `${10 + Math.random() * 30}%`, left: `${40 + Math.random() * 40}%` }}
          />
        </div>
      )}

      {/* Path direction indicator */}
      {isPath && pathDirection && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center pointer-events-none",
            theme === "night" ? "text-cyan-400/70" : theme === "reef" ? "text-teal-300/60" : theme === "sanctuary" ? "text-amber-600/60" : "text-gold-500/70",
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

      {/* Rock/Obstacle rendering - CSS styled for reef/sanctuary, emoji for others */}
      {entity?.type === "rock" && !entity.collected && (
        theme === "reef" ? (
          // Reef theme: Coral-styled obstacle (no emoji)
          <div
            className="absolute inset-[12%] rounded-lg bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600 shadow-lg border-2 border-rose-300/50"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.3)'
            }}
            aria-label="Coral - Obstáculo"
          >
            {/* Coral texture dots */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-200/60 absolute top-[20%] left-[25%]" />
              <div className="w-1 h-1 rounded-full bg-rose-200/40 absolute top-[50%] left-[60%]" />
              <div className="w-1.5 h-1.5 rounded-full bg-rose-200/50 absolute top-[70%] left-[35%]" />
            </div>
          </div>
        ) : theme === "sanctuary" ? (
          // Sanctuary theme: Fallen log with moss (no emoji)
          <div
            className="absolute inset-[10%] rounded-md bg-gradient-to-br from-[#8B7355] via-[#7A6548] to-[#5D4E37] shadow-lg border-2 border-[#6B5B3D]"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.15), 0 3px 8px rgba(0,0,0,0.4)'
            }}
            aria-label="Tronco caído - Obstáculo"
          >
            {/* Moss patches on log */}
            <div className="absolute inset-0">
              <div className="absolute w-2 h-1.5 rounded-full bg-[#6B8E23]/70 top-[15%] left-[20%]" />
              <div className="absolute w-1.5 h-1 rounded-full bg-[#556B2F]/60 top-[60%] left-[55%]" />
              <div className="absolute w-1 h-1 rounded-full bg-[#6B8E23]/50 top-[40%] right-[15%]" />
            </div>
            {/* Wood grain lines */}
            <div className="absolute inset-x-2 top-[45%] h-[1px] bg-[#4A3728]/40" />
            <div className="absolute inset-x-3 top-[55%] h-[1px] bg-[#4A3728]/30" />
          </div>
        ) : (
          // Default/Night theme: Emoji rock
          <span
            className="text-[60%] sm:text-[70%] drop-shadow-sm select-none"
            style={{ fontSize: cellSize * 0.5 }}
            aria-hidden="true"
          >
            {entityIcons.rock}
          </span>
        )
      )}

      {/* Other entity rendering (non-Kraken, non-Jorc, non-Rock) */}
      {entity && entity.type !== "jorc" && entity.type !== "kraken" && entity.type !== "rock" && !entity.collected && (
        <span
          className="text-[60%] sm:text-[70%] drop-shadow-sm select-none"
          style={{ fontSize: cellSize * 0.5 }}
          aria-hidden="true"
        >
          {entityIcons[entity.type] || "❓"}
        </span>
      )}

      {/* Character rendering: Jorc (reef/sanctuary) or Boat (default/night) */}
      {entity?.type === "jorc" && (
        (theme === "reef" || theme === "sanctuary") ? (
          // Reef/Sanctuary theme: Jorc character with directional sprites
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
            aria-label={`Jorc mirando al ${entity.facing || "este"}`}
          >
            <img
              src={jorcSprites[entity.facing || "east"].src}
              alt={`Jorc mirando al ${entity.facing || "este"}`}
              className="w-[95%] h-[95%] object-contain drop-shadow-md"
              style={{
                imageRendering: "pixelated",
                transform: jorcSprites[entity.facing || "east"].mirror ? "scaleX(-1)" : undefined
              }}
            />
          </div>
        ) : (
          // Default/Night theme: Boat
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
        )
      )}
    </div>
  )
}

export const GameCell = memo(GameCellComponent)


