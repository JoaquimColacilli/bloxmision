"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { ChevronDown, ChevronRight, Move, Zap, RefreshCw, HelpCircle, Lightbulb, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface Concept {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  shortDescription: string
  fullDescription: string
  example: {
    title: string
    code: string[]
    explanation: string
  }
  tips: string[]
  relatedConcepts: string[]
}

const programmingConcepts: Concept[] = [
  {
    id: "sequence",
    title: "Secuencia",
    icon: <Move className="size-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    shortDescription: "Los bloques se ejecutan uno tras otro, en orden",
    fullDescription:
      "Una secuencia es como seguir una receta de cocina: primero haces el paso 1, luego el paso 2, y asi sucesivamente. En programacion, tus bloques de codigo se ejecutan en el orden exacto en que los colocas.",
    example: {
      title: "Mover a Jorc 3 pasos",
      code: ["Avanzar", "Avanzar", "Avanzar"],
      explanation:
        "Jorc avanza una casilla, luego otra, y finalmente una tercera. Los bloques se ejecutan de arriba a abajo.",
    },
    tips: [
      "El orden de los bloques importa mucho",
      "Piensa paso a paso que debe hacer Jorc",
      "Si algo sale mal, revisa el orden de tus bloques",
    ],
    relatedConcepts: ["loops", "conditionals"],
  },
  {
    id: "loops",
    title: "Bucles (Repetir)",
    icon: <RefreshCw className="size-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    shortDescription: "Repite acciones varias veces sin escribirlas todas",
    fullDescription:
      "Un bucle es como cuando cantas el coro de una cancion varias veces. En vez de escribir 'Avanzar' 5 veces, puedes decir 'Repetir 5 veces: Avanzar'. Esto hace tu codigo mas corto y facil de entender!",
    example: {
      title: "Avanzar 5 casillas",
      code: ["Repetir 5 veces:", "  Avanzar"],
      explanation: "En vez de 5 bloques 'Avanzar', usamos solo 2 bloques. Jorc avanzara 5 casillas igual!",
    },
    tips: [
      "Usa bucles cuando repitas lo mismo varias veces",
      "Los bucles hacen tu codigo mas corto",
      "Puedes poner varios bloques dentro de un bucle",
    ],
    relatedConcepts: ["sequence", "conditionals"],
  },
  {
    id: "conditionals",
    title: "Condicionales (Si...)",
    icon: <HelpCircle className="size-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    shortDescription: "Toma decisiones basadas en lo que ve Jorc",
    fullDescription:
      "Un condicional es como preguntar antes de actuar. Por ejemplo: 'SI hay un obstaculo adelante, ENTONCES gira a la derecha'. Jorc puede 'ver' su alrededor y decidir que hacer segun lo que encuentre.",
    example: {
      title: "Evitar obstaculos",
      code: ["Si hay obstaculo:", "  Girar derecha", "Sino:", "  Avanzar"],
      explanation: "Jorc revisa si hay algo adelante. Si lo hay, gira. Si no hay nada, avanza. Muy listo!",
    },
    tips: [
      "Usa 'Si' para que Jorc tome decisiones",
      "Combina 'Si' con sensores como 'Hay obstaculo?'",
      "'Si-Sino' te da dos opciones diferentes",
    ],
    relatedConcepts: ["sequence", "loops", "sensors"],
  },
  {
    id: "sensors",
    title: "Sensores",
    icon: <Zap className="size-5" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    shortDescription: "Jorc puede 'ver' y detectar cosas a su alrededor",
    fullDescription:
      "Los sensores son como los ojos de Jorc. Puede detectar si hay un obstaculo adelante, si esta tocando una pared, o si hay un cofre cerca. Los sensores responden 'Si' o 'No' y los usas con los bloques 'Si'.",
    example: {
      title: "Detectar cofre",
      code: ["Si hay cofre:", "  Abrir cofre"],
      explanation: "El sensor 'hay cofre?' revisa adelante de Jorc. Si encuentra uno, devuelve 'Si' y Jorc lo abre!",
    },
    tips: [
      "Los sensores siempre responden Si o No",
      "Usalos dentro de bloques 'Si' o 'Repetir hasta'",
      "Hay sensores para obstaculos, cofres, paredes y mas",
    ],
    relatedConcepts: ["conditionals"],
  },
]

interface ConceptsPanelProps {
  className?: string
  compact?: boolean
}

