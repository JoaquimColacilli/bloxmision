"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: AuthGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", pathname)
      router.replace("/auth")
    }
  }, [user, router, pathname])

  if (!user) {
    return null
  }

  return <>{children}</>
}

export function PublicRoute({ children }: AuthGuardProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
      sessionStorage.removeItem("redirectAfterLogin")
      router.replace(redirectPath)
    }
  }, [user, router])

  if (user) {
    return null
  }

  return <>{children}</>
}
