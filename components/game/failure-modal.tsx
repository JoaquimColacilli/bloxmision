"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Lightbulb, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExecutionError, LevelObjective } from "@/lib/types"

interface FailureModalProps {
  isOpen: boolean
  onClose: () => void
  error?: ExecutionError | null
  failedObjectives?: LevelObjective[]
  onRetry: () => void
  onShowHint: () => void
  hintsUnlocked: boolean
  attemptsCount: number
}

const errorIcons: Record<string, string> = {
  collision: "🪨",
  out_of_bounds: "🗺️",
  invalid_action: "❓",
  infinite_loop: "🔄",
  syntax_error: "⚠️",
}

const errorTitles: Record<string, string> = {
  collision: "Jorc choco!",
  out_of_bounds: "Fuera del mapa!",
  invalid_action: "Accion invalida",
  infinite_loop: "Bucle infinito",
  syntax_error: "Error de sintaxis",
}

export function FailureModal({
  isOpen,
  onClose,
  error,
  failedObjectives = [],
  onRetry,
  onShowHint,
  hintsUnlocked,
  attemptsCount,
}: FailureModalProps) {
  const hasError = !!error
  const hasFailedObjectives = failedObjectives.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div
              className={cn(
                "flex size-20 items-center justify-center rounded-full shadow-lg",
                hasError
                  ? "bg-gradient-to-br from-red-300 to-red-500"
                  : "bg-gradient-to-br from-orange-300 to-orange-500",
              )}
            >
              <span className="text-4xl">{hasError ? errorIcons[error.type] || "❌" : "🎯"}</span>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-ocean-800">
            {hasError ? errorTitles[error.type] || "Error" : "Casi lo logras!"}
          </DialogTitle>

          <DialogDescription className="text-ocean-600">
            {hasError ? error.message : "No completaste todos los objetivos. Revisa tu codigo e intentalo de nuevo."}
          </DialogDescription>

          {/* Error details */}
          {hasError && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="size-4" />
              Error en el bloque #{error.blockIndex + 1}
            </div>
          )}

          {/* Failed objectives */}
          {hasFailedObjectives && !hasError && (
            <div className="space-y-2 rounded-lg bg-orange-50 p-3 text-left">
              <p className="text-sm font-medium text-orange-700">Objetivos pendientes:</p>
              <ul className="space-y-1">
                {failedObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-orange-600">
                    <XCircle className="size-3.5" />
                    {obj.type === "reach" && `Llegar a (${obj.target?.x}, ${obj.target?.y})`}
                    {obj.type === "collect" && `Recoger ${obj.count} ${obj.item}`}
                    {obj.type === "collectAll" && `Recoger todos los ${obj.items?.join(", ")}`}
                    {obj.type === "activate" && `Activar palanca`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attempts count */}
          <p className="text-sm text-ocean-500">
            Intento #{attemptsCount}
            {!hintsUnlocked && attemptsCount < 2 && (
              <span className="ml-1 text-ocean-400">({2 - attemptsCount} mas para desbloquear pistas)</span>
            )}
          </p>
        </DialogHeader>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={() => {
              onClose()
              onRetry()
            }}
            className="w-full gap-2 bg-ocean-600 hover:bg-ocean-700"
          >
            <RotateCcw className="size-4" />
            Reintentar
          </Button>

          {hintsUnlocked && (
            <Button
              variant="outline"
              onClick={() => {
                onClose()
                onShowHint()
              }}
              className="w-full gap-2"
            >
              <Lightbulb className="size-4" />
              Ver Pista
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
