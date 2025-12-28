"use client"

import type React from "react"

import { memo, useCallback } from "react"
import { ChevronDown, ChevronRight, Move, Zap, RefreshCw, Eye, Database, Code } from "lucide-react"
import { cn } from "@/lib/utils"
import { BlockItem } from "./block-item"
import type { BlockDefinition, BlockCategoryData } from "@/lib/types"

interface BlockCategoriesProps {
  category: BlockCategoryData
  isCollapsed: boolean
  onToggle: () => void
  onBlockSelect?: (block: BlockDefinition) => void
  availableBlockIds?: string[]
}

const categoryIcons: Record<string, React.ReactNode> = {
  movement: <Move className="size-4" />,
  actions: <Zap className="size-4" />,
  control: <RefreshCw className="size-4" />,
  sensors: <Eye className="size-4" />,
  memory: <Database className="size-4" />,
  commands: <Code className="size-4" />,
}

export const BlockCategories = memo(function BlockCategories({
  category,
  isCollapsed,
  onToggle,
  onBlockSelect,
  availableBlockIds,
}: BlockCategoriesProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle],
  )

  const contentId = `category-content-${category.id}`

  const allBlockIds = availableBlockIds || category.blocks.map((b) => b.id)

  return (
    <div className="overflow-hidden rounded-lg border border-ocean-200 bg-white/50">
      {/* Category Header */}
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors",
          "hover:bg-ocean-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ocean-400",
        )}
        style={{ backgroundColor: isCollapsed ? "transparent" : category.bgColor }}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
      >
        <span
          className="flex size-6 items-center justify-center rounded text-white"
          style={{ backgroundColor: category.color }}
        >
          {categoryIcons[category.id] || category.icon}
        </span>
        <span className="flex-1 text-sm font-semibold text-ocean-800">{category.name}</span>
        <span className="text-ocean-400">
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* Blocks List */}
      <div
        id={contentId}
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
        role="listbox"
        aria-label={`Bloques de ${category.name}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-2 p-2">
            {category.blocks.map((block) => (
              <BlockItem
                key={block.id}
                block={block}
                categoryColor={category.color}
                categoryBgColor={category.bgColor}
                categoryBorderColor={category.borderColor}
                onSelect={onBlockSelect}
                availableBlockIds={allBlockIds}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
