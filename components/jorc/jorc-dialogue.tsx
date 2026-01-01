"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DialogueMood = "intro" | "hint" | "success" | "error" | "optimal" | "neutral"

interface JorcDialogueProps {
  message: string
  mood?: DialogueMood
  showContinue?: boolean
  onContinue?: () => void
  autoDismiss?: number
  className?: string
}

const moodConfig: Record<DialogueMood, { bg: string; border: string; text: string; icon: string }> = {
  intro: {
    bg: "bg-ocean-100",
    border: "border-ocean-300",
    text: "text-ocean-800",
    icon: "",
  },
  hint: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-800",
    icon: "",
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-800",
    icon: "",
  },
  error: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-800",
    icon: "",
  },
  optimal: {
    bg: "bg-gold-50",
    border: "border-gold-400",
    text: "text-gold-800",
    icon: "",
  },
  neutral: {
    bg: "bg-sand-100",
    border: "border-sand-300",
    text: "text-sand-800",
    icon: "",
  },
}

export function JorcDialogue({
  message,
  mood = "neutral",
  showContinue = false,
  onContinue,
  autoDismiss,
  className,
}: JorcDialogueProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const charIndexRef = useRef(0)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  // Typing effect
  useEffect(() => {
    charIndexRef.current = 0
    setDisplayedText("")
    setIsTyping(true)

    if (prefersReducedMotion) {
      setDisplayedText(message)
      setIsTyping(false)
      return
    }

    const typeChar = () => {
      if (charIndexRef.current < message.length) {
        setDisplayedText(message.slice(0, charIndexRef.current + 1))
        charIndexRef.current++
        timeoutRef.current = setTimeout(typeChar, 50)
      } else {
        setIsTyping(false)
      }
    }

    timeoutRef.current = setTimeout(typeChar, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, prefersReducedMotion])

  // Auto-dismiss
  useEffect(() => {
    if (autoDismiss && !isTyping && onContinue) {
      const timer = setTimeout(onContinue, autoDismiss)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, isTyping, onContinue])

  const handleSkip = useCallback(() => {
    if (isTyping) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setDisplayedText(message)
      setIsTyping(false)
    }
  }, [isTyping, message])

  const config = moodConfig[mood]
  const isImportant = mood === "error" || mood === "success" || mood === "optimal"

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-4 shadow-md transition-all duration-300",
        config.bg,
        config.border,
        className,
      )}
      role={isImportant ? "alert" : "status"}
      aria-live={isImportant ? "assertive" : "polite"}
      aria-atomic="true"
    >
      {/* Speech bubble arrow */}
      <div className={cn("absolute -top-2 left-6 size-4 rotate-45 border-l-2 border-t-2", config.bg, config.border)} />

      {/* Icon */}
      <span className="absolute -top-3 left-4 text-xl" aria-hidden="true">
        {config.icon}
      </span>

      {/* Message */}
      <p className={cn("min-h-[3rem] text-base leading-relaxed", config.text)} onClick={handleSkip}>
        {displayedText}
        {isTyping && (
          <span className="ml-1 inline-block animate-pulse" aria-hidden="true">
            |
          </span>
        )}
      </p>

      {/* Continue button */}
      {showContinue && !isTyping && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onContinue}
            className={cn("border-2", config.border, config.text, "hover:bg-white/50")}
          >
            Continuar
          </Button>
        </div>
      )}

      {/* Auto-dismiss indicator */}
      {autoDismiss && !isTyping && (
        <div className="absolute bottom-1 right-2 text-xs opacity-50">Se cerrara automaticamente</div>
      )}
    </div>
  )
}
