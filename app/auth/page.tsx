"use client"

import { useRouter } from "next/navigation"
import { Auth } from "@/components/auth/auth"
import { useAuth } from "@/contexts/auth-context"
import { PublicRoute } from "@/components/auth/auth-guard"

export default function AuthPage() {
  const router = useRouter()
  const { login, register, loginWithGoogle } = useAuth()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
  }

  const handleRegister = async (displayName: string, email: string, password: string) => {
    await register(displayName, email, password)
  }

  const handleGoogleAuth = async () => {
    await loginWithGoogle()
  }

  const handleSuccess = () => {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
    sessionStorage.removeItem("redirectAfterLogin")
    router.push(redirectPath)
  }

  return (
    <PublicRoute>
      <Auth
        onLogin={handleLogin}
        onRegister={handleRegister}
        onGoogleAuth={handleGoogleAuth}
        onSuccess={handleSuccess}
      />
    </PublicRoute>
  )
}
