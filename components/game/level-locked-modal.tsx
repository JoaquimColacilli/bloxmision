"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock, Map, Play } from "lucide-react"
import { useRouter } from "next/navigation"

interface LevelLockedModalProps {
    isOpen: boolean
    worldNumericId: string
    maxUnlockedLevel: number
}

export function LevelLockedModal({
    isOpen,
    worldNumericId,
    maxUnlockedLevel,
}: LevelLockedModalProps) {
    const router = useRouter()

    const handleGoToMap = () => {
        router.push("/map")
    }

    const handleGoToLastLevel = () => {
        router.push(`/play/${worldNumericId}-${maxUnlockedLevel}`)
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="max-w-sm text-center" onPointerDownOutside={(e) => e.preventDefault()}>
                <DialogHeader className="space-y-4">
                    <div className="flex justify-center">
                        <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-lg">
                            <Lock className="size-10 text-amber-800" />
                        </div>
                    </div>

                    <DialogTitle className="text-2xl font-bold text-ocean-800">
                        ¡Alto ahí, grumete!
                    </DialogTitle>

                    <DialogDescription className="text-ocean-600">
                        Aún no has llegado a estas aguas. ¡Completa los niveles anteriores primero!
                    </DialogDescription>

                    <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                        <span className="text-lg">🏴‍☠️</span>
                        Un verdadero pirata sigue el camino paso a paso
                    </div>
                </DialogHeader>

                {/* Actions */}
                <div className="mt-6 flex flex-col gap-3">
                    <Button
                        onClick={handleGoToLastLevel}
                        className="w-full gap-2 bg-ocean-600 hover:bg-ocean-700"
                    >
                        <Play className="size-4" />
                        Ir a mi último nivel ({worldNumericId}-{maxUnlockedLevel})
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleGoToMap}
                        className="w-full gap-2"
                    >
                        <Map className="size-4" />
                        Volver al mapa
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
