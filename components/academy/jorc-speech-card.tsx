"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SkipForward } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface JorcSpeechCardProps {
    text: string
    mood?: "happy" | "thinking" | "excited"
    onComplete?: () => void
    characterName?: string
}

// Helper to highlight keywords in plain text nodes
const highlightKeywords = (text: string) => {
    // Split by keywords but keep delimiters. Matches "SI", "ENTONCES", "SI NO", "CONDICIÓN" as whole words/phrases
    // Note: "SI NO" needs to be checked before "SI" if we were using simple replace, but in regex OR it works if ordered or exact match.
    // Using capturing group () to include the separator in the result
    const regex = /\b(SI NO|SI|ENTONCES|CONDICIÓN)\b/g
    const parts = text.split(regex)

    return parts.map((part, i) => {
        if (part.match(regex)) {
            return (
                <span
                    key={i}
                    className="mx-0.5 inline-flex transform cursor-default items-center rounded-md bg-ocean-100 px-1.5 py-0.5 text-xs font-bold text-ocean-700 transition-all hover:scale-105 hover:bg-ocean-200"
                >
                    {part}
                </span>
            )
        }
        return part
    })
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

    // Tokenize text for safer markdown typing (word by word)
    // We split by spaces but preserve them to reconstruct the string perfectly
    const tokens = useMemo(() => {
        return text.split(/(\s+)/)
    }, [text])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)

        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        if (mediaQuery.matches) {
            setDisplayedText(text)
            setIsTyping(false)
            if (onComplete) onComplete()
            return
        }

        setDisplayedText("")
        setIsTyping(true)

        let tokenIndex = 0
        // Typing speed: slightly slower interval but showing whole words -> feels natural
        intervalRef.current = setInterval(() => {
            if (tokenIndex < tokens.length) {
                const token = tokens[tokenIndex]
                // Guard against undefined tokens or weird splits
                if (token !== undefined) {
                    setDisplayedText(prev => prev + token)
                }
                tokenIndex++
            } else {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }
                setIsTyping(false)
                if (onComplete) onComplete()
            }
        }, 50) // 50ms per token (word/space) is a good reading speed

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [text, tokens, onComplete])

    const handleSkip = () => {
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
            <style jsx global>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .cursor-blink {
                    animation: blink 1s step-end infinite;
                }
            `}</style>

            {/* Avatar Container */}
            <div className="shrink-0 flex flex-col items-center">
                <div className="relative size-16 overflow-hidden rounded-full border-2 border-ocean-500 bg-ocean-100 shadow-md md:size-20">
                    <Image
                        src="/sprites/jorc_raw/action-01.png"
                        alt="Jorc"
                        fill
                        className="object-cover scale-125 translate-y-2"
                    />
                </div>
                <p className="mt-2 text-center text-xs font-bold text-ocean-800">{characterName}</p>
            </div>

            {/* Dialogue Bubble */}
            <div className="relative flex-1 rounded-3xl border-2 border-wood-300 bg-white p-5 shadow-xl md:p-6 transition-all">
                {/* Dialogue Triangle */}
                <div className="absolute -left-3 bottom-8 size-6 rotate-45 border-b-2 border-l-2 border-wood-300 bg-white" />

                <div className="relative z-10 space-y-3">
                    <div className="min-h-[80px] text-[15px] leading-7 text-slate-700 md:text-base">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // Custom Paragraph with Keyword Highlighting
                                p: ({ children }) => (
                                    <p className="mb-3 last:mb-0">
                                        {Array.isArray(children)
                                            ? children.map((child, i) => {
                                                if (typeof child === 'string') return <span key={i}>{highlightKeywords(child)}</span>
                                                return child
                                            })
                                            : typeof children === 'string'
                                                ? highlightKeywords(children)
                                                : children
                                        }
                                    </p>
                                ),
                                // Custom Strong (Bold) -> Highlight Pill
                                strong: ({ children }) => (
                                    <strong className="mx-0.5 rounded bg-yellow-100 px-1.5 py-0.5 font-bold text-wood-700 ring-1 ring-yellow-200/50">
                                        {children}
                                    </strong>
                                ),
                                // Lists
                                ul: ({ children }) => <ul className="my-3 space-y-2 pl-2">{children}</ul>,
                                ol: ({ children }) => <ol className="my-3 space-y-2 pl-2">{children}</ol>,
                                li: ({ children }) => (
                                    <li className="flex items-start gap-2">
                                        <div className="mt-2 size-1.5 shrink-0 rounded-full bg-ocean-400" />
                                        <span className="flex-1">{children}</span>
                                    </li>
                                ),
                                // Blockquote as "Tip" box
                                blockquote: ({ children }) => (
                                    <blockquote className="my-3 rounded-xl border-l-4 border-ocean-400 bg-ocean-50 p-4 text-sm text-ocean-900 shadow-sm">
                                        {children}
                                    </blockquote>
                                )
                            }}
                        >
                            {displayedText}
                        </ReactMarkdown>

                        {isTyping && <span className="ml-1 inline-block h-5 w-2.5 bg-ocean-500 align-sub cursor-blink" />}
                    </div>

                    {isTyping && (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSkip}
                                className="h-7 px-3 text-xs font-semibold text-ocean-600 hover:bg-ocean-50 hover:text-ocean-800"
                            >
                                <SkipForward className="mr-1.5 size-3.5" />
                                Mostrar todo
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
