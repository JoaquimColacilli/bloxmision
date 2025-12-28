"use client"

import { MenuLayout } from "@/components/layouts/menu-layout"
import { Home } from "@/components/home/home"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/auth-guard"

export default function HomePage() {
  const { user, loading } = useAuth()

  return (
    <ProtectedRoute>
      <MenuLayout>
        <Home user={user} loading={loading} />
      </MenuLayout>
    </ProtectedRoute>
  )
}
