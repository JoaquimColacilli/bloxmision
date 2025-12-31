"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Map, Sparkles } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { FragmentPiece } from "./fragment-piece"
import { FragmentModal } from "./fragment-modal"
import { JorcPanel } from "@/components/jorc/jorc-panel"
import { cn } from "@/lib/utils"
import type { TreasureFragment } from "@/lib/types"

interface TreasureMapProps {
  fragments: TreasureFragment[]
  loading?: boolean
  error?: string
  newFragmentId?: string // ID of newly unlocked fragment for animation
  onFragmentClick?: (fragmentId: string) => void
  className?: string
}

export function TreasureMap({
  fragments,
  loading = false,
  error,
  newFragmentId,
  onFragmentClick,
  className,
}: TreasureMapProps) {
  const [selectedFragment, setSelectedFragment] = useState<TreasureFragment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const unlockedCount = fragments.filter((f) => f.unlocked).length
  const totalCount = fragments.length || 15
  const progressPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
  const isComplete = unlockedCount === totalCount && totalCount > 0

  const handleFragmentClick = useCallback(
    (fragment: TreasureFragment) => {
      if (fragment.unlocked) {
        setSelectedFragment(fragment)
        setModalOpen(true)
        onFragmentClick?.(fragment.id)
      }
    },
    [onFragmentClick],
  )

  const handleCloseModal = useCallback(() => {
    setModalOpen(false)
    setSelectedFragment(null)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      const cols = window.innerWidth < 640 ? 3 : window.innerWidth < 768 ? 4 : 5
      let newIndex = index

      switch (e.key) {
        case "ArrowRight":
          newIndex = Math.min(index + 1, fragments.length - 1)
          break
        case "ArrowLeft":
          newIndex = Math.max(index - 1, 0)
          break
        case "ArrowDown":
          newIndex = Math.min(index + cols, fragments.length - 1)
          break
        case "ArrowUp":
          newIndex = Math.max(index - cols, 0)
          break
        default:
          return
      }

      e.preventDefault()
      setFocusedIndex(newIndex)

      // Focus the new element
      const gridEl = gridRef.current
      if (gridEl) {
        const buttons = gridEl.querySelectorAll("button")
        const targetButton = buttons[newIndex] as HTMLButtonElement
        targetButton?.focus()
      }
    },
    [fragments.length],
  )

  // Jorc message based on progress
  const getJorcMessage = () => {
    if (isComplete) {
      return "Marinero, lo lograste! Has reunido todos los fragmentos del mapa. El tesoro del Dargholl esta a tu alcance. Eres un verdadero pirata!"
    }
    if (unlockedCount === 0) {
      return "Ahoy! Este es el mapa que te llevara al tesoro del Dargholl. Completa niveles para desbloquear sus fragmentos."
    }
    if (unlockedCount < totalCount / 3) {
      return `Buen comienzo, grumete! Ya tienes ${unlockedCount} fragmentos. Sigue completando niveles para revelar mas del mapa.`
    }
    if (unlockedCount < (totalCount * 2) / 3) {
      return `Excelente trabajo! ${unlockedCount} fragmentos reunidos. El tesoro se acerca, puedo sentirlo!`
    }
    return `Ya casi lo tienes! Solo faltan ${totalCount - unlockedCount} fragmentos. El tesoro del Dargholl pronto sera nuestro!`
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
        <Skeleton className="mx-auto h-3 w-full max-w-md" />
        <div className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={cn("flex flex-col items-center gap-4 rounded-xl bg-red-50 p-8 text-center", className)}>
        <Map className="size-12 text-red-400" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  // Empty state
  if (fragments.length === 0) {
    return (
      <div className={cn("flex flex-col items-center gap-4 rounded-xl bg-ocean-50 p-8 text-center", className)}>
        <Map className="size-12 text-ocean-400" />
        <h2 className="text-xl font-semibold text-ocean-700">El mapa esta vacio</h2>
        <p className="text-ocean-500">Completa niveles para descubrir los fragmentos del mapa del tesoro</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header */}
      <header className="text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-ocean-800 sm:text-3xl">
          <Map className="size-7 text-gold-600 sm:size-8" />
          Mapa del Tesoro del Dargholl
          {isComplete && <Sparkles className="size-6 animate-pulse text-gold-500" />}
        </h1>
        <p className="mt-2 text-ocean-600">
          {isComplete ? "Has completado el mapa!" : "Completa niveles para desbloquear fragmentos"}
        </p>
      </header>

      {/* Progress bar */}
      <div className="mx-auto w-full max-w-md">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-ocean-700">Progreso del mapa</span>
          <span className="text-ocean-500">
            {unlockedCount}/{totalCount} fragmentos ({progressPercent}%)
          </span>
        </div>
        <Progress
          value={progressPercent}
          className="h-3 bg-ocean-100"
          aria-label={`${progressPercent}% del mapa revelado`}
        />
      </div>

      {/* Fragment grid */}
      <div
        ref={gridRef}
        className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
        role="grid"
        aria-label="Fragmentos del mapa del tesoro"
      >
        {fragments
          .sort((a, b) => a.order - b.order)
          .map((fragment, index) => (
            <FragmentPiece
              key={fragment.id}
              fragment={fragment}
              size="large"
              onClick={() => handleFragmentClick(fragment)}
              isNew={fragment.id === newFragmentId}
              tabIndex={index === focusedIndex ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
      </div>

      {/* Jorc panel */}
      <div className="mx-auto mt-4 w-full max-w-md">
        <div className="rounded-xl border-2 border-ocean-200 bg-white/80 p-4">
          <JorcPanel
            message={getJorcMessage()}
            mood={isComplete ? "success" : unlockedCount === 0 ? "intro" : "neutral"}
            expression={isComplete ? "celebrating" : "happy"}
          />
        </div>
      </div>

      {/* Celebration overlay when complete */}
      {isComplete && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center motion-reduce:hidden"
          aria-hidden="true"
        >
          <div className="animate-confetti-1 absolute size-3 rounded-full bg-gold-400" />
          <div className="animate-confetti-2 absolute size-3 rounded-full bg-ocean-400" />
          <div className="animate-confetti-3 absolute size-3 rounded-full bg-gold-500" />
          <div className="animate-confetti-4 absolute size-3 rounded-full bg-ocean-500" />
        </div>
      )}

      {/* Fragment detail modal */}
      <FragmentModal fragment={selectedFragment} open={modalOpen} onClose={handleCloseModal} />
    </div>
  )
}
