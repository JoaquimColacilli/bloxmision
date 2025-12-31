"use client"

import { useState, useEffect, memo } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type ActionSpriteType = "collect" | "push" | "open_chest" | "lever"

interface ActionSpriteProps {
    action: ActionSpriteType
    size?: number
    animate?: boolean
    className?: string
}

// Frame counts per action
const FRAME_COUNTS: Record<ActionSpriteType, number> = {
    collect: 4,
    push: 4,
    open_chest: 5,
    lever: 5,
}

// Animation speeds (ms per frame)
const ANIMATION_SPEED: Record<ActionSpriteType, number> = {
    collect: 150,
    push: 120, // Faster for push loop
    open_chest: 180,
    lever: 160,
}

export const ActionSprite = memo(function ActionSprite({
    action,
    size = 32,
    animate = false,
    className,
}: ActionSpriteProps) {
    const [currentFrame, setCurrentFrame] = useState(1)
    const frameCount = FRAME_COUNTS[action]
    const speed = ANIMATION_SPEED[action]

    useEffect(() => {
        if (!animate) {
            setCurrentFrame(1)
            return
        }

        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev % frameCount) + 1)
        }, speed)

        return () => clearInterval(interval)
    }, [animate, frameCount, speed])

    const frameNumber = String(currentFrame).padStart(2, "0")
    const src = `/sprites/jorc_actions/${action}/frame-${frameNumber}.png`

    return (
        <div
            className={cn("relative shrink-0", className)}
            style={{ width: size, height: size }}
        >
            <Image
                src={src}
                alt={`${action} action`}
                fill
                className="object-contain"
                style={{ imageRendering: "pixelated" }}
            />
        </div>
    )
})

// Map block types to action sprite types
export const BLOCK_TO_ACTION: Record<string, ActionSpriteType> = {
    "open-chest": "open_chest",
    "collect-coin": "collect",
    "push-rock": "push",
    "use-lever": "lever",
}

export function isActionBlock(blockType: string): boolean {
    return blockType in BLOCK_TO_ACTION
}
