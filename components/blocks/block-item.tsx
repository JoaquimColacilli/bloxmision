"use client"
import { memo, useState, useCallback } from "react"
import type React from "react"

import { Info } from "lucide-react"
import { Block } from "@/components/blocks/block"
import { HelpModal } from "@/components/help/help-modal"
import type { BlockDefinition } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BlockItemProps {
  block: BlockDefinition
  categoryColor: string
  categoryBgColor?: string
  categoryBorderColor: string
  onSelect?: (block: BlockDefinition) => void
  isDragging?: boolean
  availableBlockIds?: string[]
}

export const BlockItem = memo(function BlockItem({
  block,
  categoryColor,
  categoryBorderColor,
  onSelect,
  availableBlockIds,
}: BlockItemProps) {
  const [showHelp, setShowHelp] = useState(false)

  const handleHelpClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setShowHelp(true)
  }, [])

  const handleCloseHelp = useCallback(() => {
    setShowHelp(false)
  }, [])

  return (
    <div className="group relative" data-tutorial={`block-${block.type}`}>
      <Block
        block={block}
        variant="palette"
        color={`bg-[${categoryColor}]`}
        borderColor={`border-[${categoryBorderColor}]`}
        onSelect={onSelect}
      />

      <button
        type="button"
        onClick={handleHelpClick}
        className={cn(
          "absolute -right-1 -top-1 z-10 flex size-5 items-center justify-center rounded-full",
          "bg-ocean-100 text-ocean-500 shadow-sm",
          "opacity-0 transition-all hover:bg-ocean-200 hover:text-ocean-700",
          "group-hover:opacity-100 focus:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:ring-offset-1",
        )}
        aria-label={`Ayuda sobre ${block.label}`}
      >
        <Info className="size-3" />
      </button>

      <HelpModal isOpen={showHelp} onClose={handleCloseHelp} blockId={block.id} availableBlockIds={availableBlockIds} />
    </div>
  )
})
