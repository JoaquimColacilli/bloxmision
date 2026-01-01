"use client"

import { useState, useEffect } from "react"
import { Sparkles, ArrowRight, X, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getBlockLesson, getNewBlocksIntroducedIn, type BlockLesson } from "@/lib/block-progression"
import { useAuth } from "@/contexts/auth-context"
import { markLessonSeen, getSeenLessons } from "@/src/lib/services/lessonService"

interface NewBlockIntroModalProps {
  blockIds: string[]
  levelId: string
  onClose: () => void
}

/**
 * Hook to get new blocks that should show lessons for this level
 * ONLY returns blocks that are INTRODUCED in this specific level (first time appearing)
 * and that the user has not yet seen the lesson for
 */
export function useNewBlocksForLevel(levelId: string): string[] {
  const [newBlocks, setNewBlocks] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    async function checkLessons() {
      try {
        // Get blocks that are INTRODUCED in this level (first appearance in progression)
        const introducedInThisLevel = getNewBlocksIntroducedIn(levelId)

        if (introducedInThisLevel.length === 0) {
          setNewBlocks([])
          return
        }

        // Filter by lessons not yet seen
        const seenLessons = await getSeenLessons(user?.id || null)
        const notYetSeen = introducedInThisLevel.filter((id) => !seenLessons.includes(id))
        setNewBlocks(notYetSeen)
      } catch {
        // Fallback: show all introduced blocks if storage fails
        const introduced = getNewBlocksIntroducedIn(levelId)
        setNewBlocks(introduced)
      }
    }
    checkLessons()
  }, [levelId, user?.id])

  return newBlocks
}

/**
 * Get blocks that are introduced in a specific level (from progression system)
 */
export function useBlocksIntroducedInLevel(levelId: string): string[] {
  const [blocks, setBlocks] = useState<string[]>([])

  useEffect(() => {
    setBlocks(getNewBlocksIntroducedIn(levelId))
  }, [levelId])

  return blocks
}

// Category colors for visual styling
const categoryColors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  movement: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", accent: "bg-blue-500" },
  actions: { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", accent: "bg-purple-500" },
  control: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", accent: "bg-orange-500" },
  sensor: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", accent: "bg-yellow-500" },
  memory: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", accent: "bg-emerald-500" },
  commands: { bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-700", accent: "bg-pink-500" },
}

function getBlockCategory(blockId: string): string {
  const movementBlocks = ["forward", "backward", "turn-right", "turn-left"]
  const actionBlocks = ["collect-coin", "open-chest", "push-rock", "use-lever"]
  const controlBlocks = ["repeat", "repeat-until", "if", "if-else", "if-blocked"]
  const memoryBlocks = ["variable", "create-var", "set-var", "change-var"]
  const commandBlocks = ["function-define", "function-call", "define-cmd", "call-cmd"]

  if (movementBlocks.includes(blockId)) return "movement"
  if (actionBlocks.includes(blockId)) return "actions"
  if (controlBlocks.includes(blockId)) return "control"
  if (memoryBlocks.includes(blockId)) return "memory"
  if (commandBlocks.includes(blockId)) return "commands"
  return "control"
}

export function NewBlockIntroModal({ blockIds, levelId, onClose }: NewBlockIntroModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(true)
  const { user } = useAuth()

  const currentBlockId = blockIds[currentIndex]
  const lesson = getBlockLesson(currentBlockId)
  const isLast = currentIndex === blockIds.length - 1
  const category = getBlockCategory(currentBlockId)
  const colors = categoryColors[category] || categoryColors.control

  // If no lesson data, skip this block
  useEffect(() => {
    if (!lesson) {
      markLessonSeen(user?.id || null, currentBlockId)
      if (isLast) {
        setIsOpen(false)
        onClose()
      } else {
        setCurrentIndex((prev) => prev + 1)
      }
    }
  }, [currentBlockId, lesson, isLast, onClose, user?.id])

  const handleNext = async () => {
    await markLessonSeen(user?.id || null, currentBlockId)

    if (isLast) {
      setIsOpen(false)
      onClose()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSkipAll = async () => {
    for (const id of blockIds) {
      await markLessonSeen(user?.id || null, id)
    }
    setIsOpen(false)
    onClose()
  }

  if (!lesson) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkipAll()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b p-4`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`${colors.accent} rounded-full p-1.5 animate-pulse`}>
                  <Sparkles className="size-4 text-white" />
                </div>
                <DialogTitle className={`${colors.text} text-lg`}>¡Nuevo Bloque!</DialogTitle>
              </div>
              {blockIds.length > 1 && (
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} de {blockIds.length}
                </span>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-4">
          {/* Block name and icon */}
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-3 ${colors.bg} ${colors.border} border-2 rounded-xl px-5 py-3`}
            >
              <span className="text-3xl">{lesson.icon}</span>
              <span className={`font-bold text-2xl ${colors.text}`}>{lesson.name}</span>
            </div>
          </div>

          {/* What it does */}
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-center text-slate-700 font-medium">{lesson.whatItDoes}</p>
          </div>

          {/* How to use - Steps */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              Cómo usarlo
            </h4>
            <ol className="space-y-1.5 pl-4">
              {lesson.howToUse.map((step, i) => (
                <li key={i} className="text-sm text-slate-600 flex gap-2">
                  <span className={`font-bold ${colors.text}`}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Example */}
          <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
            <h4 className="font-semibold text-slate-800 text-sm mb-2">📝 Ejemplo</h4>
            <code className="text-sm font-mono block text-slate-700">{lesson.example}</code>
          </div>

          {/* Tips */}
          {lesson.tips.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
              <Lightbulb className="size-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">{lesson.tips[0]}</p>
            </div>
          )}

          {/* Common mistake */}
          <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-200">
            <AlertTriangle className="size-4 text-red-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-sm font-semibold text-red-700">Error común: </span>
              <span className="text-sm text-red-700">{lesson.commonMistake}</span>
            </div>
          </div>

          {/* Mandatory usage notice */}
          <div className={`${colors.bg} rounded-lg p-3 border-2 ${colors.border} border-dashed`}>
            <p className={`text-sm font-medium ${colors.text} text-center`}>
              ⚠️ Para pasar este nivel, tenés que usar el bloque "{lesson.name}" al menos una vez.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t p-4 bg-muted/30">
          <Button variant="ghost" size="sm" onClick={handleSkipAll} className="text-muted-foreground">
            <X className="size-4 mr-1" />
            Saltar
          </Button>
          <Button onClick={handleNext} className={`${colors.accent} hover:opacity-90`}>
            {isLast ? "¡Entendí!" : "Siguiente"}
            {!isLast && <ArrowRight className="size-4 ml-1" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
