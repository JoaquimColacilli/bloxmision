"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { GameLayout } from "@/components/layouts/game-layout"
import { GameGrid } from "@/components/game/game-grid"
import { BlockPalette } from "@/components/blocks/block-palette"
import { CodeArea } from "@/components/code-area/code-area"
import { ExecutionControls } from "@/components/game/execution-controls"
import { HintModal } from "@/components/game/hint-modal"
import { JorcPanel } from "@/components/jorc/jorc-panel"
import { SuccessModal } from "@/components/game/success-modal"
import { FailureModal } from "@/components/game/failure-modal"
import { TutorialOverlay, defaultTutorialSteps } from "@/components/help/tutorial-overlay"
import { LearningSidebar } from "@/components/help/learning-sidebar"
import { NewBlockIntroModal, useNewBlocksForLevel } from "@/components/help/new-block-intro-modal"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { useBlockEngine } from "@/hooks/use-block-engine"
import { useAuth } from "@/contexts/auth-context"
import { submitLevelProgress } from "@/src/lib/services/progressService"
import { useProgress } from "@/contexts/progress-context"
import { checkAndAwardBadges } from "@/src/lib/services/badgeService"
import { LevelLockedModal } from "@/components/game/level-locked-modal"
import { FragmentUnlockedModal } from "@/components/game/fragment-unlocked-modal"
import { levelDataToLevel, blockInstancesToBlocks } from "@/lib/level-adapter"
import type { JorcExpression } from "@/components/jorc/jorc-sprite"
import type { DialogueMood } from "@/components/jorc/jorc-dialogue"
import { getMockLevelData, getLevelConfig } from "@/lib/mock-level-data"
import { getBlocksForLevel } from "@/lib/mock-blocks"
import { getRequiredBlocksForLevel, getBlockLesson } from "@/lib/block-progression"
import type { Entity, PathStep, BlockDefinition, BlockInstance, ExecutionResult } from "@/lib/types"
import { useAcademy } from "@/contexts/academy-context"
import { canAccessLevel } from "@/lib/academy-gating"
import { LessonRequiredModal } from "@/components/game/lesson-required-modal"

