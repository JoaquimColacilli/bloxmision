"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { AcademyProgress } from "@/lib/types"

const STORAGE_KEY = "bloxmision_academy_progress"

const DEFAULT_PROGRESS: AcademyProgress = {
  completedLessons: [],
  quizScores: {},
  badges: [],
  totalTimeSpent: 0,
}

interface AcademyContextType {
  progress: AcademyProgress
  completeLesson: (lessonId: string) => void
  saveQuizScore: (lessonId: string, score: number) => void
  addBadge: (badgeId: string) => void
  isLessonCompleted: (lessonId: string) => boolean
  getQuizScore: (lessonId: string) => number | undefined
  resetProgress: () => void
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined)

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AcademyProgress>(DEFAULT_PROGRESS)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setProgress(JSON.parse(saved))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }, [progress, initialized])

  const completeLesson = useCallback((lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
      }
    })
  }, [])

  const saveQuizScore = useCallback((lessonId: string, score: number) => {
    setProgress((prev) => ({
      ...prev,
      quizScores: { ...prev.quizScores, [lessonId]: score },
    }))
  }, [])

  const addBadge = useCallback((badgeId: string) => {
    setProgress((prev) => {
      if (prev.badges.includes(badgeId)) return prev
      return {
        ...prev,
        badges: [...prev.badges, badgeId],
      }
    })
  }, [])

  const isLessonCompleted = useCallback(
    (lessonId: string) => {
      return progress.completedLessons.includes(lessonId)
    },
    [progress.completedLessons],
  )

  const getQuizScore = useCallback(
    (lessonId: string) => {
      return progress.quizScores[lessonId]
    },
    [progress.quizScores],
  )

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS)
  }, [])

  if (!initialized) return null

  return (
    <AcademyContext.Provider
      value={{
        progress,
        completeLesson,
        saveQuizScore,
        addBadge,
        isLessonCompleted,
        getQuizScore,
        resetProgress,
      }}
    >
      {children}
    </AcademyContext.Provider>
  )
}

export function useAcademy() {
  const context = useContext(AcademyContext)
  if (!context) {
    throw new Error("useAcademy must be used within an AcademyProvider")
  }
  return context
}
