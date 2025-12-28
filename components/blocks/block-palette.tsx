"use client"

import { useState, useCallback, useMemo } from "react"
import { Package, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BlockCategories } from "./block-categories"
import type { BlockDefinition, BlockCategoryData } from "@/lib/types"

interface BlockPaletteProps {
  availableBlocks: BlockCategoryData[]
  onBlockSelect?: (block: BlockDefinition) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
}

export function BlockPalette({ availableBlocks, onBlockSelect, loading = false, error, onRetry }: BlockPaletteProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const handleToggleCategory = useCallback((categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }, [])

  const handleBlockSelect = useCallback(
    (block: BlockDefinition) => {
      onBlockSelect?.(block)
    },
    [onBlockSelect],
  )

  const allAvailableBlockIds = useMemo(() => {
    return availableBlocks.flatMap((category) => category.blocks.map((b) => b.id))
  }, [availableBlocks])

  const paletteContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-ocean-500" role="status">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-sm font-medium">Cargando bloques...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center" role="alert">
          <AlertCircle className="size-8 text-red-500" />
          <p className="text-sm font-medium text-ocean-800">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 bg-transparent">
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          )}
        </div>
      )
    }

    if (!availableBlocks || availableBlocks.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-ocean-500">
          <Package className="size-8" />
          <p className="text-sm font-medium">No hay bloques disponibles para este nivel</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        {availableBlocks.map((category) => (
          <BlockCategories
            key={category.id}
            category={category}
            isCollapsed={collapsedCategories.has(category.id)}
            onToggle={() => handleToggleCategory(category.id)}
            onBlockSelect={handleBlockSelect}
            availableBlockIds={allAvailableBlockIds}
          />
        ))}
      </div>
    )
  }, [
    loading,
    error,
    availableBlocks,
    collapsedCategories,
    handleToggleCategory,
    handleBlockSelect,
    onRetry,
    allAvailableBlockIds,
  ])

  return (
    <div className="flex h-full flex-col" role="region" aria-label="Paleta de bloques" data-tutorial="block-palette">
      <div className="hidden items-center gap-2 border-b border-ocean-200 pb-2 md:flex">
        <Package className="size-5 text-ocean-600" />
        <h3 className="text-sm font-semibold text-ocean-800">Bloques</h3>
      </div>

      <p className="mb-3 text-center text-xs text-ocean-500 md:hidden">Toca un bloque para agregarlo a tu codigo</p>

      <div className="flex-1 overflow-auto md:mt-3">{paletteContent}</div>
    </div>
  )
}
