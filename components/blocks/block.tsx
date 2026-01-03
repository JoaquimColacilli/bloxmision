"use client"

import type React from "react"
import { memo, useCallback, useState, useRef } from "react"
import { cn } from "@/lib/utils"
import type { BlockDefinition, BlockInstance, BlockParamDefinition } from "@/lib/types"
import {
  ArrowUp,
  RotateCw,
  RotateCcw,
  ArrowDown,
  Package,
  Coins,
  Mountain,
  ToggleRight,
  Repeat,
  CircleDot,
  HelpCircle,
  Variable,
  FunctionSquare,
  Play,
  Copy,
  Trash2,
  GripVertical,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActionSprite, BLOCK_TO_ACTION, isActionBlock } from "@/components/jorc/action-sprite"

export type BlockVariant = "palette" | "code" | "running"

interface BlockProps {
  // Can receive either a definition (palette) or instance (code area)
  block: BlockDefinition | BlockInstance
  variant?: BlockVariant
  color?: string
  borderColor?: string
  disabled?: boolean
  hideActions?: boolean
  // Callbacks
  onSelect?: (block: BlockDefinition) => void
  onParamChange?: (instanceId: string, params: Record<string, string | number | boolean>) => void
  onDuplicate?: (instanceId: string) => void
  onDelete?: (instanceId: string) => void
  // Drop inside callback for loop/conditional blocks
  // sourceInstanceId is provided when moving an existing block (not from palette)
  onDropInside?: (instanceId: string, blockDef: BlockDefinition, sourceInstanceId?: string) => void
  // Children for loop/conditional blocks
  children?: React.ReactNode
}

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  forward: ArrowUp,
  "turn-right": RotateCw,
  "turn-left": RotateCcw,
  backward: ArrowDown,
  "open-chest": Package,
  "collect-coin": Coins,
  "push-rock": Mountain,
  "use-lever": ToggleRight,
  repeat: Repeat,
  "repeat-until": CircleDot,
  if: HelpCircle,
  "if-else": HelpCircle,
  sensor: CircleDot,
  variable: Variable,
  define: FunctionSquare,
  call: Play,
}

// Color presets by category
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  movement: { bg: "bg-blue-500", border: "border-blue-600", text: "text-black" },
  actions: { bg: "bg-violet-500", border: "border-violet-600", text: "text-black" },
  control: { bg: "bg-orange-500", border: "border-orange-600", text: "text-black" },
  sensors: { bg: "bg-yellow-500", border: "border-yellow-700", text: "text-black" },
  memory: { bg: "bg-green-500", border: "border-green-600", text: "text-black" },
  commands: { bg: "bg-red-500", border: "border-red-600", text: "text-black" },
}

// Helper to check if it's a BlockInstance
function isBlockInstance(block: BlockDefinition | BlockInstance): block is BlockInstance {
  return "instanceId" in block && "definition" in block
}

