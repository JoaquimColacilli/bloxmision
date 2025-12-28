"use client"

import { memo } from "react"
import { useRouter } from "next/navigation"
import { Map, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { FragmentPiece } from "./fragment-piece"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { TreasureFragment } from "@/lib/types"

interface MapViewerProps {
  fragments: TreasureFragment[]
  loading?: boolean
  error?: string
  onClick?: () => void
  className?: string
}

export const MapViewer = memo(function MapViewer({
  fragments,
  loading = false,
  error,
  onClick,
  className,
}: MapViewerProps) {
  const router = useRouter()
  const unlockedCount = fragments.filter((f) => f.unlocked).length
  const totalCount = fragments.length || 15

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.push("/map")
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card className={cn("border-2 border-ocean-200 bg-white/80", className)}>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("border-2 border-red-200 bg-red-50", className)}>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (fragments.length === 0) {
    return (
      <Card className={cn("border-2 border-ocean-200 bg-white/80", className)}>
        <CardContent className="p-4 text-center">
          <Map className="mx-auto mb-2 size-8 text-ocean-400" />
          <p className="text-sm text-ocean-500">Completa niveles para encontrar fragmentos del mapa</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "cursor-pointer border-2 border-ocean-200 bg-white/80 backdrop-blur transition-all hover:border-gold-300 hover:shadow-lg",
        className,
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Mapa del tesoro: ${unlockedCount} de ${totalCount} fragmentos desbloqueados. Presiona para ver el mapa completo.`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="size-5 text-gold-600" />
            <span className="font-semibold text-ocean-800">Mapa del Tesoro</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-ocean-500">
            <span>
              {unlockedCount}/{totalCount}
            </span>
            <ChevronRight className="size-4" />
          </div>
        </div>

        {/* Mini grid - 5x3 */}
        <div className="grid grid-cols-5 gap-1.5">
          {fragments.slice(0, 15).map((fragment) => (
            <FragmentPiece key={fragment.id} fragment={fragment} size="small" tabIndex={-1} />
          ))}
        </div>

        {/* Progress text */}
        <p className="mt-3 text-center text-xs text-ocean-500">
          {unlockedCount === totalCount
            ? "Mapa completo - El tesoro te espera"
            : `${Math.round((unlockedCount / totalCount) * 100)}% del mapa revelado`}
        </p>
      </CardContent>
    </Card>
  )
})
