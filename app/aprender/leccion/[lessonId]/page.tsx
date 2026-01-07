"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

// Redirect old route to new Academy 2.0 route
export default function LessonPageRedirect() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string

  useEffect(() => {
    router.replace(`/academia/lesson/${lessonId}`)
  }, [lessonId, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Redirigiendo a la nueva Academia...</p>
    </div>
  )
}
