import type { GridData, Entity, PathStep, LevelData } from "./types"

/**
 * NIVELES REARMADOS CON PROGRESIÓN REAL (5 WORLDS, 12 LEVELS CADA UNO)
 *
 * Filosofía:
 * - World 1 (Secuencia): movimientos + giros + recoger monedas + rocas (sin repeat hasta el final)
 * - World 2 (Remolinos): refuerzo de repeat + night theme (visual lo manejás en render) + Kraken (muerte por contacto)
 * - World 3 (Decisiones): introducción gradual de if-blocked y combos con repeat
 * - World 4 (Memoria): variables (conteos) + patrones más largos (sin exigir enforcement duro en config)
 * - World 5 (Funciones): define/call + reutilización + desafíos finales
 *
 * Fragmentos del Mapa: niveles 4, 8, 12 de cada mundo (3 por isla / 15 total)
 * - fragment-{worldId}-{1..3}
 */

type Facing = LevelData["startPosition"]["facing"]

const pos = (x: number, y: number, facing: Facing) => ({ x, y, facing })
const reach = (x: number, y: number) => ({ type: "reach" as const, target: { x, y } })
const collectCoins = (count: number) => ({ type: "collect" as const, item: "coin" as const, count })
const rock = (x: number, y: number) => ({ x, y, type: "rock" as const })
const kraken = (x: number, y: number) => ({ x, y, type: "kraken" as const })
const coin = (id: string, x: number, y: number) => ({ id, x, y, type: "coin" as const })

const fragment = (worldId: number, fragmentNumber: 1 | 2 | 3, islandName: string) => ({
  fragmentId: `fragment-${worldId}-${fragmentNumber}`,
  worldId,
  fragmentNumber,
  description: `Fragmento ${fragmentNumber} de ${islandName}`,
})

const level = (cfg: LevelData): LevelData => cfg

