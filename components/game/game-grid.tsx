"use client"

import type React from "react"

import { useMemo, useCallback, useRef, useEffect, useState } from "react"
import { GameCell } from "./game-cell"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GridData, Entity, PathStep, Direction } from "@/lib/types"
import { cn } from "@/lib/utils"

interface GameGridProps {
  gridData?: GridData
  entities?: Entity[]
  showPath?: PathStep[]
  onCellClick?: (x: number, y: number) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
  className?: string
  showCoordinates?: boolean
  theme?: "default" | "night" | "reef" | "sanctuary"
}

function getPathDirection(current: PathStep, next?: PathStep): Direction | undefined {
  if (!next) return current.direction
  if (next.x > current.x) return "east"
  if (next.x < current.x) return "west"
  if (next.y > current.y) return "south"
  if (next.y < current.y) return "north"
  return current.direction
}

export function GameGrid({
  gridData,
  entities = [],
  showPath = [],
  onCellClick,
  loading = false,
  error,
  onRetry,
  className,
  showCoordinates = true,
  theme = "default",
}: GameGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(48)

  useEffect(() => {
    if (!containerRef.current || !gridData) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const padding = 16
      const labelSpace = showCoordinates ? 32 : 0
      const availableWidth = width - padding * 2 - labelSpace
      const availableHeight = height - padding * 2 - labelSpace

      const maxCellWidth = Math.floor(availableWidth / gridData.cols)
      const maxCellHeight = Math.floor(availableHeight / gridData.rows)
      const optimalSize = Math.min(maxCellWidth, maxCellHeight, 64)

      setCellSize(Math.max(optimalSize, 32))
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [gridData, showCoordinates])

  const tileMap = useMemo(() => {
    if (!gridData) return new Map()
    const map = new Map<string, (typeof gridData.tiles)[0]>()
    gridData.tiles.forEach((tile) => {
      map.set(`${tile.x},${tile.y}`, tile)
    })
    return map
  }, [gridData])

  const entityMap = useMemo(() => {
    const map = new Map<string, Entity>()
    entities.forEach((entity) => {
      map.set(`${entity.x},${entity.y}`, entity)
    })
    return map
  }, [entities])

  const pathMap = useMemo(() => {
    const map = new Map<string, Direction | undefined>()
    showPath.forEach((step, index) => {
      const nextStep = showPath[index + 1]
      map.set(`${step.x},${step.y}`, getPathDirection(step, nextStep))
    })
    return map
  }, [showPath])

  const renderGrid = useCallback(() => {
    if (!gridData) return null

    const cells: React.ReactNode[] = []
    for (let y = 0; y < gridData.rows; y++) {
      for (let x = 0; x < gridData.cols; x++) {
        const key = `${x},${y}`
        const tile = tileMap.get(key)
        const entity = entityMap.get(key)
        const isPath = pathMap.has(key)
        const pathDirection = pathMap.get(key)

        cells.push(
          <GameCell
            key={key}
            x={x}
            y={y}
            tileType={tile?.type || "grass"}
            entity={entity}
            isPath={isPath}
            pathDirection={pathDirection}
            onClick={onCellClick}
            cellSize={cellSize}
            theme={theme}
          />,
        )
      }
    }
    return cells
  }, [gridData, tileMap, entityMap, pathMap, onCellClick, cellSize])

  if (loading) {
    return (
      <div
        className={cn("flex h-full items-center justify-center", className)}
        role="status"
        aria-label="Cargando escenario"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="size-10 rounded" />
            ))}
          </div>
          <p className="animate-pulse text-sm text-ocean-500">Cargando el escenario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)} role="alert" aria-live="polite">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-red-700">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 bg-transparent">
              <RefreshCw className="size-4" />
              Reintentar
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!gridData) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)} role="status">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-ocean-100 text-3xl">🗺️</div>
          <p className="text-sm text-ocean-500">No hay nivel cargado</p>
        </div>
      </div>
    )
  }

  const gridWidth = gridData.cols * cellSize
  const gridHeight = gridData.rows * cellSize

  return (
    <div
      ref={containerRef}
      className={cn("flex h-full w-full items-center justify-center overflow-auto p-4", className)}
    >
      <div className="flex flex-col items-center">
        {showCoordinates && (
          <div className="flex mb-1" style={{ marginLeft: 28 }} aria-hidden="true">
            {Array.from({ length: gridData.cols }).map((_, x) => (
              <div
                key={`col-${x}`}
                className="flex items-center justify-center text-xs font-bold text-ocean-500 select-none"
                style={{ width: cellSize }}
              >
                <span className="rounded-full bg-ocean-100 px-1.5 py-0.5 text-[10px]">{x}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex">
          {showCoordinates && (
            <div className="flex flex-col mr-1" aria-hidden="true">
              {Array.from({ length: gridData.rows }).map((_, y) => (
                <div
                  key={`row-${y}`}
                  className="flex items-center justify-center text-xs font-bold text-ocean-500 select-none"
                  style={{ height: cellSize, width: 24 }}
                >
                  <span className="rounded-full bg-ocean-100 px-1.5 py-0.5 text-[10px]">{y}</span>
                </div>
              ))}
            </div>
          )}

          <div
            role="grid"
            aria-label={`Escenario de ${gridData.cols} columnas por ${gridData.rows} filas`}
            className="grid rounded-lg shadow-lg ring-2 ring-ocean-300 motion-reduce:transition-none"
            style={{
              gridTemplateColumns: `repeat(${gridData.cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${gridData.rows}, ${cellSize}px)`,
              width: gridWidth,
              height: gridHeight,
            }}
          >
            {renderGrid()}
          </div>
        </div>

        {showCoordinates && (
          <p className="mt-2 text-center text-[10px] text-ocean-400 select-none">
            Las coordenadas son (columna, fila) - Ejemplo: Jorc en (2, 1)
          </p>
        )}
      </div>
    </div>
  )
}
