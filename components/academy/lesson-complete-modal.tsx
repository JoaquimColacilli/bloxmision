"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Star, ArrowRight, RotateCcw } from "lucide-react" // Removed Coins
import { cn } from "@/lib/utils"
// import { Coins } from "lucide-react" // Import conflict fix

interface LessonCompleteModalProps {
    open: boolean
    stars: number // 0 to 3
    coinsEarned: number // 15 or 0
    onNext: () => void
    onReplay: () => void
}

export function LessonCompleteModal({
    open,
    stars,
    coinsEarned,
    onNext,
    onReplay
}: LessonCompleteModalProps) {

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md bg-white border-ocean-100">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-ocean-900">
                        ¡Lección Completada!
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {/* Stars Animation */}
                    <div className="flex gap-2">
                        {[1, 2, 3].map((starIdx) => (
                            <div key={starIdx} className="relative">
                                <Star
                                    className={cn(
                                        "size-12 transition-all duration-700",
                                        starIdx <= stars
                                            ? "fill-yellow-400 text-yellow-500 scale-110 drop-shadow-md"
                                            : "fill-gray-100 text-gray-300"
                                    )}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 font-medium">
                            {stars === 3 ? "¡Perfecto!" : stars === 2 ? "¡Muy bien!" : "¡Bien hecho!"}
                        </p>
                        {coinsEarned > 0 ? (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-1 text-yellow-800 font-bold border border-yellow-200">
                                {/* <Coins className="size-4" />  Conflict fix manually */}
                                <span>+{coinsEarned} JorCoins</span>
                            </div>
                        ) : (
                            <p className="mt-2 text-xs text-gray-400">(Recompensa ya reclamada)</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="sm:justify-center gap-2">
                    <Button variant="outline" onClick={onReplay}>
                        <RotateCcw className="mr-2 size-4" /> Reintentar
                    </Button>
                    <Button onClick={onNext} className="bg-ocean-600 hover:bg-ocean-700">
                        Siguiente Lección <ArrowRight className="ml-2 size-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
