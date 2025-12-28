"use client"

import type React from "react"

import { useCallback, useEffect, useRef } from "react"
import { Lightbulb, ChevronRight, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface HintModalProps {
  isOpen: boolean
  hints: string[]
  currentHintIndex: number
  onNextHint: () => void
  onClose: () => void
}

export function HintModal({ isOpen, hints, currentHintIndex, onNextHint, onClose }: HintModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management when modal opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  const totalHints = hints.length
  const hasMoreHints = currentHintIndex < totalHints - 1
  const currentHint = hints[currentHintIndex] || ""

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="border-gold-300 bg-gradient-to-b from-ocean-50 to-white sm:max-w-md"
        onKeyDown={handleKeyDown}
        aria-labelledby="hint-modal-title"
        aria-describedby="hint-modal-description"
      >
        <DialogHeader>
          <DialogTitle id="hint-modal-title" className="flex items-center gap-2 text-ocean-800">
            <div className="flex size-8 items-center justify-center rounded-full bg-gold-100">
              <Lightbulb className="size-5 text-gold-600" />
            </div>
            <span>
              Pista {currentHintIndex + 1}/{totalHints}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only" id="hint-modal-description">
            Pista para ayudarte a resolver el nivel
          </DialogDescription>
        </DialogHeader>

        {/* Progress dots */}
        <div
          className="flex items-center justify-center gap-2"
          role="group"
          aria-label={`Progreso de pistas: ${currentHintIndex + 1} de ${totalHints}`}
        >
          {hints.map((_, index) => (
            <div
              key={index}
              className={`size-3 rounded-full transition-all duration-300 ${
                index <= currentHintIndex ? "scale-110 bg-gold-500" : "bg-ocean-200"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Hint content */}
        <div className="rounded-lg border border-ocean-200 bg-white p-4 shadow-inner">
          <p className="text-center text-ocean-700 leading-relaxed">{currentHint}</p>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          {hasMoreHints ? (
            <>
              <Button
                ref={closeButtonRef}
                variant="outline"
                onClick={onClose}
                className="flex-1 border-ocean-300 bg-transparent text-ocean-600 hover:bg-ocean-50"
              >
                <Check className="mr-2 size-4" />
                Entendido
              </Button>
              <Button onClick={onNextHint} className="flex-1 bg-gold-500 text-ocean-900 hover:bg-gold-600">
                Siguiente Pista
                <ChevronRight className="ml-2 size-4" />
              </Button>
            </>
          ) : (
            <Button
              ref={closeButtonRef}
              onClick={onClose}
              className="w-full bg-gold-500 text-ocean-900 hover:bg-gold-600"
            >
              <Check className="mr-2 size-4" />
              Entendido
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
