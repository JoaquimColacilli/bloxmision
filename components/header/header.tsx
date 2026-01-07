"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { UserBadge } from "./user-badge"
import { XPBar } from "./xp-bar"
import { JorCoinDisplay } from "./jorcoin-display"
import { SettingsMenu } from "./settings-menu"
import { useIsMobile } from "@/hooks/use-mobile"
import type { User, Settings } from "@/lib/types"
import { useState } from "react"

export interface HeaderProps {
  user?: User | null
  loading?: boolean
  variant?: "full" | "compact" | "minimal"
  settings: Settings
  onLogout: () => void
  onToggleSetting: (setting: keyof Settings, value: boolean) => void
}

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/worlds", label: "Islas" },
  { href: "/aprender", label: "Academia" },
  { href: "/desafio", label: "Desafío" },
  { href: "/map", label: "Mapa del Tesoro" },
  { href: "/profile", label: "Mi Perfil" },
]

function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-ocean-200 bg-sand-50/95 backdrop-blur supports-[backdrop-filter]:bg-sand-50/80">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-4">
          <Skeleton className="hidden h-8 w-48 md:block" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </header>
  )
}

export function Header({ user, loading, variant = "full", settings, onLogout, onToggleSetting }: HeaderProps) {
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return <HeaderSkeleton />
  }

  const resolvedVariant = isMobile ? "compact" : variant

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-ocean-200 bg-sand-50/95 backdrop-blur supports-[backdrop-filter]:bg-sand-50/80"
      role="banner"
    >
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ocean-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Saltar al contenido principal
      </a>

      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4 relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-ocean-800 transition-colors hover:text-ocean-600 z-10"
          aria-label="BloxMision - Ir al inicio"
        >
          <Image src="/BM_LOGO.png" alt="BloxMision" width={32} height={32} className="rounded" />
          <span className="font-bold">BloxMision</span>
        </Link>

        {/* Desktop Navigation - Centered absolutely */}
        {user && !isMobile && (
          <nav className="hidden items-center gap-6 md:flex absolute left-1/2 -translate-x-1/2" role="navigation" aria-label="Navegacion principal">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ocean-600 transition-colors hover:text-ocean-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* XP Bar - hidden on compact */}
              {resolvedVariant === "full" && (
                <XPBar
                  totalXP={user.totalXP}
                  nextLevelThreshold={user.nextLevelThreshold}
                  playerLevel={user.playerLevel}
                  variant={isMobile ? "compact" : "full"}
                  className="hidden sm:flex"
                />
              )}

              {/* JorCoins Display */}
              <JorCoinDisplay
                balance={user.jorCoins || 0}
                totalEarned={user.jorCoinsEarned || 0}
                totalSpent={user.jorCoinsSpent || 0}
                showBazarButton={!isMobile}
                variant={resolvedVariant === "full" ? "full" : "compact"}
                className="hidden sm:flex"
              />

              {/* User Badge */}
              <UserBadge
                displayName={user.displayName}
                avatar={user.avatar}
                variant={resolvedVariant === "full" ? "full" : "minimal"}
              />

              {/* Settings Menu */}
              <SettingsMenu settings={settings} onToggleSetting={onToggleSetting} onLogout={onLogout} />

              {/* Mobile Menu */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 text-ocean-600 hover:bg-ocean-100 md:hidden"
                      aria-label="Abrir menu de navegacion"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72 bg-sand-50">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2 text-ocean-800">
                        <Image src="/BM_LOGO.png" alt="BloxMision" width={32} height={32} className="rounded" />
                        BloxMision
                      </SheetTitle>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col gap-2" role="navigation" aria-label="Menu movil">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-lg px-4 py-3 text-ocean-700 transition-colors hover:bg-ocean-100 hover:text-ocean-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    {/* XP info in mobile menu */}
                    <div className="mt-8 rounded-xl bg-ocean-100 p-4">
                      <XPBar
                        totalXP={user.totalXP}
                        nextLevelThreshold={user.nextLevelThreshold}
                        playerLevel={user.playerLevel}
                        variant="full"
                      />
                    </div>

                    {/* JorCoins in mobile menu */}
                    <Link
                      href="/bazar"
                      className="mt-4 flex items-center justify-between rounded-xl bg-yellow-100 p-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="font-medium text-yellow-800">Ir al Bazar</span>
                      <JorCoinDisplay
                        balance={user.jorCoins || 0}
                        showBazarButton={false}
                        variant="compact"
                      />
                    </Link>
                  </SheetContent>
                </Sheet>
              )}
            </>
          )}

          {!user && (
            <Link href="/auth">
              <Button className="bg-ocean-500 text-white hover:bg-ocean-600">Iniciar sesion</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
