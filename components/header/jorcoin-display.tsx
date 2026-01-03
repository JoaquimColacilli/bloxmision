"use client"

import { cn } from "@/lib/utils"
import { Store } from "lucide-react"
import Link from "next/link"

interface JorCoinDisplayProps {
    balance: number
    showBazarButton?: boolean
    variant?: "full" | "compact"
    className?: string
}

/**
 * JorCoin Balance Display
 * Shows the user's current JorCoins balance with a golden coin icon.
 * Optionally shows a button to go to the Bazar.
 */
export function JorCoinDisplay({
    balance,
    showBazarButton = true,
    variant = "full",
    className
}: JorCoinDisplayProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            {/* JorCoin Balance */}
            <div className="flex items-center gap-1.5">
                {/* Golden Coin Icon */}
                <div className="relative size-5 shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-sm" />
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-yellow-800 drop-shadow-sm">J</span>
                    </div>
                </div>

                {/* Balance Number */}
                <span className={cn(
                    "font-semibold tabular-nums",
                    variant === "full" ? "text-sm" : "text-xs",
                    "text-yellow-700"
                )}>
                    {balance.toLocaleString()}
                </span>
            </div>

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
    )
}

/**
 * JorCoin Icon Only (for compact displays)
 */
export function JorCoinIcon({ className }: { className?: string }) {
    return (
        <div className={cn("relative size-5", className)}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-sm" />
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500" />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold text-yellow-800 drop-shadow-sm">J</span>
            </div>
        </div>
    )
}
