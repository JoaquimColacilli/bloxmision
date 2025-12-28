"use client"

import type * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AuthInput } from "./auth-input"
import { Loader2 } from "lucide-react"

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  onGoogleAuth: () => Promise<void>
  onSwitchToRegister: () => void
  isLoading: boolean
}

interface FormErrors {
  email?: string
  password?: string
}

const DEMO_EMAIL = "admin@bloxmision.com"
const DEMO_PASSWORD = "admin"

export function LoginForm({ onSubmit, onGoogleAuth, onSwitchToRegister, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateEmail = (value: string): string | undefined => {
    if (!value) return "¡Necesitas un correo para zarpar!"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return "¡Arrr! Ese correo no parece correcto, grumete"
    return undefined
  }

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "¡Tu contraseña secreta es necesaria!"
    if (value.length < 6 && value !== DEMO_PASSWORD) return "Tu contraseña secreta necesita al menos 6 letras"
    return undefined
  }

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }))
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)

    setErrors({ email: emailError, password: passwordError })
    setTouched({ email: true, password: true })

    if (!emailError && !passwordError) {
      await onSubmit(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthInput
        label="Correo del capitán"
        type="email"
        placeholder="pirata@bloxmision.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => handleBlur("email")}
        error={touched.email ? errors.email : undefined}
        disabled={isLoading}
        autoComplete="email"
      />

      <AuthInput
        label="Contraseña secreta"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => handleBlur("password")}
        error={touched.password ? errors.password : undefined}
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="mt-2 h-12 rounded-xl bg-ocean-600 text-lg font-bold text-white hover:bg-ocean-700 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>Izando velas...</span>
          </>
        ) : (
          "¡Zarpar!"
        )}
      </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-ocean-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-sand-50 px-3 text-ocean-500">o continúa con</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onGoogleAuth}
        disabled={isLoading}
        className="h-12 rounded-xl border-2 border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50"
      >
        <svg className="size-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continuar con Google
      </Button>

      <p className="mt-2 text-center text-sm text-ocean-600">
        ¿No tienes tripulación?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-gold-600 underline-offset-2 hover:underline"
        >
          ¡Únete a la aventura!
        </button>
      </p>
    </form>
  )
}
