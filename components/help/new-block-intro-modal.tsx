"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { blockHelpData } from "@/lib/block-help-data"
import { MiniGrid } from "./mini-grid"

interface NewBlockIntroModalProps {
  blockIds: string[]
  levelId: string
  onClose: () => void
}

// Storage key for tracking which blocks have been introduced
const INTRODUCED_BLOCKS_KEY = "bloxmision_introduced_blocks"

function getIntroducedBlocks(): string[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(INTRODUCED_BLOCKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function markBlockAsIntroduced(blockId: string) {
  if (typeof window === "undefined") return
  try {
    const current = getIntroducedBlocks()
    if (!current.includes(blockId)) {
      localStorage.setItem(INTRODUCED_BLOCKS_KEY, JSON.stringify([...current, blockId]))
    }
  } catch {
    // Ignore storage errors
  }
}

export function useNewBlocksForLevel(availableBlockIds: string[]): string[] {
  const [newBlocks, setNewBlocks] = useState<string[]>([])

  useEffect(() => {
    const introduced = getIntroducedBlocks()
    const notYetIntroduced = availableBlockIds.filter((id) => !introduced.includes(id))
    setNewBlocks(notYetIntroduced)
  }, [availableBlockIds])

  return newBlocks
}

export function NewBlockIntroModal({ blockIds, levelId, onClose }: NewBlockIntroModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const currentBlockId = blockIds[currentIndex]
  const helpData = blockHelpData[currentBlockId]
  const isLast = currentIndex === blockIds.length - 1

  useEffect(() => {
    if (!helpData) {
      // Mark this block and move to next
      markBlockAsIntroduced(currentBlockId)
      if (isLast) {
        setIsOpen(false)
        onClose()
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    }
  }, [currentBlockId, helpData, isLast, onClose])

  const handleNext = () => {
    // Mark current block as introduced
    markBlockAsIntroduced(currentBlockId)

    if (isLast) {
      setIsOpen(false)
      onClose()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSkipAll = () => {
    // Mark all blocks as introduced
    blockIds.forEach((id) => markBlockAsIntroduced(id))
    setIsOpen(false)
    onClose()
  }

  if (!helpData) {
    return null
  }

  const categoryColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    movement: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", icon: "bg-blue-500" },
    action: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", icon: "bg-purple-500" },
    control: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", icon: "bg-orange-500" },
    sensor: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: "bg-yellow-500" },
  }

  const colors = categoryColors[helpData.category] || categoryColors.movement

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkipAll()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header with sparkle animation */}
        <div className={`${colors.bg} ${colors.border} border-b p-4`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`${colors.icon} rounded-full p-1.5 animate-pulse`}>
                  <Sparkles className="size-4 text-white" />
                </div>
                <DialogTitle className={`${colors.text} text-lg`}>Nuevo Bloque Desbloqueado!</DialogTitle>
              </div>
              {blockIds.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {blockIds.length}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          {/* Block name and icon */}
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 ${colors.bg} ${colors.border} border-2 rounded-lg px-4 py-2`}
            >
              <span className="text-2xl">{helpData.icon}</span>
              <span className={`font-bold text-xl ${colors.text}`}>{helpData.name}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-center text-muted-foreground text-sm leading-relaxed">{helpData.description}</p>

          {/* Visual example */}
          {helpData.visual && (
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block mb-1">Antes</span>
                <MiniGrid jorc={helpData.visual.before.jorc} highlights={helpData.visual.before.highlight} size={3} />
              </div>
              <ArrowRight className="size-6 text-muted-foreground" />
              <div className="text-center">
                <span className="text-xs text-muted-foreground block mb-1">Despues</span>
                <MiniGrid jorc={helpData.visual.after.jorc} highlights={helpData.visual.after.highlight} size={3} />
              </div>
            </div>
          )}

          {/* Tip */}
          {helpData.tips && helpData.tips[0] && (
            <div className={`${colors.bg} rounded-lg p-3 text-sm ${colors.text}`}>
              <strong>Tip:</strong> {helpData.tips[0]}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t p-4 bg-muted/30">
          <Button variant="ghost" size="sm" onClick={handleSkipAll} className="text-muted-foreground">
            <X className="size-4 mr-1" />
            Saltar todo
          </Button>
          <Button onClick={handleNext} className={`${colors.icon} hover:opacity-90`}>
            {isLast ? "Comenzar!" : "Siguiente"}
            {!isLast && <ArrowRight className="size-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
