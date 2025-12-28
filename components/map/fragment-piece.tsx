"use client"

import type React from "react"

import { memo } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TreasureFragment } from "@/lib/types"

interface FragmentPieceProps {
  fragment: TreasureFragment
  size?: "small" | "medium" | "large"
  onClick?: () => void
  isNew?: boolean
  tabIndex?: number
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export const FragmentPiece = memo(function FragmentPiece({
  fragment,
  size = "medium",
  onClick,
  isNew = false,
  tabIndex = 0,
  onKeyDown,
}: FragmentPieceProps) {
  const sizeClasses = {
    small: "size-12 sm:size-14",
    medium: "size-16 sm:size-20",
    large: "size-20 sm:size-24 md:size-28",
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onClick?.()
    }
    onKeyDown?.(e)
  }

  return (
    <button
      type="button"
      onClick={fragment.unlocked ? onClick : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={fragment.unlocked ? tabIndex : -1}
      disabled={!fragment.unlocked}
      aria-label={
        fragment.unlocked
          ? `Fragmento ${fragment.order} desbloqueado. Presiona para ver detalles.`
          : `Fragmento ${fragment.order} bloqueado`
      }
      className={cn(
        "relative overflow-hidden rounded-lg border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2",
        sizeClasses[size],
        fragment.unlocked
          ? "cursor-pointer border-gold-400 bg-gradient-to-br from-gold-100 to-gold-200 shadow-md hover:scale-105 hover:shadow-lg"
          : "cursor-not-allowed border-ocean-200 bg-ocean-100/50",
        isNew && "animate-fragment-unlock",
      )}
    >
      {fragment.unlocked ? (
        <>
          <img
            src={
              fragment.imageUrl ||
              `/placeholder.svg?height=120&width=120&query=ancient treasure map piece ${fragment.order} pirate`
            }
            alt={`Fragmento ${fragment.order} del mapa`}
            className="size-full object-cover"
            loading="lazy"
          />
          {/* Shine effect for unlocked */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          {/* New badge */}
          {isNew && (
            <span className="absolute -right-1 -top-1 rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
              NUEVO
            </span>
          )}
        </>
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-1 p-1">
          <Lock className="size-4 text-ocean-400 sm:size-5" />
          <span className="text-[10px] font-medium text-ocean-400 sm:text-xs">#{fragment.order}</span>
          {/* Blur overlay pattern */}
          <div className="absolute inset-0 backdrop-blur-[1px]" />
        </div>
      )}
    </button>
  )
})