// Mensajes dinámicos de JORC basados en el mundo y nivel
const getJorcMessages = (worldId: string, levelNum: number) => {
  const worldIntros: Record<string, string> = {
    "1": "¡Ahoy, grumete! En esta isla vas a aprender los fundamentos de la navegación: avanzar, girar y recoger tesoros. ¡Arrastra bloques al área de código y presiona Ejecutar!",
    "2": "¡Bienvenido a las Aguas Nocturnas! Aquí dominarás los bucles y aprenderás a esquivar los temibles Krakens. ¡Ten cuidado con las sombras!",
    "3": "¡Navegante intrépido! En la Isla de las Decisiones aprenderás a tomar caminos inteligentes usando condicionales. ¡El barco decidirá qué hacer según lo que encuentre!",
    "4": "¡Los mares de la Memoria te esperan! Aquí aprenderás a usar variables para recordar información importante durante tu travesía.",
    "5": "¡Capitán experto! Has llegado a la Isla de las Funciones. Aprenderás a crear tus propios bloques reutilizables. ¡El tesoro final está cerca!",
  }

  const worldHints: Record<string, string> = {
    "1": "¿Probaste usar los bloques 'Avanzar' y 'Girar'? Piensa en los pasos que el barco debe dar.",
    "2": "¡Recuerda que los bucles te ahorran trabajo! Y cuidado con los Krakens...",
    "3": "Usa 'Si está bloqueado' para que el barco tome decisiones automáticamente.",
    "4": "Las variables te ayudan a recordar cuántas veces hiciste algo.",
    "5": "Define una función con los pasos que se repiten y luego llámala cuando la necesites.",
  }

  const worldSuccess: Record<string, string> = {
    "1": "¡Fantástico trabajo, marinero! Estás dominando la navegación básica.",
    "2": "¡Excelente! Dominas los bucles y esquivaste a los Krakens como un verdadero capitán.",
    "3": "¡Brillante! Tu barco toma decisiones inteligentes gracias a los condicionales.",
    "4": "¡Impresionante! Usas las variables como un programador experto.",
    "5": "¡Asombroso! Tus funciones hacen el código más elegante y reutilizable.",
  }

  // Mensajes especiales para ciertos niveles
  let intro = worldIntros[worldId] || worldIntros["1"]

  // Personalización adicional por nivel
  if (levelNum > 1) {
    const levelMessages: Record<string, Record<number, string>> = {
      "1": {
        4: "¡Es hora de aprender a recoger monedas! Usa el bloque 'Recoger' cuando estés sobre una moneda.",
        7: "¡Las rocas bloquean el camino! Tendrás que rodearlas con giros.",
        10: "¡Presentamos el bloque Repetir! Con él puedes ejecutar acciones varias veces sin escribir tanto código.",
      },
      "2": {
        3: "¡Cuidado! Los Krakens son peligrosos. Si los tocas, te atraparán. Rodéalos con cuidado.",
        8: "¡Los patrones son clave! Busca secuencias que se repitan para usar bucles eficientemente.",
      },
      "3": {
        4: "¡Nuevo poder desbloqueado! 'Si está bloqueado' permite que el barco tome decisiones basadas en obstáculos.",
      },
      "4": {
        4: "¡Las variables son como cofres de memoria! Guarda valores importantes para usarlos después.",
      },
      "5": {
        4: "¡Define tu primera función! Agrupa comandos para reutilizarlos fácilmente.",
        12: "¡El desafío final! Usa todas las habilidades que has aprendido para conseguir el tesoro.",
      },
    }

    if (levelMessages[worldId]?.[levelNum]) {
      intro = levelMessages[worldId][levelNum]
    }
  }

  return {
    intro,
    hint: worldHints[worldId] || worldHints["1"],
    success: worldSuccess[worldId] || worldSuccess["1"],
    error: "Vaya, parece que el barco se desvió un poco. No te preocupes, hasta los mejores navegantes necesitan ajustar el rumbo. ¡Intentemos de nuevo!",
    optimal: "¡Increíble! Resolviste el nivel con el código más eficiente posible. ¡Eres un verdadero genio de la programación!",
    running: "Hmm, veamos qué hace tu código...",
    objectives_failed: "¡Casi lo logras! Pero no completaste todos los objetivos. Revisa tu código.",
  }
}

