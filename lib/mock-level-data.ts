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

  // 1-1 — Solo avanzar (presenta el tablero y la idea de "pasos")
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
    uiObjectiveText: "Llegá a la posición (3, 1) usando al menos 3 Avanzar.",
    jorcMessage: "¡Bienvenido a bordo, grumete! Tu primera misión es simple: usá bloques 'Avanzar' para mover el barco hacia la meta. ¡Cada bloque es un paso!",
  }),

  // 1-2 — Avanzar con "distancia distinta" (para que no sea copy/paste)
  "1-2": level({
    id: "1-2",
    title: "Rumbo Largo",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward"],
    optimalSolution: { blockCount: 4 },
    hints: ["Más pasos, misma idea.", "Contá las celdas hasta la meta."],
    uiObjectiveText: "Llegá a la posición (4, 2) usando al menos 4 Avanzar.",
    jorcMessage: "Ahora el viaje es más largo, pero la idea es la misma. Contá cuántas celdas hay hasta la meta y usá esa cantidad de bloques 'Avanzar'.",
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
    uiObjectiveText: "Llegá a la posición (3, 0) usando al menos 1 Girar derecha o Girar izquierda.",
    jorcMessage: "¡Nuevas herramientas! Ahora podés girar el barco. Usá 'Girar derecha' o 'Girar izquierda' para cambiar de dirección antes de avanzar.",
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
    uiObjectiveText: "Recogé 1 moneda y llegá a (3, 1) usando al menos 1 Recoger moneda.",
    jorcMessage: "¡Oro a la vista! Pasá por encima de la moneda y usá 'Recoger moneda' para guardarla. ¡No basta con pasar, hay que recogerla!",
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
    optimalSolution: { blockCount: 8 },
    hints: ["La moneda no está en línea recta.", "Primero ruta, después 'recoger'."],
    uiObjectiveText: "Recogé 1 moneda y llegá a (3, 3) usando al menos 1 Recoger moneda.",
    jorcMessage: "La moneda no está en línea recta. Vas a tener que desviarte un poco, recogerla, y después seguir hacia la meta. ¡Planificá tu ruta!",
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
    optimalSolution: { blockCount: 10 },
    hints: ["Tenés que pasar por ambas monedas.", "No te olvides de 'Recoger' en cada una."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (3, 3) usando al menos 2 Recoger moneda.",
    jorcMessage: "¡Doble botín! Hay 2 monedas en el mapa. Tené en cuenta que tenés que usar 'Recoger moneda' en CADA una. Planificá una ruta que pase por las dos.",
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
    uiObjectiveText: "Llegá a la posición (4, 2) usando al menos 1 Girar para esquivar la roca.",
    jorcMessage: "¡Ojo! Hay una roca bloqueando el camino directo. No podés pasar por encima. Usá giros para rodearla y seguir hacia la meta.",
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
    optimalSolution: { blockCount: 11 },
    hints: ["Buscá una ruta que pase por la moneda.", "Después seguí a la meta."],
    treasureFragment: fragment(1, 2, "Isla Secuencia"),
    uiObjectiveText: "Recogé 1 moneda y llegá a (4, 4) usando al menos 1 Recoger moneda.",
    jorcMessage: "Hay una roca y una moneda. Buscá una ruta que evite la roca, pase por la moneda y termine en la meta. ¡Usá Recoger moneda cuando pases!",
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
    uiObjectiveText: "Llegá a la posición (4, 0) usando al menos 2 Girar para navegar entre rocas.",
    jorcMessage: "¡Un mini laberinto! Hay varias rocas bloqueando. Pensá bien el camino antes de empezar a poner bloques. Un giro de más puede arruinar todo.",
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
    uiObjectiveText: "Llegá a la posición (6, 3) usando al menos 1 Repetir.",
    jorcMessage: "¡Nueva herramienta poderosa! En vez de poner 6 bloques 'Avanzar', usá 'Repetir' para hacer lo mismo con menos bloques. ¡Probalo!",
  }),

  // 1-11 — Repeat + giro (patrón en L)
  "1-11": level({
    id: "1-11",
    title: "Patrón de Navegación",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(5, 5)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 5 },
    hints: ["Buscá un patrón: avanzar varias veces y girar.", "Repetir te ahorra bloques."],
    uiObjectiveText: "Llegá a la posición (5, 5) usando al menos 1 Repetir.",
    jorcMessage: "Buscá un patrón: avanzás varias veces, girás, y repetís. Usá 'Repetir' para no escribir todo de nuevo. ¡Menos bloques, mismo resultado!",
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
    optimalSolution: { blockCount: 14 },
    hints: ["Rocas bloqueando un corredor.", "Juntá 3 monedas y llegá al final.", "Usá repeat para los tramos largos."],
    treasureFragment: fragment(1, 3, "Isla Secuencia"),
    uiObjectiveText: "Recogé 3 monedas y llegá a (6, 6) usando Repetir y Recoger moneda.",
    jorcMessage: "¡Final de la isla! Usá todo lo que aprendiste: giros, Repetir, y Recoger moneda. Hay rocas bloqueando, así que planificá bien tu ruta.",
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
    uiObjectiveText: "Llegá a la posición (3, 1) usando al menos 1 Repetir.",
    jorcMessage: "¡Bienvenido a las aguas nocturnas! Acá vamos a dominar 'Repetir'. Usá este bloque para avanzar múltiples veces sin repetir código.",
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
    uiObjectiveText: "Recogé 1 moneda y llegá a (3, 3) usando al menos 1 Repetir y 1 Recoger moneda.",
    jorcMessage: "Hay una moneda en el camino. Usá 'Repetir' para los tramos largos y no te olvides de 'Recoger moneda' cuando pases por ella.",
  }),

  // 2-3 — Primer kraken (presentación: "si lo tocás, perdés")
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
    uiObjectiveText: "Llegá a la posición (3, 1) usando al menos 1 Girar para esquivar al Kraken.",
    jorcMessage: "¡PELIGRO! Ese Kraken NO es una roca. Si lo tocás, perdés el nivel. Tenés que rodearlo con giros. ¡Planificá bien!",
  }),

  // 2-4 — Fragmento 1 W2 — repeat "bien usado" + evitar kraken
  "2-4": level({
    id: "2-4",
    title: "Esquiva Nocturna",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [kraken(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["El Kraken bloquea la ruta directa.", "Subí o bajá para rodearlo."],
    treasureFragment: fragment(2, 1, "Isla Remolinos"),
    uiObjectiveText: "Llegá a la posición (4, 2) usando al menos 1 Repetir y 1 Girar.",
    jorcMessage: "El Kraken bloquea el camino directo. Usá giros para subir o bajar, rodearlo, y seguir. 'Repetir' te ayuda en los tramos rectos.",
  }),

  // 2-5 — 2 krakens obligan a elegir ruta clara
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
    hints: ["Hay más de un Kraken.", "Bajá primero para evitarlos."],
    uiObjectiveText: "Llegá a la posición (4, 4) usando al menos 2 Girar para esquivar Krakens.",
    jorcMessage: "¡Hay más de un Kraken! Buscá una ruta que los evite a ambos. Tip: a veces conviene ir por otro lado aunque parezca más largo.",
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
    uiObjectiveText: "Recogé 2 monedas y llegá a (4, 4) usando al menos 1 Repetir y 2 Recoger moneda.",
    jorcMessage: "Hay 2 monedas formando un patrón. Usá 'Repetir' para los tramos largos entre ellas. ¡No te olvides de recoger cada una!",
  }),

  // 2-7 — Pasillo central seguro, krakens a los lados
  "2-7": level({
    id: "2-7",
    title: "Trampa del Kraken",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [kraken(1, 1), kraken(1, 3), kraken(3, 1), kraken(3, 3)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 2 },
    hints: ["El camino del medio es el más seguro.", "Usá repetir para el tramo recto."],
    uiObjectiveText: "Llegá a la posición (4, 2) usando al menos 1 Repetir.",
    jorcMessage: "¡Trampa de Krakens! Pero mirá bien: el pasillo del medio está libre. Usá 'Repetir' para cruzar rápido y seguro.",
  }),

  // 2-8 — Fragmento 2 W2 — L invertida con kraken + moneda
  "2-8": level({
    id: "2-8",
    title: "Bucle con Peligro",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(5, 5), collectCoins(1)],
    obstacles: [kraken(3, 0), kraken(0, 3)],
    collectibles: [coin("c1", 5, 0)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Recogé la moneda antes de bajar.", "Evitá los Krakens planificando."],
    treasureFragment: fragment(2, 2, "Isla Remolinos"),
    uiObjectiveText: "Recogé 1 moneda y llegá a (5, 5) usando al menos 1 Repetir y 1 Recoger moneda.",
    jorcMessage: "Hay Krakens custodiando. Recogé la moneda primero y planificá cómo llegar a la meta sin tocarlos. 'Repetir' ayuda en los tramos largos.",
  }),

  // 2-9 — Navegación más compleja, 2 krakens, 2 monedas (último fácil)
  "2-9": level({
    id: "2-9",
    title: "Laberinto Oscuro",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [kraken(1, 2), kraken(4, 3)],
    collectibles: [coin("c1", 2, 1), coin("c2", 3, 4)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 14 },
    hints: ["Planificá: moneda 1 → moneda 2 → salida.", "En noche, un paso mal te cuesta caro."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 5) usando al menos 1 Repetir y 2 Recoger moneda.",
    jorcMessage: "Laberinto nocturno con 2 monedas y 2 Krakens. Planificá tu ruta: moneda 1, moneda 2, y meta. ¡Un error y el Kraken te atrapa!",
  }),

  // 2-10 — Corredor con emboscada: krakens custodian monedas
  "2-10": level({
    id: "2-10",
    title: "Emboscada Submarina",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0), collectCoins(2)],
    obstacles: [kraken(1, 4), kraken(3, 2), kraken(5, 4)],
    collectibles: [coin("c1", 2, 3), coin("c2", 4, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Los Krakens custodian el paso.", "Zigzaguea con cuidado para las monedas."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 0) usando al menos 1 Repetir y 2 Recoger moneda.",
    jorcMessage: "¡Emboscada! Hay 3 Krakens vigilando. Las monedas están entre ellos. Zigzagueá con cuidado y usá 'Repetir' donde puedas.",
  }),

  // 2-11 — Patrón en espiral para adentro: requiere repeat + giros precisos
  "2-11": level({
    id: "2-11",
    title: "Remolino Interior",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(3, 3), collectCoins(3)],
    obstacles: [kraken(2, 2), kraken(4, 4)],
    collectibles: [coin("c1", 0, 3), coin("c2", 3, 6), coin("c3", 6, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["Las monedas forman un cuadrado exterior.", "Recogelas rodeando hacia el centro."],
    uiObjectiveText: "Recogé 3 monedas y llegá a (3, 3) usando al menos 1 Repetir y 3 Recoger moneda.",
    jorcMessage: "Las monedas forman un cuadrado en el borde. Tenés que recogerlas rodeando el mapa y llegar al centro. ¡Cuidado con los Krakens!",
  }),

  // 2-12 — Final épico W2: patrón claro con recompensa y peligro
  "2-12": level({
    id: "2-12",
    title: "Maestro del Bucle",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(4)],
    obstacles: [kraken(2, 1), kraken(1, 4), kraken(4, 2), kraken(5, 5)],
    collectibles: [coin("c1", 3, 0), coin("c2", 6, 3), coin("c3", 3, 6), coin("c4", 0, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 22 },
    hints: ["Las monedas marcan los puntos cardinales.", "Usá repeat en los tramos largos, esquivá con giros."],
    treasureFragment: fragment(2, 3, "Isla Remolinos"),
    uiObjectiveText: "Recogé 4 monedas y llegá a (6, 6) usando al menos 1 Repetir y 4 Recoger moneda.",
    jorcMessage: "¡Final del mundo! Las 4 monedas marcan los puntos cardinales. Usá todo lo que aprendiste: 'Repetir' para tramos largos, giros para esquivar.",
  }),

  // =========================
  // WORLD 3 — DECISIONES (3-1..3-12) — IF-BLOCKED
  // =========================

  // 3-1 — Presenta if-blocked muy simple: una roca, una decisión
  "3-1": level({
    id: "3-1",
    title: "La Primera Elección",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1)],
    obstacles: [rock(2, 1)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked"],
    optimalSolution: { blockCount: 7 },
    hints: ["Nuevo bloque: 'Si Bloqueado'.", "Si adelante hay roca, tomá una decisión."],
    uiObjectiveText: "Llegá a la posición (3, 1) usando al menos 1 Si bloqueado.",
    jorcMessage: "¡Nueva herramienta: 'Si Bloqueado'! Este bloque te permite tomar decisiones. Si hay algo adelante, ejecutá una acción (como girar).",
  }),

  // 3-2 — Repite la idea con otra geometría (viene del norte)
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
    hints: ["Probá: avanzás hasta bloquear.", "Ahí decidís girar."],
    uiObjectiveText: "Llegá a la posición (3, 0) usando al menos 1 Si bloqueado.",
    jorcMessage: "Avanzá hasta que te bloquees, y ahí usá 'Si Bloqueado' para decidir girar. El barco toma decisiones inteligentes.",
  }),

  // 3-3 — If-blocked + repeat (la combinación clave)
  "3-3": level({
    id: "3-3",
    title: "Patrulla Automática",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 6 },
    hints: ["Combinación fuerte: repeat + si-bloqueado.", "Repetí: si bloqueado → girá, sino → avanzá."],
    uiObjectiveText: "Llegá a la posición (4, 2) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "¡Combinación poderosa! Meté 'Si Bloqueado' dentro de 'Repetir'. El barco avanza, y si se bloquea, gira solo. ¡Autopiloto!",
  }),

  // 3-4 — Fragmento 1 W3 — if-blocked para elegir camino + moneda
  "3-4": level({
    id: "3-4",
    title: "Elección con Premio",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(2, 0, "south"),
    objectives: [reach(2, 4), collectCoins(1)],
    obstacles: [rock(2, 2)],
    collectibles: [coin("c1", 3, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked"],
    optimalSolution: { blockCount: 9 },
    hints: ["Cuando te bloquees, decidí girar.", "Aprovechá para agarrar la moneda."],
    treasureFragment: fragment(3, 1, "Isla Decisiones"),
    uiObjectiveText: "Recogé 1 moneda y llegá a (2, 4) usando al menos 1 Si bloqueado y 1 Recoger moneda.",
    jorcMessage: "Hay una roca en el camino y una moneda al costado. Usá 'Si Bloqueado' para decidir cuándo girar y aprovechá para recoger el botín.",
  }),

  // 3-5 — Pared de rocas obliga if-blocked natural
  "3-5": level({
    id: "3-5",
    title: "Muro y Señales",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4), collectCoins(1)],
    obstacles: [rock(2, 0), rock(2, 1), rock(2, 2)],
    collectibles: [coin("c1", 1, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 12 },
    hints: ["Las rocas arman una pared.", "Usá si-bloqueado para no chocarte."],
    uiObjectiveText: "Recogé 1 moneda y llegá a (4, 4) usando al menos 1 Si bloqueado y 1 Recoger moneda.",
    jorcMessage: "Hay una pared de rocas. Usá 'Si Bloqueado' para detectarla y cambiar de dirección automáticamente. ¡No te olvides de la moneda!",
  }),

  // 3-6 — Pasillo largo con varios bloqueos (repeat + if-blocked brilla)
  "3-6": level({
    id: "3-6",
    title: "Pasillo Sinuoso",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(0, 3), rock(2, 3), rock(2, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 14 },
    hints: ["Si te chocás, perdés el hilo.", "Hacé que el código decida por vos."],
    uiObjectiveText: "Llegá a la posición (5, 0) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "Pasillo largo con varios bloqueos. Combiná 'Repetir' con 'Si Bloqueado' para que el barco navegue solo y gire cuando sea necesario.",
  }),

  // 3-7 — Bifurcación: 2 monedas en caminos opuestos
  "3-7": level({
    id: "3-7",
    title: "Bifurcación",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [rock(2, 1), rock(2, 2), rock(2, 3)],
    collectibles: [coin("c1", 1, 4), coin("c2", 4, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Dos caminos: arriba o abajo del muro.", "Si bloqueado te ayuda a elegir."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 5) usando al menos 1 Si bloqueado y 2 Recoger moneda.",
    jorcMessage: "Hay dos caminos posibles: arriba o abajo del muro. Usá 'Si Bloqueado' para elegir el camino y recoger ambas monedas.",
  }),

  // 3-8 — Fragmento 2 W3 — laberinto medio con if-blocked
  "3-8": level({
    id: "3-8",
    title: "Caminos Múltiples",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3), collectCoins(2)],
    obstacles: [rock(2, 2), rock(2, 3), rock(2, 4), rock(4, 1)],
    collectibles: [coin("c1", 1, 5), coin("c2", 4, 0)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 18 },
    hints: ["El muro te obliga a tomar otro camino.", "Si bloqueado dentro de repeat es poderoso."],
    treasureFragment: fragment(3, 2, "Isla Decisiones"),
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 3) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "El muro te obliga a buscar otro camino. 'Si Bloqueado' dentro de 'Repetir' te permite navegar automáticamente. ¡Recogé las 2 monedas!",
  }),

  // 3-9 — Laberinto más grande: serpenteo natural
  "3-9": level({
    id: "3-9",
    title: "Laberinto Lógico",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 6, "north"),
    objectives: [reach(6, 0)],
    obstacles: [
      rock(1, 5), rock(1, 4), rock(3, 4), rock(3, 3), rock(3, 2), rock(5, 2), rock(5, 1),
    ],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 20 },
    hints: ["No es fuerza bruta.", "Escribí reglas: si bloqueado, girá."],
    uiObjectiveText: "Llegá a la posición (6, 0) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "Laberinto grande, pero no es fuerza bruta. Con 'Repetir' y 'Si Bloqueado' podés escribir reglas simples que naveguen solas.",
  }),

  // 3-10 — Mezcla con monedas (planificación + decisiones)
  "3-10": level({
    id: "3-10",
    title: "Señales en el Muro",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(2)],
    obstacles: [rock(2, 0), rock(2, 1), rock(2, 2), rock(4, 4), rock(4, 5)],
    collectibles: [coin("c1", 1, 4), coin("c2", 5, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 22 },
    hints: ["Si bloqueado te salva de chocar.", "Primero monedas, después salida."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (6, 6) usando al menos 1 Si bloqueado y 2 Recoger moneda.",
    jorcMessage: "Hay muros y monedas. Usá 'Si Bloqueado' para no chocarte con las paredes y planificá tu ruta para recoger ambas monedas.",
  }),

  // 3-11 — Autopiloto: repeat + if-blocked resuelve todo
  "3-11": level({
    id: "3-11",
    title: "Autopiloto",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(3, 6, "north"),
    objectives: [reach(3, 0)],
    obstacles: [rock(3, 4), rock(2, 3), rock(4, 3), rock(1, 2), rock(5, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Tu código tiene que pilotear solo.", "Regla simple: si bloqueado → girá."],
    uiObjectiveText: "Llegá a la posición (3, 0) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "Tu código tiene que pilotear solo. Armá una regla simple con 'Repetir' y 'Si Bloqueado': si hay obstáculo, girá. ¡Automático!",
  }),

  // 3-12 — Final W3: laberinto completo + fragmento
  "3-12": level({
    id: "3-12",
    title: "Laberinto Inteligente",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6), collectCoins(2)],
    obstacles: [
      rock(1, 0), rock(1, 1), rock(3, 2), rock(3, 3), rock(5, 4), rock(5, 5), rock(4, 1),
    ],
    collectibles: [coin("c1", 2, 4), coin("c2", 6, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 24 },
    hints: ["Condicionales dentro de bucles.", "Pensá como un robot: si no puede, decide."],
    treasureFragment: fragment(3, 3, "Isla Decisiones"),
    uiObjectiveText: "Recogé 2 monedas y llegá a (6, 6) usando al menos 1 Repetir y 1 Si bloqueado.",
    jorcMessage: "¡Final de la isla! Pensá como un robot: usá condicionales dentro de bucles. Si no podés avanzar, decidí qué hacer. ¡Todo automático!",
  }),

  // =========================
  // WORLD 4 — MEMORIA / VARIABLES (4-1..4-12)
  // =========================

  // 4-1 — Nivel introductorio sin variable (placeholder removido)
  "4-1": level({
    id: "4-1",
    title: "Guardar en la Bitácora",
    gridSize: { rows: 4, cols: 4 },
    startPosition: pos(0, 1, "east"),
    objectives: [reach(3, 1), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 1, 1)],
    availableBlocks: ["forward", "collect-coin"],
    optimalSolution: { blockCount: 4 },
    hints: ["Recogé la moneda en el camino.", "Llegá hasta el final del tablero."],
    uiObjectiveText: "Recogé 1 moneda y llegá a (3, 1).",
    jorcMessage: "¡Bienvenido al Santuario! Tu misión es simple: recogé la moneda y llegá a la meta. ¡Cada paso cuenta!",
  }),

  // 4-2 — Conteo de 2 monedas en línea
  "4-2": level({
    id: "4-2",
    title: "Contar Botín",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 1, 2), coin("c2", 3, 2)],
    availableBlocks: ["forward", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 6 },
    hints: ["Usá Repetir para ahorrar bloques.", "Recogé cada moneda individualmente."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (4, 2) usando al menos 1 Repetir.",
    jorcMessage: "Dos monedas en línea recta. Usá 'Repetir' para ahorrar bloques. ¡Cada moneda requiere su propio Recoger!",
  }),

  // 4-3 — Rodear obstáculos
  "4-3": level({
    id: "4-3",
    title: "Registro de Ruta",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4)],
    obstacles: [rock(2, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat"],
    optimalSolution: { blockCount: 10 },
    hints: ["Hay una roca en el medio.", "Rodeala con giros estratégicos."],
    uiObjectiveText: "Llegá a la posición (4, 4) rodeando la roca.",
    jorcMessage: "Hay una roca en el camino. Planificá tu ruta: ¿por arriba o por abajo? ¡Los giros son clave!",
  }),

  // 4-4 — Fragmento 1 W4: monedas en línea
  "4-4": level({
    id: "4-4",
    title: "Contador de Monedas",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2), collectCoins(3)],
    obstacles: [],
    collectibles: [coin("c1", 1, 2), coin("c2", 2, 2), coin("c3", 3, 2)],
    availableBlocks: ["forward", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 7 },
    hints: ["Tres monedas en fila.", "Combiná Avanzar y Recoger dentro de Repetir."],
    treasureFragment: fragment(4, 1, "Isla Memoria"),
    uiObjectiveText: "Recogé 3 monedas y llegá a (4, 2).",
    jorcMessage: "Tres monedas en fila. Combiná 'Avanzar' y 'Recoger' dentro de 'Repetir' para ser eficiente. ¡Fragmento de mapa!",
  }),

  // 4-5 — Obstáculos y decisiones
  "4-5": level({
    id: "4-5",
    title: "Memoria de Obstáculos",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3)],
    obstacles: [rock(2, 3), rock(3, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 14 },
    hints: ["Usá Si Bloqueado para detectar rocas.", "Combiná con Repetir para automatizar."],
    uiObjectiveText: "Llegá a la posición (5, 3) usando al menos 1 Si bloqueado.",
    jorcMessage: "Hay rocas obstaculizando. Usá 'Si Bloqueado' para detectarlas y girar automáticamente. ¡Navegación inteligente!",
  }),

  // 4-6 — 3 monedas dispersas
  "4-6": level({
    id: "4-6",
    title: "Inventario Pirata",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(3)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 1, 4), coin("c2", 4, 1), coin("c3", 5, 3)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 18 },
    hints: ["Las monedas están dispersas.", "Planificá la ruta para recoger todas."],
    uiObjectiveText: "Recogé 3 monedas y llegá a (5, 5).",
    jorcMessage: "Tres monedas dispersas por el mapa. Planificá tu ruta para recogerlas todas. ¡Cada moneda cuenta!",
  }),

  // 4-7 — Laberinto suave
  "4-7": level({
    id: "4-7",
    title: "Bitácora Profunda",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(1, 4), rock(2, 4), rock(3, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Hay varios obstáculos.", "Usá Si Bloqueado para navegar."],
    uiObjectiveText: "Llegá a la posición (5, 0) usando al menos 1 Si bloqueado.",
    jorcMessage: "Laberinto con obstáculos. Combiná 'Repetir' con 'Si Bloqueado' para navegar automáticamente.",
  }),

  // 4-8 — Fragmento 2 W4: diagonal con rocas
  "4-8": level({
    id: "4-8",
    title: "Memoria Direccional",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [rock(2, 2), rock(3, 3)],
    collectibles: [coin("c1", 1, 3), coin("c2", 4, 2)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 18 },
    hints: ["Camino diagonal.", "Esquivá las rocas."],
    treasureFragment: fragment(4, 2, "Isla Memoria"),
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 5).",
    jorcMessage: "Camino diagonal con rocas. Usá 'Si Bloqueado' + 'Repetir' para navegar eficientemente. ¡Fragmento!",
  }),

  // 4-9 — 4 monedas con pared vertical
  "4-9": level({
    id: "4-9",
    title: "Contabilidad Marina",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(4)],
    obstacles: [rock(3, 1), rock(3, 2), rock(3, 4), rock(3, 5)],
    collectibles: [coin("c1", 1, 1), coin("c2", 2, 5), coin("c3", 4, 1), coin("c4", 5, 5)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 24 },
    hints: ["Pared vertical con hueco en el centro.", "Planificá el recorrido."],
    uiObjectiveText: "Recogé 4 monedas y llegá a (6, 3).",
    jorcMessage: "Pared vertical con hueco central. Planificá bien el recorrido para recoger todas las monedas.",
  }),

  // 4-10 — Serpiente de rocas: zigzag controlado
  "4-10": level({
    id: "4-10",
    title: "Serpiente de Agua",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(6, 6)],
    obstacles: [rock(2, 1), rock(4, 1), rock(2, 3), rock(4, 3), rock(2, 5), rock(4, 5)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 22 },
    hints: ["Ruta en zigzag controlada.", "Repeat para tramos, si-bloqueado para bordes."],
    uiObjectiveText: "Llegá a la posición (6, 6) usando Repetir y Si Bloqueado.",
    jorcMessage: "Serpiente de rocas. Navegación en zigzag controlado. Usá 'Repetir' para los tramos y 'Si Bloqueado' para los giros.",
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
      coin("c5", 6, 4),
    ],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 28 },
    hints: ["Las monedas dibujan una ruta.", "Planificá bien cada tramo."],
    uiObjectiveText: "Recogé 5 monedas y llegá a (6, 0).",
    jorcMessage: "Las monedas dibujan una ruta diagonal. Planificá bien cada tramo. ¡Preparándote para el final!",
  }),

  // 4-12 — Final W4: 6 monedas en patrón simétrico
  "4-12": level({
    id: "4-12",
    title: "Cálculo Pirata",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(6)],
    obstacles: [rock(3, 2), rock(3, 4)],
    collectibles: [
      coin("c1", 1, 1),
      coin("c2", 1, 5),
      coin("c3", 3, 0),
      coin("c4", 3, 6),
      coin("c5", 5, 1),
      coin("c6", 5, 5),
    ],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked"],
    optimalSolution: { blockCount: 26 },
    hints: ["Patrón simétrico: monedas arriba y abajo.", "Optimizá con repeat."],
    treasureFragment: fragment(4, 3, "Isla Memoria"),
    uiObjectiveText: "Recogé 6 monedas y llegá a (6, 3).",
    jorcMessage: "¡Final del Santuario! Patrón simétrico de monedas. Usá todo: Repetir para optimizar, Si Bloqueado para decidir. ¡Fragmento final!",
  }),

  // =========================
  // WORLD 5 — FUNCIONES (5-1..5-12)
  // =========================

  // 5-1 — Introduce función: define para avanzar 3 veces
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
    hints: ["Nuevo: 'Función'.", "Definí una función que avance 3 veces.", "Después llamala."],
    uiObjectiveText: "Llegá a la posición (3, 1) usando al menos 1 Definir función y 1 Llamar función.",
    jorcMessage: "¡Nueva herramienta: Funciones! Definí un bloque con pasos adentro y después llamalo. ¡Podés reutilizar código sin repetirlo!",
  }),

  // 5-2 — Función para patrón: avanzar + girar
  "5-2": level({
    id: "5-2",
    title: "Hechizo de Giro",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(4, 4)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "function-define", "function-call"],
    optimalSolution: { blockCount: 7 },
    hints: ["Meté dentro de una función: avanzar y girar.", "Reutilizá con 'llamar función'."],
    uiObjectiveText: "Llegá a la posición (4, 4) usando al menos 1 Definir función y 1 Llamar función.",
    jorcMessage: "Armá una función con un patrón: avanzar y girar. Después llamala varias veces. ¡Menos bloques, mismo resultado!",
  }),

  // 5-3 — Función + repeat
  "5-3": level({
    id: "5-3",
    title: "Reutilizar sin Dolor",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(5, 3)],
    obstacles: [],
    collectibles: [],
    availableBlocks: ["forward", "repeat", "function-define", "function-call"],
    optimalSolution: { blockCount: 5 },
    hints: ["Una función puede contener repeat.", "Construí un 'macro' de movimiento."],
    uiObjectiveText: "Llegá a la posición (5, 3) usando al menos 1 Definir función y 1 Repetir.",
    jorcMessage: "Podés meter 'Repetir' dentro de una función. Es como crear tu propio 'macro' de movimiento. ¡Muy poderoso!",
  }),

  // 5-4 — Fragmento 1 W5: función simple + moneda
  "5-4": level({
    id: "5-4",
    title: "Mi Primera Función",
    gridSize: { rows: 5, cols: 5 },
    startPosition: pos(0, 2, "east"),
    objectives: [reach(4, 2), collectCoins(1)],
    obstacles: [],
    collectibles: [coin("c1", 2, 2)],
    availableBlocks: ["forward", "collect-coin", "function-define", "function-call"],
    optimalSolution: { blockCount: 5 },
    hints: ["Definí una función para avanzar y recoger.", "Después llamala."],
    treasureFragment: fragment(5, 1, "Isla Funciones"),
    uiObjectiveText: "Recogé 1 moneda y llegá a (4, 2) usando al menos 1 Definir función y 1 Llamar función.",
    jorcMessage: "Tu primera función con moneda. Definí una rutina que avance y recoja, después llamala. ¡Fragmento del mapa!",
  }),

  // 5-5 — Función + monedas + roca
  "5-5": level({
    id: "5-5",
    title: "Función de Botín",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 2, 2), coin("c2", 4, 4)],
    availableBlocks: [
      "forward", "turn-right", "turn-left", "collect-coin", "repeat", "function-define", "function-call",
    ],
    optimalSolution: { blockCount: 16 },
    hints: ["Creá una función para recorrer un tramo.", "Repetila y recogé monedas."],
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 5) usando al menos 1 Definir función y 2 Recoger moneda.",
    jorcMessage: "Hay monedas y una roca. Creá una función para un tramo del recorrido. Reutilizala y recogé las monedas.",
  }),

  // 5-6 — Función + if-blocked (autopiloto en función)
  "5-6": level({
    id: "5-6",
    title: "Autopiloto 2.0",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 5, "north"),
    objectives: [reach(5, 0)],
    obstacles: [rock(1, 4), rock(2, 4), rock(3, 2), rock(4, 2)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "if-blocked", "repeat", "function-define", "function-call"],
    optimalSolution: { blockCount: 18 },
    hints: ["Meté la lógica 'si bloqueado' en una función.", "Después repetís llamadas."],
    uiObjectiveText: "Llegá a la posición (5, 0) usando al menos 1 Definir función y 1 Si bloqueado.",
    jorcMessage: "Autopiloto 2.0: meté la lógica de 'Si Bloqueado' dentro de una función. Después repetis llamadas. ¡Navegación inteligente!",
  }),

  // 5-7 — Función + variables + monedas
  "5-7": level({
    id: "5-7",
    title: "Rutina con Memoria",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(3)],
    obstacles: [rock(3, 3)],
    collectibles: [coin("c1", 1, 1), coin("c2", 5, 1), coin("c3", 3, 5)],
    availableBlocks: [
      "forward", "turn-right", "turn-left", "collect-coin", "variable", "repeat", "if-blocked", "function-define", "function-call",
    ],
    optimalSolution: { blockCount: 26 },
    hints: ["Función para moverte, variable para contar.", "La roca te obliga a rodear."],
    uiObjectiveText: "Recogé 3 monedas y llegá a (6, 3) usando al menos 1 Definir función y 1 Variable.",
    jorcMessage: "Combiná funciones con variables. La función te mueve, la variable cuenta. La roca te obliga a rodear. ¡Todo junto!",
  }),

  // 5-8 — Fragmento 2 W5: reutilización de función para patrón
  "5-8": level({
    id: "5-8",
    title: "Patrón Reutilizable",
    gridSize: { rows: 6, cols: 6 },
    startPosition: pos(0, 0, "south"),
    objectives: [reach(5, 5), collectCoins(2)],
    obstacles: [],
    collectibles: [coin("c1", 2, 2), coin("c2", 4, 4)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "function-define", "function-call", "repeat"],
    optimalSolution: { blockCount: 16 },
    hints: ["Creá una función para el patrón diagonal.", "Usala dos veces."],
    treasureFragment: fragment(5, 2, "Isla Funciones"),
    uiObjectiveText: "Recogé 2 monedas y llegá a (5, 5) usando al menos 1 Definir función llamada 2 veces.",
    jorcMessage: "Patrón diagonal que se repite. Creá una función para el patrón y llamala dos veces. ¡Fragmento del mapa!",
  }),

  // 5-9 — Desafío serio: pasillos + monedas + rocas
  "5-9": level({
    id: "5-9",
    title: "El Taller del Navegante",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 7, "north"),
    objectives: [reach(7, 0), collectCoins(4)],
    obstacles: [rock(2, 5), rock(2, 4), rock(5, 3), rock(5, 2)],
    collectibles: [coin("c1", 1, 6), coin("c2", 3, 3), coin("c3", 4, 6), coin("c4", 6, 1)],
    availableBlocks: [
      "forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked", "variable", "function-define", "function-call",
    ],
    optimalSolution: { blockCount: 32 },
    hints: ["Acá se nota si realmente usás funciones.", "Divide el problema en rutinas."],
    uiObjectiveText: "Recogé 4 monedas y llegá a (7, 0) usando al menos 1 Definir función y 1 Variable.",
    jorcMessage: "Desafío grande. Acá se nota si realmente usás funciones. Dividí el problema en rutinas reutilizables.",
  }),

  // 5-10 — Función para patrón repetido (U o zigzag)
  "5-10": level({
    id: "5-10",
    title: "Rutina Perfecta",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(7, 7)],
    obstacles: [rock(3, 1), rock(3, 2), rock(3, 3), rock(4, 4), rock(4, 5), rock(4, 6)],
    collectibles: [],
    availableBlocks: ["forward", "turn-right", "turn-left", "repeat", "if-blocked", "function-define", "function-call"],
    optimalSolution: { blockCount: 28 },
    hints: ["Construí una función para el patrón.", "Llamala dentro de un repeat."],
    uiObjectiveText: "Llegá a la posición (7, 7) usando al menos 1 Definir función y 1 Repetir.",
    jorcMessage: "Rutina perfecta: construí una función con el patrón de navegación y llamala dentro de 'Repetir'. ¡Elegancia pura!",
  }),

  // 5-11 — Pre-final: 6 monedas en disposición compleja
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
      coin("c3", 3, 4),
      coin("c4", 5, 4),
      coin("c5", 6, 1),
      coin("c6", 6, 6),
    ],
    availableBlocks: [
      "forward", "turn-right", "turn-left", "collect-coin", "repeat", "if-blocked", "variable", "function-define", "function-call",
    ],
    optimalSolution: { blockCount: 40 },
    hints: ["Sin funciones, esto se hace eterno.", "Variables para conteo, funciones para patrones."],
    uiObjectiveText: "Recogé 6 monedas y llegá a (7, 4) usando al menos 1 Definir función y 1 Variable.",
    jorcMessage: "Cámara del tesoro. Sin funciones, esto se hace eterno. Usá variables para conteo y funciones para patrones.",
  }),

  // 5-12 — Final épico: 8 monedas + rocas simétricas
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
      "forward", "turn-right", "turn-left", "collect-coin", "function-define", "function-call", "repeat", "if-blocked", "variable",
    ],
    optimalSolution: { blockCount: 48 },
    hints: ["Usá TODO lo aprendido.", "Funciones para rutinas, repeat para repeticiones, variables para conteo."],
    treasureFragment: fragment(5, 3, "Isla Funciones"),
    uiObjectiveText: "Recogé 8 monedas y llegá a (7, 7) usando al menos 1 Definir función, 1 Repetir y 1 Variable.",
    jorcMessage: "¡EL TESORO FINAL! Usá TODO lo que aprendiste: funciones, repetir, variables, condicionales. ¡Demostrá que sos un verdadero capitán programador!",
  }),
}

