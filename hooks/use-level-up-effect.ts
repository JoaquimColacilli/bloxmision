"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { PlayerLevel } from "@/lib/types/player-level";
import { isLevelUp, isValidPlayerLevel } from "@/lib/types/player-level";

interface LevelUpEvent {
    oldLevel: PlayerLevel;
    newLevel: PlayerLevel;
}

interface UseLevelUpEffectReturn {
    levelUpEvent: LevelUpEvent | null;
    dismissLevelUp: () => void;
}

/**
 * Hook to detect level-up events and trigger the toast
 * @param currentLevel - The current player level
 * @returns Object with levelUpEvent and dismiss function
 */
export function useLevelUpEffect(currentLevel: PlayerLevel | string | undefined): UseLevelUpEffectReturn {
    const previousLevelRef = useRef<PlayerLevel | null>(null);
    const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEvent | null>(null);

    useEffect(() => {
        // Skip if no valid level
        if (!currentLevel || !isValidPlayerLevel(currentLevel)) {
            return;
        }

        const validCurrentLevel = currentLevel as PlayerLevel;

        // First mount - just store the level
        if (previousLevelRef.current === null) {
            previousLevelRef.current = validCurrentLevel;
            return;
        }

        // Check for level up
        if (isLevelUp(previousLevelRef.current, validCurrentLevel)) {
            setLevelUpEvent({
                oldLevel: previousLevelRef.current,
                newLevel: validCurrentLevel,
            });
        }

        previousLevelRef.current = validCurrentLevel;
    }, [currentLevel]);

    const dismissLevelUp = useCallback(() => {
        setLevelUpEvent(null);
    }, []);

    return { levelUpEvent, dismissLevelUp };
}
