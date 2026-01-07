"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, HelpCircle, X, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export type PracticeType = "choice" | "order" | "fill"

export interface PracticeExerciseData {
    id: string
    type: PracticeType
    prompt: string
    options?: Array<{ id: string; label: string; isCorrect: boolean }> // For choice
    correctOrder?: string[] // For order
    items?: Array<{ id: string; label: string }> // items to order
    correctFill?: string // For fill
    hint: string
}

interface PracticeEngineProps {
    exercise: PracticeExerciseData
    onComplete: (stats: { attempts: number; hintsUsed: number; solved: boolean }) => void
}

export function PracticeEngine({ exercise, onComplete }: PracticeEngineProps) {
    const [attempts, setAttempts] = useState(0)
    const [hintsUsed, setHintsUsed] = useState(0)
    const [isSolved, setIsSolved] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<"success" | "error" | null>(null)

    // Reset state when exercise changes
    if (exercise.id !== exercise.id) { // Key check usually handled by parent, but safety first
        // In React typically we use key={exercise.id} in parent to force remount
    }

    const handleHint = () => {
        if (!showHint) {
            setHintsUsed(h => h + 1)
            setShowHint(true)
        }
    }

    const checkSolution = () => {
        if (isSolved) return

        setAttempts(a => a + 1)
        let correct = false

        if (exercise.type === "choice") {
            const selected = exercise.options?.find(o => o.id === selectedOption)
            correct = selected?.isCorrect || false
        }
        // TODO: Implement logic for 'order' and 'fill' in Phase 2.5
        // For now we assume they are placeholders or simple clicks in MVP

        if (correct) {
            setIsSolved(true)
            setFeedback("success")
            // Notify parent slightly delayed to allow animation
            setTimeout(() => {
                onComplete({ attempts: attempts + 1, hintsUsed, solved: true })
            }, 1000)
        } else {
            setFeedback("error")
            setTimeout(() => setFeedback(null), 1500)
        }
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-4">
            {/* Prompt */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-4">{exercise.prompt}</h3>

                {/* Interaction Area */}
                <div className="space-y-3">
                    {exercise.type === "choice" && exercise.options?.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => !isSolved && setSelectedOption(opt.id)}
                            className={cn(
                                "w-full rounded-md border-2 p-4 text-left transition-all hover:bg-gray-50",
                                selectedOption === opt.id
                                    ? "border-ocean-500 bg-ocean-50"
                                    : "border-gray-200",
                                isSolved && opt.isCorrect && "border-green-500 bg-green-50 font-medium"
                            )}
                            disabled={isSolved}
                        >
                            {opt.label}
                        </button>
                    ))}

                    {exercise.type !== "choice" && (
                        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded italic">
                            [Interactive widget for {exercise.type} coming in Phase 2.5]
                            <br />
                            (Simulate success by clicking check)
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback & Actions */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleHint}
                    disabled={showHint || isSolved}
                    className={cn("text-yellow-600 hover:text-yellow-700", showHint && "opacity-50")}
                >
                    <HelpCircle className="mr-2 size-4" />
                    {showHint ? "Pista usada" : "Pedir Pista"}
                </Button>

                <Button
                    onClick={() => {
                        if (exercise.type !== "choice") {
                            // Auto-pass for MVP incomplete types
                            setIsSolved(true)
                            setFeedback("success")
                            setTimeout(() => onComplete({ attempts: 1, hintsUsed: 0, solved: true }), 500)
                        } else {
                            checkSolution()
                        }
                    }}
                    disabled={!selectedOption && exercise.type === "choice" || isSolved}
                    className={cn(
                        "min-w-[120px]",
                        isSolved ? "bg-green-600 hover:bg-green-700" : "bg-ocean-600 hover:bg-ocean-700"
                    )}
                >
                    {isSolved ? (
                        <>
                            <Check className="mr-2 size-4" /> Correcto!
                        </>
                    ) : (
                        "Verificar"
                    )}
                </Button>
            </div>

            {showHint && (
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <HelpCircle className="size-4 text-yellow-600" />
                    <AlertTitle>Pista</AlertTitle>
                    <AlertDescription>{exercise.hint}</AlertDescription>
                </Alert>
            )}

            {feedback === "error" && (
                <div className="text-center text-red-600 font-medium animate-shake">
                    Inténtalo de nuevo, ¡tú puedes!
                </div>
            )}
        </div>
    )
}