// Niveles bonus (fuera de los 60 principales)
const BONUS_LEVELS: Record<string, LevelData> = {
  "2-13": level({
    id: "2-13",
    title: "Noche Profunda",
    gridSize: { rows: 7, cols: 7 },
    startPosition: pos(0, 3, "east"),
    objectives: [reach(6, 3), collectCoins(3)],
    obstacles: [kraken(2, 2), kraken(2, 4), kraken(4, 2), kraken(4, 4)],
    collectibles: [coin("c1", 1, 1), coin("c2", 3, 5), coin("c3", 5, 1)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 20 },
    hints: ["Los Krakens forman un patrón en X.", "Buscá el camino seguro por los bordes."],
  }),

  "2-14": level({
    id: "2-14",
    title: "Señor de las Mareas",
    gridSize: { rows: 8, cols: 8 },
    startPosition: pos(0, 0, "east"),
    objectives: [reach(7, 7), collectCoins(5)],
    obstacles: [kraken(2, 2), kraken(3, 5), kraken(5, 3), kraken(6, 6)],
    collectibles: [coin("c1", 1, 3), coin("c2", 3, 1), coin("c3", 4, 4), coin("c4", 6, 2), coin("c5", 7, 5)],
    availableBlocks: ["forward", "turn-right", "turn-left", "collect-coin", "repeat"],
    optimalSolution: { blockCount: 28 },
    hints: ["Nivel bonus del mundo.", "Usá repeat para los tramos largos."],
  }),
}

