'use client';

import { useState, useRef, useCallback } from 'react';
import { BlockEngine, StepEvent, GameState } from '../lib/game/blockEngine';
import type { Block, Level } from '@/src/types';

export function useBlockEngine(level: Level | null) {
    const [isRunning, setIsRunning] = useState(false);
    const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null);
    const [error, setError] = useState<{ message: string; blockIndex: number } | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);

    const engineRef = useRef<BlockEngine | null>(null);

    const run = useCallback(async (
        blocks: Block[],
        onStepCallback?: (event: StepEvent) => void,
        onCompleteCallback?: (state: GameState) => void
    ) => {
        if (!level) return;

        setIsRunning(true);
        setError(null);
        setCurrentBlockIndex(null);

        const engine = new BlockEngine(level);
        engineRef.current = engine;

        // Set initial state
        setGameState(engine.getState());

        await engine.executeBlocks(
            blocks,
            async (event, blockIndex) => {
                setCurrentBlockIndex(blockIndex);
                setGameState(engine.getState());
                onStepCallback?.(event);
            },
            (finalState) => {
                setIsRunning(false);
                setCurrentBlockIndex(null);
                setGameState(finalState);
                onCompleteCallback?.(finalState);
            },
            (err) => {
                setIsRunning(false);
                setCurrentBlockIndex(null);
                setError(err);
            }
        );
    }, [level]);

    const stop = useCallback(() => {
        engineRef.current?.abort();
        setIsRunning(false);
        setCurrentBlockIndex(null);
    }, []);

    const reset = useCallback(() => {
        if (!level) return;

        setIsRunning(false);
        setCurrentBlockIndex(null);
        setError(null);
        setGameState({
            position: { ...level.startPosition },
            facing: level.startPosition.facing,
            inventory: []
        });
    }, [level]);

    return {
        run,
        stop,
        reset,
        isRunning,
        currentBlockIndex,
        error,
        gameState
    };
}
