import type { GridData, Entity, PathStep, LevelData } from "./types"

export function getLevelConfig(levelId: string): LevelData {
  // Extract custom sequence levels
  // Custom sequence levels logic removed - consolidated into numeric IDs below

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
      availableBlocks: ["forward", "turn-right", "turn-left"],
      optimalSolution: { blockCount: 4 },
      hints: ["Avanza, gira a la derecha (o izquierda), y sigue avanzando"],
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
      availableBlocks: ["forward", "collect-coin", "turn-right", "turn-left"],
      optimalSolution: { blockCount: 4 },
      hints: ["Recoge la moneda cuando estes sobre ella"],
      treasureFragment: {
        fragmentId: "fragment-1-1",
        worldId: 1,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Secuencia"
      },
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
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
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
      treasureFragment: {
        fragmentId: "fragment-1-2",
        worldId: 1,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Secuencia"
      },
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
      treasureFragment: {
        fragmentId: "fragment-1-3",
        worldId: 1,
        fragmentNumber: 3,
        description: "Tercer fragmento de la Isla Secuencia"
      },
    }
  }

  // ========== WORLD 2 LEVELS (Remolinos de las Mareas - Night Theme + Krakens) ==========

  // 2-1: Intro to night theme (4x4)
  if (levelId === "2-1") {
    return {
      id: levelId,
      title: "Aguas Nocturnas",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "repeat"],
      optimalSolution: { blockCount: 2 },
      hints: ["Bienvenido a las aguas nocturnas. Usa Repetir para avanzar!"],
    }
  }

  // 2-2: Forward + turns (4x4)
  if (levelId === "2-2") {
    return {
      id: levelId,
      title: "Corriente Marina",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [{ type: "reach", target: { x: 3, y: 3 } }],
      obstacles: [],
      collectibles: [{ id: "c1", x: 0, y: 2, type: "coin" }],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["La corriente te lleva hacia el sur y el este"],
    }
  }

  // 2-3: First Kraken encounter (4x4)
  if (levelId === "2-3") {
    return {
      id: levelId,
      title: "Peligro en las Sombras",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
      obstacles: [{ x: 2, y: 1, type: "kraken" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Cuidado con el Kraken! No lo toques o te atrapará."],
    }
  }

  // 2-4: Fragment level - Repeat intro (5x5)
  if (levelId === "2-4") {
    return {
      id: levelId,
      title: "Bucle Simple",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "repeat"],
      optimalSolution: { blockCount: 2 },
      hints: ["Usa el bloque Repetir para avanzar 4 veces"],
      treasureFragment: {
        fragmentId: "fragment-2-1",
        worldId: 2,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Remolinos"
      },
    }
  }

  // 2-5: Navigate around Krakens (5x5)
  if (levelId === "2-5") {
    return {
      id: levelId,
      title: "Esquivando Tentáculos",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 4 } }],
      obstacles: [
        { x: 2, y: 0, type: "kraken" },
        { x: 2, y: 2, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Rodea a los Krakens por la izquierda o derecha"],
    }
  }

  // 2-6: Repeat + turns pattern (5x5)
  if (levelId === "2-6") {
    return {
      id: levelId,
      title: "Patrón de las Mareas",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 4, y: 4 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 2, y: 0, type: "coin" },
        { id: "c2", x: 4, y: 2, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Avanza, recoge, gira - busca el patrón"],
    }
  }

  // 2-7: Multiple Krakens blocking paths (5x5)
  if (levelId === "2-7") {
    return {
      id: levelId,
      title: "Trampa del Kraken",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [
        { x: 1, y: 1, type: "kraken" },
        { x: 1, y: 3, type: "kraken" },
        { x: 3, y: 1, type: "kraken" },
        { x: 3, y: 3, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Solo hay un camino seguro - por el medio!"],
    }
  }

  // 2-8: Fragment level - Repeat + turn patterns (6x6)
  if (levelId === "2-8") {
    return {
      id: levelId,
      title: "Bucle con Giros",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
      obstacles: [{ x: 3, y: 3, type: "kraken" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "repeat"],
      hints: ["Avanza y gira en un patrón repetible, evita al Kraken"],
      treasureFragment: {
        fragmentId: "fragment-2-2",
        worldId: 2,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Remolinos"
      },
    }
  }

  // 2-9: Complex navigation (6x6)
  if (levelId === "2-9") {
    return {
      id: levelId,
      title: "Laberinto Oscuro",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [
        { type: "reach", target: { x: 5, y: 5 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [
        { x: 1, y: 2, type: "kraken" },
        { x: 4, y: 3, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 2, y: 1, type: "coin" },
        { id: "c2", x: 3, y: 4, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Planifica tu ruta cuidadosamente en la oscuridad"],
    }
  }

  // 2-10: Obstacle + Kraken combo (6x6)
  if (levelId === "2-10") {
    return {
      id: levelId,
      title: "Mareas Cambiantes",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [{ type: "reach", target: { x: 5, y: 3 } }],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 2, y: 3, type: "kraken" },
        { x: 2, y: 4, type: "rock" },
        { x: 4, y: 2, type: "kraken" },
        { x: 4, y: 4, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Combina esquivar rocas y Krakens - sube o baja"],
    }
  }

  // 2-11: Advanced patterns (7x7)
  if (levelId === "2-11") {
    return {
      id: levelId,
      title: "El Abismo",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 3 } },
        { type: "collect", item: "coin", count: 3 },
      ],
      obstacles: [
        { x: 2, y: 2, type: "kraken" },
        { x: 4, y: 4, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 1, y: 1, type: "coin" },
        { id: "c2", x: 3, y: 3, type: "coin" },
        { id: "c3", x: 5, y: 5, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Sigue la diagonal de monedas, cuidado con los Krakens"],
    }
  }

  // 2-12: Fragment level - Final challenge (7x7)
  if (levelId === "2-12") {
    return {
      id: levelId,
      title: "Maestro del Bucle",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 6 } },
        { type: "collect", item: "coin", count: 4 },
      ],
      obstacles: [
        { x: 2, y: 1, type: "kraken" },
        { x: 4, y: 3, type: "kraken" },
        { x: 1, y: 5, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 2, y: 0, type: "coin" },
        { id: "c2", x: 4, y: 2, type: "coin" },
        { id: "c3", x: 2, y: 4, type: "coin" },
        { id: "c4", x: 4, y: 6, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Encuentra el patrón en las monedas, evita los Krakens"],
      treasureFragment: {
        fragmentId: "fragment-2-3",
        worldId: 2,
        fragmentNumber: 3,
        description: "Tercer fragmento de la Isla Remolinos"
      },
    }
  }

  // ========== WORLD 3 LEVELS (Decisiones) - Fragment levels only ==========

  if (levelId === "3-4") {
    return {
      id: levelId,
      title: "Primera Decisión",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 2, y: 0, facing: "south" },
      objectives: [{ type: "reach", target: { x: 2, y: 4 } }],
      obstacles: [{ x: 2, y: 2, type: "rock" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked"],
      hints: ["Usa Si-Bloqueado para decidir girar"],
      treasureFragment: {
        fragmentId: "fragment-3-1",
        worldId: 3,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Decisiones"
      },
    }
  }

  if (levelId === "3-8") {
    return {
      id: levelId,
      title: "Caminos Múltiples",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 5, y: 3 } },
        { type: "collect", item: "coin", count: 1 },
      ],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 2, y: 3, type: "rock" },
        { x: 2, y: 4, type: "rock" },
      ],
      collectibles: [{ id: "c1", x: 4, y: 1, type: "coin" }],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
      hints: ["El muro te obliga a tomar otro camino"],
      treasureFragment: {
        fragmentId: "fragment-3-2",
        worldId: 3,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Decisiones"
      },
    }
  }

  if (levelId === "3-12") {
    return {
      id: levelId,
      title: "Laberinto Inteligente",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 6, y: 6 } }],
      obstacles: [
        { x: 1, y: 0, type: "rock" },
        { x: 1, y: 1, type: "rock" },
        { x: 3, y: 2, type: "rock" },
        { x: 3, y: 3, type: "rock" },
        { x: 5, y: 4, type: "rock" },
        { x: 5, y: 5, type: "rock" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
      hints: ["Usa condicionales dentro de bucles"],
      treasureFragment: {
        fragmentId: "fragment-3-3",
        worldId: 3,
        fragmentNumber: 3,
        description: "Tercer fragmento de la Isla Decisiones"
      },
    }
  }

  // ========== WORLD 4 LEVELS (Memoria/Variables) - Fragment levels only ==========

  if (levelId === "4-4") {
    return {
      id: levelId,
      title: "Contador de Monedas",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 4, y: 2 } },
        { type: "collect", item: "coin", count: 3 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 1, y: 2, type: "coin" },
        { id: "c2", x: 2, y: 2, type: "coin" },
        { id: "c3", x: 3, y: 2, type: "coin" },
      ],
      availableBlocks: ["forward", "collect-coin", "variable", "repeat"],
      hints: ["Guarda el conteo en una variable"],
      treasureFragment: {
        fragmentId: "fragment-4-1",
        worldId: 4,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Memoria"
      },
    }
  }

  if (levelId === "4-8") {
    return {
      id: levelId,
      title: "Memoria Direccional",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 3, y: 3, type: "rock" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "variable", "repeat", "if-blocked"],
      hints: ["Recuerda cuántas veces has girado"],
      treasureFragment: {
        fragmentId: "fragment-4-2",
        worldId: 4,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Memoria"
      },
    }
  }

  if (levelId === "4-12") {
    return {
      id: levelId,
      title: "Cálculo Pirata",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 3 } },
        { type: "collect", item: "coin", count: 6 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 1, y: 1, type: "coin" },
        { id: "c2", x: 1, y: 5, type: "coin" },
        { id: "c3", x: 3, y: 3, type: "coin" },
        { id: "c4", x: 5, y: 1, type: "coin" },
        { id: "c5", x: 5, y: 5, type: "coin" },
        { id: "c6", x: 6, y: 3, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "variable", "repeat", "if-blocked"],
      hints: ["Usa variables para rastrear monedas"],
      treasureFragment: {
        fragmentId: "fragment-4-3",
        worldId: 4,
        fragmentNumber: 3,
        description: "Tercer fragmento de la Isla Memoria"
      },
    }
  }

  // ========== WORLD 5 LEVELS (Funciones) - Fragment levels only ==========

  if (levelId === "5-4") {
    return {
      id: levelId,
      title: "Mi Primera Función",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "function-define", "function-call"],
      optimalSolution: { blockCount: 3 },
      hints: ["Define una función para avanzar varias veces"],
      treasureFragment: {
        fragmentId: "fragment-5-1",
        worldId: 5,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Funciones"
      },
    }
  }

  if (levelId === "5-8") {
    return {
      id: levelId,
      title: "Funciones con Parámetros",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [
        { type: "reach", target: { x: 5, y: 5 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 2, y: 2, type: "coin" },
        { id: "c2", x: 4, y: 4, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "function-define", "function-call", "repeat"],
      hints: ["Crea una función que reciba cuántos pasos dar"],
      treasureFragment: {
        fragmentId: "fragment-5-2",
        worldId: 5,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Funciones"
      },
    }
  }

  if (levelId === "5-12") {
    return {
      id: levelId,
      title: "¡El Tesoro Final!",
      gridSize: { rows: 8, cols: 8 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 7, y: 7 } },
        { type: "collect", item: "coin", count: 8 },
      ],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 5, y: 2, type: "rock" },
        { x: 2, y: 5, type: "rock" },
        { x: 5, y: 5, type: "rock" },
      ],
      collectibles: [
        { id: "c1", x: 1, y: 1, type: "coin" },
        { id: "c2", x: 3, y: 1, type: "coin" },
        { id: "c3", x: 6, y: 1, type: "coin" },
        { id: "c4", x: 1, y: 4, type: "coin" },
        { id: "c5", x: 6, y: 4, type: "coin" },
        { id: "c6", x: 1, y: 6, type: "coin" },
        { id: "c7", x: 4, y: 6, type: "coin" },
        { id: "c8", x: 7, y: 7, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "function-define", "function-call", "repeat", "if-blocked", "variable"],
      hints: ["Usa todo lo que aprendiste - este es el desafío final!"],
      treasureFragment: {
        fragmentId: "fragment-5-3",
        worldId: 5,
        fragmentNumber: 3,
        description: "¡Fragmento final! El Mapa del Tesoro está completo"
      },
    }
  }

  // ========== WORLD 2 LEVELS (Remolinos de las Mareas - Night Theme + Krakens) ==========

  // 2-1: Intro to night theme (4x4)
  if (levelId === "2-1") {
    return {
      id: levelId,
      title: "Aguas Nocturnas",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "repeat"],
      optimalSolution: { blockCount: 2 },
      hints: ["Bienvenido a las aguas nocturnas. Usa Repetir para avanzar!"],
    }
  }

  // 2-2: Forward + turns (4x4)
  if (levelId === "2-2") {
    return {
      id: levelId,
      title: "Corriente Marina",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [{ type: "reach", target: { x: 3, y: 3 } }],
      obstacles: [],
      collectibles: [{ id: "c1", x: 0, y: 2, type: "coin" }],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["La corriente te lleva hacia el sur y el este"],
    }
  }

  // 2-3: First Kraken encounter (4x4)
  if (levelId === "2-3") {
    return {
      id: levelId,
      title: "Peligro en las Sombras",
      gridSize: { rows: 4, cols: 4 },
      startPosition: { x: 0, y: 1, facing: "east" },
      objectives: [{ type: "reach", target: { x: 3, y: 1 } }],
      obstacles: [{ x: 2, y: 1, type: "kraken" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Cuidado con el Kraken! No lo toques o te atrapará."],
    }
  }

  // 2-4: Fragment level - Repeat intro (5x5)
  if (levelId === "2-4") {
    return {
      id: levelId,
      title: "Bucle Simple",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [],
      collectibles: [],
      availableBlocks: ["forward", "repeat"],
      optimalSolution: { blockCount: 2 },
      hints: ["Usa el bloque Repetir para avanzar 4 veces"],
      treasureFragment: {
        fragmentId: "fragment-2-1",
        worldId: 2,
        fragmentNumber: 1,
        description: "Primer fragmento de la Isla Remolinos"
      },
    }
  }

  // 2-5: Navigate around Krakens (5x5)
  if (levelId === "2-5") {
    return {
      id: levelId,
      title: "Esquivando Tentáculos",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 4 } }],
      obstacles: [
        { x: 2, y: 0, type: "kraken" },
        { x: 2, y: 2, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Rodea a los Krakens por la izquierda o derecha"],
    }
  }

  // 2-6: Repeat + turns pattern (5x5)
  if (levelId === "2-6") {
    return {
      id: levelId,
      title: "Patrón de las Mareas",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 4, y: 4 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [],
      collectibles: [
        { id: "c1", x: 2, y: 0, type: "coin" },
        { id: "c2", x: 4, y: 2, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Avanza, recoge, gira - busca el patrón"],
    }
  }

  // 2-7: Multiple Krakens blocking paths (5x5)
  if (levelId === "2-7") {
    return {
      id: levelId,
      title: "Trampa del Kraken",
      gridSize: { rows: 5, cols: 5 },
      startPosition: { x: 0, y: 2, facing: "east" },
      objectives: [{ type: "reach", target: { x: 4, y: 2 } }],
      obstacles: [
        { x: 1, y: 1, type: "kraken" },
        { x: 1, y: 3, type: "kraken" },
        { x: 3, y: 1, type: "kraken" },
        { x: 3, y: 3, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Solo hay un camino seguro - por el medio!"],
    }
  }

  // 2-8: Fragment level - Repeat + turn patterns (6x6)
  if (levelId === "2-8") {
    return {
      id: levelId,
      title: "Bucle con Giros",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [{ type: "reach", target: { x: 5, y: 5 } }],
      obstacles: [{ x: 3, y: 3, type: "kraken" }],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "repeat"],
      hints: ["Avanza y gira en un patrón repetible, evita al Kraken"],
      treasureFragment: {
        fragmentId: "fragment-2-2",
        worldId: 2,
        fragmentNumber: 2,
        description: "Segundo fragmento de la Isla Remolinos"
      },
    }
  }

  // 2-9: Complex navigation (6x6)
  if (levelId === "2-9") {
    return {
      id: levelId,
      title: "Laberinto Oscuro",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 0, facing: "south" },
      objectives: [
        { type: "reach", target: { x: 5, y: 5 } },
        { type: "collect", item: "coin", count: 2 },
      ],
      obstacles: [
        { x: 1, y: 2, type: "kraken" },
        { x: 4, y: 3, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 2, y: 1, type: "coin" },
        { id: "c2", x: 3, y: 4, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Planifica tu ruta cuidadosamente en la oscuridad"],
    }
  }

  // 2-10: Obstacle + Kraken combo (6x6)
  if (levelId === "2-10") {
    return {
      id: levelId,
      title: "Mareas Cambiantes",
      gridSize: { rows: 6, cols: 6 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [{ type: "reach", target: { x: 5, y: 3 } }],
      obstacles: [
        { x: 2, y: 2, type: "rock" },
        { x: 2, y: 3, type: "kraken" },
        { x: 2, y: 4, type: "rock" },
        { x: 4, y: 2, type: "kraken" },
        { x: 4, y: 4, type: "kraken" },
      ],
      collectibles: [],
      availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
      hints: ["Combina esquivar rocas y Krakens - sube o baja"],
    }
  }

  // 2-11: Advanced patterns (7x7)
  if (levelId === "2-11") {
    return {
      id: levelId,
      title: "El Abismo",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 3, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 3 } },
        { type: "collect", item: "coin", count: 3 },
      ],
      obstacles: [
        { x: 2, y: 2, type: "kraken" },
        { x: 4, y: 4, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 1, y: 1, type: "coin" },
        { id: "c2", x: 3, y: 3, type: "coin" },
        { id: "c3", x: 5, y: 5, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Sigue la diagonal de monedas, cuidado con los Krakens"],
    }
  }

  // 2-12: Fragment level - Final challenge (7x7)
  if (levelId === "2-12") {
    return {
      id: levelId,
      title: "Maestro del Bucle",
      gridSize: { rows: 7, cols: 7 },
      startPosition: { x: 0, y: 0, facing: "east" },
      objectives: [
        { type: "reach", target: { x: 6, y: 6 } },
        { type: "collect", item: "coin", count: 4 },
      ],
      obstacles: [
        { x: 2, y: 1, type: "kraken" },
        { x: 4, y: 3, type: "kraken" },
        { x: 1, y: 5, type: "kraken" },
      ],
      collectibles: [
        { id: "c1", x: 2, y: 0, type: "coin" },
        { id: "c2", x: 4, y: 2, type: "coin" },
        { id: "c3", x: 2, y: 4, type: "coin" },
        { id: "c4", x: 4, y: 6, type: "coin" },
      ],
      availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
      hints: ["Encuentra el patrón en las monedas, evita los Krakens"],
      treasureFragment: {
        fragmentId: "fragment-2-3",
        worldId: 2,
        fragmentNumber: 3,
        description: "Tercer fragmento de la Isla Remolinos"
      },
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
      tiles.push({ x, y, type: "water" })
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
