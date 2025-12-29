"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorialStep {
  target: string
  title: string
  content: string
  position: "top" | "bottom" | "left" | "right"
}

interface TutorialOverlayProps {
  steps: TutorialStep[]
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function TutorialOverlay({ steps, isOpen, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const step = steps[currentStep]

  // Find and highlight target element with retry logic
  useEffect(() => {
    if (!isOpen || !step) return

    let timeoutId: NodeJS.Timeout
    let retries = 0
    const maxRetries = 5

    const findTarget = () => {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        // Only set if element is visible (has dimensions)
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect)
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          setRetryCount(0)
          return
        }
      }

      // Retry if not found and under limit
      retries++
      if (retries < maxRetries) {
        timeoutId = setTimeout(findTarget, 300)
        setRetryCount(retries)
      } else {
        // Give up - show centered tooltip
        setTargetRect(null)
        setRetryCount(0)
      }
    }

    // Initial delay to ensure DOM is ready
    timeoutId = setTimeout(findTarget, 500)

    // Re-calculate on resize
    const handleResize = () => {
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect(rect)
        }
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
    }
  }, [isOpen, step, currentStep])

  // Reset step when reopening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      onComplete()
    }
  }, [currentStep, steps.length, onComplete])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    onClose()
  }, [onClose])

  if (!isOpen || !step) return null

  // Calculate tooltip position with improved boundary checks
  const getTooltipStyle = (): React.CSSProperties => {
    // Center tooltip if no target found
    if (!targetRect) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed"
      }
    }

    const padding = 20
    const tooltipWidth = 320
    const tooltipHeight = 200 // Approximate height

    // Check if target is visible in viewport
    const isTargetVisible =
      targetRect.top >= 0 &&
      targetRect.left >= 0 &&
      targetRect.bottom <= window.innerHeight &&
      targetRect.right <= window.innerWidth

    // If target is not visible, center the tooltip
    if (!isTargetVisible || targetRect.width === 0 || targetRect.height === 0) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        position: "fixed"
      }
    }

    const centerX = targetRect.left + targetRect.width / 2
    const centerY = targetRect.top + targetRect.height / 2

    switch (step.position) {
      case "top": {
        const top = targetRect.top - padding - tooltipHeight
        return {
          top: Math.max(10, top),
          left: Math.min(Math.max(centerX - tooltipWidth / 2, 10), window.innerWidth - tooltipWidth - 10),
          position: "fixed"
        }
      }
      case "bottom": {
        const top = targetRect.bottom + padding
        return {
          top: Math.min(top, window.innerHeight - tooltipHeight - 10),
          left: Math.min(Math.max(centerX - tooltipWidth / 2, 10), window.innerWidth - tooltipWidth - 10),
          position: "fixed"
        }
      }
      case "left": {
        const left = targetRect.left - padding - tooltipWidth
        return {
          top: Math.min(Math.max(centerY - tooltipHeight / 2, 10), window.innerHeight - tooltipHeight - 10),
          left: Math.max(10, left),
          position: "fixed"
        }
      }
      case "right": {
        const left = targetRect.right + padding
        return {
          top: Math.min(Math.max(centerY - tooltipHeight / 2, 10), window.innerHeight - tooltipHeight - 10),
          left: Math.min(left, window.innerWidth - tooltipWidth - 10),
          position: "fixed"
        }
      }
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          position: "fixed"
        }
    }
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Tutorial">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={handleSkip} />

      {/* Highlighted area */}
      {targetRect && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg ring-4 ring-gold-400 ring-offset-2"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-20 w-80 max-w-[calc(100vw-2rem)] rounded-xl border-2 border-gold-400 bg-white p-5 shadow-xl"
        style={getTooltipStyle()}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute right-2 top-2 rounded-full p-1 text-ocean-400 transition-colors hover:bg-ocean-100 hover:text-ocean-600"
          aria-label="Saltar tutorial"
        >
          <X className="size-4" />
        </button>

        {/* Jorc avatar */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-ocean-100 text-2xl">🏴‍☠️</div>
          <h3 className="pr-6 text-lg font-bold text-ocean-800">{step.title}</h3>
        </div>

        {/* Content */}
        <p className="mb-4 text-sm leading-relaxed text-ocean-600">{step.content}</p>

        {/* Progress dots */}
        <div className="mb-4 flex justify-center gap-1.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "size-2 rounded-full transition-colors",
                index === currentStep ? "bg-gold-500" : index < currentStep ? "bg-gold-300" : "bg-ocean-200",
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handlePrev} disabled={currentStep === 0} className="gap-1">
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <span className="text-xs text-ocean-400">
            {currentStep + 1} / {steps.length}
          </span>

          <Button size="sm" onClick={handleNext} className="gap-1 bg-gold-500 text-ocean-900 hover:bg-gold-600">
            {currentStep === steps.length - 1 ? "Empezar!" : "Siguiente"}
            {currentStep < steps.length - 1 && <ChevronRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Default tutorial steps for first level
export const defaultTutorialSteps: TutorialStep[] = [
  {
    target: "[data-tutorial='game-grid']",
    title: "Bienvenido, grumete!",
    content:
      "Este es el mapa donde Jorc necesita tu ayuda. El objetivo es llevarlo al cofre del tesoro usando bloques de codigo.",
    position: "left",
  },
  {
    target: "[data-tutorial='block-palette']",
    title: "Bloques magicos",
    content: "Aqui estan los bloques de codigo. Son como ordenes para Jorc. Cada bloque hace algo diferente!",
    position: "right",
  },
  {
    target: "[data-tutorial='block-forward']",
    title: "Bloque Avanzar",
    content: "Este bloque hace que Jorc camine hacia adelante. Toca el bloque para agregarlo a tu codigo!",
    position: "right",
  },
  {
    target: "[data-tutorial='code-area']",
    title: "Tu programa",
    content: "Los bloques que selecciones apareceran aqui. Este es tu programa - la lista de instrucciones para Jorc.",
    position: "top",
  },
  {
    target: "[data-tutorial='btn-execute']",
    title: "Ejecutar!",
    content:
      "Cuando estes listo, presiona aqui para que Jorc siga tus instrucciones. Si algo sale mal, puedes intentar de nuevo!",
    position: "top",
  },
]
