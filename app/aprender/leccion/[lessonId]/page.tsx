"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { LessonStory } from "@/components/academy/lesson-story"
import { LessonDemo } from "@/components/academy/lesson-demo"
import { LessonPractice } from "@/components/academy/lesson-practice"
import { LessonSummary } from "@/components/academy/lesson-summary"
import { useAcademy } from "@/contexts/academy-context"
import { getLessonById } from "@/lib/lessons-data"
import { cn } from "@/lib/utils"

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const { completeLesson, saveQuizScore, addBadge } = useAcademy()

  const lessonId = params.lessonId as string
  const lesson = getLessonById(lessonId)

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    setCurrentStep(0)
    setCompletedSteps([])
  }, [lessonId])

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Leccion no encontrada</p>
      </div>
    )
  }

  const totalSteps = lesson.content.length
  const progressPercent = ((currentStep + 1) / totalSteps) * 100
  const currentSection = lesson.content[currentStep]

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePracticeComplete = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    // Auto advance after short delay
    setTimeout(() => {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1)
      }
    }, 1500)
  }

  const handleLessonComplete = (quizPassed: boolean) => {
    completeLesson(lesson.id)
    saveQuizScore(lesson.id, quizPassed ? 100 : 50)

    // Award badge for completing category
    if (lesson.category === "basic" && lesson.order === 3) {
      addBadge("Estudiante Pirata")
    } else if (lesson.category === "loop" && lesson.order === 2) {
      addBadge("Experto en Bucles")
    } else if (lesson.category === "conditional" && lesson.order === 1) {
      addBadge("Maestro de Decisiones")
    }

    router.push("/aprender")
  }

  const stepLabels = {
    story: "Historia",
    demo: "Demo",
    practice: "Practica",
    summary: "Resumen",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-ocean-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/aprender")}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="size-4" />
              Volver
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{lesson.title}</h1>
            <span className="text-sm text-gray-500">{lesson.duration}</span>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <Progress value={progressPercent} className="h-2" />
            <div className="mt-2 flex justify-between">
              {lesson.content.map((section, index) => (
                <button
                  key={index}
                  onClick={() => completedSteps.includes(index) && setCurrentStep(index)}
                  disabled={!completedSteps.includes(index) && index !== currentStep}
                  className={cn(
                    "flex items-center gap-1 text-xs transition-colors",
                    index === currentStep
                      ? "font-semibold text-ocean-600"
                      : completedSteps.includes(index)
                        ? "text-green-600"
                        : "text-gray-400",
                  )}
                >
                  {completedSteps.includes(index) && <Check className="size-3" />}
                  {stepLabels[section.type]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl p-4 py-8">
        {currentSection.type === "story" && <LessonStory data={currentSection.data} />}

        {currentSection.type === "demo" && <LessonDemo data={currentSection.data} />}

        {currentSection.type === "practice" && (
          <LessonPractice data={currentSection.data} onComplete={handlePracticeComplete} />
        )}

        {currentSection.type === "summary" && (
          <LessonSummary data={currentSection.data} onComplete={handleLessonComplete} />
        )}
      </main>

      {/* Navigation */}
      {currentSection.type !== "summary" && (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="mx-auto flex max-w-3xl justify-between">
            <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 0}>
              <ArrowLeft className="mr-2 size-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {lesson.content.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    index === currentStep
                      ? "bg-ocean-600"
                      : completedSteps.includes(index)
                        ? "bg-green-500"
                        : "bg-gray-300",
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNextStep}
              disabled={currentSection.type === "practice" && !completedSteps.includes(currentStep)}
            >
              Siguiente
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
