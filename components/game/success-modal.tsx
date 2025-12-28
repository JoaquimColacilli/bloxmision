"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Sparkles, ArrowRight, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExecutionResult } from "@/lib/types"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  result: ExecutionResult | null
  levelTitle?: string
  onNextLevel: () => void
  onRetry: () => void
}

export function SuccessModal({
  isOpen,
  onClose,
  result,
  levelTitle = "Nivel",
  onNextLevel,
  onRetry,
}: SuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen && result?.success) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, result?.success])

  if (!result) return null

  const stars = result.stars
  const isOptimal = result.isOptimal

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              >
                <Sparkles className="size-4 text-gold-400" />
              </div>
            ))}
          </div>
        )}

        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shadow-lg">
              <span className="text-4xl">🏆</span>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-ocean-800">
            {isOptimal ? "Solucion Optima!" : "Nivel Completado!"}
          </DialogTitle>

          <DialogDescription className="text-ocean-600">{levelTitle}</DialogDescription>

          {/* Stars */}
          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={cn(
                  "size-10 transition-all duration-300",
                  starNum <= stars ? "fill-gold-400 text-gold-400 scale-110" : "fill-ocean-200 text-ocean-200",
                )}
                style={{
                  animationDelay: `${starNum * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* XP earned */}
          <div className="rounded-lg bg-ocean-50 p-4">
            <p className="text-sm text-ocean-600">XP Ganado</p>
            <p className="text-3xl font-bold text-ocean-800">+{result.xpEarned}</p>
          </div>

          {/* Messages */}
          {isOptimal && (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-gold-50 p-3 text-sm text-gold-700">
              <Sparkles className="size-4" />
              Usaste el codigo mas eficiente!
            </div>
          )}
        </DialogHeader>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={onNextLevel} className="w-full gap-2 bg-ocean-600 hover:bg-ocean-700">
            Siguiente Nivel
            <ArrowRight className="size-4" />
          </Button>
          <Button variant="outline" onClick={onRetry} className="w-full gap-2 bg-transparent">
            <RotateCcw className="size-4" />
            Mejorar Solucion
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
