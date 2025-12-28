"use client"

import { useState, useCallback, useRef, useMemo } from "react"
import type {
  BlockInstance,
  ExecutionGameState,
  ExecutionError,
  LevelObjective,
  Direction,
  ExecutionResult,
} from "@/lib/types"

// Direction utilities
const DIRECTION_ORDER: Direction[] = ["north", "east", "south", "west"]

function turnRight(facing: Direction): Direction {
  const idx = DIRECTION_ORDER.indexOf(facing)
  return DIRECTION_ORDER[(idx + 1) % 4]
}

function turnLeft(facing: Direction): Direction {
  const idx = DIRECTION_ORDER.indexOf(facing)
  return DIRECTION_ORDER[(idx + 3) % 4]
}

function getOpposite(facing: Direction): Direction {
  const idx = DIRECTION_ORDER.indexOf(facing)
  return DIRECTION_ORDER[(idx + 2) % 4]
}

function getForwardDelta(facing: Direction): { dx: number; dy: number } {
  switch (facing) {
    case "north":
      return { dx: 0, dy: -1 }
    case "south":
      return { dx: 0, dy: 1 }
    case "east":
      return { dx: 1, dy: 0 }
    case "west":
      return { dx: -1, dy: 0 }
  }
}

interface UseBlockEngineOptions {
  gridSize: { rows: number; cols: number }
  startPosition: { x: number; y: number; facing: Direction }
  obstacles: Array<{ x: number; y: number; type: string }>
  collectibles: Array<{ id: string; x: number; y: number; type: string }>
  objectives: LevelObjective[]
  optimalBlockCount?: number
  baseXP?: number
  animationSpeed?: number
}

interface UseBlockEngineReturn {
  execute: (blocks: BlockInstance[]) => Promise<ExecutionResult | null>
  stop: () => void
  reset: () => void
  isRunning: boolean
  isPaused: boolean
  currentBlockIndex: number | null
  error: ExecutionError | null
  gameState: ExecutionGameState
  stepCount: number
  setAnimationSpeed: (speed: number) => void
}

const MAX_STEPS = 1000
const BASE_DELAY = 400

