"use client"

import Link from "next/link"
import { Compass, Map, User, Ship, Anchor, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ProgressCard } from "./progress-card"
import type { User as UserType } from "@/lib/types"

interface HomeProps {
  user: UserType | null
  loading?: boolean
  error?: string
  onRetry?: () => void
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 p-6">
      <Skeleton className="size-32 rounded-full" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-48 w-full max-w-md" />
    </div>
  )
}

function HomeError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-red-100">
        <Ship className="size-12 text-red-400" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-ocean-800">Tormenta a la vista!</h2>
        <p className="mt-2 text-ocean-600">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} className="bg-ocean-500 text-white hover:bg-ocean-600">
          Intentar de nuevo
        </Button>
      )}
    </div>
  )
}

export function Home({ user, loading, error, onRetry }: HomeProps) {
  if (loading) {
    return <HomeSkeleton />
  }

  if (error) {
    return <HomeError message={error} onRetry={onRetry} />
  }

  const hasProgress = user && user.currentWorld && user.totalXP > 0
  const isNewUser = user && !hasProgress

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8 md:py-12">
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-4 text-center" aria-labelledby="hero-title">
        {/* Jorc Illustration */}
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-ocean-200 opacity-50" />
          <div className="relative flex size-32 items-center justify-center rounded-full border-4 border-ocean-300 bg-ocean-500 shadow-lg md:size-40">
            <img
              src="/placeholder.svg?height=120&width=120"
              alt="Jorc el Pirata, tu guia de aventuras"
              className="size-24 md:size-32"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="max-w-md">
          <h1 id="hero-title" className="text-2xl font-bold text-ocean-800 md:text-3xl">
            {isNewUser
              ? "Ahoy, grumete!"
              : hasProgress
                ? `Bienvenido de vuelta, ${user.displayName}!`
                : "Ahoy, aventurero!"}
          </h1>
          <p className="mt-2 text-ocean-600">
            {isNewUser
              ? "Soy Jorc, capitan del Dargholl. Listo para tu primera aventura?"
              : hasProgress
                ? "Continuamos nuestra busqueda del tesoro?"
                : "Inicia sesion para comenzar tu aventura pirata"}
          </p>
        </div>

        {/* Primary CTA */}
        {user ? (
          <Link href={hasProgress && user.currentLevelId ? `/play/${user.currentLevelId}` : "/worlds"}>
            <Button
              size="lg"
              className="mt-2 gap-2 bg-gold-400 px-8 text-lg font-bold text-ocean-800 shadow-lg transition-all hover:bg-gold-600 hover:shadow-xl"
            >
              <Anchor className="size-5" />
              {hasProgress ? "Continuar aventura" : "Comenzar aventura!"}
            </Button>
          </Link>
        ) : (
          <Link href="/auth">
            <Button
              size="lg"
              className="mt-2 gap-2 bg-gold-400 px-8 text-lg font-bold text-ocean-800 shadow-lg transition-all hover:bg-gold-600 hover:shadow-xl"
            >
              <Ship className="size-5" />
              Unirme a la tripulacion
            </Button>
          </Link>
        )}
      </section>

      {/* Progress Card - only if user has progress */}
      {hasProgress && user && (
        <section aria-label="Tu progreso">
          <ProgressCard user={user} />
        </section>
      )}

      {/* Secondary Actions */}
      {user && (
        <section className="grid w-full max-w-lg grid-cols-4 gap-3" aria-label="Accesos rapidos">
          <Link href="/worlds" className="block">
            <Card className="border-2 border-ocean-200 bg-white/80 transition-all hover:border-ocean-400 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <Compass className="size-8 text-ocean-500" />
                <span className="text-center text-sm font-medium text-ocean-700">Islas</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/aprender" className="block">
            <Card className="border-2 border-gold-300 bg-gold-50/80 transition-all hover:border-gold-500 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <GraduationCap className="size-8 text-gold-600" />
                <span className="text-center text-sm font-medium text-gold-700">Academia</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/map" className="block">
            <Card className="border-2 border-ocean-200 bg-white/80 transition-all hover:border-ocean-400 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <Map className="size-8 text-ocean-500" />
                <span className="text-center text-sm font-medium text-ocean-700">Mapa</span>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile" className="block">
            <Card className="border-2 border-ocean-200 bg-white/80 transition-all hover:border-ocean-400 hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <User className="size-8 text-ocean-500" />
                <span className="text-center text-sm font-medium text-ocean-700">Perfil</span>
              </CardContent>
            </Card>
          </Link>
        </section>
      )}

      {/* Decorative waves */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ocean-200/50 to-transparent"
        aria-hidden="true"
      />
    </div>
  )
}
