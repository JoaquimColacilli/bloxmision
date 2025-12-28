"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, HelpCircle, Lightbulb, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ConceptsPanel } from "./concepts-panel"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

interface LearningSidebarProps {
  className?: string
  levelId?: string
}

export function LearningSidebar({ className, levelId }: LearningSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 border-ocean-300 bg-white/90 backdrop-blur hover:bg-ocean-50",
              // On mobile, make it a floating button
              "lg:relative lg:top-0 lg:right-0",
              "max-lg:fixed max-lg:right-4 max-lg:top-20 max-lg:z-40 max-lg:size-12 max-lg:rounded-full max-lg:p-0 max-lg:shadow-lg",
            )}
          >
            <GraduationCap className="size-4 lg:size-4 max-lg:size-5 text-ocean-600" />
            <span className="text-ocean-700 max-lg:sr-only">Aprender</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn("overflow-y-auto p-0", isDesktop ? "w-[400px]" : "h-[85vh] rounded-t-2xl")}
        >
          <SheetHeader className="sticky top-0 z-10 border-b border-ocean-200 bg-ocean-50 p-4">
            <SheetTitle className="flex items-center gap-2 text-ocean-800">
              <GraduationCap className="size-5" />
              Centro de Aprendizaje
            </SheetTitle>
          </SheetHeader>
          <LearningSidebarContent levelId={levelId} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function LearningSidebarContent({ levelId }: { levelId?: string }) {
  return (
    <div className="p-4 space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/guia"
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-ocean-200 bg-ocean-50 p-4 transition-all hover:border-ocean-400 hover:bg-ocean-100"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-ocean-200">
            <BookOpen className="size-6 text-ocean-600" />
          </div>
          <span className="text-sm font-medium text-ocean-700">Guia de Bloques</span>
          <span className="text-[10px] text-ocean-500 text-center">Ver todos los bloques disponibles</span>
        </Link>

        <Link
          href="/guia?category=control"
          className="flex flex-col items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 p-4 transition-all hover:border-orange-400 hover:bg-orange-100"
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-orange-200">
            <HelpCircle className="size-6 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-orange-700">Condicionales</span>
          <span className="text-[10px] text-orange-500 text-center">Aprende sobre Si y Sino</span>
        </Link>
      </div>

      {/* Concepts panel */}
      <ConceptsPanel />

      {/* Tips for current level */}
      {levelId && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-5 text-amber-600" />
            <span className="font-semibold text-amber-800">Tip para este nivel</span>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed">
            Observa las coordenadas del grid (los numeros en los bordes). Te ayudan a planear el camino de Jorc paso a
            paso. Por ejemplo, si Jorc esta en (0,0) y quieres llegar a (3,0), necesitas 3 bloques "Avanzar" hacia la
            derecha.
          </p>
        </div>
      )}

      {/* Coordinate explanation */}
      <div className="rounded-xl border border-ocean-200 bg-white p-4">
        <h4 className="font-semibold text-ocean-800 mb-2 flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded bg-ocean-100 text-xs font-bold text-ocean-600">
            XY
          </span>
          Como leer las coordenadas
        </h4>
        <div className="space-y-2 text-sm text-ocean-600">
          <p>
            <strong className="text-ocean-700">Columna (X):</strong> Los numeros de arriba. Van de izquierda a derecha
            (0, 1, 2, 3...)
          </p>
          <p>
            <strong className="text-ocean-700">Fila (Y):</strong> Los numeros del lado. Van de arriba a abajo (0, 1, 2,
            3...)
          </p>
          <p className="text-ocean-500 italic">Ejemplo: La posicion (2, 1) significa columna 2, fila 1</p>
        </div>

        {/* Mini visual example */}
        <div className="mt-3 flex justify-center">
          <div className="inline-block">
            <div className="flex text-[10px] text-ocean-400 mb-0.5">
              <div className="w-5" />
              <div className="w-6 text-center">0</div>
              <div className="w-6 text-center">1</div>
              <div className="w-6 text-center font-bold text-ocean-600">2</div>
            </div>
            <div className="flex items-center">
              <div className="w-5 text-[10px] text-ocean-400 text-center">0</div>
              <div className="grid grid-cols-3 gap-0.5">
                <div className="size-6 rounded bg-green-200" />
                <div className="size-6 rounded bg-green-200" />
                <div className="size-6 rounded bg-green-200" />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-5 text-[10px] text-ocean-400 text-center font-bold text-ocean-600">1</div>
              <div className="grid grid-cols-3 gap-0.5">
                <div className="size-6 rounded bg-green-200" />
                <div className="size-6 rounded bg-green-200" />
                <div className="size-6 rounded bg-ocean-400 flex items-center justify-center text-[10px]">🏴‍☠️</div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-[10px] text-ocean-500 mt-2">Jorc esta en la posicion (2, 1)</p>
      </div>
    </div>
  )
}
