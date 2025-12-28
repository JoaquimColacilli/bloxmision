"use client"

import { Ship } from "lucide-react"

export function GlobalLoader() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-ocean-100"
      role="status"
      aria-live="polite"
      aria-label="Cargando aplicación"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-ocean-400 opacity-30" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-ocean-500">
          <Ship className="size-10 animate-bounce text-gold-400" />
        </div>
      </div>
      <p className="text-lg font-medium text-ocean-700">Cargando el barco...</p>
      <span className="sr-only">Por favor espera mientras cargamos tu aventura</span>
    </div>
  )
}
