"use client"

import { useState, useCallback } from "react"
import { Play, RotateCcw, Lightbulb, Lock, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ExecutionControlsProps {
  isRunning: boolean
  hasBlocks: boolean
  attemptsCount: number
  hintsUnlocked: boolean
  currentHintLevel: 1 | 2 | 3
  blocksCount?: number
  onRun: () => void
  onStop?: () => void
  onReset: () => void
  onShowHint: () => void
}

const ATTEMPTS_TO_UNLOCK_HINTS = 2

export function ExecutionControls({
  isRunning,
  hasBlocks,
  attemptsCount,
  hintsUnlocked,
  currentHintLevel,
  blocksCount = 0,
  onRun,
  onStop,
  onReset,
  onShowHint,
}: ExecutionControlsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const canRun = hasBlocks && !isRunning
  const canReset = !isRunning
  const showHintBadge = hintsUnlocked && currentHintLevel <= 3

  const handleResetClick = useCallback(() => {
    if (blocksCount > 5) {
      setShowResetConfirm(true)
    } else {
      onReset()
    }
  }, [blocksCount, onReset])

  const handleConfirmReset = useCallback(() => {
    setShowResetConfirm(false)
    onReset()
  }, [onReset])

  return (
    <>
      <div className="flex items-center justify-center gap-2 sm:gap-3" data-tutorial="execution-controls">
        <TooltipProvider>
          {/* Reset button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className={cn(
                  "size-12 shrink-0 border-ocean-300 bg-ocean-50 p-0 text-ocean-600 hover:bg-ocean-100 hover:text-ocean-700 sm:size-12",
                  !canReset && "cursor-not-allowed opacity-50",
                )}
                onClick={handleResetClick}
                disabled={!canReset}
                aria-label="Reiniciar nivel"
              >
                <RotateCcw className="size-5 sm:size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reiniciar nivel</p>
            </TooltipContent>
          </Tooltip>

          {isRunning ? (
            <Button
              size="lg"
              className="h-12 flex-1 gap-2 bg-red-500 px-4 text-white hover:bg-red-600 sm:min-w-36 sm:flex-none sm:px-8"
              onClick={onStop}
              aria-label="Detener ejecucion"
            >
              <Square className="size-5" />
              <span className="hidden sm:inline">Detener</span>
            </Button>
          ) : (
            <Button
              size="lg"
              className={cn(
                "h-12 flex-1 gap-2 bg-green-500 px-4 text-white hover:bg-green-600 sm:min-w-36 sm:flex-none sm:px-8",
                !canRun && "cursor-not-allowed opacity-50",
              )}
              onClick={onRun}
              disabled={!canRun}
              aria-label="Ejecutar codigo"
              data-tutorial="btn-execute"
            >
              <Play className="size-5" />
              Ejecutar
            </Button>
          )}

          {/* Hint button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative shrink-0">
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "size-12 border-gold-300 bg-gold-50 p-0 text-gold-600 hover:bg-gold-100 hover:text-gold-700 sm:size-12",
                    !hintsUnlocked && "cursor-not-allowed opacity-50",
                    hintsUnlocked && !isRunning && "animate-pulse",
                  )}
                  onClick={onShowHint}
                  disabled={!hintsUnlocked || isRunning}
                  aria-label={hintsUnlocked ? `Ver pista ${currentHintLevel} de 3` : "Pistas bloqueadas"}
                >
                  {hintsUnlocked ? <Lightbulb className="size-5" /> : <Lock className="size-4" />}
                </Button>
                {showHintBadge && (
                  <span
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ocean-900"
                    aria-hidden="true"
                  >
                    {currentHintLevel}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {hintsUnlocked ? (
                <p>Ver pista ({currentHintLevel}/3)</p>
              ) : (
                <p>
                  Intenta resolver solo primero
                  <br />
                  <span className="text-xs opacity-75">({ATTEMPTS_TO_UNLOCK_HINTS - attemptsCount} intentos mas)</span>
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Reset confirmation dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent className="border-ocean-200 bg-gradient-to-b from-ocean-50 to-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ocean-800">Reiniciar nivel?</AlertDialogTitle>
            <AlertDialogDescription className="text-ocean-600">
              Tienes {blocksCount} bloques en tu codigo. Al reiniciar, Jorc volvera al inicio pero tu codigo se
              mantendra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-ocean-300 bg-transparent text-ocean-600 hover:bg-ocean-50">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReset} className="bg-ocean-600 text-white hover:bg-ocean-700">
              Si, reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