export function useBlockEngine(options: UseBlockEngineOptions): UseBlockEngineReturn {
  const {
    gridSize,
    startPosition,
    obstacles,
    collectibles,
    objectives,
    optimalBlockCount = 10,
    baseXP = 50,
    animationSpeed: initialSpeed = 1,
  } = options

  const abortedRef = useRef(false)
  const speedRef = useRef(initialSpeed)

  const initialGameState = useMemo<ExecutionGameState>(
    () => ({
      jorc: { ...startPosition },
      inventory: [],
      variables: {},
      functions: {},
      path: [{ x: startPosition.x, y: startPosition.y, direction: startPosition.facing }],
      stepCount: 0,
      activatedLevers: [],
      collectedItems: [],
    }),
    [gridSize, startPosition, obstacles, collectibles, objectives, optimalBlockCount, baseXP, initialSpeed],
  )

  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number | null>(null)
  const [error, setError] = useState<ExecutionError | null>(null)
  const [gameState, setGameState] = useState<ExecutionGameState>(initialGameState)
  const [stepCount, setStepCount] = useState(0)

  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      return x >= 0 && x < gridSize.cols && y >= 0 && y < gridSize.rows
    },
    [gridSize],
  )

  const hasObstacle = useCallback(
    (x: number, y: number, state: ExecutionGameState): boolean => {
      const isStaticObstacle = obstacles.some(
        (o) => o.x === x && o.y === y && ["rock", "tree", "wall"].includes(o.type),
      )
      if (isStaticObstacle) return true
      return false
    },
    [obstacles],
  )

  const getCollectibleAt = useCallback(
    (x: number, y: number, state: ExecutionGameState): { id: string; type: string } | null => {
      const collected = state.collectedItems
      const item = collectibles.find((c) => c.x === x && c.y === y && !collected.includes(c.id))
      return item ? { id: item.id, type: item.type } : null
    },
    [collectibles],
  )

  const delay = useCallback(async (ms: number): Promise<void> => {
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const actualDelay = prefersReducedMotion ? 50 : ms / speedRef.current
    return new Promise((resolve) => setTimeout(resolve, actualDelay))
  }, [])

  const executeBlock = useCallback(
    async (block: BlockInstance, blockIndex: number, state: ExecutionGameState): Promise<ExecutionGameState> => {
      if (abortedRef.current) throw new Error("Aborted")

      setCurrentBlockIndex(blockIndex)
      await delay(BASE_DELAY)

      const newState = { ...state }
      const { type } = block.definition
      const params = block.params

      switch (type) {
        case "forward": {
          const steps = Number(params.pasos) || 1
          for (let i = 0; i < steps; i++) {
            if (abortedRef.current) throw new Error("Aborted")

            const delta = getForwardDelta(newState.jorc.facing)
            const newX = newState.jorc.x + delta.dx
            const newY = newState.jorc.y + delta.dy

            if (!isValidPosition(newX, newY)) {
              throw {
                type: "out_of_bounds",
                message: "Jorc salio del mapa! Revisa los limites.",
                blockIndex,
              } as ExecutionError
            }

            if (hasObstacle(newX, newY, newState)) {
              throw {
                type: "collision",
                message: "Jorc choco con un obstaculo!",
                blockIndex,
              } as ExecutionError
            }

            newState.jorc.x = newX
            newState.jorc.y = newY
            newState.stepCount++
            newState.path.push({ x: newX, y: newY, direction: newState.jorc.facing })

            setGameState({ ...newState })
            setStepCount(newState.stepCount)

            if (newState.stepCount > MAX_STEPS) {
              throw {
                type: "infinite_loop",
                message: "Loop infinito detectado! El codigo da demasiadas vueltas.",
                blockIndex,
              } as ExecutionError
            }

            if (i < steps - 1) await delay(BASE_DELAY / 2)
          }
          break
        }

        case "backward": {
          const steps = Number(params.pasos) || 1
          for (let i = 0; i < steps; i++) {
            if (abortedRef.current) throw new Error("Aborted")

            const oppositeFacing = getOpposite(newState.jorc.facing)
            const delta = getForwardDelta(oppositeFacing)
            const newX = newState.jorc.x + delta.dx
            const newY = newState.jorc.y + delta.dy

            if (!isValidPosition(newX, newY)) {
              throw {
                type: "out_of_bounds",
                message: "Jorc salio del mapa retrocediendo!",
                blockIndex,
              } as ExecutionError
            }

            if (hasObstacle(newX, newY, newState)) {
              throw {
                type: "collision",
                message: "Jorc choco con un obstaculo al retroceder!",
                blockIndex,
              } as ExecutionError
            }

            newState.jorc.x = newX
            newState.jorc.y = newY
            newState.stepCount++
            newState.path.push({ x: newX, y: newY, direction: newState.jorc.facing })

            setGameState({ ...newState })
            setStepCount(newState.stepCount)

            if (i < steps - 1) await delay(BASE_DELAY / 2)
          }
          break
        }

        case "turn-right": {
          newState.jorc.facing = turnRight(newState.jorc.facing)
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          await delay(BASE_DELAY / 2)
          break
        }

        case "turn-left": {
          newState.jorc.facing = turnLeft(newState.jorc.facing)
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          await delay(BASE_DELAY / 2)
          break
        }

        case "open-chest": {
          const chest = getCollectibleAt(newState.jorc.x, newState.jorc.y, newState)
          if (!chest || chest.type !== "chest") {
            throw {
              type: "invalid_action",
              message: "No hay cofre aqui para abrir!",
              blockIndex,
            } as ExecutionError
          }
          newState.inventory.push("chest")
          newState.collectedItems.push(chest.id)
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          break
        }

        case "collect-coin": {
          const coin = getCollectibleAt(newState.jorc.x, newState.jorc.y, newState)
          if (!coin || (coin.type !== "coin" && coin.type !== "gem")) {
            throw {
              type: "invalid_action",
              message: "No hay moneda o gema aqui para recoger!",
              blockIndex,
            } as ExecutionError
          }
          newState.inventory.push(coin.type)
          newState.collectedItems.push(coin.id)
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          break
        }

        case "push-rock": {
          const delta = getForwardDelta(newState.jorc.facing)
          const rockX = newState.jorc.x + delta.dx
          const rockY = newState.jorc.y + delta.dy
          const rockDestX = rockX + delta.dx
          const rockDestY = rockY + delta.dy

          const rockObstacle = obstacles.find((o) => o.x === rockX && o.y === rockY && o.type === "rock")

          if (!rockObstacle) {
            throw {
              type: "invalid_action",
              message: "No hay roca adelante para empujar!",
              blockIndex,
            } as ExecutionError
          }

          if (!isValidPosition(rockDestX, rockDestY) || hasObstacle(rockDestX, rockDestY, newState)) {
            throw {
              type: "invalid_action",
              message: "No se puede empujar la roca, hay algo bloqueando!",
              blockIndex,
            } as ExecutionError
          }

          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          break
        }

        case "use-lever": {
          const lever = collectibles.find(
            (c) => c.x === newState.jorc.x && c.y === newState.jorc.y && c.type === "lever",
          )
          if (!lever) {
            throw {
              type: "invalid_action",
              message: "No hay palanca aqui para usar!",
              blockIndex,
            } as ExecutionError
          }

          if (newState.activatedLevers.includes(lever.id)) {
            newState.activatedLevers = newState.activatedLevers.filter((id) => id !== lever.id)
          } else {
            newState.activatedLevers.push(lever.id)
          }
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          break
        }

        case "repeat": {
          const times = Number(params.veces) || 1
          const children = block.children || []

          for (let i = 0; i < times; i++) {
            if (abortedRef.current) throw new Error("Aborted")

            for (let j = 0; j < children.length; j++) {
              const result = await executeBlock(children[j], blockIndex, newState)
              Object.assign(newState, result)

              if (newState.stepCount > MAX_STEPS) {
                throw {
                  type: "infinite_loop",
                  message: "Loop infinito detectado! El bucle tiene demasiadas repeticiones.",
                  blockIndex,
                } as ExecutionError
              }
            }
          }
          break
        }

        case "sensor": {
          break
        }

        case "variable": {
          const varName = String(params.nombre || "var")
          if (block.definition.id === "create-var") {
            newState.variables[varName] = 0
          } else if (block.definition.id === "set-var") {
            newState.variables[varName] = Number(params.valor) || 0
          } else if (block.definition.id === "change-var") {
            newState.variables[varName] = (newState.variables[varName] || 0) + (Number(params.cambio) || 1)
          }
          newState.stepCount++
          setGameState({ ...newState })
          setStepCount(newState.stepCount)
          break
        }

        case "define": {
          const funcName = String(params.nombre || "funcion")
          newState.functions[funcName] = block.children || []
          break
        }

        case "call": {
          const funcName = String(params.nombre || "funcion")
          const funcBlocks = newState.functions[funcName]
          if (!funcBlocks) {
            throw {
              type: "syntax_error",
              message: `La funcion "${funcName}" no existe!`,
              blockIndex,
            } as ExecutionError
          }
          for (const child of funcBlocks) {
            const result = await executeBlock(child, blockIndex, newState)
            Object.assign(newState, result)
          }
          break
        }

        default:
          console.log(`[v0] Unknown block type: ${type}`)
      }

      return newState
    },
    [delay, isValidPosition, hasObstacle, getCollectibleAt, collectibles, obstacles],
  )

  const validateObjectives = useCallback(
    (state: ExecutionGameState): { completed: LevelObjective[]; failed: LevelObjective[] } => {
      const completed: LevelObjective[] = []
      const failed: LevelObjective[] = []

      for (const obj of objectives) {
        let passed = false

        switch (obj.type) {
          case "reach":
            if (obj.target) {
              passed = state.jorc.x === obj.target.x && state.jorc.y === obj.target.y
            }
            break

          case "collect":
            if (obj.item && obj.count) {
              const count = state.inventory.filter((i) => i === obj.item).length
              passed = count >= obj.count
            }
            break

          case "collectAll":
            if (obj.items) {
              const itemsToCollect = collectibles.filter((c) => obj.items!.includes(c.type))
              passed = itemsToCollect.every((item) => state.collectedItems.includes(item.id))
            }
            break

          case "activate":
            if (obj.id) {
              passed = state.activatedLevers.includes(obj.id)
            }
            break

          case "avoid":
            passed = true
            break
        }

        if (passed) {
          completed.push(obj)
        } else {
          failed.push(obj)
        }
      }

      return { completed, failed }
    },
    [objectives, collectibles],
  )

  const calculateStars = useCallback(
    (state: ExecutionGameState, blockCount: number, usedHints: boolean): { stars: 1 | 2 | 3; isOptimal: boolean } => {
      const isOptimal = blockCount <= optimalBlockCount

      if (isOptimal && !usedHints) {
        return { stars: 3, isOptimal: true }
      } else if (!usedHints) {
        return { stars: 2, isOptimal: false }
      } else {
        return { stars: 1, isOptimal: false }
      }
    },
    [optimalBlockCount],
  )

  const execute = useCallback(
    async (blocks: BlockInstance[]): Promise<ExecutionResult | null> => {
      if (blocks.length === 0) return null

      abortedRef.current = false
      setIsRunning(true)
      setError(null)
      setCurrentBlockIndex(null)

      const state: ExecutionGameState = {
        jorc: { ...initialGameState.jorc },
        inventory: [],
        variables: {},
        functions: {},
        path: [{ ...initialGameState.path[0] }],
        stepCount: 0,
        activatedLevers: [],
        collectedItems: [],
      }
      setGameState(state)
      setStepCount(0)

      try {
        let currentState = state

        for (let i = 0; i < blocks.length; i++) {
          if (abortedRef.current) {
            setIsRunning(false)
            return null
          }

          currentState = await executeBlock(blocks[i], i, currentState)
        }

        const { completed, failed } = validateObjectives(currentState)
        const success = failed.length === 0

        if (!success) {
          setIsRunning(false)
          setCurrentBlockIndex(null)
          return {
            success: false,
            stars: 1,
            xpEarned: 0,
            completedObjectives: completed,
            failedObjectives: failed,
            isOptimal: false,
          }
        }

        const { stars, isOptimal } = calculateStars(currentState, blocks.length, false)
        const xpEarned = baseXP * stars

        setIsRunning(false)
        setCurrentBlockIndex(null)

        return {
          success: true,
          stars,
          xpEarned,
          completedObjectives: completed,
          failedObjectives: failed,
          isOptimal,
        }
      } catch (err) {
        if ((err as Error).message === "Aborted") {
          setIsRunning(false)
          return null
        }

        const execError = err as ExecutionError
        setError(execError)
        setIsRunning(false)

        return {
          success: false,
          stars: 1,
          xpEarned: 0,
          completedObjectives: [],
          failedObjectives: objectives,
          isOptimal: false,
        }
      }
    },
    [executeBlock, validateObjectives, calculateStars, baseXP, objectives, initialGameState],
  )

  const stop = useCallback(() => {
    abortedRef.current = true
    setIsRunning(false)
    setCurrentBlockIndex(null)
  }, [])

  const reset = useCallback(() => {
    abortedRef.current = true
    setIsRunning(false)
    setCurrentBlockIndex(null)
    setError(null)
    setGameState({
      jorc: { ...initialGameState.jorc },
      inventory: [],
      variables: {},
      functions: {},
      path: [{ ...initialGameState.path[0] }],
      stepCount: 0,
      activatedLevers: [],
      collectedItems: [],
    })
    setStepCount(0)
  }, [initialGameState.jorc, initialGameState.path])

  const setAnimationSpeed = useCallback((speed: number) => {
    speedRef.current = speed
  }, [])

  return {
    execute,
    stop,
    reset,
    isRunning,
    isPaused,
    currentBlockIndex,
    error,
    gameState,
    stepCount,
    setAnimationSpeed,
  }
}