export { BONUS_LEVELS }

export function getLevelConfig(levelId: string): LevelData {
  // Alias: tutorial => 1-1 (manteniendo el id solicitado)
  if (levelId === "tutorial") {
    const base = LEVELS["1-1"]
    return { ...base, id: "tutorial", theme: "default" }
  }

  // Derive theme from world prefix
  const worldPrefix = levelId.split("-")[0]
  const deriveTheme = (): "default" | "night" | "reef" | "sanctuary" => {
    if (worldPrefix === "4") return "sanctuary"
    if (worldPrefix === "3") return "reef"
    if (worldPrefix === "2") return "night"
    return "default"
  }

  const found = LEVELS[levelId]
  if (found) return { ...found, theme: found.theme || deriveTheme() }

  // Check bonus levels
  const bonus = BONUS_LEVELS[levelId]
  if (bonus) return { ...bonus, theme: bonus.theme || deriveTheme() }

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
    theme: deriveTheme(),
  }
}

// Mock level data generator (backward compatible)
export function getMockLevelData(levelId: string): {
  gridData: GridData
  entities: Entity[]
  objective: string
  jorcMessage?: string
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

  // Build objective string - use custom uiObjectiveText if available
  let objective: string
  if (config.uiObjectiveText) {
    objective = config.uiObjectiveText
  } else {
    const objectiveStrings = config.objectives.map((obj) => {
      if (obj.type === "reach") return `Llega a la posición (${obj.target?.x}, ${obj.target?.y})`
      if (obj.type === "collect") return `Recoge ${obj.count} ${obj.item}`
      if (obj.type === "collectAll") return `Recoge todos los ${obj.items?.join(", ")}`
      if (obj.type === "activate") return `Activa la palanca`
      return ""
    })
    objective = objectiveStrings.join(" y ")
  }

  return {
    gridData: {
      rows: config.gridSize.rows,
      cols: config.gridSize.cols,
      tiles,
    },
    entities,
    objective,
    jorcMessage: config.jorcMessage,
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