const LEVELS: Record<string, LevelData> = {
  // =========================
  // WORLD 1 — SECUENCIA (1-1..1-12)
  // =========================

  // 1-1 — Solo avanzar (presenta el tablero y la idea de “pasos”)
  "1-1": level({
    id: "1-1",
    title: "Primer Rumbo",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward"],
    optimalSolution: { blockCount: 3 },
    hints: ["Tu misión: llegar a la meta.", "Usá 3 bloques 'Avanzar' en línea recta."],
  }),

  // 1-2 — Avanzar con “distancia distinta” (para que no sea copy/paste)
  "1-2": level({
    id: "1-2",
    title: "Tres Pasos",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(3, 2)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward"],
    optimalSolution: { blockCount: 3 },
    hints: ["Misma idea, otra fila.", "Pensá: 'paso' = una celda."],
  }),

  // 1-3 — Introduce giros (sin monedas todavía)
  "1-3": level({
    id: "1-3",
    title: "Aprender a Girar",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 3, "north"),
    objectives: [reach(3, 0)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left"],
    optimalSolution: { blockCount: 6 },
    hints: ["Ahora podés girar.", "Tip: girá una vez y después seguí avanzando."],
  }),

  // 1-4 — Introduce moneda + collect-coin (primer fragmento W1)
  "1-4": level({
    id: "1-4",
    title: "La Primera Moneda",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 2, 1)],
    availableBlocks: ["forward", "collect-coin", "turn-right", "turn-left"],
    optimalSolution: { blockCount: 4 },
    hints: ["Pasá por la moneda.", "Cuando estés arriba: usá 'Recoger moneda'."],
    treasureFragment: fragment(1, 1, "Isla Secuencia"),
  }),

  // 1-5 — Moneda fuera de la ruta recta (obliga a girar + recoger)
  "1-5": level({
    id: "1-5",
    title: "Desvío Cortito",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(3, 3), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 2, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
    optimalSolution: { blockCount: 7 },
    hints: ["La moneda no está en línea recta.", "Primero ruta, después 'recoger'."],
  }),

  // 1-6 — 2 monedas (enseña planificación de ruta)
  "1-6": level({
    id: "1-6",
    title: "Ruta del Botín",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(3, 3), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 2, 0), coin("c2", 3, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
    optimalSolution: { blockCount: 9 },
    hints: ["Tenés que pasar por ambas monedas.", "No te olvides de 'Recoger' en cada una."],
  }),

  // 1-7 — Introduce roca (obstáculo fijo)
  "1-7": level({
    id: "1-7",
    title: "Roca a la Vista",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left"],
    optimalSolution: { blockCount: 8 },
    hints: ["La roca bloquea el camino.", "Rodeala con giros."],
  }),

  // 1-8 — Roca + moneda (segundo fragmento W1)
  "1-8": level({
    id: "1-8",
    title: "Tesoro Vigilado",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4), collectCoins(1)],
    obstacles: [rock(2, 2)],
    collectibles: [coin("c1", 3, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin"],
    optimalSolution: { blockCount: 10 },
    hints: ["Buscá una ruta que pase por la moneda.", "Después seguí a la meta."],
    treasureFragment: fragment(1, 2, "Isla Secuencia"),
  }),

  // 1-9 — Mini laberinto simple (varias rocas)
  "1-9": level({
    id: "1-9",
    title: "Canal de Rocas",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 4, "north"),
    objectives: [reach(4, 0)],
    obstacles: [rock(1, 3), rock(2, 2), rock(3, 1)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left"],
    optimalSolution: { blockCount: 12 },
    hints: ["Pensá el camino antes de poner bloques.", "Un giro de más te puede sacar de ruta."],
  }),

  // 1-10 — Introduce REPEAT (por fin, explicado) — nivel largo sin repetir sería tedioso
  "1-10": level({
    id: "1-10",
    title: "El Poder de Repetir",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "repeat"],
    optimalSolution: { blockCount: 2 },
    hints: ["En vez de 6 'Avanzar', usá 'Repetir'.", "Idea: repetir 6 veces → avanzar."],
  }),

  // 1-11 — Repeat + giro (patrón)
  "1-11": level({
    id: "1-11",
    title: "Patrón de Navegación",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(1, 1, "east"),
    objectives: [reach(5, 5)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["Buscá un patrón: avanzar varias veces y girar.", "Repetir te ahorra bloques."],
  }),

  // 1-12 — Final W1 + fragmento 3 — usa todo lo aprendido (sin volverse injusto)
  "1-12": level({
    id: "1-12",
    title: "Mapa de la Secuencia",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(3)],
    obstacles: [rock(3, 0), rock(3, 1), rock(3, 2)],
    collectibles: [coin("c1", 1, 1), coin("c2", 5, 3), coin("c3", 4, 5)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Rocas bloqueando un corredor.", "Juntá 3 monedas y llegá al final.", "Usá repeat para los tramos largos."],
    treasureFragment: fragment(1, 3, "Isla Secuencia"),
  }),

  // =========================
  // WORLD 2 — REMOLINOS DE LAS MAREAS (2-1..2-12) + KRAKEN
  // =========================

  // 2-1 — Refuerzo de repeat (ya lo viste en 1-10)
  "2-1": level({
    id: "2-1",
    title: "Aguas Nocturnas",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "repeat"],
    optimalSolution: { blockCount: 2 },
    hints: ["Bienvenido a la noche.", "Repetí 3 veces 'Avanzar' para llegar."],
  }),

  // 2-2 — Repeat + giros + 1 moneda (sin kraken todavía)
  "2-2": level({
    id: "2-2",
    title: "Corriente Marina",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(3, 3), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 0, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 8 },
    hints: ["Primero bajá hasta la moneda y recogela.", "Después buscá la meta."],
  }),

  // 2-3 — Primer kraken (presentación: “si lo tocás, perdés”)
  "2-3": level({
    id: "2-3",
    title: "Peligro en las Sombras",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1)],
    obstacles: [kraken(2, 1)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["Ese Kraken NO es una roca.", "Si lo tocás: fallás el nivel.", "Rodealo con un desvío."],
  }),

  // 2-4 — Fragmento 1 W2 — repeat “bien usado”
  "2-4": level({
    id: "2-4",
    title: "Bucle Simple",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "repeat"],
    optimalSolution: { blockCount: 2 },
    hints: ["Perfecto para repetir.", "Repetí 4 veces 'Avanzar'."],
    treasureFragment: fragment(2, 1, "Isla Remolinos"),
  }),

  // 2-5 — 2 krakens obligan a elegir ruta
  "2-5": level({
    id: "2-5",
    title: "Tentáculos en Silencio",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4)],
    obstacles: [kraken(2, 0), kraken(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 10 },
    hints: ["Hay más de un Kraken.", "Elegí una ruta y mantenela (sin zigzag innecesario)."],
  }),

  // 2-6 — Patrón con monedas para que repetir tenga sentido
  "2-6": level({
    id: "2-6",
    title: "Patrón de las Mareas",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 2, 0), coin("c2", 4, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 10 },
    hints: ["Avanzá hasta la moneda 1, recogé.", "Girá, repetí, y buscá la moneda 2."],
  }),

  // 2-7 — “Solo un camino seguro” (pero sin ser tramposo)
  "2-7": level({
    id: "2-7",
    title: "Trampa del Kraken",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [kraken(1, 1), kraken(1, 3), kraken(3, 1), kraken(3, 3)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["El camino del medio es el más seguro.", "Usá repetir para el tramo recto."],
  }),

  // 2-8 — Fragmento 2 W2 — repeat + giro en patrón simple, 1 kraken “controlado”
  "2-8": level({
    id: "2-8",
    title: "Bucle con Giros",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(5, 5)],
    obstacles: [kraken(3, 3)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Armá un patrón: repetir + girar.", "Evitá el Kraken del centro."],
    treasureFragment: fragment(2, 2, "Isla Remolinos"),
  }),

  // 2-9 — Navegación más compleja, 2 krakens, 2 monedas
  "2-9": level({
    id: "2-9",
    title: "Laberinto Oscuro",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [kraken(1, 2), kraken(4, 3)],
    collectibles: [coin("c1", 2, 1), coin("c2", 3, 4)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Planificá: moneda 1 → moneda 2 → salida.", "En noche, un paso mal te cuesta caro 😄"],
  }),

  // 2-10 — Rocas + kraken (combo), obliga a “sube o baja”
  "2-10": level({
    id: "2-10",
    title: "Mareas Cambiantes",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3)],
    obstacles: [rock(2, 2), kraken(2, 3), rock(2, 4), kraken(4, 2), kraken(4, 4)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Hay un bloqueo en el medio.", "Elegí: subir o bajar para esquivar el Kraken."],
  }),

  // 2-11 — Avanzado: 2 krakens + diagonal de monedas
  "2-11": level({
    id: "2-11",
    title: "El Abismo",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(3)],
    obstacles: [kraken(2, 2), kraken(4, 4)],
    collectibles: [coin("c1", 1, 1), coin("c2", 3, 3), coin("c3", 5, 5)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Seguí la diagonal de monedas.", "Evitá cruzarte con los Krakens."],
  }),

  // 2-12 — Fragmento 3 W2 — final del mundo 2
  "2-12": level({
    id: "2-12",
    title: "Maestro del Bucle",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(4)],
    obstacles: [kraken(2, 1), kraken(4, 3), kraken(1, 5)],
    collectibles: [coin("c1", 2, 0), coin("c2", 4, 2), coin("c3", 2, 4), coin("c4", 4, 6)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 22 },
    hints: ["Las monedas marcan un patrón.", "Usá repeat en los tramos largos, y giros cortos para esquivar."],
    treasureFragment: fragment(2, 3, "Isla Remolinos"),
  }),

  // =========================
  // WORLD 3 — DECISIONES (3-1..3-12) — IF-BLOCKED
  // =========================

  // 3-1 — Presenta if-blocked como “si adelante hay obstáculo, girá”
  "3-1": level({
    id: "3-1",
    title: "La Primera Elección",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 3)],
    obstacles: [rock(2, 1)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked"],
    optimalSolution: { blockCount: 7 },
    hints: ["Nuevo bloque: 'Si Bloqueado'.", "Si adelante hay roca/borde, tomá una decisión (girás)."],
  }),

  // 3-2 — Repite la idea con otra geometría
  "3-2": level({
    id: "3-2",
    title: "Desvío Inteligente",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(1, 3, "north"),
    objectives: [reach(3, 0)],
    obstacles: [rock(1, 1)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked"],
    optimalSolution: { blockCount: 8 },
    hints: ["Probá: avanzás hasta bloquear, y ahí decidís.", "No es adivinanza: es lógica."],
  }),

  // 3-3 — Mete repeat + if-blocked (sin kraken) como “auto-navegación”
  "3-3": level({
    id: "3-3",
    title: "Patrulla",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 6 },
    hints: ["Combinación fuerte: repeat + si-bloqueado.", "Idea: repetí varias veces: si bloqueado → girá."],
  }),

  // 3-4 — Fragmento 1 W3 — (tu fragment level, pero ahora con progresión previa)
  "3-4": level({
    id: "3-4",
    title: "Primera Decisión",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(2, 0, "south"),
    objectives: [reach(2, 4)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked"],
    optimalSolution: { blockCount: 7 },
    hints: ["Cuando te bloquees, decidí girar.", "Llegá al final sin tocar la roca."],
    treasureFragment: fragment(3, 1, "Isla Decisiones"),
  }),

  // 3-5 — Introduce monedas como “señal” pero sin condicionales de moneda
  "3-5": level({
    id: "3-5",
    title: "Ruta con Señales",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4), collectCoins(1)],
    obstacles: [rock(2, 0), rock(2, 1), rock(2, 2)],
    collectibles: [coin("c1", 1, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 14 },
    hints: ["Las rocas arman una pared.", "Usá si-bloqueado para no chocarte con el muro."],
  }),

  // 3-6 — “Pasillo” donde if-blocked simplifica un montón
  "3-6": level({
    id: "3-6",
    title: "Pasillo",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(1, 4), rock(1, 3), rock(1, 2), rock(3, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Si te chocás, perdés el hilo.", "Hacé que el código “decida” por vos."],
  }),

  // 3-7 — Más complejo, 2 monedas
  "3-7": level({
    id: "3-7",
    title: "Bifurcación",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [rock(2, 1), rock(2, 2), rock(2, 3), rock(3, 3)],
    collectibles: [coin("c1", 1, 4), coin("c2", 4, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Dos caminos posibles.", "Si bloqueado te ayuda a elegir sin romper todo."],
  }),

  // 3-8 — Fragmento 2 W3 (tu nivel existente)
  "3-8": level({
    id: "3-8",
    title: "Caminos Múltiples",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3), collectCoins(1)],
    obstacles: [rock(2, 2), rock(2, 3), rock(2, 4)],
    collectibles: [coin("c1", 4, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["El muro te obliga a tomar otro camino.", "Si bloqueado dentro de un repeat es GOD."],
    treasureFragment: fragment(3, 2, "Isla Decisiones"),
  }),

  // 3-9 — Laberinto con decisiones (más rocas)
  "3-9": level({
    id: "3-9",
    title: "Laberinto Lógico",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 6, "north"),
    objectives: [reach(6, 0)],
    obstacles: [
      rock(1, 5),
      rock(2, 5),
      rock(3, 5),
      rock(3, 4),
      rock(3, 3),
      rock(4, 3),
      rock(5, 3),
      rock(5, 2),
    ],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 22 },
    hints: ["No es fuerza bruta.", "Escribí reglas: si bloqueado, girá."],
  }),

  // 3-10 — Mezcla con monedas (planificación + decisiones)
  "3-10": level({
    id: "3-10",
    title: "Señales en el Muro",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(2)],
    obstacles: [rock(2, 0), rock(2, 1), rock(2, 2), rock(4, 4), rock(4, 5)],
    collectibles: [coin("c1", 1, 5), coin("c2", 5, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 24 },
    hints: ["Si bloqueado te salva de chocar con paredes.", "Primero monedas, después salida."],
  }),

  // 3-11 — “Autopiloto” con repeat + if-blocked (final prep)
  "3-11": level({
    id: "3-11",
    title: "Autopiloto",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(3, 6, "north"),
    objectives: [reach(3, 0)],
    obstacles: [rock(3, 4), rock(2, 3), rock(4, 3), rock(1, 2), rock(5, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Tu código tiene que pilotear solo.", "Regla simple: si bloqueado → girá."],
  }),

  // 3-12 — Fragmento 3 W3 (tu nivel existente)
  "3-12": level({
    id: "3-12",
    title: "Laberinto Inteligente",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6)],
    obstacles: [rock(1, 0), rock(1, 1), rock(3, 2), rock(3, 3), rock(5, 4), rock(5, 5)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 26 },
    hints: ["Condicionales dentro de bucles.", "Pensá como un robot: si no puede, decide."],
    treasureFragment: fragment(3, 3, "Isla Decisiones"),
  }),

  // =========================
  // WORLD 4 — MEMORIA / VARIABLES (4-1..4-12)
  // =========================

  // 4-1 — Presenta variable como “contador” (aunque el config no lo enforcea)
  "4-1": level({
    id: "4-1",
    title: "Guardar en la Bitácora",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 1, 1)],
    availableBlocks: ["forward", "collect-coin", "variable"],
    optimalSolution: { blockCount: 4 },
    hints: ["Nuevo: 'Variable'.", "Usala para guardar un número (ej: monedas).", "Recogé 1 moneda y llegá."],
  }),

  // 4-2 — Conteo simple de 2 monedas en línea
  "4-2": level({
    id: "4-2",
    title: "Contar Botín",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 1, 2), coin("c2", 3, 2)],
    availableBlocks: ["forward", "collect-coin", "variable", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["Podés contar en una variable: monedas = monedas + 1.", "Repeat te ahorra pasos."],
  }),

  // 4-3 — Variables + giros (planificación)
  "4-3": level({
    id: "4-3",
    title: "Registro de Giros",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "variable", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Usá una variable para recordar cuántas veces giraste (idea).", "Rodeá la roca."],
  }),

  // 4-4 — Fragmento 1 W4 (tu nivel existente)
  "4-4": level({
    id: "4-4",
    title: "Contador de Monedas",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2), collectCoins(3)],
    obstacles: [],
    collectibles: [coin("c1", 1, 2), coin("c2", 2, 2), coin("c3", 3, 2)],
    availableBlocks: ["forward", "collect-coin", "variable", "repeat"],
    optimalSolution: { blockCount: 7 },
    hints: ["Guardá el conteo en una variable.", "Repeat para el tramo recto."],
    treasureFragment: fragment(4, 1, "Isla Memoria"),
  }),

  // 4-5 — Variable + if-blocked (recuerda “estado”)
  "4-5": level({
    id: "4-5",
    title: "Memoria de Obstáculos",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3)],
    obstacles: [rock(2, 3), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "variable", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Podés guardar en variable si ya giraste (idea).", "Si bloqueado te guía."],
  }),

  // 4-6 — 3 monedas dispersas (requiere plan)
  "4-6": level({
    id: "4-6",
    title: "Inventario",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(3)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 1, 4), coin("c2", 4, 1), coin("c3", 5, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "variable", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 20 },
    hints: ["Usá variable para llevar conteo.", "No te olvides: recoger = acción separada."],
  }),

  // 4-7 — Laberinto suave, exige más “memoria mental”
  "4-7": level({
    id: "4-7",
    title: "Bitácora Profunda",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(1, 4), rock(2, 4), rock(3, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "variable", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Tu variable puede ser un contador de pasos o giros (idea).", "Hacé reglas simples."],
  }),

  // 4-8 — Fragmento 2 W4 (tu nivel existente)
  "4-8": level({
    id: "4-8",
    title: "Memoria Direccional",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5)],
    obstacles: [rock(2, 2), rock(3, 3)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "variable", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 18 },
    hints: ["Idea: recordá cuántas veces giraste.", "Si bloqueado + repeat te ordena el caos."],
    treasureFragment: fragment(4, 2, "Isla Memoria"),
  }),

  // 4-9 — Más grande, 4 monedas
  "4-9": level({
    id: "4-9",
    title: "Contabilidad Pirata",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(4)],
    obstacles: [rock(3, 1), rock(3, 2), rock(3, 4), rock(3, 5)],
    collectibles: [coin("c1", 1, 1), coin("c2", 2, 5), coin("c3", 4, 1), coin("c4", 5, 5)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "variable", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 26 },
    hints: ["Pared vertical con hueco (en el centro).", "Planificá el recorrido de monedas con conteo."],
  }),

  // 4-10 — Patrón largo “tipo serpiente”
  "4-10": level({
    id: "4-10",
    title: "Serpiente de Agua",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6)],
    obstacles: [rock(2, 1), rock(4, 1), rock(2, 3), rock(4, 3), rock(2, 5), rock(4, 5)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked", "variable"],
    optimalSolution: { blockCount: 24 },
    hints: ["Ruta en zigzag controlada.", "Repeat para los tramos, si-bloqueado para los bordes."],
  }),

  // 4-11 — Preparación final: 5 monedas
  "4-11": level({
    id: "4-11",
    title: "Libro Mayor",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 6, "north"),
    objectives: [reach(6, 0), collectCoins(5)],
    obstacles: [rock(3, 3)],
    collectibles: [
      coin("c1", 1, 5),
      coin("c2", 2, 4),
      coin("c3", 4, 2),
      coin("c4", 5, 1),
      coin("c5", 6, 3),
    ],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked", "variable"],
    optimalSolution: { blockCount: 30 },
    hints: ["Las monedas dibujan una ruta.", "Tu variable debería ayudarte a no perder el conteo."],
  }),

  // 4-12 — Fragmento 3 W4 (tu nivel existente)
  "4-12": level({
    id: "4-12",
    title: "Cálculo Pirata",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(6)],
    obstacles: [],
    collectibles: [
      coin("c1", 1, 1),
      coin("c2", 1, 5),
      coin("c3", 3, 3),
      coin("c4", 5, 1),
      coin("c5", 5, 5),
      coin("c6", 6, 3),
    ],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "variable", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 26 },
    hints: ["Nivel largo: optimizá con repeat.", "Tu variable: conteo de monedas, sí o sí."],
    treasureFragment: fragment(4, 3, "Isla Memoria"),
  }),

  // =========================
  // WORLD 5 — FUNCIONES (5-1..5-12)
  // =========================

  // 5-1 — Introduce funciones (define + call) en algo chiquito
  "5-1": level({
    id: "5-1",
    title: "Ritual de Función",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "function-define", "function-call"],
    optimalSolution: { blockCount: 3 },
    hints: ["Nuevo: 'Función'.", "Definí una función que avance 3 veces.", "Después llamala 1 vez."],
  }),

  // 5-2 — Función para patrón: avanzar + girar (pequeño)
  "5-2": level({
    id: "5-2",
    title: "Hechizo de Giro",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "function-define", "function-call"],
    optimalSolution: { blockCount: 8 },
    hints: ["Meté dentro de una función: avanzar, girar, avanzar.", "Reutilizá con 'llamar función'."],
  }),

  // 5-3 — Función + repeat (reutilización real)
  "5-3": level({
    id: "5-3",
    title: "Reutilizar sin Dolor",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "repeat", "function-define", "function-call"],
    optimalSolution: { blockCount: 6 },
    hints: ["Una función puede contener repeat.", "Construí un 'macro' de movimiento."],
  }),

  // 5-4 — Fragmento 1 W5 (tu nivel existente)
  "5-4": level({
    id: "5-4",
    title: "Mi Primera Función",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "function-define", "function-call"],
    optimalSolution: { blockCount: 3 },
    hints: ["Definí una función para avanzar varias veces.", "Después llamala."],
    treasureFragment: fragment(5, 1, "Isla Funciones"),
  }),

  // 5-5 — Función + monedas
  "5-5": level({
    id: "5-5",
    title: "Función de Botín",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 2, 2), coin("c2", 4, 4)],
    availableBlocks: [
      "forward",
      "turn-right",
      "turn-left",
      "collect-coin",
      "repeat",
      "function-define",
      "function-call",
    ],
    optimalSolution: { blockCount: 18 },
    hints: ["Creá una función para recorrer un 'bloque' del mapa.", "Repetila y recogé monedas."],
  }),

  // 5-6 — Función + if-blocked (autopiloto)
  "5-6": level({
    id: "5-6",
    title: "Autopiloto 2.0",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(1, 4), rock(2, 4), rock(3, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat", "function-define", "function-call"],
    optimalSolution: { blockCount: 20 },
    hints: ["Meté la lógica 'si bloqueado entonces girar' dentro de una función.", "Después repetís llamadas."],
  }),

  // 5-7 — Función + variables (planificación)
  "5-7": level({
    id: "5-7",
    title: "Rutina con Memoria",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(3)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 1, 1), coin("c2", 5, 1), coin("c3", 3, 5)],
    availableBlocks: [
      "forward",
      "turn-right",
      "turn-left",
      "collect-coin",
      "variable",
      "repeat",
      "if-blocked",
      "function-define",
      "function-call",
    ],
    optimalSolution: { blockCount: 28 },
    hints: ["Función para moverte, variable para contar.", "La roca del centro te obliga a rodear."],
  }),

  // 5-8 — Fragmento 2 W5 (tu nivel existente)
  "5-8": level({
    id: "5-8",
    title: "Funciones con Parámetros",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 2, 2), coin("c2", 4, 4)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "function-define", "function-call", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Crea una función que reciba cuántos pasos dar.", "Usala para simplificar."],
    treasureFragment: fragment(5, 2, "Isla Funciones"),
  }),

  // 5-9 — Desafío serio: pasillos + monedas + rocas
  "5-9": level({
    id: "5-9",
    title: "El Taller del Dargholl",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 7, "north"),
    objectives: [reach(7, 0), collectCoins(4)],
    obstacles: [rock(2, 2), rock(2, 3), rock(2, 4), rock(5, 3), rock(5, 4), rock(5, 5)],
    collectibles: [coin("c1", 1, 6), coin("c2", 3, 1), coin("c3", 4, 6), coin("c4", 6, 2)],
    availableBlocks: [
      "forward",
      "turn-right",
      "turn-left",
      "collect-coin",
      "repeat",
      "if-blocked",
      "variable",
      "function-define",
      "function-call",
    ],
    optimalSolution: { blockCount: 36 },
    hints: ["Acá se nota si realmente estás usando funciones.", "Divide el problema en rutinas."],
  }),

  // 5-10 — Optimización: misma ruta repetida varias veces
  "5-10": level({
    id: "5-10",
    title: "Rutina Perfecta",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(7, 7)],
    obstacles: [rock(3, 1), rock(3, 2), rock(3, 3), rock(3, 4), rock(4, 4), rock(5, 4)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked", "function-define", "function-call"],
    optimalSolution: { blockCount: 32 },
    hints: ["Construí una función que te haga avanzar por el patrón.", "Llamala dentro de un repeat."],
  }),

  // 5-11 — Preparación final: 8 monedas (sin ser imposible)
  "5-11": level({
    id: "5-11",
    title: "Cámara del Tesoro",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 4, "east"),
    objectives: [reach(7, 4), collectCoins(6)],
    obstacles: [rock(2, 2), rock(2, 5), rock(5, 2), rock(5, 5)],
    collectibles: [
      coin("c1", 1, 1),
      coin("c2", 1, 6),
      coin("c3", 3, 3),
      coin("c4", 4, 4),
      coin("c5", 6, 1),
      coin("c6", 6, 6),
    ],
    availableBlocks: [
      "forward",
      "turn-right",
      "turn-left",
      "collect-coin",
      "repeat",
      "if-blocked",
      "variable",
      "function-define",
      "function-call",
    ],
    optimalSolution: { blockCount: 44 },
    hints: ["Si no usás funciones, esto se hace eterno.", "Variables: conteo de monedas y control."],
  }),

  // 5-12 — Fragmento 3 W5 (tu nivel existente, pero mantenido como gran final)
  "5-12": level({
    id: "5-12",
    title: "¡El Tesoro Final!",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(7, 7), collectCoins(8)],
    obstacles: [rock(2, 2), rock(5, 2), rock(2, 5), rock(5, 5)],
    collectibles: [
      coin("c1", 1, 1),
      coin("c2", 3, 1),
      coin("c3", 6, 1),
      coin("c4", 1, 4),
      coin("c5", 6, 4),
      coin("c6", 1, 6),
      coin("c7", 4, 6),
      coin("c8", 7, 7),
    ],
    availableBlocks: [
      "forward",
      "turn-right",
      "turn-left",
      "collect-coin",
      "function-define",
      "function-call",
      "repeat",
      "if-blocked",
      "variable",
    ],
    optimalSolution: { blockCount: 48 },
    hints: ["Usa TODO lo aprendido.", "Funciones para rutinas, repeat para repeticiones, variables para conteo."],
    treasureFragment: fragment(5, 3, "Isla Funciones"),
  }),
}

export function getLevelConfig(levelId: string): LevelData {
  // Alias: tutorial => 1-1 (manteniendo el id solicitado)
  if (levelId === "tutorial") {
    const base = LEVELS["1-1"]
    return { ...base, id: "tutorial" }
  }

  const found = LEVELS[levelId]
  if (found) return found

  // Default fallback for unknown levels
  return {
    id: levelId,
    title: "Nivel Desconocido",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(3, 3)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left"],
    hints: ["No encontré configuración para este nivel."],
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