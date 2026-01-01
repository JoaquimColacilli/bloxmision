"use client"

import type React from "react"
import { memo, useCallback, useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { BlockInstance, BlockDefinition } from "@/lib/types"
import { Block } from "@/components/blocks/block"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Hand, Package, ChevronUp, ChevronDown, Copy, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface CodeAreaProps {
  blocks: BlockInstance[]
  onAddBlock: (block: BlockDefinition, index?: number) => void
  onAddBlockInside?: (parentInstanceId: string, block: BlockDefinition, sourceInstanceId?: string) => void
  onRemoveBlockChild?: (parentInstanceId: string, childInstanceId: string) => void
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemoveBlock: (index: number) => void
  onDuplicateBlock: (index: number) => void
  onEditParams: (index: number, params: Record<string, string | number | boolean>) => void
  onClearAll: () => void
  currentBlockIndex?: number | null
  maxBlocks?: number
  isRunning?: boolean
  className?: string
}

export const CodeArea = memo(function CodeArea({
  blocks,
  onAddBlock,
  onAddBlockInside,
  onRemoveBlockChild,
  onReorder,
  onRemoveBlock,
  onDuplicateBlock,
  onEditParams,
  onClearAll,
  currentBlockIndex,
  maxBlocks = 50,
  isRunning = false,
  className,
}: CodeAreaProps) {
  const isMobile = useIsMobile()
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [focusedBlockIndex, setFocusedBlockIndex] = useState<number | null>(null)
  const [longPressIndex, setLongPressIndex] = useState<number | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Scroll to current block during execution
  useEffect(() => {
    if (currentBlockIndex !== null && currentBlockIndex !== undefined && currentBlockIndex >= 0) {
      const blockEl = blockRefs.current.get(currentBlockIndex)
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [currentBlockIndex])

  const handleTouchStart = useCallback((index: number) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressIndex(index)
    }, 500)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleCloseContextMenu = useCallback(() => {
    setLongPressIndex(null)
  }, [])

  const handleMoveUp = useCallback(
    (index: number) => {
      if (index > 0) {
        onReorder(index, index - 1)
      }
      setLongPressIndex(null)
    },
    [onReorder],
  )

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index < blocks.length - 1) {
        onReorder(index, index + 2)
      }
      setLongPressIndex(null)
    },
    [onReorder, blocks.length],
  )

  // Handle drop from palette (desktop only)
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (isRunning || isMobile) return
      e.dataTransfer.dropEffect = draggedIndex !== null ? "move" : "copy"
      setIsDragOver(true)
    },
    [isRunning, draggedIndex, isMobile],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDropTargetIndex(null)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      setDropTargetIndex(null)

      if (isRunning || isMobile) return

      if (draggedIndex !== null && dropTargetIndex !== null) {
        if (draggedIndex !== dropTargetIndex) {
          onReorder(draggedIndex, dropTargetIndex)
        }
        setDraggedIndex(null)
        return
      }

      try {
        const data = e.dataTransfer.getData("application/json")
        if (data) {
          const blockDef: BlockDefinition = JSON.parse(data)
          if (blocks.length >= maxBlocks) {
            return
          }
          const insertIndex = dropTargetIndex ?? blocks.length
          onAddBlock(blockDef, insertIndex)
        }
      } catch {
        // Invalid data
      }
    },
    [isRunning, isMobile, draggedIndex, dropTargetIndex, blocks.length, maxBlocks, onReorder, onAddBlock],
  )

  const handleBlockDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  const handleBlockDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }, [])

  const handleDropZoneDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      e.stopPropagation()
      if (isRunning) return
      setDropTargetIndex(index)
    },
    [isRunning],
  )

  // Keyboard navigation (desktop)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (blocks.length === 0 || isRunning || isMobile) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setFocusedBlockIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, blocks.length - 1)))
          break
        case "ArrowUp":
          e.preventDefault()
          setFocusedBlockIndex((prev) => (prev === null ? blocks.length - 1 : Math.max(prev - 1, 0)))
          break
        case "Delete":
        case "Backspace":
          if (focusedBlockIndex !== null) {
            e.preventDefault()
            onRemoveBlock(focusedBlockIndex)
            setFocusedBlockIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : blocks.length > 1 ? 0 : null))
          }
          break
        case "d":
          if (e.ctrlKey && focusedBlockIndex !== null) {
            e.preventDefault()
            onDuplicateBlock(focusedBlockIndex)
          }
          break
      }
    },
    [blocks.length, focusedBlockIndex, isRunning, isMobile, onRemoveBlock, onDuplicateBlock],
  )

  useEffect(() => {
    if (focusedBlockIndex !== null) {
      const blockEl = blockRefs.current.get(focusedBlockIndex)
      if (blockEl) {
        blockEl.focus()
      }
    }
  }, [focusedBlockIndex])

  const handleParamChange = useCallback(
    (instanceId: string, params: Record<string, string | number | boolean>) => {
      const index = blocks.findIndex((b) => b.instanceId === instanceId)
      if (index !== -1) {
        onEditParams(index, params)
      }
    },
    [blocks, onEditParams],
  )

  const handleDuplicate = useCallback(
    (instanceId: string) => {
      // First check top-level blocks
      const index = blocks.findIndex((b) => b.instanceId === instanceId)
      if (index !== -1) {
        onDuplicateBlock(index)
        return
      }

      // Otherwise, check inside children of loop blocks - need to handle via onAddBlockInside
      // For children, we find the parent and duplicate within its children
      for (const block of blocks) {
        if (block.children) {
          const childIndex = block.children.findIndex(c => c.instanceId === instanceId)
          if (childIndex !== -1) {
            const childToDupe = block.children[childIndex]
            // Add a copy of this child into the same parent
            if (onAddBlockInside) {
              onAddBlockInside(block.instanceId, childToDupe.definition)
            }
            return
          }
        }
      }
    },
    [blocks, onDuplicateBlock, onAddBlockInside],
  )

  const handleDelete = useCallback(
    (instanceId: string) => {
      // First check top-level blocks
      const index = blocks.findIndex((b) => b.instanceId === instanceId)
      if (index !== -1) {
        onRemoveBlock(index)
        return
      }

      // Otherwise, check inside children of loop blocks
      for (const block of blocks) {
        if (block.children) {
          const childIndex = block.children.findIndex(c => c.instanceId === instanceId)
          if (childIndex !== -1) {
            // Found child - use dedicated callback to remove it
            if (onRemoveBlockChild) {
              onRemoveBlockChild(block.instanceId, instanceId)
            }
            return
          }
        }
      }
    },
    [blocks, onRemoveBlock, onRemoveBlockChild],
  )

  // Handle drop inside a loop block
  const handleDropInside = useCallback(
    (parentInstanceId: string, blockDef: BlockDefinition, sourceInstanceId?: string) => {
      if (onAddBlockInside) {
        onAddBlockInside(parentInstanceId, blockDef, sourceInstanceId)
      }
    },
    [onAddBlockInside],
  )

  const isEmpty = blocks.length === 0
  const isAtMax = blocks.length >= maxBlocks

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ocean-200 bg-ocean-50 px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold text-ocean-800">Mi Codigo</h3>
          <p className="text-xs text-ocean-600">
            {blocks.length} bloque{blocks.length !== 1 ? "s" : ""}
            {maxBlocks && <span className="text-ocean-400"> / {maxBlocks}</span>}
          </p>
        </div>

        {blocks.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-ocean-600 hover:bg-ocean-100 hover:text-red-600"
                disabled={isRunning}
              >
                <Trash2 className="size-3.5" />
                Limpiar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpiar todo el codigo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta accion eliminara todos los bloques de tu programa. Tendras que empezar de nuevo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAll} className="bg-red-500 hover:bg-red-600">
                  Si, limpiar todo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Drop zone / Block list */}
      <div
        ref={containerRef}
        data-droppable="code-area"
        className={cn(
          "relative flex-1 overflow-y-auto p-3 transition-colors",
          isDragOver && !isAtMax && "bg-ocean-100",
          isAtMax && isDragOver && "bg-red-50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="list"
        aria-label="Lista de bloques de codigo"
        tabIndex={isEmpty ? -1 : 0}
      >
        {/* Empty state */}
        {isEmpty && (
          <div
            className={cn(
              "flex h-full min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors",
              isDragOver ? "border-gold-400 bg-gold-50" : "border-ocean-300 bg-ocean-50/50",
            )}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-ocean-100">
              <Hand className="size-8 text-ocean-400" />
            </div>
            <div className="space-y-1 text-center">
              <p className="font-medium text-ocean-700">
                {isMobile ? "Agrega bloques desde la pestana Bloques" : "Arrastra bloques aqui"}
              </p>
              <p className="text-sm text-ocean-500">
                {isMobile ? "Toca un bloque para agregarlo" : "Usa la paleta de la izquierda para comenzar"}
              </p>
            </div>
          </div>
        )}

        {/* Block list */}
        {!isEmpty && (
          <div className="space-y-1">
            {/* Top drop zone - desktop only */}
            {!isMobile && (
              <DropZone index={0} isActive={dropTargetIndex === 0} onDragOver={(e) => handleDropZoneDragOver(e, 0)} />
            )}

            {blocks.map((block, index) => (
              <div key={block.instanceId}>
                <div
                  ref={(el) => {
                    if (el) blockRefs.current.set(index, el)
                    else blockRefs.current.delete(index)
                  }}
                  data-block-index={index}
                  className={cn(
                    "relative transition-all duration-200",
                    draggedIndex === index && "opacity-50",
                    focusedBlockIndex === index && "ring-2 ring-ocean-400 ring-offset-1",
                    longPressIndex === index && "ring-2 ring-gold-400 ring-offset-1",
                  )}
                  draggable={!isRunning && !isMobile}
                  onDragStart={() => handleBlockDragStart(index)}
                  onDragEnd={handleBlockDragEnd}
                  onClick={() => !isMobile && setFocusedBlockIndex(index)}
                  onTouchStart={() => handleTouchStart(index)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  tabIndex={-1}
                  role="listitem"
                  aria-label={`Bloque ${index + 1}: ${block.definition.label}`}
                >
                  {currentBlockIndex === index && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2">
                      <div className="size-3 animate-pulse rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                    </div>
                  )}

                  {index > 0 && <div className="absolute -top-1 left-6 h-2 w-0.5 bg-ocean-300" />}

                  <Block
                    block={block}
                    variant={currentBlockIndex === index ? "running" : "code"}
                    onParamChange={handleParamChange}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                    onDropInside={handleDropInside}
                    disabled={isRunning}
                    hideActions={isMobile}
                  >
                    {/* Render children for loop blocks */}
                    {block.children && block.children.length > 0 && (
                      <div className="space-y-1">
                        {block.children.map((childBlock) => (
                          <Block
                            key={childBlock.instanceId}
                            block={childBlock}
                            variant="code"
                            onParamChange={handleParamChange}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            disabled={isRunning}
                            hideActions={isMobile}
                          />
                        ))}
                      </div>
                    )}
                  </Block>

                  {isMobile && longPressIndex === index && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-ocean-900/80 p-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="size-10 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        aria-label="Mover arriba"
                      >
                        <ChevronUp className="size-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="size-10 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === blocks.length - 1}
                        aria-label="Mover abajo"
                      >
                        <ChevronDown className="size-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="size-10 p-0"
                        onClick={() => {
                          onDuplicateBlock(index)
                          setLongPressIndex(null)
                        }}
                        aria-label="Duplicar"
                      >
                        <Copy className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="size-10 p-0"
                        onClick={() => {
                          onRemoveBlock(index)
                          setLongPressIndex(null)
                        }}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-10 bg-white/20 p-0 text-white hover:bg-white/30"
                        onClick={handleCloseContextMenu}
                        aria-label="Cerrar"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Drop zone after block - desktop only */}
                {!isMobile && (
                  <DropZone
                    index={index + 1}
                    isActive={dropTargetIndex === index + 1}
                    onDragOver={(e) => handleDropZoneDragOver(e, index + 1)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {isAtMax && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-100 p-2 text-xs text-orange-700">
            <Package className="size-4" />
            Has alcanzado el limite de {maxBlocks} bloques
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint - desktop only */}
      {!isEmpty && !isMobile && (
        <div className="border-t border-ocean-200 bg-ocean-50 px-3 py-1.5">
          <p className="text-xs text-ocean-500">
            <kbd className="rounded bg-ocean-200 px-1">↑↓</kbd> navegar{" "}
            <kbd className="rounded bg-ocean-200 px-1">Del</kbd> eliminar{" "}
            <kbd className="rounded bg-ocean-200 px-1">Ctrl+D</kbd> duplicar
          </p>
        </div>
      )}

      {!isEmpty && isMobile && (
        <div className="border-t border-ocean-200 bg-ocean-50 px-3 py-1.5">
          <p className="text-center text-xs text-ocean-500">Manten presionado un bloque para moverlo o eliminarlo</p>
        </div>
      )}
    </div>
  )
})

// Drop zone component (desktop only)
const DropZone = memo(function DropZone({
  index,
  isActive,
  onDragOver,
}: {
  index: number
  isActive: boolean
  onDragOver: (e: React.DragEvent) => void
}) {
  return (
    <div
      className={cn("h-2 w-full rounded transition-all", isActive ? "h-4 bg-gold-300" : "bg-transparent")}
      onDragOver={onDragOver}
      data-drop-index={index}
    />
  )
})

export default CodeArea
