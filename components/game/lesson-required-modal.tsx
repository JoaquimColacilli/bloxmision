"use client"

import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { GraduationCap, Map } from "lucide-react"
import { getLessonById } from "@/lib/lessons-data"

interface LessonRequiredModalProps {
    isOpen: boolean
    missingLessonId: string | null
    reason?: string
}

export function LessonRequiredModal({ isOpen, missingLessonId, reason }: LessonRequiredModalProps) {
    const router = useRouter()

    if (!missingLessonId) return null

    const lesson = getLessonById(missingLessonId)

    // Hard Gating: No onClose prop strictly provided to Dialog to prevent casual dismissal,
    // though pointer-events might still allow it unless we controlled it strictly. 
    // We use `onPointerDownOutside={(e) => e.preventDefault()}` to enforce interaction.

    return (
        <Dialog open={isOpen}>
            <DialogContent
                className="max-w-md border-purple-500/50 bg-slate-900 text-white sm:rounded-xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="items-center text-center">
                    <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-purple-500/20 ring-1 ring-purple-500/50">
                        <GraduationCap className="size-10 text-purple-400" />
                    </div>

                    <DialogTitle className="text-2xl font-bold text-purple-100">
                        ¡A la Academia, grumete!
                    </DialogTitle>

                    <DialogDescription className="mt-2 text-center text-base text-slate-300">
                        {reason || "Para navegar estas aguas necesitás aprender nuevos trucos."}
                    </DialogDescription>
                </DialogHeader>

                <div className="my-4 rounded-lg bg-slate-950/50 p-4 border border-slate-800">
                    <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-purple-400">
                        Lección Requerida
                    </h4>
                    <p className="text-lg font-bold text-white">
                        {lesson?.title || "Lección Especial"}
                    </p>
                    <p className="text-sm text-slate-400">
                        {lesson?.description || "Aprende el concepto necesario para pasar este nivel."}
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        size="lg"
                        className="w-full bg-purple-600 font-bold text-white hover:bg-purple-500"
                        onClick={() => router.push(`/aprender/leccion/${missingLessonId}`)}
                    >
                        Ir a la Lección
                    </Button>

                    {/* Solo mostramos "Volver" si NO es Onboarding (porque onboarding es root requirement) 
              Pero si es 1-1 y pide onboarding, volver al mapa no sirve de mucho si todo está bloqueado.
              Aun así, permitimos volver al mapa por UX general, salvo que sea onboarding crítico. */}
                    {missingLessonId !== "onboarding" && (
                        <Button
                            variant="outline"
                            className="w-full border-slate-700 bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
                            onClick={() => router.push("/worlds")}
                        >
                            <Map className="mr-2 size-4" />
                            Volver al Mapa
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
