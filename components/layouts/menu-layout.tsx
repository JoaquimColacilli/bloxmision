"use client"

import { Header } from "@/components/header/header"
import { useAuth } from "@/contexts/auth-context"
import type { ReactNode } from "react"

interface MenuLayoutProps {
  children: ReactNode
}

export function MenuLayout({ children }: MenuLayoutProps) {
  const { user, loading, settings, logout, updateSettings } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-ocean-50">
      <Header user={user} loading={loading} settings={settings} onLogout={logout} onToggleSetting={updateSettings} />
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>
    </div>
  )
}
