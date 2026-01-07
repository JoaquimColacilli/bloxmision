"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SkipForward } from "lucide-react"

interface JorcSpeechCardProps {
    text: string
    mood?: "happy" | "thinking" | "excited"
    onComplete?: () => void
    characterName?: string
}

export function JorcSpeechCard({
    text,
    mood = "happy",
    onComplete,
    characterName = "Capitán Jorc"
}: JorcSpeechCardProps) {
    const [displayedText, setDisplayedText] = useState("")
    const [isTyping, setIsTyping] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Clear interval on unmount or when text changes
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        // Check for reduced motion preference
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (mediaQuery.matches) {
            setDisplayedText(text)
            setIsTyping(false)
            if (onComplete) onComplete()
            return
        }

        // Reset state
        setDisplayedText("")
        setIsTyping(true)

        let charIndex = 0
        intervalRef.current = setInterval(() => {
            if (charIndex < text.length) {
                setDisplayedText(text.substring(0, charIndex + 1))
                charIndex++
            } else {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                setIsTyping(false)
                if (onComplete) onComplete()
            }
        }, 25)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [text, onComplete])

    const handleSkip = () => {
        // Clear the interval immediately
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        setDisplayedText(text)
        setIsTyping(false)
        if (onComplete) onComplete()
    }

    return (
        <div className="mt-4 flex flex-row items-end gap-4 md:gap-6">
            {/* Avatar Container - Outside Bubble */}
            <div className="shrink-0 flex flex-col items-center">
                <div className="relative size-16 overflow-hidden rounded-full border-2 border-ocean-500 bg-ocean-100 shadow-md md:size-20">
                    <Image
                        src="/sprites/jorc_raw/frame-02.png"
                        alt="Jorc"
                        fill
                        className="object-cover scale-125 translate-y-2"
                    />
                </div>
                <p className="mt-2 text-center text-xs font-bold text-ocean-800">{characterName}</p>
            </div>

            {/* Dialogue Bubble */}
            <div className="relative flex-1 rounded-2xl border-2 border-wood-300 bg-sand-50 p-4 shadow-lg md:p-6">
                {/* Dialogue Triangle - pointing LEFT towards avatar, attached to bubbles side */}
                <div className="absolute -left-3 bottom-8 size-6 rotate-45 border-b-2 border-l-2 border-wood-300 bg-sand-50" />

                <div className="relative z-10 space-y-3">
                    <div className="text-sm leading-relaxed text-gray-800 md:text-base min-h-[60px]">
                        {displayedText}
                        {isTyping && <span className="animate-pulse font-bold text-ocean-500">|</span>}
                    </div>

                    {isTyping && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSkip}
                            className="h-8 px-2 text-xs text-ocean-600 hover:text-ocean-800"
                        >
                            <SkipForward className="mr-1 size-3" />
                            Mostrar todo
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
