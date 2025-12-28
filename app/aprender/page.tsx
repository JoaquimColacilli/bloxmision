"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { BookOpen, Repeat, GitBranch, Search, GraduationCap, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LessonCard } from "@/components/academy/lesson-card"
import { useAcademy } from "@/contexts/academy-context"
import { basicLessons, loopLessons, conditionalLessons, glossary, isLessonUnlocked } from "@/lib/lessons-data"

function AcademyContent() {
  const { progress, isLessonCompleted } = useAcademy()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("lecciones")

  const completedWorlds = 1 // Mock - would come from user progress

  const filteredGlossary = Object.entries(glossary).reduce(
    (acc, [letter, terms]) => {
      const filtered = terms.filter(
        (term) =>
          term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
          term.definition.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      if (filtered.length > 0) {
        acc[letter] = filtered
      }
      return acc
    },
    {} as typeof glossary,
  )

  const totalLessons = basicLessons.length + loopLessons.length + conditionalLessons.length
  const completedCount = progress.completedLessons.length
  const progressPercent = Math.round((completedCount / totalLessons) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50">
      {/* Header */}
      <header className="border-b border-ocean-200 bg-white/80 px-4 py-6 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-ocean-500">
                <GraduationCap className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ocean-900">Academia Pirata</h1>
                <p className="text-sm text-gray-600">Aprende a programar con Jorc</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">Volver al juego</Button>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {completedCount} de {totalLessons} lecciones completadas
              </span>
              <span className="font-semibold text-ocean-600">{progressPercent}%</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-ocean-400 to-ocean-600 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-4xl p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lecciones" className="gap-2">
              <BookOpen className="size-4" />
              Lecciones
            </TabsTrigger>
            <TabsTrigger value="glosario" className="gap-2">
              <Search className="size-4" />
              Glosario
            </TabsTrigger>
          </TabsList>

          {/* Lecciones Tab */}
          <TabsContent value="lecciones" className="mt-6 space-y-8">
            {/* Conceptos Basicos */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="size-5 text-ocean-600" />
                <h2 className="text-xl font-bold text-gray-800">Conceptos Basicos</h2>
                <span className="rounded-full bg-ocean-100 px-2 py-0.5 text-xs text-ocean-700">
                  Siempre disponibles
                </span>
              </div>
              <div className="space-y-3">
                {basicLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isUnlocked={isLessonUnlocked(lesson, progress.completedLessons, completedWorlds)}
                    isCompleted={isLessonCompleted(lesson.id)}
                  />
                ))}
              </div>
            </section>

            {/* Bucles */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Repeat className="size-5 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-800">Bucles (Repetir)</h2>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">Isla Bucle</span>
              </div>
              <div className="space-y-3">
                {loopLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isUnlocked={isLessonUnlocked(lesson, progress.completedLessons, completedWorlds)}
                    isCompleted={isLessonCompleted(lesson.id)}
                  />
                ))}
              </div>
            </section>

            {/* Condicionales */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <GitBranch className="size-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Condicionales (Si...)</h2>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">Isla Decision</span>
              </div>
              <div className="space-y-3">
                {conditionalLessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    isUnlocked={isLessonUnlocked(lesson, progress.completedLessons, completedWorlds)}
                    isCompleted={isLessonCompleted(lesson.id)}
                  />
                ))}
              </div>
            </section>

            {/* Badges */}
            {progress.badges.length > 0 && (
              <section className="rounded-xl bg-gold-50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Trophy className="size-5 text-gold-600" />
                  <h2 className="text-xl font-bold text-gold-800">Tus Insignias</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {progress.badges.map((badge) => (
                    <div key={badge} className="flex items-center gap-2 rounded-full bg-gold-200 px-4 py-2">
                      <Trophy className="size-4 text-gold-700" />
                      <span className="text-sm font-medium text-gold-800">{badge}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Glosario Tab */}
          <TabsContent value="glosario" className="mt-6">
            <div className="mb-4">
              <Input
                placeholder="Buscar termino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="space-y-6">
              {Object.entries(filteredGlossary).map(([letter, terms]) => (
                <div key={letter}>
                  <h3 className="mb-3 text-2xl font-bold text-ocean-600">{letter}</h3>
                  <div className="space-y-3">
                    {terms.map((term) => (
                      <div key={term.term} className="rounded-lg border border-gray-200 bg-white p-4">
                        <h4 className="text-lg font-bold text-gray-800">{term.term}</h4>
                        <p className="mt-1 text-gray-600">{term.definition}</p>
                        <div className="mt-2 rounded bg-ocean-50 p-2">
                          <span className="text-xs font-semibold text-ocean-700">Ejemplo: </span>
                          <span className="text-sm text-ocean-800">{term.example}</span>
                        </div>
                        {term.relatedTerms.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500">Relacionado:</span>
                            {term.relatedTerms.map((related) => (
                              <span key={related} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                {related}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(filteredGlossary).length === 0 && (
                <p className="py-8 text-center text-gray-500">No se encontraron terminos</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function AcademyPage() {
  return (
    <Suspense fallback={null}>
      <AcademyContent />
    </Suspense>
  )
}
