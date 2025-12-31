"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export type JorcExpression = "neutral" | "happy" | "thinking" | "surprised" | "celebrating" | "worried"

interface JorcSpriteProps {
  expression?: JorcExpression
  size?: "small" | "medium" | "large"
  className?: string
}

// Map expressions to specific JORC sprite frames
// Mapping (per tu spritesheet):
// - Idle down: frame-01, blink: frame-02
// - Emotes: frame-30 (surprised), frame-31 (thinking-ish), frame-32 (worried/sad)
// - Attack: frame-25..27
// - Hurt: frame-28..29
const expressionSprites: Record<JorcExpression, string> = {
  neutral: "/sprites/jorc_raw/frame-01.png", // Idle down
  happy: "/sprites/jorc_raw/frame-02.png", // Blink (se ve más “amable” que neutral)
  thinking: "/sprites/jorc_raw/frame-31.png", // Emote 2 (pensando / dudando)
  surprised: "/sprites/jorc_raw/frame-30.png", // Emote 1 (sorpresa)
  celebrating: "/sprites/jorc_raw/frame-25.png", // Attack frame (acción/celebración)
  worried: "/sprites/jorc_raw/frame-32.png", // Emote 3 (preocupado/triste)
}

// Background colors for different expressions
const expressionColors: Record<JorcExpression, string> = {
  neutral: "bg-ocean-500",
  happy: "bg-emerald-500",
  thinking: "bg-amber-500",
  surprised: "bg-sky-500",
  celebrating: "bg-gold-500",
  worried: "bg-orange-500",
}

const sizeConfig = {
  small: { container: "size-16", sprite: "w-14 h-14" },
  medium: { container: "size-24", sprite: "w-20 h-20" },
  large: { container: "size-32", sprite: "w-28 h-28" },
}

export function JorcSprite({ expression = "neutral", size = "medium", className }: JorcSpriteProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  const sizes = sizeConfig[size]
  const spriteUrl = expressionSprites[expression]
  const bgColor = expressionColors[expression]

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="img"
      aria-label={`Jorc el pirata (${expression})`}
    >
      {/* Body container with breathing animation */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-lg transition-colors duration-300",
          sizes.container,
          bgColor,
          !prefersReducedMotion && "animate-breathe",
        )}
      >


        {/* JORC Sprite Image */}
        <img
          src={spriteUrl}
          alt={`Jorc ${expression}`}
          className={cn("relative z-10 object-contain drop-shadow-md", sizes.sprite)}
          style={{ imageRendering: "pixelated" }}
        />

        {/* Confetti for celebrating */}
        {expression === "celebrating" && !prefersReducedMotion && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${20 + i * 12}%`,
                  top: "-10%",
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96E6A1", "#DDA0DD"][i],
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}