"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { type User as FirebaseUser } from "firebase/auth"
import type { User, Settings } from "@/lib/types"
import * as authService from "@/lib/firebase-auth"
import { getUserProfile, createUserProfile, toAppUser } from "@/lib/firebase-firestore"

const STORAGE_KEY = "bloxmision_settings"

interface AuthContextType {
  user: User | null
  loading: boolean
  settings: Settings
  login: (email: string, password: string) => Promise<void>
  register: (displayName: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateSettings: (key: keyof Settings, value: boolean) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Convert Firebase user to app User, fetching profile from Firestore
 */
async function firebaseUserToAppUser(firebaseUser: FirebaseUser): Promise<User> {
  // Try to get existing profile
  let profile = await getUserProfile(firebaseUser.uid)

  // If no profile exists (e.g., trigger failed), create one client-side
  if (!profile) {
    profile = await createUserProfile(
      firebaseUser.uid,
      firebaseUser.displayName || "Pirata Anónimo",
      firebaseUser.email || ""
    )
  }

  return toAppUser(firebaseUser.uid, profile)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    sound: true,
    music: true,
    hints: true,
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY)
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setLoading(true)

      if (firebaseUser) {
        try {
          const appUser = await firebaseUserToAppUser(firebaseUser)
          setUser(appUser)
        } catch (error) {
          console.error("Error loading user profile:", error)
          setUser(null)
        }
      } else {
        setUser(null)
      }

      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signInWithEmail(email, password)
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false)
      // Translate Firebase errors to Spanish
      if (error?.code === "auth/user-not-found") {
        throw new Error("¡Arrr! No encontramos a ningún pirata con ese correo")
      } else if (error?.code === "auth/wrong-password") {
        throw new Error("¡La contraseña secreta es incorrecta, marinero!")
      } else if (error?.code === "auth/invalid-email") {
        throw new Error("¡Ese correo no parece válido, grumete!")
      } else if (error?.code === "auth/too-many-requests") {
        throw new Error("¡Demasiados intentos! Espera un momento antes de volver a intentar")
      } else if (error?.code === "auth/invalid-credential") {
        throw new Error("¡Credenciales incorrectas! Verifica tu correo y contraseña")
      } else {
        throw new Error(error?.message || "Error al iniciar sesión")
      }
    }
  }, [])

  const register = useCallback(async (displayName: string, email: string, password: string) => {
    setLoading(true)
    try {
      await authService.signUpWithEmail(email, password, displayName)
      // The auth trigger will create the user profile in Firestore
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false)
      // Translate Firebase errors to Spanish
      if (error?.code === "auth/email-already-in-use") {
        throw new Error("¡Ese correo ya está siendo usado por otro pirata!")
      } else if (error?.code === "auth/weak-password") {
        throw new Error("¡Tu contraseña secreta necesita ser más fuerte!")
      } else if (error?.code === "auth/invalid-email") {
        throw new Error("¡Ese correo no parece válido, grumete!")
      } else {
        throw new Error(error?.message || "Error al crear la cuenta")
      }
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      await authService.signInWithGoogle()
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setLoading(false)
      if (error?.code === "auth/popup-closed-by-user") {
        throw new Error("¡El login fue cancelado!")
      } else if (error?.code === "auth/popup-blocked") {
        throw new Error("¡El navegador bloqueó la ventana de login! Permite popups e intenta de nuevo")
      } else {
        throw new Error(error?.message || "Error al iniciar sesión con Google")
      }
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.signOutUser()
      // User state will be updated by onAuthStateChanged listener
    } catch (error) {
      setLoading(false)
      throw new Error("Error al cerrar sesión")
    }
  }, [])

  const updateSettings = useCallback((key: keyof Settings, value: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  const refreshUser = useCallback(async () => {
    const firebaseUser = authService.getCurrentUser()
    if (firebaseUser) {
      try {
        const appUser = await firebaseUserToAppUser(firebaseUser)
        setUser(appUser)
      } catch (error) {
        console.error("Error refreshing user:", error)
      }
    }
  }, [])

  // Don't render children until auth state is initialized
  if (!initialized) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        settings,
        login,
        register,
        loginWithGoogle,
        logout,
        updateSettings,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
