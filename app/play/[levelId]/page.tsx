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
import { checkAndAwardBadges } from "@/src/lib/services/badgeService"
import type { JorcExpression } from "@/components/jorc/jorc-sprite"
import type { DialogueMood } from "@/components/jorc/jorc-dialogue"
import { getMockLevelData, getLevelConfig } from "@/lib/mock-level-data"
import { getBlocksForLevel } from "@/lib/mock-blocks"
import type { Entity, PathStep, BlockDefinition, BlockInstance, ExecutionResult } from "@/lib/types"

const JORC_MESSAGES = {
  intro:
    "Ahoy, grumete! En este nivel vas a aprender a mover el barco por el mapa. Arrastra bloques al area de codigo y presiona Ejecutar!",
  hint: "Hmm, probaste usar el bloque 'Avanzar' primero?",
  success: "Fantastico trabajo, marinero! Esa secuencia fue perfecta. Encontramos otro fragmento del mapa!",
  error:
    "Vaya, parece que el barco se desvio un poco. No te preocupes, hasta los mejores navegantes necesitan ajustar el rumbo! Intentemos de nuevo.",
  optimal:
    "Increible! Resolviste el nivel con el codigo mas eficiente posible. Eres un verdadero genio de la programacion!",
  running: "Hmm, veamos que hace tu codigo...",
  objectives_failed: "Casi lo logras! Pero no completaste todos los objetivos. Revisa tu codigo.",
}

const ATTEMPTS_TO_UNLOCK = 2
const TUTORIAL_STORAGE_KEY = "bloxmision_tutorial_completed"

export default function PlayPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const levelId = params.levelId as string

  const levelConfig = useMemo(() => getLevelConfig(levelId), [levelId])
  const levelData = useMemo(() => getMockLevelData(levelId), [levelId])
  const availableBlocks = useMemo(() => getBlocksForLevel(levelId), [levelId])

  const availableBlockIds = useMemo(() => availableBlocks.map((b) => b.id), [availableBlocks])
  const newBlockIds = useNewBlocksForLevel(availableBlockIds)
  const [showNewBlockIntro, setShowNewBlockIntro] = useState(false)

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
  const [jorcMessage, setJorcMessage] = useState<string>(JORC_MESSAGES.intro)

  const [showTutorial, setShowTutorial] = useState(false)

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

  const handleClearAll = useCallback(() => {
    setCodeBlocks([])
    resetEngine()
    setJorcExpression("happy")
    setJorcMood("intro")
    setJorcMessage(JORC_MESSAGES.intro)
  }, [resetEngine])

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
    setJorcMessage(JORC_MESSAGES.running)

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

    if (result.success) {
      if (result.isOptimal) {
        setJorcExpression("celebrating")
        setJorcMood("optimal")
        setJorcMessage(JORC_MESSAGES.optimal)
      } else {
        setJorcExpression("celebrating")
        setJorcMood("success")
        setJorcMessage(JORC_MESSAGES.success)
      }
      setShowSuccessModal(true)
    } else if (engineError) {
      setJorcExpression("worried")
      setJorcMood("error")
      setJorcMessage(engineError.message)
      setShowFailureModal(true)
    } else {
      setJorcExpression("worried")
      setJorcMood("error")
      setJorcMessage(JORC_MESSAGES.objectives_failed)
      setShowFailureModal(true)
    }
  }, [codeBlocks, execute, resetEngine, engineError])

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
    setJorcMessage(JORC_MESSAGES.hint)
  }, [])

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

  const handleNextLevel = useCallback(async () => {
    // Save progress to Firestore before navigating
    if (user && executionResult?.success) {
      try {
        const progressResult = await submitLevelProgress(
          user.id,
          levelId,
          levelConfig as any, // Type cast for compatibility
          codeBlocks as any,
          attemptsCount,
          viewedHintIndex
        )

        if (progressResult.success) {
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
        }
      } catch (error) {
        console.error('Error saving progress:', error)
      }
    }

    setShowSuccessModal(false)
    // Navigate to next level
    const currentNum = Number.parseInt(levelId.split("-")[1] || "1")
    router.push(`/play/1-${currentNum + 1}`)
  }, [router, levelId, user, executionResult, levelConfig, codeBlocks, attemptsCount, viewedHintIndex])

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
            <div className="flex-1 overflow-hidden">{CodeAreaComponent}</div>
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
    </ProtectedRoute>
  )
}
