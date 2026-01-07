"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { doc, getDoc, updateDoc, arrayUnion, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
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
  addBadge: (badgeId: string) => Promise<void>
  isLessonCompleted: (lessonId: string) => boolean
  getQuizScore: (lessonId: string) => number | undefined
  resetProgress: () => void
  refreshProgress: () => Promise<void>
}

const AcademyContext = createContext<AcademyContextType | undefined>(undefined)

export function AcademyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<AcademyProgress>(DEFAULT_PROGRESS)
  const [initialized, setInitialized] = useState(false)

  // Load progress from Firestore - including lessonProgress subcollection for completed lessons
  const loadProgress = useCallback(async () => {
    // First, load from localStorage as baseline
    const saved = localStorage.getItem(STORAGE_KEY)
    let localProgress = { ...DEFAULT_PROGRESS }

    if (saved) {
      try {
        localProgress = JSON.parse(saved)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    // If user is logged in, fetch from Firestore
    if (user?.id) {
      try {
        // 1. Fetch badges from user document
        const userDocRef = doc(db, "users", user.id)
        const userDoc = await getDoc(userDocRef)

        let firestoreBadges: string[] = []
        if (userDoc.exists()) {
          const userData = userDoc.data()
          firestoreBadges = (userData.badges || []).filter((b: string) => b && b.trim() !== '')
        }

        // 2. Fetch completed lessons from lessonProgress subcollection
        const lessonProgressRef = collection(db, "users", user.id, "lessonProgress")
        const lessonProgressSnap = await getDocs(lessonProgressRef)

        const completedFromFirestore: string[] = []
        const quizScoresFromFirestore: Record<string, number> = {}

        lessonProgressSnap.forEach((doc) => {
          const data = doc.data()
          // Mark as completed if status is "completed"
          if (data.status === "completed") {
            completedFromFirestore.push(doc.id)
          }
          // Also get quiz scores
          if (data.quizScore !== undefined) {
            quizScoresFromFirestore[doc.id] = data.quizScore
          }
        })

        // 3. Merge everything: Firestore is source of truth, but also include local
        const mergedBadges = [...new Set([...localProgress.badges, ...firestoreBadges])].filter(b => b && b.trim() !== '')
        const mergedCompletedLessons = [...new Set([...localProgress.completedLessons, ...completedFromFirestore])]
        const mergedQuizScores = { ...localProgress.quizScores, ...quizScoresFromFirestore }

        localProgress = {
          ...localProgress,
          badges: mergedBadges,
          completedLessons: mergedCompletedLessons,
          quizScores: mergedQuizScores,
        }

        // Sync local badges to Firestore if needed
        const newBadgesToSync = localProgress.badges.filter(b => b && !firestoreBadges.includes(b))
        if (newBadgesToSync.length > 0) {
          await updateDoc(userDocRef, {
            badges: arrayUnion(...newBadgesToSync)
          })
        }

        console.log("[AcademyContext] Loaded from Firestore:", {
          badges: mergedBadges.length,
          completedLessons: mergedCompletedLessons
        })
      } catch (error) {
        console.warn("[AcademyContext] Failed to load from Firestore:", error)
      }
    }

    setProgress(localProgress)
    setInitialized(true)
  }, [user?.id])

  // Load on mount / user change
  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // Save to localStorage whenever progress changes
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

  // Add badge - now persists to Firestore as well
  const addBadge = useCallback(async (badgeId: string) => {
    // Skip empty badges
    if (!badgeId || badgeId.trim() === '') return

    // Update local state first (optimistic)
    setProgress((prev) => {
      if (prev.badges.includes(badgeId)) return prev
      return {
        ...prev,
        badges: [...prev.badges, badgeId],
      }
    })

    // Persist to Firestore if user is logged in
    if (user?.id) {
      try {
        const userDocRef = doc(db, "users", user.id)
        await updateDoc(userDocRef, {
          badges: arrayUnion(badgeId)
        })
        console.log(`[AcademyContext] Badge "${badgeId}" saved to Firestore`)
      } catch (error) {
        console.error("[AcademyContext] Failed to save badge to Firestore:", error)
      }
    }
  }, [user?.id])

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

  // Expose refresh function for manual refresh
  const refreshProgress = useCallback(async () => {
    await loadProgress()
  }, [loadProgress])

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
        refreshProgress,
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
