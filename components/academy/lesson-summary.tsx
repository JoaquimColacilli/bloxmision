"use client"

import { useState } from "react"
import { Check, X, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { LessonSectionData } from "@/lib/types"

interface LessonSummaryProps {
  data: LessonSectionData
  onComplete: (quizPassed: boolean) => void
}

export function LessonSummary({ data, onComplete }: LessonSummaryProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const quiz = data.quiz
  const correctOption = quiz?.options.find((o) => o.correct)
  const isCorrect = selectedAnswer === correctOption?.value

  const handleSubmitQuiz = () => {
    setSubmitted(true)
  }

  const handleComplete = () => {
    onComplete(isCorrect)
  }

  return (
    <div className="space-y-8">
      {/* Summary points */}
      <div className="rounded-lg bg-ocean-50 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-ocean-800">
          <Trophy className="size-5" />
          Resumen
        </h3>
        <ul className="space-y-3">
          {data.summaryPoints?.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="mt-0.5 size-5 shrink-0 text-green-600" />
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Quiz */}
      {quiz && (
        <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
          <h4 className="mb-4 text-lg font-bold text-purple-800">Mini Quiz</h4>
          <p className="mb-4 text-gray-700">{quiz.question}</p>

          <div className="space-y-2">
            {quiz.options.map((option) => (
              <button
                key={option.value}
                onClick={() => !submitted && setSelectedAnswer(option.value)}
                disabled={submitted}
                className={cn(
                  "w-full rounded-lg border-2 p-3 text-left transition-all",
                  selectedAnswer === option.value
                    ? submitted
                      ? option.correct
                        ? "border-green-500 bg-green-100"
                        : "border-red-500 bg-red-100"
                      : "border-purple-500 bg-purple-100"
                    : "border-gray-200 bg-white hover:border-purple-300",
                  submitted && option.correct && "border-green-500 bg-green-100",
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {submitted && option.correct && <Check className="size-5 text-green-600" />}
                  {submitted && selectedAnswer === option.value && !option.correct && (
                    <X className="size-5 text-red-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {!submitted && (
            <Button onClick={handleSubmitQuiz} disabled={!selectedAnswer} className="mt-4 w-full">
              Verificar respuesta
            </Button>
          )}

          {submitted && (
            <div className={cn("mt-4 rounded-lg p-3 text-center", isCorrect ? "bg-green-200" : "bg-amber-200")}>
              {isCorrect ? (
                <span className="font-bold text-green-800">Excelente! Respuesta correcta!</span>
              ) : (
                <span className="font-bold text-amber-800">No exactamente, pero ya sabes la respuesta correcta!</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete button */}
      {submitted && (
        <Button onClick={handleComplete} size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700">
          <Check className="size-5" />
          Marcar leccion como completada
        </Button>
      )}
    </div>
  )
}
