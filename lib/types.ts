export interface User {
  id: string
  displayName: string
  email: string
  avatar?: string
  totalXP: number
  currentXP: number
  nextLevelThreshold: number
  playerLevel: string
  currentWorld?: number
  currentLevel?: number
  streak?: {
    current: number
    longest: number
  }
  badges?: string[]
  treasureFragments?: number
  // Treasure Fragment System
  unlockedFragmentsMap?: Record<string, true>
  treasureFragmentsCount?: number
  mapCompleted?: boolean
}

export interface World {
  id: string
  name: string
  description: string
  totalLevels: number
  completedLevels: number
  isUnlocked: boolean
  isCurrent?: boolean
  icon?: string
  concept?: string
}

export interface Level {
  id: string
  worldId: string
  name: string
  order: number
  isCompleted: boolean
  isUnlocked: boolean
  isCurrent?: boolean
  stars?: number
  xpReward?: number
  description?: string
}

export interface Settings {
  sound: boolean
  music: boolean
  hints: boolean
}

export type TileType = "water" | "sand" | "grass" | "rock" | "wood"
export type EntityType = "jorc" | "rock" | "tree" | "wall" | "chest" | "coin" | "gem" | "lever" | "door" | "bridge"
export type Direction = "north" | "south" | "east" | "west"

export interface Tile {
  x: number
  y: number
  type: TileType
}

export interface GridData {
  rows: number
  cols: number
  tiles: Tile[]
}

export interface Entity {
  id: string
  type: EntityType
  x: number
  y: number
  facing?: Direction
  collected?: boolean
  activated?: boolean
}

export interface PathStep {
  x: number
  y: number
  direction?: Direction
}

export type BlockCategory = "movement" | "actions" | "control" | "sensors" | "memory" | "commands"

export interface BlockDefinition {
  id: string
  type: string
  category: BlockCategory
  label: string
  icon?: string
  params?: BlockParamDefinition[]
  isCustom?: boolean
  shape?: "command" | "conditional" | "loop" | "sensor" | "variable"
}

export interface BlockParamDefinition {
  name: string
  type: "number" | "boolean" | "variable" | "block" | "select"
  default?: string | number | boolean
  options?: string[] // For select type
  min?: number
  max?: number
}

export interface BlockInstance {
  instanceId: string
  definition: BlockDefinition
  params: Record<string, string | number | boolean>
  children?: BlockInstance[] // For loops and conditionals
}

export interface BlockCategoryData {
  id: BlockCategory
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  blocks: BlockDefinition[]
}

export interface GameState {
  status: "idle" | "running" | "paused" | "completed" | "failed"
  jorc: Entity
  entities: Entity[]
  path: PathStep[]
}

export interface TreasureFragment {
  id: string
  order: number
  unlocked: boolean
  imageUrl?: string
  revealedText?: string
  unlockedByLevel?: string
}

export interface ExecutionGameState {
  jorc: {
    x: number
    y: number
    facing: Direction
  }
  inventory: string[]
  variables: Record<string, number>
  functions: Record<string, BlockInstance[]>
  path: Array<{ x: number; y: number; direction: Direction }>
  stepCount: number
  activatedLevers: string[]
  collectedItems: string[]
}

export interface ExecutionError {
  type: "collision" | "out_of_bounds" | "invalid_action" | "infinite_loop" | "syntax_error"
  message: string
  blockIndex: number
}

export interface LevelObjective {
  type: "reach" | "collect" | "collectAll" | "activate" | "avoid"
  target?: { x: number; y: number }
  item?: string
  count?: number
  items?: string[]
  id?: string
}

export interface TreasureFragmentConfig {
  fragmentId: string           // "fragment-{world}-{n}" e.g. "fragment-1-1"
  worldId: number              // 1-5
  fragmentNumber: number       // 1-3 within the world
  description: string          // "Fragmento 1 del Mundo 1"
}

export interface LevelData {
  id: string
  title: string
  gridSize: { rows: number; cols: number }
  startPosition: { x: number; y: number; facing: Direction }
  objectives: LevelObjective[]
  obstacles: Array<{ x: number; y: number; type: EntityType }>
  collectibles: Array<{ id: string; x: number; y: number; type: EntityType }>
  availableBlocks: string[]
  optimalSolution?: {
    blockCount: number
  }
  hints?: string[]
  xpReward?: number
  treasureFragment?: TreasureFragmentConfig
}

export interface ExecutionResult {
  success: boolean
  stars: 1 | 2 | 3
  xpEarned: number
  completedObjectives: LevelObjective[]
  failedObjectives: LevelObjective[]
  isOptimal: boolean
}

export interface LessonSection {
  type: "story" | "demo" | "practice" | "summary"
  data: LessonSectionData
}

export interface LessonSectionData {
  dialogue?: string
  demoCode?: string[]
  beforeCode?: string[]
  afterCode?: string[]
  message?: string
  challenge?: string
  availableBlocks?: string[]
  maxBlocks?: number
  gridSetup?: {
    size: number
    jorc: { x: number; y: number; facing: Direction }
    target?: { x: number; y: number; type: string }
    obstacles?: Array<{ x: number; y: number; type: string }>
  }
  solution?: string[]
  summaryPoints?: string[]
  quiz?: {
    question: string
    options: Array<{ value: string; label: string; correct?: boolean }>
  }
}

export interface Lesson {
  id: string
  title: string
  duration: string
  icon: string
  description: string
  category: "basic" | "sequence" | "loop" | "conditional" | "advanced"
  order: number
  requiredLesson?: string
  requiredWorld?: number
  content: LessonSection[]
}

export interface GlossaryTerm {
  term: string
  definition: string
  example: string
  relatedTerms: string[]
}

export interface AcademyProgress {
  completedLessons: string[]
  quizScores: Record<string, number>
  badges: string[]
  currentLesson?: string
  totalTimeSpent: number
}
