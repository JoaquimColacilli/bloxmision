"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Lightbulb, Link2 } from "lucide-react"
import { MiniGrid } from "./mini-grid"
import { blockHelpData } from "@/lib/block-help-data"
import { cn } from "@/lib/utils"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
  blockId: string
  availableBlockIds?: string[]
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  movement: { bg: "bg-blue-500", text: "text-blue-50", border: "border-blue-600" },
  actions: { bg: "bg-violet-500", text: "text-violet-50", border: "border-violet-600" },
  control: { bg: "bg-orange-500", text: "text-orange-50", border: "border-orange-600" },
  sensors: { bg: "bg-yellow-500", text: "text-yellow-950", border: "border-yellow-600" },
  memory: { bg: "bg-green-500", text: "text-green-50", border: "border-green-600" },
  commands: { bg: "bg-red-500", text: "text-red-50", border: "border-red-600" },
}

const categoryLabels: Record<string, string> = {
  movement: "Movimiento",
  actions: "Acciones",
  control: "Control",
  sensors: "Sensores",
  memory: "Memoria",
  commands: "Mis Comandos",
}

export function HelpModal({ isOpen, onClose, blockId, availableBlockIds }: HelpModalProps) {
  const [currentBlockId, setCurrentBlockId] = useState(blockId)

  const help = blockHelpData[currentBlockId]

  const handleRelatedClick = useCallback((relatedId: string) => {
    if (blockHelpData[relatedId]) {
      setCurrentBlockId(relatedId)
    }
  }, [])

  // Reset to initial block when modal opens with new blockId
  if (blockId !== currentBlockId && isOpen) {
    setCurrentBlockId(blockId)
  }

  if (!help) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ayuda no disponible</DialogTitle>
          </DialogHeader>
          <p className="text-ocean-600">No hay informacion de ayuda para este bloque.</p>
        </DialogContent>
      </Dialog>
    )
  }

  const colors = categoryColors[help.category] || categoryColors.movement

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-0">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-lg text-xl font-bold",
                colors.bg,
                colors.text,
              )}
            >
              {help.title.charAt(0)}
            </div>
            <div>
              <DialogTitle className="text-xl">{help.title}</DialogTitle>
              <span
                className={cn("inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium", colors.bg, colors.text)}
              >
                {categoryLabels[help.category]}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Description */}
          <p className="text-base leading-relaxed text-ocean-700">{help.description}</p>

          {/* Visual ANTES/DESPUES */}
          <div className="rounded-lg border border-ocean-200 bg-ocean-50 p-4">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <div className="text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ocean-500">Antes</p>
                <MiniGrid cells={help.visual.before} />
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="size-8 text-ocean-400" />
              </div>
              <div className="text-center">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ocean-500">Despues</p>
                <MiniGrid cells={help.visual.after} />
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-amber-700">
              <Lightbulb className="size-4" />
              <span className="text-sm font-bold">Consejos de pirata:</span>
            </div>
            <ul className="space-y-1.5">
              {help.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Related blocks */}
          {help.related.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-ocean-600">
                <Link2 className="size-4" />
                <span className="text-sm font-bold">Bloques relacionados:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {help.related.map((relatedId) => {
                  const relatedHelp = blockHelpData[relatedId]
                  if (!relatedHelp) return null

                  const isAvailable = !availableBlockIds || availableBlockIds.includes(relatedId)
                  const relatedColors = categoryColors[relatedHelp.category]

                  return (
                    <button
                      key={relatedId}
                      onClick={() => handleRelatedClick(relatedId)}
                      disabled={!isAvailable}
                      className={cn(
                        "rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all",
                        isAvailable
                          ? cn(relatedColors.bg, relatedColors.text, relatedColors.border, "hover:opacity-90")
                          : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
                      )}
                    >
                      {relatedHelp.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