const ATTEMPTS_TO_UNLOCK = 2
const TUTORIAL_STORAGE_KEY = "bloxmision_tutorial_completed"

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const levelId = params.levelId as string

  const levelConfig = useMemo(() => getLevelConfig(levelId), [levelId])
  const levelData = useMemo(() => getMockLevelData(levelId), [levelId])
  const availableBlocks = useMemo(() => getBlocksForLevel(levelId), [levelId])

  const availableBlockIds = useMemo(() => availableBlocks.map((b) => b.id), [availableBlocks])
  const newBlockIds = useNewBlocksForLevel(levelId)  // Uses canonical progression to detect blocks introduced in THIS level
  const [showNewBlockIntro, setShowNewBlockIntro] = useState(false)

  // Lesson Gating State (Hard Gating)
  const [isLessonLocked, setIsLessonLocked] = useState(false)
  const [missingLessonId, setMissingLessonId] = useState<string | null>(null)
  const [missingLessonReason, setMissingLessonReason] = useState<string | undefined>(undefined)

  // Level locking state
  const [isLevelLocked, setIsLevelLocked] = useState(false)
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1)
  const [accessCheckDone, setAccessCheckDone] = useState(false)

  // Parse world and level numbers from levelId (e.g., "1-5" -> world "1", level 5)
  const [worldNumericId, requestedLevelNum] = useMemo(() => {
    const parts = levelId.split('-')
    return [parts[0] || '1', parseInt(parts[1] || '1', 10)]
  }, [levelId])

  // Mensajes de JORC personalizados por mundo y nivel
  const jorcMessages = useMemo(() => getJorcMessages(worldNumericId, requestedLevelNum), [worldNumericId, requestedLevelNum])

  // Get cached progress from context
  const { getMaxUnlockedLevel, isWorldUnlocked, isLoading: progressLoading, invalidateCache } = useProgress()
  const { progress: academyProgress, isLoading: academyLoading } = useAcademy()

  // Map numeric world ID to semantic for isWorldUnlocked check
  const worldSemanticMap: Record<string, string> = {
    "1": "secuencia",
    "2": "bucle",
    "3": "decision",
    "4": "memoria",
    "5": "funcion",
  }

  // Level Access Check using cached progress (no Firestore read)
  // Now also checks if the WORLD itself is unlocked (cross-world gating)
  // Academy Gating Check (Source of Truth)
  useEffect(() => {
    if (!user || academyLoading) return

    // 1. Check Academy Lessons requirements first
    // This is the hard gating logic based on blocks introduced/used
    const completedLessons = academyProgress?.completedLessons || []

    // We pass levelId to the deterministic gating function
    const gateResult = canAccessLevel(levelId, completedLessons)

    if (!gateResult.allowed) {
      setIsLessonLocked(true)
      setMissingLessonId(gateResult.missingLessonId)
      setMissingLessonReason(gateResult.reason)
      setAccessCheckDone(true)
      return // Stop further checks if lesson is missing
    } else {
      setIsLessonLocked(false)
      setMissingLessonId(null)
    }

    // 2. If lessons are OK, check level progression
    const worldSemanticId = worldSemanticMap[worldNumericId] || "secuencia"
    const worldUnlocked = isWorldUnlocked(worldSemanticId)

    if (!worldUnlocked) {
      // World itself is not unlocked - block access entirely
      setIsLevelLocked(true)
      setMaxUnlockedLevel(1) // Show "go to level 1" option (of previous world in practice)
    } else {
      // World is unlocked, check level within world
      const maxLevel = getMaxUnlockedLevel(worldNumericId)
      setMaxUnlockedLevel(maxLevel)

      if (requestedLevelNum > maxLevel) {
        setIsLevelLocked(true)
      }
    }
    setAccessCheckDone(true)
  }, [user, worldNumericId, requestedLevelNum, progressLoading, academyLoading, getMaxUnlockedLevel, isWorldUnlocked, levelId, academyProgress])

  useEffect(() => {
    if (newBlockIds.length > 0) {
      // Small delay to ensure UI is rendered first
      const timeout = setTimeout(() => setShowNewBlockIntro(true), 300)
      return () => clearTimeout(timeout)
    }
  }, [newBlockIds])

  const {
    execute,
    stop,
    reset: resetEngine,
    isRunning,
    currentBlockIndex,
    error: engineError,
    gameState,
    stepCount,
    setAnimationSpeed,
  } = useBlockEngine({
    gridSize: levelConfig.gridSize,
    startPosition: levelConfig.startPosition,
    obstacles: levelConfig.obstacles,
    collectibles: levelConfig.collectibles,
    objectives: levelConfig.objectives,
    optimalBlockCount: levelConfig.optimalSolution?.blockCount,
    baseXP: 50,
  })

  // Code blocks state
  const [codeBlocks, setCodeBlocks] = useState<BlockInstance[]>([])

  // Attempts and hints
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [currentHintLevel, setCurrentHintLevel] = useState<1 | 2 | 3>(1)
  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [viewedHintIndex, setViewedHintIndex] = useState(0)

  // Result modals
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null)

  // Jorc state
  const [jorcExpression, setJorcExpression] = useState<JorcExpression>("happy")
  const [jorcMood, setJorcMood] = useState<DialogueMood>("intro")
  const [jorcMessage, setJorcMessage] = useState<string>("")

  // Inicializar mensaje de intro cuando cambia el nivel
  // Use custom jorcMessage from level config if available, otherwise use world-based message
  useEffect(() => {
    const customMessage = levelData.jorcMessage
    setJorcMessage(customMessage || jorcMessages.intro)
  }, [levelData.jorcMessage, jorcMessages.intro])

  const [showTutorial, setShowTutorial] = useState(false)

  // Fragment modal state
  const [showFragmentModal, setShowFragmentModal] = useState(false)
  const [unlockedFragment, setUnlockedFragment] = useState<{
    fragmentId: string
    description?: string
    totalCount: number
    isMapComplete: boolean
  } | null>(null)

  // Show tutorial on first level if not completed
  useEffect(() => {
    const isFirstLevel = levelId === "1-1" || levelId === "secuencia-1"
    const tutorialCompleted = localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true"

    if (isFirstLevel && !tutorialCompleted) {
      // Small delay to ensure UI is rendered
      const timeout = setTimeout(() => setShowTutorial(true), 500)
      return () => clearTimeout(timeout)
    }
  }, [levelId])

  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false)
  }, [])

  const handleCompleteTutorial = useCallback(() => {
    setShowTutorial(false)
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true")
    setJorcExpression("happy")
    setJorcMessage("Excelente! Ahora ya sabes lo basico. Intenta resolver el nivel!")
  }, [])

  const handleCloseNewBlockIntro = useCallback(() => {
    setShowNewBlockIntro(false)
    setJorcExpression("happy")
    setJorcMessage("Ahora tienes nuevos bloques disponibles! Usalos para resolver el nivel.")
  }, [])

  const hintsUnlocked = attemptsCount >= ATTEMPTS_TO_UNLOCK

  const entities = useMemo((): Entity[] => {
    const baseEntities: Entity[] = [
      {
        id: "jorc",
        type: "jorc",
        x: gameState.jorc.x,
        y: gameState.jorc.y,
        facing: gameState.jorc.facing,
      },
      ...levelConfig.obstacles.map((o, i) => ({
        id: `obstacle-${i}`,
        type: o.type as Entity["type"],
        x: o.x,
        y: o.y,
      })),
      ...levelConfig.collectibles
        .filter((c) => !gameState.collectedItems.includes(c.id))
        .map((c) => ({
          id: c.id,
          type: c.type as Entity["type"],
          x: c.x,
          y: c.y,
        })),
    ]
    return baseEntities
  }, [gameState, levelConfig])

  // Path from engine
  const showPath = useMemo((): PathStep[] => {
    return gameState.path.map((p) => ({
      x: p.x,
      y: p.y,
      direction: p.direction,
    }))
  }, [gameState.path])

  // Block handlers
  const handleAddBlock = useCallback(
    (block: BlockDefinition, index?: number) => {
      const instance: BlockInstance = {
        instanceId: `${block.id}-${Date.now()}`,
        definition: block,
        params: block.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.default ?? "" }), {}) || {},
      }
      setCodeBlocks((prev) => {
        if (index !== undefined && index >= 0 && index <= prev.length) {
          return [...prev.slice(0, index), instance, ...prev.slice(index)]
        }
        return [...prev, instance]
      })
      if (codeBlocks.length === 0) {
        setJorcExpression("happy")
        setJorcMood("neutral")
        setJorcMessage("Muy bien! Ahora agrega mas bloques o presiona Ejecutar para ver que pasa.")
      }
    },
    [codeBlocks.length],
  )

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setCodeBlocks((prev) => {
      const newBlocks = [...prev]
      const [removed] = newBlocks.splice(fromIndex, 1)
      const adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
      newBlocks.splice(adjustedToIndex, 0, removed)
      return newBlocks
    })
  }, [])

  const handleEditParams = useCallback((index: number, params: Record<string, string | number | boolean>) => {
    setCodeBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, params } : b)))
  }, [])

  const handleDuplicateBlock = useCallback((index: number) => {
    setCodeBlocks((prev) => {
      if (index < 0 || index >= prev.length) return prev
      const block = prev[index]
      const newBlock: BlockInstance = {
        ...block,
        instanceId: `${block.definition.id}-${Date.now()}`,
        params: { ...block.params },
      }
      return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)]
    })
  }, [])

  const handleRemoveBlock = useCallback((index: number) => {
    setCodeBlocks((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // Handle adding a block inside a loop block
  const handleAddBlockInside = useCallback(
    (parentInstanceId: string, blockDef: BlockDefinition, sourceInstanceId?: string) => {
      setCodeBlocks((prev) => {
        let blocksToProcess = [...prev]
        let existingBlock: BlockInstance | null = null

        // Helper to find and remove a block from the tree
        const findAndRemoveBlock = (blocks: BlockInstance[], targetId: string): { newBlocks: BlockInstance[], foundBlock: BlockInstance | null } => {
          let found: BlockInstance | null = null

          // Check top level first
          const index = blocks.findIndex(b => b.instanceId === targetId)
          if (index !== -1) {
            found = blocks[index]
            return { newBlocks: blocks.filter((_, i) => i !== index), foundBlock: found }
          }

          // Check children recursively
          const newBlocks = blocks.map(block => {
            if (block.children && block.children.length > 0) {
              const result = findAndRemoveBlock(block.children, targetId)
              if (result.foundBlock) {
                found = result.foundBlock
                return { ...block, children: result.newBlocks }
              }
            }
            return block
          })

          return { newBlocks, foundBlock: found }
        }

        // If sourceInstanceId is provided, we're moving an existing block
        if (sourceInstanceId) {
          const result = findAndRemoveBlock(blocksToProcess, sourceInstanceId)
          blocksToProcess = result.newBlocks
          existingBlock = result.foundBlock
        }

        // Create the child instance (use existing block or create new one)
        const childInstance: BlockInstance = existingBlock || {
          instanceId: `${blockDef.id}-${Date.now()}`,
          definition: blockDef,
          params: blockDef.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.default ?? "" }), {}) || {},
        }

        // Helper to add a block to a specific parent in the tree
        const addBlockToParent = (blocks: BlockInstance[], targetParentId: string, newBlock: BlockInstance): BlockInstance[] => {
          return blocks.map(block => {
            if (block.instanceId === targetParentId) {
              return {
                ...block,
                children: [...(block.children || []), newBlock]
              }
            }
            if (block.children) {
              return {
                ...block,
                children: addBlockToParent(block.children, targetParentId, newBlock)
              }
            }
            return block
          })
        }

        return addBlockToParent(blocksToProcess, parentInstanceId, childInstance)
      })
    },
    [],
  )

  // Handle removing a block from inside a loop block (supports any nesting depth)
  const handleRemoveBlockChild = useCallback(
    (_parentInstanceId: string, childInstanceId: string) => {
      // Note: parentInstanceId is ignored since we search recursively for the child
      setCodeBlocks((prev) => {
        const removeBlockRecursively = (blocks: BlockInstance[]): BlockInstance[] => {
          return blocks
            .filter(block => block.instanceId !== childInstanceId) // Remove if found at this level
            .map(block => {
              if (block.children) {
                return {
                  ...block,
                  children: removeBlockRecursively(block.children)
                }
              }
              return block
            })
        }
        return removeBlockRecursively(prev)
      })
    },
    [],
  )

  // Handle editing params of a block inside a loop/conditional block recursively
  const handleEditChildParams = useCallback(
    (parentInstanceId: string | undefined, childInstanceId: string, params: Record<string, string | number | boolean>) => {
      // Note: parentInstanceId might refer to the top-level block OR the immediate parent. 
      // With the recursive search in code-area, it passes the top-level parent. 
      // However, a full recursive search doesn't strictly need parentInstanceId if we search for childInstanceId.

      setCodeBlocks((prev) => {
        const updateParamsRecursively = (blocks: BlockInstance[]): BlockInstance[] => {
          return blocks.map(block => {
            if (block.instanceId === childInstanceId) {
              return { ...block, params }
            }
            if (block.children) {
              return { ...block, children: updateParamsRecursively(block.children) }
            }
            return block
          })
        }
        return updateParamsRecursively(prev)
      })
    },
    [],
  )

  const handleClearAll = useCallback(() => {
    setCodeBlocks([])
    resetEngine()
    setJorcExpression("happy")
    setJorcMood("intro")
    setJorcMessage(levelData.jorcMessage || jorcMessages.intro)
  }, [resetEngine, levelData.jorcMessage, jorcMessages.intro])

  const handleBlockSelect = useCallback(
    (block: BlockDefinition) => {
      handleAddBlock(block)
    },
    [handleAddBlock],
  )

  const handleCellClick = useCallback((x: number, y: number) => {
    // Cell click handler
  }, [])

  const handleReset = useCallback(() => {
    resetEngine()
    setJorcExpression("neutral")
    setJorcMood("neutral")
    setJorcMessage("Listo para intentar de nuevo! Modifica tu codigo y ejecuta.")
  }, [resetEngine])

  const handleExecute = useCallback(async () => {
    if (codeBlocks.length === 0) return

    setAttemptsCount((prev) => prev + 1)
    setJorcExpression("thinking")
    setJorcMood("neutral")
    setJorcMessage(jorcMessages.running)

    // Reset before executing
    resetEngine()

    // Small delay for UI feedback
    await new Promise((r) => setTimeout(r, 100))

    const result = await execute(codeBlocks)

    if (!result) {
      // Execution was stopped
      return
    }

    setExecutionResult(result)

    // Check mandatory block usage for levels that introduce new blocks
    const requiredBlocks = getRequiredBlocksForLevel(levelId)
    const executedBlocks = result.executedBlockTypes || []
    const missingBlocks = requiredBlocks.filter((blockId) => !executedBlocks.includes(blockId))

    if (result.success && missingBlocks.length > 0) {
      // User completed objectives but didn't use the required new block
      const firstMissing = missingBlocks[0]
      const lesson = getBlockLesson(firstMissing)
      const blockName = lesson?.name || firstMissing

      setJorcExpression("worried")
      setJorcMood("error")
      setJorcMessage(`¡Casi! Para pasar este nivel tenés que usar el bloque "${blockName}" al menos una vez.`)
      setShowFailureModal(true)
      return
    }

    if (result.success) {
      if (result.isOptimal) {
        setJorcExpression("celebrating")
        setJorcMood("optimal")
        setJorcMessage(jorcMessages.optimal)
      } else {
        setJorcExpression("celebrating")
        setJorcMood("success")
        setJorcMessage(jorcMessages.success)
      }
      setShowSuccessModal(true)
    } else if (engineError) {
      setJorcExpression("worried")
      setJorcMood("error")
      setJorcMessage(engineError.message)
      setShowFailureModal(true)
      // Auto-reset after a short delay so user can see failure message
      setTimeout(() => {
        resetEngine()
        setShowFailureModal(false)
        setJorcExpression("neutral")
        setJorcMessage("¡No te rindas! Modifica tu código e intenta de nuevo.")
      }, 1500)
    } else {
      setJorcExpression("worried")
      setJorcMood("error")
      setJorcMessage(jorcMessages.objectives_failed)
      setShowFailureModal(true)
      // Auto-reset after a short delay so user can see failure message
      setTimeout(() => {
        resetEngine()
        setShowFailureModal(false)
        setJorcExpression("neutral")
        setJorcMessage("¡Casi lo lográs! Revisa tu código y vuelve a intentar.")
      }, 1500)
    }
  }, [codeBlocks, execute, resetEngine, engineError, jorcMessages, levelId])

  const handleStop = useCallback(() => {
    stop()
    setJorcExpression("neutral")
    setJorcMood("neutral")
    setJorcMessage("Ejecucion detenida. Puedes modificar tu codigo y ejecutar de nuevo.")
  }, [stop])

  const handleShowHint = useCallback(() => {
    setIsHintModalOpen(true)
    setJorcExpression("thinking")
    setJorcMood("hint")
    setJorcMessage(jorcMessages.hint)
  }, [jorcMessages.hint])

  const handleNextHint = useCallback(() => {
    if (viewedHintIndex < (levelConfig.hints?.length || 0) - 1) {
      setViewedHintIndex((prev) => prev + 1)
      setCurrentHintLevel((prev) => Math.min(3, prev + 1) as 1 | 2 | 3)
    }
  }, [viewedHintIndex, levelConfig.hints])

  const handleCloseHint = useCallback(() => {
    setIsHintModalOpen(false)
  }, [])

  const handleJorcContinue = useCallback(() => {
    setJorcMessage("")
  }, [])

  const [isSaving, setIsSaving] = useState(false)

  const handleNextLevel = useCallback(async () => {
    // Prevent double submission
    if (isSaving) return

    // Save progress to Firestore before navigating
    if (user && executionResult?.success) {
      setIsSaving(true)
      try {
        // Convert LevelData to Level format for the validator
        const level = levelDataToLevel(levelConfig)
        // Convert BlockInstance[] to Block[] for the validator
        const blocks = blockInstancesToBlocks(codeBlocks)

        const progressResult = await submitLevelProgress(
          user.id,
          levelId,
          level,
          blocks,
          attemptsCount,
          viewedHintIndex
        )

        if (progressResult.success) {
          // Invalidate progress cache so next level check uses updated data
          await invalidateCache()

          // Refresh user data to update XP bar
          await refreshUser()

          // Check if a fragment was unlocked
          if (progressResult.fragmentUnlocked) {
            setUnlockedFragment({
              fragmentId: progressResult.fragmentUnlocked,
              description: levelConfig.treasureFragment?.description,
              totalCount: progressResult.totalFragments || 1,
              isMapComplete: progressResult.mapCompleted || false
            })
            setShowSuccessModal(false)
            setShowFragmentModal(true)
            setIsSaving(false)
            return // Don't navigate yet - wait for fragment modal to close
          }

          // Check for new badges
          const newBadges = await checkAndAwardBadges(user.id, {
            userId: user.id,
            levelId,
            attempts: attemptsCount,
            usedHints: viewedHintIndex,
            isOptimal: progressResult.isOptimal
          })

          // Show bonus message if earned badges
          if (newBadges.length > 0) {
            setJorcExpression("celebrating")
            setJorcMessage(`¡Ganaste ${progressResult.xpEarned} XP y ${newBadges.length} insignia(s) nueva(s)!`)
          }

          // Navigate ONLY if save was successful
          setShowSuccessModal(false)
          // Navigate to next level - preserve the world prefix
          const [worldPrefix, levelNum] = levelId.split("-")
          const nextLevelNum = Number.parseInt(levelNum || "1") + 1
          router.push(`/play/${worldPrefix}-${nextLevelNum}`)
        } else {
          console.error('Progress submission failed:', progressResult.message)
          // Show error to user and stay on current level
          alert(`Error al guardar avance: ${progressResult.message}\n\nIntenta de nuevo.`)
        }
      } catch (error: any) {
        console.error('Error saving progress:', error)
        alert(`Error inesperado al guardar: ${error?.message || 'Error desconocido'}`)
      } finally {
        setIsSaving(false)
      }
    } else {
      // If no user (guest?) or odd state, just close modal (or navigate if intended for guests)
      setShowSuccessModal(false)
      const [worldPrefix, levelNum] = levelId.split("-")
      const nextLevelNum = Number.parseInt(levelNum || "1") + 1
      router.push(`/play/${worldPrefix}-${nextLevelNum}`)
    }
  }, [router, levelId, user, executionResult, levelConfig, codeBlocks, attemptsCount, viewedHintIndex, refreshUser, isSaving, invalidateCache])

  // Handle fragment modal close - navigate to next level
  const handleFragmentModalClose = useCallback(() => {
    setShowFragmentModal(false)
    setUnlockedFragment(null)
    // Navigate to next level
    const [worldPrefix, levelNum] = levelId.split("-")
    const nextLevelNum = Number.parseInt(levelNum || "1") + 1
    if (unlockedFragment?.isMapComplete) {
      // If map is complete, go to treasure map page
      router.push('/treasure-map')
    } else {
      router.push(`/play/${worldPrefix}-${nextLevelNum}`)
    }
  }, [router, levelId, unlockedFragment])

  const handleRetryFromModal = useCallback(() => {
    setShowSuccessModal(false)
    setShowFailureModal(false)
    handleReset()
  }, [handleReset])

  const BlockPaletteComponent = <BlockPalette availableBlocks={availableBlocks} onBlockSelect={handleBlockSelect} />

  const CodeAreaComponent = (
    <div data-tutorial="code-area">
      <CodeArea
        blocks={codeBlocks}
        onAddBlock={handleAddBlock}
        onAddBlockInside={handleAddBlockInside}
        onRemoveBlockChild={handleRemoveBlockChild}
        onEditChildParams={handleEditChildParams}
        onReorder={handleReorder}
        onRemoveBlock={handleRemoveBlock}
        onDuplicateBlock={handleDuplicateBlock}
        onEditParams={handleEditParams}
        onClearAll={handleClearAll}
        currentBlockIndex={currentBlockIndex}
        maxBlocks={20}
        isRunning={isRunning}
      />
    </div>
  )

  // Get readable names for required blocks
  const requiredBlockNames = useMemo(() => {
    const requiredIds = getRequiredBlocksForLevel(levelId)
    return requiredIds.map((id) => {
      const lesson = getBlockLesson(id)
      return lesson?.name || id
    })
  }, [levelId])

  const JorcPanelComponent = (
    <JorcPanel
      expression={jorcExpression}
      message={jorcMessage}
      mood={jorcMood}
      showContinue={jorcMood === "success" || jorcMood === "optimal"}
      onContinue={handleJorcContinue}
      levelInfo={{
        levelId,
        objective: levelData.objective,
        attemptsCount,
        requiredBlocks: requiredBlockNames,
      }}
    />
  )

  const ExecutionControlsComponent = (
    <ExecutionControls
      isRunning={isRunning}
      hasBlocks={codeBlocks.length > 0}
      attemptsCount={attemptsCount}
      hintsUnlocked={hintsUnlocked}
      currentHintLevel={currentHintLevel}
      blocksCount={codeBlocks.length}
      onRun={handleExecute}
      onStop={handleStop}
      onReset={handleReset}
      onShowHint={handleShowHint}
    />
  )

  return (
    <ProtectedRoute>
      <GameLayout
        sidebar={BlockPaletteComponent}
        codeArea={CodeAreaComponent}
        blocksCount={codeBlocks.length}
        rightPanel={
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto">{CodeAreaComponent}</div>
            <div className="border-t border-ocean-200 p-4">{JorcPanelComponent}</div>
          </div>
        }
        bottomControls={ExecutionControlsComponent}
      >
        <div data-tutorial="game-grid" className="relative h-full">
          <GameGrid
            gridData={levelData.gridData}
            entities={entities}
            showPath={showPath}
            onCellClick={handleCellClick}
            showCoordinates={true}
            theme={levelConfig.theme}
          />
          <div className="absolute right-4 top-4 z-10">
            <LearningSidebar levelId={levelId} />
          </div>
        </div>
      </GameLayout>

      <HintModal
        isOpen={isHintModalOpen}
        hints={levelConfig.hints || []}
        currentHintIndex={viewedHintIndex}
        onNextHint={handleNextHint}
        onClose={handleCloseHint}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        result={executionResult}
        levelTitle={levelConfig.title}
        onNextLevel={handleNextLevel}
        onRetry={handleRetryFromModal}
      />

      <FailureModal
        isOpen={showFailureModal}
        onClose={() => setShowFailureModal(false)}
        error={engineError}
        failedObjectives={executionResult?.failedObjectives}
        onRetry={handleRetryFromModal}
        onShowHint={handleShowHint}
        hintsUnlocked={hintsUnlocked}
        attemptsCount={attemptsCount}
      />

      <TutorialOverlay
        steps={defaultTutorialSteps}
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        onComplete={handleCompleteTutorial}
      />

      {showNewBlockIntro && newBlockIds.length > 0 && (
        <NewBlockIntroModal blockIds={newBlockIds} levelId={levelId} onClose={handleCloseNewBlockIntro} />
      )}

      <LevelLockedModal
        isOpen={isLevelLocked}
        worldNumericId={worldNumericId}
        maxUnlockedLevel={maxUnlockedLevel}
      />

      {unlockedFragment && (
        <FragmentUnlockedModal
          isOpen={showFragmentModal}
          onClose={handleFragmentModalClose}
          fragmentId={unlockedFragment.fragmentId}
          fragmentDescription={unlockedFragment.description}
          currentCount={unlockedFragment.totalCount}
          isMapComplete={unlockedFragment.isMapComplete}
        />
      )}

      <LessonRequiredModal
        isOpen={isLessonLocked}
        missingLessonId={missingLessonId}
        reason={missingLessonReason}
      />
    </ProtectedRoute>
  )
}
