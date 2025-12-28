import type { GridData, Entity, PathStep, LevelData } from "./types"

export function getLevelConfig(levelId: string): LevelData {
  // Tutorial level
  if (levelId === "1-1" || levelId === "tutorial") {
    return {
      id: levelId,
      title: "Primeros Pasos",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 4, y: 4 } },
        { type: "collect", item: "chest", count: 1 },
      ],
      obstacles: [{ x: 2, y: 2, type: "rock" }],
      collectibles: [
        { id: "chest-1", x: 4, y: 4, type: "chest" },
        { id: "coin-1", x: 2, y: 0, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "open-chest"],
      optimalSolution: { blockCount: 5 },
      hints: [
        "Piensa en cuantos pasos necesitas dar primero para llegar al primer obstaculo",
        "Intenta avanzar, luego girar a la derecha",
        "La solucion: Avanzar 4 -> Girar Derecha -> Avanzar 4 -> Abrir Cofre",
      ],
    }
  }

  // Level 1-2
  if (levelId === "1-2") {
    return {
      id: levelId,
      title: "Recoleccion",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 5, y: 5 } },
        { type: "collectAll", items: ["coin"] },
      ],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 3, y: 2, type: "rock" },
        { x: 2, y: 1, type: "tree" },
        { x: 4, y: 3, type: "tree" },
      ],
      collectibles: [
        { id: "chest-1", x: 5, y: 5, type: "chest" },
        { id: "coin-1", x: 1, y: 3, type: "coin" },
        { id: "coin-2", x: 4, y: 1, type: "coin" },
        { id: "gem-1", x: 3, y: 4, type: "gem" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "backward", "collect-coin", "open-chest"],
      optimalSolution: { blockCount: 8 },
      hints: [
        "Primero recoge las monedas, luego ve al cofre",
        "Usa giros para cambiar de direccion",
        "Planifica tu ruta para no pasar dos veces por el mismo lugar",
      ],
    }
  }

  // Default level (bucle-5 and others)
  return {
    id: levelId,
    title: "Exploracion",
    gridSize: { rows: 8, cols: 8 },
    startPosition: { x: 0, y: 0, facing: "east" },
    objectives: [{ type: "reach", target: { x: 7, y: 7 } }],
    obstacles: [
      { x: 2, y: 2, type: "rock" },
      { x: 5, y: 5, type: "rock" },
      { x: 1, y: 4, type: "tree" },
      { x: 6, y: 2, type: "tree" },
      { x: 3, y: 1, type: "wall" },
      { x: 4, y: 1, type: "wall" },
    ],
    collectibles: [
      { id: "chest-1", x: 7, y: 7, type: "chest" },
      { id: "coin-1", x: 2, y: 5, type: "coin" },
      { id: "coin-2", x: 5, y: 2, type: "coin" },
      { id: "coin-3", x: 6, y: 6, type: "coin" },
      { id: "gem-1", x: 1, y: 6, type: "gem" },
    ],
    availableBlocks: ["forward", "turn-right", "turn-left", "backward", "collect-coin", "open-chest", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: [
      "Usa el bloque Repetir para moverte mas eficientemente",
      "Evita los obstaculos planificando tu ruta",
      "Avanza hacia el sur, luego al este para llegar al cofre",
    ],
  }
}

// Mock level data generator (backward compatible)
export function getMockLevelData(levelId: string): {
  gridData: GridData
  entities: Entity[]
  objective: string
} {
  const config = getLevelConfig(levelId)

  // Build tiles
  const tiles: GridData["tiles"] = []
  for (let y = 0; y < config.gridSize.rows; y++) {
    for (let x = 0; x < config.gridSize.cols; x++) {
      tiles.push({ x, y, type: "grass" })
    }
  }

  // Build entities
  const entities: Entity[] = [
    {
      id: "jorc",
      type: "jorc",
      x: config.startPosition.x,
      y: config.startPosition.y,
      facing: config.startPosition.facing,
    },
    ...config.obstacles.map((o, i) => ({
      id: `obstacle-${i}`,
      type: o.type as Entity["type"],
      x: o.x,
      y: o.y,
    })),
    ...config.collectibles.map((c) => ({
      id: c.id,
      type: c.type as Entity["type"],
      x: c.x,
      y: c.y,
    })),
  ]

  // Build objective string
  const objectiveStrings = config.objectives.map((obj) => {
    if (obj.type === "reach") return `Llega a la posicion (${obj.target?.x}, ${obj.target?.y})`
    if (obj.type === "collect") return `Recoge ${obj.count} ${obj.item}`
    if (obj.type === "collectAll") return `Recoge todos los ${obj.items?.join(", ")}`
    if (obj.type === "activate") return `Activa la palanca`
    return ""
  })

  return {
    gridData: {
      rows: config.gridSize.rows,
      cols: config.gridSize.cols,
      tiles,
    },
    entities,
    objective: objectiveStrings.join(" y "),
  }
}

// Mock path for demonstration (deprecated, engine now generates real paths)
export function getMockPath(): PathStep[] {
  return [
    { x: 0, y: 0, direction: "south" },
    { x: 0, y: 1, direction: "south" },
    { x: 0, y: 2, direction: "east" },
    { x: 1, y: 2, direction: "east" },
    { x: 2, y: 2, direction: "south" },
    { x: 2, y: 3, direction: "south" },
    { x: 2, y: 4, direction: "east" },
    { x: 3, y: 4, direction: "east" },
    { x: 4, y: 4, direction: "east" },
  ]
}
