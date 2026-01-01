"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { JorcSprite, type JorcExpression } from "./jorc-sprite"
import { JorcDialogue, type DialogueMood } from "./jorc-dialogue"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface JorcPanelProps {
  expression?: JorcExpression
  message?: string
  mood?: DialogueMood
  showContinue?: boolean
  onContinue?: () => void
  onClose?: () => void
  autoDismiss?: number
  levelInfo?: {
    levelId: string
    objective: string
    attemptsCount: number
    requiredBlocks?: string[]  // Block names that MUST be used to pass the level
  }
  className?: string
}

// Map mood to expression for automatic sync
const moodToExpression: Record<DialogueMood, JorcExpression> = {
  intro: "happy",
  hint: "thinking",
  success: "celebrating",
  error: "worried",
  optimal: "celebrating",
  neutral: "neutral",
}

export function JorcPanel({
  expression,
  message,
  mood = "neutral",
  showContinue = false,
  onContinue,
  onClose,
  autoDismiss,
  levelInfo,
  className,
}: JorcPanelProps) {
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Auto-derive expression from mood if not provided
  const actualExpression = expression || moodToExpression[mood]

  // Show panel when there's a message
  useEffect(() => {
    if (message) {
      setIsVisible(true)
      if (isMobile) {
        setMobileDrawerOpen(true)
      }
    }
  }, [message, isMobile])

  const handleClose = () => {
    setIsVisible(false)
    setMobileDrawerOpen(false)
    onClose?.()
  }

  const handleContinue = () => {
    onContinue?.()
    if (!showContinue) {
      handleClose()
    }
  }

  // Desktop panel content
  const PanelContent = (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Sprite section */}
      <div className="flex flex-col items-center gap-3 py-4">
        <JorcSprite expression={actualExpression} size={isMobile ? "small" : "medium"} />

        {/* Level info */}
        {levelInfo && (
          <div className="space-y-1 text-center">
            <h3 className="font-semibold text-ocean-800">Nivel {levelInfo.levelId}</h3>
            <p className="text-sm text-ocean-600">{levelInfo.objective}</p>
            {levelInfo.requiredBlocks && levelInfo.requiredBlocks.length > 0 && (
              <p className="text-sm font-medium text-orange-600">
                ⚠️ Usá: {levelInfo.requiredBlocks.join(", ")}
              </p>
            )}
            <div className="text-xs text-ocean-500">Intentos: {levelInfo.attemptsCount}</div>
          </div>
        )}
      </div>

      {/* Dialogue section */}
      {message && isVisible && (
        <div className="flex-1 px-2">
          <JorcDialogue
            message={message}
            mood={mood}
            showContinue={showContinue}
            onContinue={handleContinue}
            autoDismiss={autoDismiss}
          />
        </div>
      )}

      {/* Close button for messages */}
      {message && isVisible && onClose && (
        <div className="flex justify-center pb-2 pt-4">
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-ocean-500 hover:text-ocean-700">
            <X className="mr-1 size-4" />
            Cerrar
          </Button>
        </div>
      )}
    </div>
  )

  // Mobile: Show as drawer/toast
  if (isMobile && message) {
    return (
      <>
        {/* Always show mini sprite */}
        <div className="flex flex-col items-center gap-2 py-2">
          <JorcSprite expression={actualExpression} size="small" />
          {levelInfo && (
            <div className="text-center">
              <div className="text-xs text-ocean-500">Nivel {levelInfo.levelId}</div>
            </div>
          )}
        </div>

        {/* Dialogue drawer */}
        <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <DrawerContent className="bg-sand-50 px-4 pb-6 pt-4">
            <div className="flex items-start gap-3">
              <JorcSprite expression={actualExpression} size="small" />
              <div className="flex-1">
                <JorcDialogue
                  message={message}
                  mood={mood}
                  showContinue={showContinue}
                  onContinue={handleContinue}
                  autoDismiss={autoDismiss}
                />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // Desktop: Show as sidebar panel
  return PanelContent
}
