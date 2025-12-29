import type { GridData, Entity, PathStep, LevelData } from "./types"

export function getLevelConfig(levelId: string): LevelData {
  // Extract custom sequence levels
  if (levelId.startsWith("secuencia-")) {
    const levelNum = Number.parseInt(levelId.split("-")[1], 10)

    // Nivel 1: Linea Recta (Solo Avanzar)
    if (levelNum === 1) {
      return {
        id: levelId,
        title: "Primeros Pasos",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 1, y: 2, facing: "east" },
        objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
        obstacles: [],
        collectibles: [],
        availableBlocks: ["forward"],
        optimalSolution: { blockCount: 3 },
        hints: ["Simplemente avanza hacia la meta", "Necesitas 3 pasos para llegar"],
      }
    }

    // Nivel 2: Primer Giro (Avanzar + Girar)
    if (levelNum === 2) {
      return {
        id: levelId,
        title: "Girando",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 1, y: 3, facing: "east" },
        objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
        obstacles: [],
        collectibles: [],
        availableBlocks: ["forward", "turn-left"],
        optimalSolution: { blockCount: 5 }, // F2, L, F2
        hints: ["Avanza hasta alinearte con la meta", "Luego gira a la izquierda y sigue avanzando"],
      }
    }

    // Nivel 3: Escalera (Multiples Giros)
    if (levelNum === 3) {
      return {
        id: levelId,
        title: "La Escalera",
        gridSize: { rows: 6, cols: 6 },
        startPosition: { x: 1, y: 4, facing: "east" },
        objectives: [{ type: "reach", target: { x: 4, y: 1 } }],
        obstacles: [],
        collectibles: [],
        availableBlocks: ["forward", "turn-left", "turn-right"],
        hints: ["Tendras que girar varias veces", "Imagina que subes una escalera"],
      }
    }

    // Nivel 4: Vuelta en U (Giro 180 o dos giros de 90)
    if (levelNum === 4) {
      return {
        id: levelId,
        title: "Media Vuelta",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 1, y: 1, facing: "east" },
        objectives: [{ type: "reach", target: { x: 1, y: 3 } }],
        obstacles: [
          { x: 2, y: 1, type: "wall" },
          { x: 3, y: 1, type: "wall" },
          { x: 3, y: 2, type: "wall" },
          { x: 3, y: 3, type: "wall" },
          { x: 2, y: 3, type: "wall" },
        ],
        collectibles: [],
        availableBlocks: ["forward", "turn-right"],
        optimalSolution: { blockCount: 6 },
        hints: ["Tienes un muro enfrente, no puedes avanzar directo", "Rodea el obstaculo"],
      }
    }

    // Nivel 5: Esquivar Obstaculo
    if (levelNum === 5) {
      return {
        id: levelId,
        title: "Obstaculos",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 0, y: 2, facing: "east" },
        objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
        obstacles: [{ x: 2, y: 2, type: "rock" }],
        collectibles: [],
        availableBlocks: ["forward", "turn-left", "turn-right"],
        optimalSolution: { blockCount: 6 },
        hints: ["Hay una roca en tu camino", "Pasa por arriba o por abajo para esquivarla"],
      }
    }

    // Nivel 6: Primera Moneda (Acciones)
    if (levelNum === 6) {
      return {
        id: levelId,
        title: "Tesoros",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 1, y: 2, facing: "east" },
        objectives: [
          { type: "reach", target: { x: 4, y: 2 } },
          { type: "collect", item: "coin", count: 1 }
        ],
        obstacles: [],
        collectibles: [{ id: "c1", x: 2, y: 2, type: "coin" }],
        availableBlocks: ["forward", "collect-coin"],
        optimalSolution: { blockCount: 4 }, // F1, Collect, F2
        hints: ["No olvides recoger la moneda antes de llegar a la meta", "Usa el bloque 'Recoger Moneda' cuando estes sobre ella"],
      }
    }

    // Nivel 7: Varias Monedas
    if (levelNum === 7) {
      return {
        id: levelId,
        title: "Coleccionista",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 0, y: 2, facing: "east" },
        objectives: [
          { type: "reach", target: { x: 4, y: 2 } },
          { type: "collect", item: "coin", count: 2 }
        ],
        collectibles: [
          { id: "c1", x: 1, y: 2, type: "coin" },
          { id: "c2", x: 3, y: 2, type: "coin" }
        ],
        obstacles: [],
        availableBlocks: ["forward", "collect-coin"],
        optimalSolution: { blockCount: 6 },
        hints: ["Recoge todas las monedas en tu camino"],
      }
    }

    // Nivel 8: Monedas y Giros
    if (levelNum === 8) {
      return {
        id: levelId,
        title: "Ruta de Monedas",
        gridSize: { rows: 5, cols: 5 },
        startPosition: { x: 1, y: 1, facing: "east" },
        objectives: [
          { type: "reach", target: { x: 3, y: 3 } },
          { type: "collectAll", items: ["coin"] }
        ],
        collectibles: [
          { id: "c1", x: 1, y: 3, type: "coin" },
          { id: "c2", x: 3, y: 1, type: "coin" }
        ],
        obstacles: [{ x: 2, y: 2, type: "tree" }],
        availableBlocks: ["forward", "turn-left", "collect-coin"],
        hints: ["Planea tu ruta para pasar por ambas monedas"],
      }
    }

    // Nivel 9: Laberinto con acciones
    if (levelNum === 9) {
      return {
        id: levelId,
        title: "El Laberinto",
        gridSize: { rows: 6, cols: 6 },
        startPosition: { x: 0, y: 0, facing: "east" },
        objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
        obstacles: [
          { x: 1, y: 0, type: "wall" }, { x: 3, y: 0, type: "wall" },
          { x: 1, y: 1, type: "wall" }, { x: 3, y: 1, type: "wall" }, { x: 5, y: 1, type: "wall" },
          { x: 1, y: 2, type: "wall" }, { x: 3, y: 2, type: "wall" }, { x: 5, y: 2, type: "wall" },
          { x: 5, y: 3, type: "wall" },
          { x: 0, y: 4, type: "wall" }, { x: 1, y: 4, type: "wall" }, { x: 2, y: 4, type: "wall" }, { x: 3, y: 4, type: "wall" }, { x: 5, y: 4, type: "wall" },
        ],
        collectibles: [{ id: "g1", type: "gem", x: 0, y: 5 }], // Bonus
        availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"], // No coin needed but maybe gem?
        hints: ["Sigue el camino libre", "Cuidado con los callejones sin salida"],
      }
    }

    // Nivel 10: Intro Repetir (Patron simple)
    if (levelNum === 10) {
      return {
        id: levelId,
        title: "Patrones",
        gridSize: { rows: 8, cols: 8 },
        startPosition: { x: 1, y: 1, facing: "east" },
        objectives: [{ type: "reach", target: { x: 7, y: 1 } }],
        obstacles: [],
        collectibles: [],
        availableBlocks: ["forward", "repeat"],
        optimalSolution: { blockCount: 2 }, // Repeat 6 times Forward
        hints: ["En lugar de usar muchos bloques 'Avanzar', usa un bloque 'Repetir'", "Avanza 6 veces"],
      }
    }

    // Nivel 11: Repetir Cuadrado
    if (levelNum === 11) {
      return {
        id: levelId,
        title: "El Cuadrado",
        gridSize: { rows: 6, cols: 6 },
        startPosition: { x: 1, y: 1, facing: "east" },
        objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
        obstacles: [],
        collectibles: [],
        availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
        hints: ["Busca un patron que se repita", "Avanzar y girar, avanzar y girar..."],
      }
    }

    // Nivel 12: Desafio Final Secuencia
    if (levelNum === 12) {
      return {
        id: levelId,
        title: "Gran Desafio",
        gridSize: { rows: 7, cols: 7 },
        startPosition: { x: 0, y: 0, facing: "east" },
        objectives: [
          { type: "reach", target: { x: 6, y: 6 } },
          { type: "collectAll", items: ["coin"] }
        ],
        obstacles: [
          { x: 0, y: 3, type: "rock" }, { x: 1, y: 3, type: "rock" }, { x: 2, y: 3, type: "rock" },
          { x: 4, y: 3, type: "rock" }, { x: 5, y: 3, type: "rock" }, { x: 6, y: 3, type: "rock" },
        ],
        collectibles: [
          { id: "c1", x: 0, y: 6, type: "coin" },
          { id: "c2", x: 6, y: 0, type: "coin" },
          { id: "c3", x: 3, y: 3, type: "coin" } // Bridge coin
        ],
        availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
        hints: ["Combina todo lo que has aprendido", "Usa repeticiones donde puedas"],
      }
    }
  }
  // ========== WORLD 1 LEVELS (1-1 to 1-12) ==========
  // Progressive difficulty: 4x4 (1-6), 5x5 (7-9), 7x7 (10-12)

  // 1-1: Just forward (4x4)
  if (levelId === "1-1" || levelId === "tutorial") {
    return {
      id: levelId,
      title: "Caminar",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward"],
      optimalSolution: { blockCount: 3 },
      hints: ["Solo avanza en linea recta", "Necesitas 3 bloques 'Avanzar'"],
    }
  }

  // 1-2: Forward + first turn (4x4)
  if (levelId === "1-2") {
    return {
      id: levelId,
      title: "Primer Giro",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 2, y: 2 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "turn-right"],
      optimalSolution: { blockCount: 4 },
      hints: ["Avanza, gira a la derecha, y sigue avanzando"],
    }
  }

  // 1-3: Turns practice (4x4)
  if (levelId === "1-3") {
    return {
      id: levelId,
      title: "Giros",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 3, facing: "north" },
      objectives: [{ type: "reach", target: { x: 3, y: 0 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left"],
      hints: ["Practica girando en ambas direcciones"],
    }
  }

  // 1-4: First coin (4x4)
  if (levelId === "1-4") {
    return {
      id: levelId,
      title: "Tu Primera Moneda",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 3, y: 1 } },
        { type: "collect", item: "coin", count: 1 },
      ],
      obstacles: [],
      collectibles: [{ id: "c1", x: 2, y: 1, type: "coin" }],
      availableBlocks: ["forward", "collect-coin"],
      optimalSolution: { blockCount: 4 },
      hints: ["Recoge la moneda cuando estes sobre ella"],
    }
  }

  // 1-5: Coin + turn (4x4)
  if (levelId === "1-5") {
    return {
      id: levelId,
      title: "Moneda Escondida",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 3, y: 3 } },
        { type: "collect", item: "coin", count: 1 },
      ],
      obstacles: [],
      collectibles: [{ id: "c1", x: 2, y: 2, type: "coin" }],
      availableBlocks: ["forward", "turn-right", "collect-coin"],
      hints: ["La moneda no esta en linea recta!"],
    }
  }

  // 1-6: Two coins (4x4)
  if (levelId === "1-6") {
    return {
      id: levelId,
      title: "Doble Tesoro",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 3, y: 3 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 2, y: 0, type: "coin" },
        { id: "c2", x: 3, y: 2, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
      hints: ["Planifica tu ruta para pasar por ambas monedas"],
    }
  }

  // 1-7: First obstacle (5x5)
  if (levelId === "1-7") {
    return {
      id: levelId,
      title: "Esquivando Rocas",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [{ x: 2, y: 2, type: "rock" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left"],
      hints: ["Hay una roca en el camino - rodeala"],
    }
  }

  // 1-8: Obstacle + coin (5x5)
  if (levelId === "1-8") {
    return {
      id: levelId,
      title: "Tesoro Protegido",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 4, y: 4 } },
        { type: "collect", item: "coin", count: 1 },
      ],
      obstacles: [{ x: 2, y: 2, type: "rock" }],
      collectibles: [{ id: "c1", x: 3, y: 1, type: "coin" }],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
      hints: ["Recoge la moneda antes de llegar a la meta"],
    }
  }

  // 1-9: Multiple obstacles (5x5)
  if (levelId === "1-9") {
    return {
      id: levelId,
      title: "Laberinto Simple",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [{ type: "reach", target: { x: 4, y: 4 } }],
      obstacles: [
        { x: 1, y: 1, type: "rock" },
        { x: 2, y: 2, type: "rock" },
        { x: 3, y: 3, type: "rock" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left"],
      hints: ["Hay varias rocas formando una diagonal"],
    }
  }

  // 1-10: Intro to repeat (7x7)
  if (levelId === "1-10") {
    return {
      id: levelId,
      title: "Repitiendo",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [{ type: "reach", target: { x: 6, y: 3 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "repeat"],
      optimalSolution: { blockCount: 2 },
      hints: ["En vez de 6 bloques 'Avanzar', usa 'Repetir'!"],
    }
  }

  // 1-11: Repeat + turns (7x7)
  if (levelId === "1-11") {
    return {
      id: levelId,
      title: "Patron Cuadrado",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 1, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "repeat"],
      hints: ["Busca un patron: avanzar y girar"],
    }
  }

  // 1-12: Final challenge (7x7)
  if (levelId === "1-12") {
    return {
      id: levelId,
      title: "Desafio Final",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 6 } },
        { type: "collect", item: "coin", count: 3 },
      ],
      obstacles: [
        { x: 3, y: 0, type: "rock" },
        { x: 3, y: 1, type: "rock" },
        { x: 3, y: 2, type: "rock" },
      ],
      collectibles: [
        { id: "c1", x: 1, y: 1, type: "coin" },
        { id: "c2", x: 5, y: 3, type: "coin" },
        { id: "c3", x: 4, y: 5, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Usa todo lo que aprendiste!"],
    }
  }

  // Default fallback for unknown levels
  return {
    id: levelId,
    title: "Nivel Desconocido",
    gridSize: { rows: 4, cols: 4 },
    startPosition: { x: 0, y: 0, facing: "east" },
    objectives: [{ type: "reach", target: { x: 3, y: 3 } }],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left"],
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
