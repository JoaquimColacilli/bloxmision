"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Store, HelpCircle, Coins, Star, Flame, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface JorCoinDisplayProps {
    balance: number
    totalEarned?: number
    totalSpent?: number
    showBazarButton?: boolean
    variant?: "full" | "compact"
    className?: string
}

/**
 * JorCoin Balance Display
 * Shows the user's current JorCoins balance with a golden coin icon.
 * Clicking opens an info modal with balance details.
 */
export function JorCoinDisplay({
    balance,
    totalEarned = 0,
    totalSpent = 0,
    showBazarButton = true,
    variant = "full",
    className
}: JorCoinDisplayProps) {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <>
            <div className={cn("flex items-center gap-2", className)}>
                {/* JorCoin Balance - Clickable */}
                <button
                    onClick={() => setModalOpen(true)}
                    className={cn(
                        "flex items-center gap-1.5 rounded-md px-2 py-1 transition-all",
                        "hover:bg-yellow-100 hover:scale-105 cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
                    )}
                    aria-label="Ver información de JorCoins"
                >
                    {/* Golden Coin Icon */}
                    <Image
                        src="/sprites/bazar/efectos/jorcoin.png"
                        alt="JorCoin"
                        width={20}
                        height={20}
                        className="shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                    />

                    {/* Balance Number */}
                    <span className={cn(
                        "font-semibold tabular-nums",
                        variant === "full" ? "text-sm" : "text-xs",
                        "text-yellow-700"
                    )}>
                        {balance.toLocaleString()}
                    </span>

                    {/* Info hint icon */}
                    <HelpCircle className="size-3 text-yellow-600/60" />
                </button>

                {/* Bazar Button */}
                {showBazarButton && variant === "full" && (
                    <Link
                        href="/bazar"
                        className={cn(
                            "flex items-center gap-1.5 rounded-md px-2 py-1",
                            "text-xs font-medium text-ocean-600",
                            "bg-ocean-50 hover:bg-ocean-100 transition-colors",
                            "border border-ocean-200"
                        )}
                    >
                        <Store className="size-3.5" />
                        <span className="hidden sm:inline">Bazar</span>
                    </Link>
                )}
            </div>

            {/* Info Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <JorCoinIconLarge />
                            JorCoins
                        </DialogTitle>
                        <DialogDescription>
                            Tu moneda pirata para comprar items en el Bazar
                        </DialogDescription>
                    </DialogHeader>

                    {/* Balance Display */}
                    <div className="my-6 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 p-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-yellow-700 mb-2">Tu tesoro actual</p>
                            <div className="flex items-center justify-center gap-3">
                                <JorCoinIconLarge size="lg" />
                                <span className="text-5xl font-bold text-yellow-800">
                                    {balance.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Stats */}
                        {(totalEarned > 0 || totalSpent > 0) && (
                            <div className="mt-4 pt-4 border-t border-yellow-300/50 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-yellow-600">Total ganados</p>
                                    <p className="text-lg font-bold text-green-600">+{totalEarned.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-600">Total gastados</p>
                                    <p className="text-lg font-bold text-red-500">-{totalSpent.toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* How to earn */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-ocean-900 flex items-center gap-2">
                            <Coins className="size-4 text-yellow-500" />
                            ¿Cómo ganar JorCoins?
                        </h4>
                        <ul className="space-y-2 text-sm text-ocean-700">
                            <li className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Star className="size-3 text-blue-500" />
                                </div>
                                <span>Completar niveles: <strong className="text-yellow-700">+10</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                    <Trophy className="size-3 text-yellow-500" />
                                </div>
                                <span>Código óptimo (3⭐): <strong className="text-yellow-700">+5 extra</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-green-100 flex items-center justify-center">
                                    <HelpCircle className="size-3 text-green-500" />
                                </div>
                                <span>Sin usar pistas: <strong className="text-yellow-700">+3 extra</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Flame className="size-3 text-purple-500" />
                                </div>
                                <span>Fragmento de mapa: <strong className="text-yellow-700">+10 extra</strong></span>
                            </li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex gap-3">
                        <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                            Cerrar
                        </Button>
                        <Link href="/bazar" className="flex-1">
                            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900">
                                <Store className="size-4 mr-2" />
                                Ir al Bazar
                            </Button>
                        </Link>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

/**
 * JorCoin Icon - Large version for modals
 */
function JorCoinIconLarge({ size = "md" }: { size?: "md" | "lg" }) {
    const sizePixels = size === "lg" ? 48 : 32

    return (
        <Image
            src="/sprites/bazar/efectos/jorcoin.png"
            alt="JorCoin"
            width={sizePixels}
            height={sizePixels}
            className="shrink-0"
            style={{ imageRendering: 'pixelated' }}
        />
    )
}

/**
 * JorCoin Icon Only (for compact displays)
 */
export function JorCoinIcon({ className }: { className?: string }) {
    return (
        <Image
            src="/sprites/bazar/efectos/jorcoin.png"
            alt="JorCoin"
            width={20}
            height={20}
            className={cn("shrink-0", className)}
            style={{ imageRendering: 'pixelated' }}
        />
    )
}