export function ConceptsPanel({ className, compact = false }: ConceptsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [modalConcept, setModalConcept] = useState<Concept | null>(null)

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const openModal = useCallback((concept: Concept) => {
    setModalConcept(concept)
  }, [])

  const closeModal = useCallback(() => {
    setModalConcept(null)
  }, [])

  if (compact) {
    return (
      <>
        <div className={cn("flex flex-wrap gap-2", className)}>
          {programmingConcepts.map((concept) => (
            <button
              key={concept.id}
              onClick={() => openModal(concept)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ocean-400",
                concept.bgColor,
                concept.color,
              )}
            >
              {concept.icon}
              {concept.title}
            </button>
          ))}
        </div>
        <ConceptModal concept={modalConcept} onClose={closeModal} />
      </>
    )
  }

  return (
    <>
      <div className={cn("rounded-lg border border-ocean-200 bg-white overflow-hidden", className)}>
        <div className="flex items-center gap-2 border-b border-ocean-100 bg-ocean-50 px-4 py-3">
          <BookOpen className="size-5 text-ocean-600" />
          <h3 className="font-semibold text-ocean-800">Conceptos de Programacion</h3>
        </div>

        <div className="divide-y divide-ocean-100">
          {programmingConcepts.map((concept) => {
            const isExpanded = expandedId === concept.id

            return (
              <div key={concept.id}>
                <button
                  onClick={() => toggleExpand(concept.id)}
                  className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-ocean-50"
                  aria-expanded={isExpanded}
                >
                  <div className={cn("flex size-10 items-center justify-center rounded-lg", concept.bgColor)}>
                    <span className={concept.color}>{concept.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ocean-800">{concept.title}</p>
                    <p className="text-xs text-ocean-500 truncate">{concept.shortDescription}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-ocean-400 shrink-0" />
                  ) : (
                    <ChevronRight className="size-5 text-ocean-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-ocean-100 bg-ocean-50/50 px-4 py-3 space-y-3">
                    <p className="text-sm text-ocean-700 leading-relaxed">{concept.fullDescription}</p>

                    {/* Example */}
                    <div className="rounded-lg border border-ocean-200 bg-white p-3">
                      <p className="text-xs font-semibold text-ocean-600 mb-2">Ejemplo: {concept.example.title}</p>
                      <div className="font-mono text-xs bg-ocean-900 text-ocean-100 rounded p-2 space-y-0.5">
                        {concept.example.code.map((line, i) => (
                          <div key={i} className={line.startsWith("  ") ? "pl-4" : ""}>
                            {line}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-ocean-600 italic">{concept.example.explanation}</p>
                    </div>

                    {/* Tips */}
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <Lightbulb className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <ul className="space-y-1">
                        {concept.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-amber-800">
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => openModal(concept)} className="w-full">
                      Ver mas detalles
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <ConceptModal concept={modalConcept} onClose={closeModal} />
    </>
  )
}

interface ConceptModalProps {
  concept: Concept | null
  onClose: () => void
}

function ConceptModal({ concept, onClose }: ConceptModalProps) {
  if (!concept) return null

  return (
    <Dialog open={!!concept} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("flex size-12 items-center justify-center rounded-xl", concept.bgColor)}>
              <span className={cn("scale-125", concept.color)}>{concept.icon}</span>
            </div>
            <div>
              <DialogTitle className="text-xl">{concept.title}</DialogTitle>
              <DialogDescription className="text-ocean-600">{concept.shortDescription}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <p className="text-base leading-relaxed text-ocean-700">{concept.fullDescription}</p>

          {/* Visual example */}
          <div className="rounded-xl border-2 border-ocean-200 bg-gradient-to-br from-ocean-50 to-white p-4">
            <p className="text-sm font-bold text-ocean-700 mb-3 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-ocean-200 text-xs">1</span>
              Ejemplo: {concept.example.title}
            </p>
            <div className="font-mono text-sm bg-ocean-900 text-ocean-100 rounded-lg p-4 space-y-1">
              {concept.example.code.map((line, i) => (
                <div key={i} className={cn(line.startsWith("  ") ? "pl-6 text-ocean-300" : "text-white font-semibold")}>
                  {line}
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-ocean-600 bg-ocean-100 rounded-lg p-3 italic">
              {concept.example.explanation}
            </p>
          </div>

          {/* Tips section */}
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="size-5 text-amber-600" />
              <span className="font-bold text-amber-800">Consejos importantes:</span>
            </div>
            <ul className="space-y-2">
              {concept.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="mt-1 size-1.5 rounded-full bg-amber-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Related concepts */}
          {concept.relatedConcepts.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-ocean-700 mb-2">Conceptos relacionados:</p>
              <div className="flex flex-wrap gap-2">
                {concept.relatedConcepts.map((relatedId) => {
                  const related = programmingConcepts.find((c) => c.id === relatedId)
                  if (!related) return null
                  return (
                    <span
                      key={relatedId}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                        related.bgColor,
                        related.color,
                      )}
                    >
                      {related.icon}
                      {related.title}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { programmingConcepts }
export type { Concept }
