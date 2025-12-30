"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { PlayerLevel } from "@/lib/types/player-level";
import { getRankIconPath } from "@/lib/types/player-level";

interface LevelUpToastProps {
    newLevel: PlayerLevel;
    isVisible: boolean;
    onDismiss: () => void;
    duration?: number; // Auto-dismiss duration in ms
}

// Check for reduced motion preference
function usePrefersReducedMotion(): boolean {
    const [prefersReduced, setPrefersReduced] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReduced(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return prefersReduced;
}

export function LevelUpToast({
    newLevel,
    isVisible,
    onDismiss,
    duration = 2500,
}: LevelUpToastProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const iconPath = getRankIconPath(newLevel);

    // Auto-dismiss timer
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onDismiss]);

    // Animation variants
    const containerVariants = prefersReducedMotion
        ? {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
        }
        : {
            hidden: { opacity: 0, y: -50, scale: 0.8 },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                    type: "spring" as const,
                    stiffness: 300,
                    damping: 20,
                },
            },
            exit: {
                opacity: 0,
                y: -30,
                scale: 0.9,
                transition: { duration: 0.2 },
            },
        };

    const iconVariants = prefersReducedMotion
        ? undefined
        : {
            initial: { rotate: -10, scale: 0.5 },
            animate: {
                rotate: 0,
                scale: 1,
                transition: {
                    type: "spring" as const,
                    stiffness: 400,
                    damping: 15,
                    delay: 0.1,
                },
            },
        };

    const glowVariants = prefersReducedMotion
        ? undefined
        : {
            animate: {
                boxShadow: [
                    "0 0 10px rgba(255, 215, 0, 0.3)",
                    "0 0 25px rgba(255, 215, 0, 0.6)",
                    "0 0 10px rgba(255, 215, 0, 0.3)",
                ],
                transition: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut" as const,
                },
            },
        };

    // Sparkle positions for pixel-style effect
    const sparkles = [
        { x: -20, y: -15, delay: 0 },
        { x: 25, y: -10, delay: 0.2 },
        { x: -15, y: 20, delay: 0.4 },
        { x: 20, y: 15, delay: 0.3 },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed top-6 left-1/2 z-[100] -translate-x-1/2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        className="relative flex items-center gap-4 rounded-xl border-2 border-gold-400 bg-gradient-to-r from-amber-900/95 via-amber-800/95 to-amber-900/95 px-6 py-4 shadow-2xl backdrop-blur-sm"
                        variants={glowVariants}
                        animate={glowVariants ? "animate" : undefined}
                    >
                        {/* Pixel sparkles */}
                        {!prefersReducedMotion &&
                            sparkles.map((sparkle, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute h-2 w-2 rounded-sm bg-gold-300"
                                    style={{ left: `calc(50% + ${sparkle.x}px)`, top: `calc(50% + ${sparkle.y}px)` }}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0, 1, 0],
                                        scale: [0, 1.2, 0],
                                    }}
                                    transition={{
                                        duration: 0.8,
                                        delay: sparkle.delay,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }}
                                />
                            ))}

                        {/* Rank icon */}
                        <motion.div
                            className="relative h-16 w-16 shrink-0"
                            initial={iconVariants?.initial}
                            animate={iconVariants?.animate}
                        >
                            <Image
                                src={iconPath}
                                alt={`Rango: ${newLevel}`}
                                fill
                                className="object-contain drop-shadow-lg"
                                style={{ imageRendering: "pixelated" }}
                                priority
                            />
                        </motion.div>

                        {/* Text content */}
                        <div className="flex flex-col">
                            <motion.span
                                className="text-sm font-medium text-gold-300"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                ¡Subiste de nivel!
                            </motion.span>
                            <motion.span
                                className="text-xl font-bold text-white"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                {newLevel}
                            </motion.span>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onDismiss}
                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-xs text-amber-200 shadow-md transition-colors hover:bg-amber-600"
                            aria-label="Cerrar"
                        >
                            ✕
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LevelUpToast;
