"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { Anchor, Ship } from "lucide-react"

export interface AuthProps {
  onLogin: (email: string, password: string) => Promise<void>
  onRegister: (displayName: string, email: string, password: string) => Promise<void>
  onGoogleAuth: () => Promise<void>
  onSuccess?: () => void
}

type AuthStatus = "idle" | "loading" | "success" | "error"

export function Auth({ onLogin, onRegister, onGoogleAuth, onSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const [status, setStatus] = useState<AuthStatus>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handleLogin = async (email: string, password: string) => {
    setStatus("loading")
    setErrorMessage("")
    try {
      await onLogin(email, password)
      setStatus("success")
      onSuccess?.()
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Tormenta a la vista! Intenta de nuevo")
    }
  }

  const handleRegister = async (displayName: string, email: string, password: string) => {
    setStatus("loading")
    setErrorMessage("")
    try {
      await onRegister(displayName, email, password)
      setStatus("success")
      onSuccess?.()
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Funcion no disponible")
    }
  }

  const handleGoogleAuth = async () => {
    setStatus("loading")
    setErrorMessage("")
    try {
      await onGoogleAuth()
      setStatus("success")
      onSuccess?.()
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Funcion no disponible")
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ocean-100 to-ocean-200 p-4">
        <Card className="w-full max-w-md border-2 border-ocean-300 bg-sand-50 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex size-20 items-center justify-center rounded-full bg-ocean-500">
              <Ship className="size-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-ocean-800">Bienvenido a bordo, grumete!</h2>
            <p className="text-center text-ocean-600">Tu aventura pirata esta por comenzar...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-ocean-100 to-ocean-200 p-4">
      <Card className="w-full max-w-md border-2 border-ocean-300 bg-sand-50 shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-ocean-500">
            <Anchor className="size-8 text-gold-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-ocean-800">Ahoy, aventurero!</CardTitle>
          <CardDescription className="text-ocean-600">Bienvenido a BloxMision</CardDescription>
        </CardHeader>

        <CardContent>
          {status === "error" && errorMessage && (
            <div
              className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              <span aria-hidden="true">⚠️</span>
              {errorMessage}
            </div>
          )}

          <div className="mb-4 rounded-xl border border-ocean-200 bg-ocean-50 p-3 text-sm text-ocean-700">
            <p className="font-medium">Modo Demo</p>
            <p className="text-ocean-600">
              Email: <code className="rounded bg-ocean-100 px-1">admin@bloxmision.com</code>
            </p>
            <p className="text-ocean-600">
              Password: <code className="rounded bg-ocean-100 px-1">admin123</code>
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2 rounded-xl bg-ocean-100 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-ocean-800 data-[state=active]:shadow-sm"
              >
                Ya tengo tripulacion
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-ocean-800 data-[state=active]:shadow-sm"
              >
                Quiero unirme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                onSubmit={handleLogin}
                onGoogleAuth={handleGoogleAuth}
                onSwitchToRegister={() => setActiveTab("register")}
                isLoading={status === "loading"}
              />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm
                onSubmit={handleRegister}
                onGoogleAuth={handleGoogleAuth}
                onSwitchToLogin={() => setActiveTab("login")}
                isLoading={status === "loading"}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mascota Jorc el Pirata */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <img
          src="/placeholder.svg?height=120&width=100"
          alt="Jorc el Pirata, la mascota de BloxMision"
          className="h-30 w-25 drop-shadow-lg"
        />
      </div>
    </div>
  )
}
