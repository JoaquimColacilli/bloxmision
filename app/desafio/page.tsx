"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WordleGame } from "@/components/wordle/wordle-game"
import { useAuth } from "@/contexts/auth-context"

function DesafioContent() {
    const { user, loading: authLoading } = useAuth()

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-slate-500">Cargando...</div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-4">
                <Trophy className="size-16 text-ocean-300" />
                <h2 className="text-xl font-bold text-slate-700">Iniciá sesión para jugar</h2>
                <p className="text-slate-500 max-w-sm">
                    Necesitás una cuenta para guardar tu progreso y ganar JorCoins.
                </p>
                <Link href="/login">
                    <Button className="bg-ocean-600 hover:bg-ocean-700">
                        Iniciar sesión
                    </Button>
                </Link>
            </div>
        )
    }

    return <WordleGame userId={user.id} />
}

export default function DesafioPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50">
            {/* Header */}
            <header className="border-b border-ocean-200 bg-white/80 px-4 py-4 backdrop-blur-sm sticky top-0 z-10">
                <div className="mx-auto max-w-lg flex items-center justify-between">
                    <Link href="/" className="text-slate-500 hover:text-slate-700 transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>

                    <div className="text-center">
                        <h1 className="text-lg font-bold text-ocean-800 flex items-center gap-2">
                            🏴‍☠️ Desafío Diario
                        </h1>
                        <p className="text-xs text-slate-500">Adivina la palabra tech</p>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600">
                        <HelpCircle className="size-5" />
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="mx-auto max-w-lg px-4 py-6">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="animate-pulse text-slate-500">Cargando...</div>
                    </div>
                }>
                    <DesafioContent />
                </Suspense>
            </main>

            {/* Footer hint */}
            <footer className="text-center py-4 text-xs text-slate-400">
                <p>Palabras relacionadas a desarrollo, sistemas e infra</p>
            </footer>
        </div>
    )
}
