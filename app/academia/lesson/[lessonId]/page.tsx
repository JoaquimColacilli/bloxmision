"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context" // Correct import path
import {
    getLessonById,
    getLessonProgress,
    saveLessonProgress,
    awardLessonRewards
} from "@/src/lib/services/lessonService"
import { AcademyLesson, LessonProgress } from "@/src/lib/types/academy"
import { LessonHeader } from "@/components/academy/lesson-header"
import { LessonTabs, TabType } from "@/components/academy/lesson-tabs"
import { JorcSpeechCard } from "@/components/academy/jorc-speech-card"
import { PracticeEngine } from "@/components/academy/practice-engine"
import { LessonCompleteModal } from "@/components/academy/lesson-complete-modal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Lock } from "lucide-react"

import { InteractiveDemoPanel } from "@/components/academy/interactive-demo-panel"

export default function LessonPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()

    const lessonId = params.lessonId as string

    // Data State
    const [lesson, setLesson] = useState<AcademyLesson | null>(null)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState<LessonProgress | null>(null)

    // UI State
    const [currentTab, setCurrentTab] = useState<TabType>("story")
    const [completedTabs, setCompletedTabs] = useState<TabType[]>([])
    const [practiceStats, setPracticeStats] = useState({ attempts: 0, hints: 0, completedExercises: 0 })
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [rewardResult, setRewardResult] = useState({ coins: 0, stars: 0 })
    const [submitting, setSubmitting] = useState(false)

    // 1. Fetch Data
    useEffect(() => {
        async function init() {
            if (!user) return

            try {
                const lessonData = await getLessonById(lessonId)
                setLesson(lessonData)

                const progressData = await getLessonProgress(user.id, lessonId)
                setProgress(progressData)

                // Restore progress state if exists
                if (progressData?.status === "completed") {
                    setCompletedTabs(["story", "demo", "practice", "summary"])
                }
            } catch (error) {
                console.error("Failed to load lesson:", error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [lessonId, user])

    // 2. Tab Marking Logic
    const markTabComplete = (tab: TabType) => {
        if (!completedTabs.includes(tab)) {
            setCompletedTabs(prev => [...prev, tab])
        }
    }

    // 3. Handlers
    const handleStoryComplete = () => {
        markTabComplete("story")
        setCurrentTab("demo")
    }

    const handlePracticeComplete = (stats: { attempts: number; hintsUsed: number; solved: boolean }) => {
        // Accumulate session stats (this is blunt for MVP, ideally per exercise ID)
        setPracticeStats(prev => ({
            attempts: prev.attempts + stats.attempts,
            hints: prev.hints + stats.hintsUsed,
            completedExercises: prev.completedExercises + 1
        }))

        // Assume 1 exercise for MVP demo, or check against lesson.content.practice.exercises.length
        // For this specific MVP "Qué es un programa", let's say it has 3 exercises.
        // But implementation_plan says "3 exercises".
        // Let's hardcode checking if we reached 3 for this MVP integration
        if (practiceStats.completedExercises + 1 >= (lesson?.content?.practice?.exercises?.length || 3)) {
            markTabComplete("practice")
            // Allow user to go to summary manually or auto?
            // Let's explicitly NOT auto-nav to summary, keep user in control, but enable it in tabs
        }
    }

    const handleFinishLesson = async () => {
        if (!user || !lesson) return
        setSubmitting(true)

        try {
            // Calculate final stats for this run
            // For MVP, we need the totals.
            // Quiz score: assume perfect for now since we don't have the quiz component fully built
            // Or just assume the practice pass IS the pass.

            const finalRuns = {
                quizScore: 3, // Mocking quiz success for MVP
                totalQuestions: 3,
                hintsUsed: practiceStats.hints,
                attempts: practiceStats.attempts,
                totalExercises: lesson.content.practice.exercises.length
            }

            const result = await awardLessonRewards(user.id, lessonId, finalRuns)
            setRewardResult({ coins: result.coinsAwarded, stars: result.starsEarned })
            setShowCompleteModal(true)

            // Local update
            markTabComplete("summary")
        } catch (e) {
            console.error("Reward failed:", e)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || !lesson) return <div className="p-8 text-center">Cargando la aventura...</div>

    // Calculate generic progress for header
    const totalSteps = 4 // Story, Demo, Practice, Summary
    const currentStepIdx = ["story", "demo", "practice", "summary"].indexOf(currentTab) + 1

    return (
        <div className="min-h-screen bg-sand-50 pb-20">
            <LessonHeader
                title={lesson.title}
                completedSteps={currentStepIdx}
                totalSteps={totalSteps}
                jorCoins={user?.jorCoins || 0} // Would update real-time via context ideally
                totalStars={progress?.starsEarned || 0}
                onExit={() => router.push("/aprender")} // or /academia
            />

            <LessonTabs
                currentTab={currentTab}
                onTabChange={setCurrentTab}
                completedTabs={completedTabs}
                practiceCompleted={completedTabs.includes("practice")}
            />

            <main className="mx-auto max-w-3xl p-4">
                {/* CONTENT: STORY */}
                {currentTab === "story" && (
                    <div className="space-y-6">
                        <JorcSpeechCard
                            text={lesson.content.story.dialogue}
                            onComplete={() => { }} // Optional auto-forward?
                        />
                        <div className="flex justify-end">
                            <Button onClick={handleStoryComplete} className="bg-ocean-600">
                                Continuar <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* CONTENT: DEMO */}
                {currentTab === "demo" && (
                    <div className="space-y-6">
                        <InteractiveDemoPanel
                            gridSize={lesson.content.demo.gridSize || 4}
                            code={lesson.content.demo.steps[lesson.content.demo.steps.length - 1]?.code || ["Avanzar"]}
                            steps={lesson.content.demo.steps.map((step: any, idx: number) => ({
                                jorcState: step.jorcState,
                                message: step.message,
                                highlightLine: step.activeLineIndex
                            }))}
                            targetPosition={null}
                            obstacle={lesson.content.demo.obstacle || null}
                        />
                        <div className="flex justify-end">
                            <Button onClick={() => { markTabComplete("demo"); setCurrentTab("practice") }} variant="outline">
                                Ir a Práctica <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* CONTENT: PRACTICE */}
                {currentTab === "practice" && (
                    <div className="space-y-8">
                        {lesson.content.practice.exercises.map((ex, i) => (
                            <div key={ex.id || i} className="border-b border-gray-100 pb-8 last:border-0">
                                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-400">Ejercicio {i + 1}</span>
                                <PracticeEngine
                                    exercise={ex}
                                    onComplete={handlePracticeComplete}
                                />
                            </div>
                        ))}

                        {completedTabs.includes("practice") && (
                            <div className="mt-8 rounded-lg bg-green-50 p-6 text-center">
                                <h3 className="mb-2 text-lg font-bold text-green-800">¡Práctica Completada!</h3>
                                <Button onClick={() => setCurrentTab("summary")} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                    Ver Resumen y Reclamar
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* CONTENT: SUMMARY */}
                {currentTab === "summary" && (
                    <div className="space-y-6">
                        <div className="rounded-xl bg-white p-6 shadow-sm border border-ocean-100">
                            <h2 className="mb-4 text-xl font-bold text-ocean-900">Resumen de la lección</h2>
                            <ul className="space-y-2">
                                {lesson.content.summary.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <div className="mt-1.5 size-1.5 rounded-full bg-ocean-500" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* QUIZ WOULD GO HERE */}
                        <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center text-gray-400">
                            [Quiz MVP Placeholder - Assumed Passed]
                        </div>

                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={handleFinishLesson}
                                disabled={!completedTabs.includes("practice") || submitting}
                                className="w-full sm:w-auto min-w-[200px] text-lg font-bold shadow-lg shadow-ocean-600/20 bg-ocean-600 hover:bg-ocean-700"
                            >
                                {submitting ? "Guardando..." : "¡Finalizar Lección!"}
                            </Button>
                        </div>

                        {!completedTabs.includes("practice") && (
                            <p className="text-center text-sm text-red-400">
                                <Lock className="mr-1 inline size-3" />
                                Completa la práctica primero
                            </p>
                        )}
                    </div>
                )}
            </main>

            <LessonCompleteModal
                open={showCompleteModal}
                stars={rewardResult.stars}
                coinsEarned={rewardResult.coins}
                onNext={() => router.push("/aprender")}
                onReplay={() => {
                    setShowCompleteModal(false)
                    setCurrentTab("practice")
                    // Reset generic logic for replay if needed
                }}
            />
        </div>
    )
}