// Inline parameter editor component
const ParamEditor = memo(function ParamEditor({
  param,
  value,
  onChange,
  disabled,
}: {
  param: BlockParamDefinition
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  disabled?: boolean
}) {
  if (param.type === "select" && param.options) {
    return (
      <Select value={String(value)} onValueChange={(v) => onChange(v)} disabled={disabled}>
        <SelectTrigger className="h-6 w-auto min-w-[60px] border-white/30 bg-white/20 px-2 text-xs font-medium text-inherit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {param.options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  if (param.type === "number") {
    return (
      <Input
        type="number"
        value={value as number}
        onChange={(e) => onChange(Number(e.target.value))}
        min={param.min}
        max={param.max}
        disabled={disabled}
        className="h-6 w-12 border-white/30 bg-white/20 px-2 text-center text-xs font-bold text-inherit [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label={param.name}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  if (param.type === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={disabled}
        className={cn(
          "h-6 rounded border border-white/30 bg-white/20 px-2 text-xs font-medium transition-colors",
          value ? "bg-white/40" : "",
        )}
        aria-pressed={!!value}
      >
        {value ? "Si" : "No"}
      </button>
    )
  }

  // Default: text input for variable names
  return (
    <Input
      type="text"
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-6 w-20 border-white/30 bg-white/20 px-2 text-xs font-medium text-inherit"
      aria-label={param.name}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  )
})

export const Block = memo(function Block({
  block,
  variant = "palette",
  color,
  borderColor,
  disabled = false,
  hideActions = false,
  onSelect,
  onParamChange,
  onDuplicate,
  onDelete,
  onDropInside,
  children,
}: BlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoopDragOver, setIsLoopDragOver] = useState(false)

  // Extract definition and instance data
  const definition = isBlockInstance(block) ? block.definition : block
  const instanceId = isBlockInstance(block) ? block.instanceId : undefined
  const paramValues = isBlockInstance(block) ? block.params : {}

  // Get colors from category or props
  const categoryColor = categoryColors[definition.category] || categoryColors.movement
  const bgColor = color || categoryColor.bg
  const bdColor = borderColor || categoryColor.border
  const textColor = categoryColor.text

  // Determine shape from definition or infer from type
  const shape = definition.shape || inferShape(definition.type)

  // Get icon component (or null for action blocks that use sprites)
  const useSprite = isActionBlock(definition.type)
  const IconComponent = iconMap[definition.type] || iconMap[definition.category] || Package

  // Handlers
  const handleClick = useCallback(() => {
    if (variant === "palette" && onSelect) {
      onSelect(definition)
    }
  }, [variant, definition, onSelect])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick, disabled],
  )

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return
      setIsDragging(true)
      // Include instanceId for blocks already in code area so they can be moved into loops
      const dragData = {
        ...definition,
        sourceInstanceId: instanceId, // Will be undefined for palette blocks
      }
      e.dataTransfer.setData("application/json", JSON.stringify(dragData))
      e.dataTransfer.effectAllowed = variant === "palette" ? "copy" : "move"
    },
    [definition, variant, disabled, instanceId],
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handlers for dropping blocks inside loop
  const handleLoopDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled || !instanceId) return
      e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed === "move" ? "move" : "copy"
      setIsLoopDragOver(true)
    },
    [disabled, instanceId],
  )

  const handleLoopDragLeave = useCallback((e: React.DragEvent) => {
    e.stopPropagation()
    // More robust check: only clear if effectively leaving the container
    // However, for nested structures, sometimes simpler is better or use a ref timeout
    // But adding min-w-0 usually fixes layout which might help hit testing

    // Original check
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsLoopDragOver(false)
    }
  }, [])

  const handleLoopDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsLoopDragOver(false)
      if (disabled || !instanceId || !onDropInside) return

      try {
        const data = e.dataTransfer.getData("application/json")
        if (data) {
          const parsedData = JSON.parse(data)
          // Extract the source instance id if present (for moving existing blocks)
          const { sourceInstanceId, ...blockDef } = parsedData
          // Pass both the block definition and the source instance id
          onDropInside(instanceId, blockDef as BlockDefinition, sourceInstanceId)
        }
      } catch {
        // Invalid data
      }
    },
    [disabled, instanceId, onDropInside],
  )

  const handleParamChange = useCallback(
    (paramName: string, value: string | number | boolean) => {
      if (instanceId && onParamChange) {
        onParamChange(instanceId, { ...paramValues, [paramName]: value })
      }
    },
    [instanceId, paramValues, onParamChange],
  )

  // Base classes for all blocks
  const baseClasses = cn(
    "relative flex min-h-[56px] w-full items-center gap-2 font-medium shadow-md transition-all",
    textColor,
    disabled && "cursor-not-allowed opacity-50",
    !disabled &&
    variant === "palette" &&
    "cursor-grab hover:scale-[1.02] hover:shadow-lg active:cursor-grabbing active:scale-[0.98]",
    !disabled && variant === "code" && "cursor-default",
    variant === "running" && "animate-pulse ring-2 ring-white ring-offset-2",
    isDragging && "opacity-60",
  )

  // Focus classes
  const focusClasses =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"

  // Render different shapes
  const renderBlock = () => {
    switch (shape) {
      case "conditional":
        return (
          <div
            ref={blockRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn("relative w-full", focusClasses)}
            onClick={variant === "palette" ? handleClick : undefined}
            onKeyDown={handleKeyDown}
            draggable={!disabled && variant === "palette"}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-block-id={definition.id}
            data-block-type={definition.type}
            data-block-category={definition.category}
            data-block-shape="conditional"
            aria-label={`Bloque condicional: ${definition.label}`}
            aria-disabled={disabled}
          >
            {/* Top part of C-shape */}
            <div
              className={cn(
                bgColor,
                bdColor,
                "flex min-h-[44px] items-center gap-2 rounded-t-lg border-2 border-b-0 px-3 py-2",
                baseClasses.includes("cursor-grab") && !disabled && "cursor-grab hover:shadow-lg",
                variant === "running" && "animate-pulse ring-2 ring-white",
                textColor,
              )}
            >
              {/* Diamond icon indicator for conditional */}
              <div className="size-5 shrink-0 rotate-45 rounded-sm bg-white/30 border border-white/50 flex items-center justify-center">
                <span className="-rotate-45 text-xs">?</span>
              </div>
              {useSprite ? (
                <ActionSprite
                  action={BLOCK_TO_ACTION[definition.type]}
                  size={24}
                  animate={variant === "running"}
                  className="shrink-0"
                />
              ) : (
                <IconComponent className="size-5 shrink-0" />
              )}
              <span className="flex-1 truncate text-sm font-medium min-w-[30px]">{definition.label}</span>
              {renderParams()}
              {renderCodeActions()}
            </div>

            {/* Middle indent for nested blocks */}
            <div className="flex">
              <div className={cn(bgColor, bdColor, "w-4 shrink-0 border-l-2 border-r-0")} />
              <div
                className={cn(
                  "min-h-[48px] flex-1 min-w-0 overflow-visible rounded-sm p-2 transition-colors",
                  isLoopDragOver ? "bg-gold-200/60" : "bg-black/10",
                )}
              >
                <div className="flex flex-col gap-1">
                  {/* Render existing children */}
                  {children && (
                    <div className={cn(isLoopDragOver && "pointer-events-none")}>
                      {children}
                    </div>
                  )}
                  {/* Always show drop zone for adding more blocks */}
                  <div
                    className={cn(
                      "flex min-h-[40px] items-center justify-center rounded-lg border-2 border-dashed text-sm font-medium transition-all cursor-copy",
                      isLoopDragOver
                        ? "border-gold-500 bg-gold-100 text-gold-700 scale-105"
                        : "border-ocean-400/60 bg-ocean-100/40 text-ocean-600 hover:border-ocean-500 hover:bg-ocean-100/60",
                    )}
                    onDragOver={variant === "code" ? handleLoopDragOver : undefined}
                    onDragEnter={variant === "code" ? handleLoopDragOver : undefined}
                    onDragLeave={variant === "code" ? handleLoopDragLeave : undefined}
                    onDrop={variant === "code" ? handleLoopDrop : undefined}
                  >
                    {isLoopDragOver ? "⬇ Suelta aquí ⬇" : (children ? "Suelta más bloques aquí" : "Arrastra bloques aquí")}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom part of C-shape */}
            <div className={cn(bgColor, bdColor, "h-3 rounded-b-lg border-2 border-t-0")} />
          </div>
        )

      case "loop":
        return (
          <div
            ref={blockRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn("relative w-full", focusClasses)}
            onClick={variant === "palette" ? handleClick : undefined}
            onKeyDown={handleKeyDown}
            draggable={!disabled && variant === "palette"}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-block-id={definition.id}
            data-block-type={definition.type}
            data-block-category={definition.category}
            data-block-shape="loop"
            aria-label={`Bloque de bucle: ${definition.label}`}
            aria-disabled={disabled}
          >
            {/* Top part of C-shape */}
            <div
              className={cn(
                bgColor,
                bdColor,
                "flex min-h-[44px] items-center gap-2 rounded-t-lg border-2 border-b-0 px-3 py-2",
                baseClasses.includes("cursor-grab") && !disabled && "cursor-grab hover:shadow-lg",
                variant === "running" && "animate-pulse ring-2 ring-white",
                textColor,
              )}
            >
              {useSprite ? (
                <ActionSprite
                  action={BLOCK_TO_ACTION[definition.type]}
                  size={24}
                  animate={variant === "running"}
                  className="shrink-0"
                />
              ) : (
                <IconComponent className="size-5 shrink-0" />
              )}
              <span className="flex-1 truncate text-sm font-medium min-w-[30px]">{definition.label}</span>
              {renderParams()}
              {renderCodeActions()}
            </div>

            {/* Middle indent for nested blocks */}
            <div className="flex">
              <div className={cn(bgColor, bdColor, "w-4 shrink-0 border-l-2 border-r-0")} />
              <div
                className={cn(
                  "min-h-[48px] flex-1 min-w-0 overflow-visible rounded-sm p-2 transition-colors",
                  isLoopDragOver ? "bg-gold-200/60" : "bg-black/10",
                )}
              >
                <div className="flex flex-col gap-1">
                  {/* Render existing children */}
                  {children && (
                    <div className={cn(isLoopDragOver && "pointer-events-none")}>
                      {children}
                    </div>
                  )}
                  {/* Always show drop zone for adding more blocks */}
                  <div
                    className={cn(
                      "flex min-h-[40px] items-center justify-center rounded-lg border-2 border-dashed text-sm font-medium transition-all cursor-copy",
                      isLoopDragOver
                        ? "border-gold-500 bg-gold-100 text-gold-700 scale-105"
                        : "border-ocean-400/60 bg-ocean-100/40 text-ocean-600 hover:border-ocean-500 hover:bg-ocean-100/60",
                    )}
                    onDragOver={variant === "code" ? handleLoopDragOver : undefined}
                    onDragEnter={variant === "code" ? handleLoopDragOver : undefined}
                    onDragLeave={variant === "code" ? handleLoopDragLeave : undefined}
                    onDrop={variant === "code" ? handleLoopDrop : undefined}
                  >
                    {isLoopDragOver ? "⬇ Suelta aquí ⬇" : (children ? "Suelta más bloques aquí" : "Arrastra bloques aquí")}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom part of C-shape */}
            <div className={cn(bgColor, bdColor, "h-3 rounded-b-lg border-2 border-t-0")} />
          </div>
        )

      case "sensor":
        return (
          <div
            ref={blockRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(baseClasses, focusClasses, "rounded-full border-2 px-4 py-2", bgColor, bdColor)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-block-id={definition.id}
            data-block-type={definition.type}
            data-block-category={definition.category}
            data-block-shape="sensor"
            aria-label={`Bloque sensor: ${definition.label}`}
            aria-disabled={disabled}
          >
            {useSprite ? (
              <ActionSprite
                action={BLOCK_TO_ACTION[definition.type]}
                size={24}
                animate={variant === "running"}
                className="shrink-0"
              />
            ) : (
              <IconComponent className="size-5 shrink-0" />
            )}
            <span className="flex-1 truncate text-sm min-w-[30px]">{definition.label}</span>
            {renderParams()}
            {renderCodeActions()}
          </div>
        )

      case "variable":
        return (
          <div
            ref={blockRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(baseClasses, focusClasses, "rounded-xl border-2 px-4 py-2", bgColor, bdColor)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-block-id={definition.id}
            data-block-type={definition.type}
            data-block-category={definition.category}
            data-block-shape="variable"
            aria-label={`Bloque de variable: ${definition.label}`}
            aria-disabled={disabled}
          >
            {useSprite ? (
              <ActionSprite
                action={BLOCK_TO_ACTION[definition.type]}
                size={24}
                animate={variant === "running"}
                className="shrink-0"
              />
            ) : (
              <IconComponent className="size-5 shrink-0" />
            )}
            <span className="flex-1 truncate text-sm min-w-[30px]">{definition.label}</span>
            {renderParams()}
            {renderCodeActions()}
          </div>
        )

      // Default: command (rectangle with rounded corners)
      default:
        return (
          <div
            ref={blockRef}
            role="button"
            tabIndex={disabled ? -1 : 0}
            className={cn(baseClasses, focusClasses, "rounded-lg border-2 px-3 py-2", bgColor, bdColor)}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            draggable={!disabled}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-block-id={definition.id}
            data-block-type={definition.type}
            data-block-category={definition.category}
            data-block-shape="command"
            aria-label={`Bloque: ${definition.label}`}
            aria-disabled={disabled}
          >
            {variant === "code" && <GripVertical className="size-4 shrink-0 cursor-grab opacity-50" />}
            {useSprite ? (
              <ActionSprite
                action={BLOCK_TO_ACTION[definition.type]}
                size={24}
                animate={variant === "running"}
                className="shrink-0"
              />
            ) : (
              <IconComponent className="size-5 shrink-0" />
            )}
            <span className="flex-1 truncate text-sm min-w-[30px]">{definition.label}</span>
            {renderParams()}
            {renderCodeActions()}
          </div>
        )
    }
  }

  // Render inline parameters
  const renderParams = () => {
    if (!definition.params || definition.params.length === 0) return null

    return (
      <div className="flex items-center gap-1">
        {definition.params.map((param) => {
          const value = paramValues[param.name] ?? param.default ?? ""
          return (
            <ParamEditor
              key={param.name}
              param={param}
              value={value}
              onChange={(v) => handleParamChange(param.name, v)}
              disabled={disabled || variant === "palette"}
            />
          )
        })}
      </div>
    )
  }

  // Render code variant action buttons - inline, compact
  const renderCodeActions = () => {
    if (variant !== "code" || !instanceId || hideActions) return null

    return (
      <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 [div:hover>&]:opacity-100 ml-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDuplicate?.(instanceId)
          }}
          className="rounded p-0.5 hover:bg-white/30"
          aria-label="Duplicar bloque"
        >
          <Copy className="size-3" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(instanceId)
          }}
          className="rounded p-0.5 hover:bg-white/30"
          aria-label="Eliminar bloque"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    )
  }

  return renderBlock()
})

// Helper to infer shape from block type
function inferShape(type: string): "command" | "conditional" | "loop" | "sensor" | "variable" {
  if (type === "if" || type === "if-else") return "conditional"
  if (type === "repeat" || type === "repeat-until") return "loop"
  if (type === "sensor" || type.includes("has-") || type.includes("touching-") || type.includes("-gt")) return "sensor"
  if (type === "variable" || type.includes("var")) return "variable"
  return "command"
}

export default Block
