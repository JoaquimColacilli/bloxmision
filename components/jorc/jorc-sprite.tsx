"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

export type JorcExpression = "neutral" | "happy" | "thinking" | "surprised" | "celebrating" | "worried" | "winking"

interface JorcSpriteProps {
  expression?: JorcExpression
  size?: "small" | "medium" | "large"
  className?: string
}

const expressionConfig: Record<JorcExpression, { face: string; color: string; eyebrows: string }> = {
  neutral: { face: "😐", color: "bg-ocean-500", eyebrows: "normal" },
  happy: { face: "😊", color: "bg-emerald-500", eyebrows: "raised" },
  thinking: { face: "🤔", color: "bg-amber-500", eyebrows: "furrowed" },
  surprised: { face: "😮", color: "bg-sky-500", eyebrows: "raised" },
  celebrating: { face: "🎉", color: "bg-gold-500", eyebrows: "raised" },
  worried: { face: "😟", color: "bg-orange-500", eyebrows: "furrowed" },
  winking: { face: "😉", color: "bg-purple-500", eyebrows: "normal" },
}

const sizeConfig = {
  small: { container: "size-16", face: "text-2xl", hat: "size-8" },
  medium: { container: "size-24", face: "text-4xl", hat: "size-12" },
  large: { container: "size-32", face: "text-5xl", hat: "size-16" },
}

export function JorcSprite({ expression = "neutral", size = "medium", className }: JorcSpriteProps) {
  const [isBlinking, setIsBlinking] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Blinking animation
  useEffect(() => {
    if (prefersReducedMotion) return

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000 // 3-5 seconds
      blinkTimeoutRef.current = setTimeout(() => {
        setIsBlinking(true)
        setTimeout(() => {
          setIsBlinking(false)
          scheduleBlink()
        }, 150)
      }, delay)
    }

    scheduleBlink()

    return () => {
      if (blinkTimeoutRef.current) {
        clearTimeout(blinkTimeoutRef.current)
      }
    }
  }, [prefersReducedMotion])

  const config = expressionConfig[expression]
  const sizes = sizeConfig[size]

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="img"
      aria-label={`Jorc el pirata con expresion ${expression}`}
    >
      {/* Body container with breathing animation */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shadow-lg transition-colors duration-300",
          sizes.container,
          config.color,
          !prefersReducedMotion && "animate-breathe",
        )}
      >
        {/* Pirate hat */}
        <div
          className={cn(
            "absolute -top-2 left-1/2 -translate-x-1/2 rounded-t-lg bg-gray-900",
            sizes.hat,
            !prefersReducedMotion && "animate-sway",
          )}
          style={{ height: "40%", clipPath: "polygon(10% 100%, 50% 0%, 90% 100%)" }}
        >
          {/* Skull decoration */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-white">☠️</div>
        </div>

        {/* Face */}
        <div className={cn("relative z-10 transition-opacity duration-100", sizes.face, isBlinking && "opacity-0")}>
          {config.face}
        </div>

        {/* Blink overlay */}
        {isBlinking && <div className={cn("absolute z-10", sizes.face)}>😑</div>}

        {/* Eyepatch */}
        <div
          className={cn(
            "absolute rounded-full bg-gray-900",
            size === "small" && "right-2 top-3 size-3",
            size === "medium" && "right-3 top-4 size-4",
            size === "large" && "right-4 top-5 size-5",
          )}
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
