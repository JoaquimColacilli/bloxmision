import type { Lesson, GlossaryTerm } from "./types"

// MVP: Partial cast to match AcademyLesson for the first lesson
export const basicLessons: any[] = [
  {
    id: "lesson-1",
    title: "Qué es un programa?",
    duration: "5 min",
    icon: "Monitor",
    description: "Aprende qué es programar y por qué es como dar órdenes a un pirata",
    category: "basic",
    order: 1,
    content: {
      story: {
        character: "jorc",
        dialogue: `¡Ahoy, grumete! Bienvenido a bordo del *Perla de Código*.\n\nSoy Jorc, tu capitán. Tengo un secreto: soy muy fuerte, pero **no sé qué hacer si tú no me lo dices**.\n\nUn **PROGRAMA** es simplemente una lista de órdenes que tú me das. Si me dices:\n1. Avanzar\n2. Girar a la derecha\n3. Abrir el cofre\n\n¡Yo haré exactamente sus deseos! Ni más, ni menos.`
      },
      demo: {
        gridSize: 4,
        steps: [
          { code: ["Avanzar"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Jorc está listo en la salida (0,0)." },
          { code: ["Avanzar"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "east" }, message: "Si dices 'Avanzar', doy un paso al frente." },
          { code: ["Avanzar", "Girar"], activeLineIndex: 1, jorcState: { x: 1, y: 0, facing: "south" }, message: "Si dices 'Girar', cambio mi rumbo a la derecha." },
          { code: ["Avanzar", "Girar", "Avanzar"], activeLineIndex: 2, jorcState: { x: 1, y: 1, facing: "south" }, message: "¡Avanzar de nuevo! Ahora voy hacia el sur." }
        ]
      },
      practice: {
        exercises: [
          {
            id: "ex-1",
            type: "choice",
            prompt: "¿Qué es un programa?",
            options: [
              { id: "a", label: "Un mapa del tesoro", isCorrect: false },
              { id: "b", label: "Una lista de órdenes para la computadora", isCorrect: true },
              { id: "c", label: "Un tipo de loro", isCorrect: false }
            ],
            hint: "Recuerda lo que dijo Jorc sobre las órdenes."
          },
          {
            id: "ex-2",
            type: "choice",
            prompt: "Si el capitán no recibe órdenes, ¿qué hace?",
            options: [
              { id: "a", label: "Nada, se queda quieto", isCorrect: true },
              { id: "b", label: "Adivina qué hacer", isCorrect: false },
              { id: "c", label: "Se va a dormir", isCorrect: false }
            ],
            hint: "Las computadoras (y Jorc) necesitan instrucciones exactas."
          },
          {
            id: "ex-3",
            type: "choice",
            prompt: "¿En qué orden se ejecutan las instrucciones?",
            options: [
              { id: "a", label: "Todas a la vez", isCorrect: false },
              { id: "b", label: "De abajo hacia arriba", isCorrect: false },
              { id: "c", label: "Paso a paso, una por una", isCorrect: true }
            ],
            hint: "Como una receta de cocina: paso 1, paso 2..."
          }
        ]
      },
      summary: {
        keyPoints: [
          "Un PROGRAMA es una lista de instrucciones.",
          "El ORDEN es importante.",
          "La computadora hace EXACTAMENTE lo que le dices."
        ],
        quiz: {
          questions: [] // Handled in practice for MVP
        }
      }
    },
  },
  // ... other lessons kept as legacy structure or unrelated for this MVP path
]

export const loopLessons: Lesson[] = [
  {
    id: "loop-1",
    title: "Que es un bucle?",
    duration: "9 min",
    icon: "Repeat",
    description: "Aprende a repetir acciones sin escribir lo mismo muchas veces",
    category: "loop",
    order: 1,
    requiredWorld: 1,
    content: [
      {
        type: "story",
        data: {
          dialogue: `Imagina que tienes que dar 10 pasos.

La forma ABURRIDA:
Avanzar
Avanzar
Avanzar
... (10 veces!)

La forma INTELIGENTE:
Repetir 10 veces: Avanzar

Eso es un BUCLE! Es como decirle a Jorc: "Haz esto varias veces sin que yo tenga que escribirlo cada vez."

Los bucles hacen tu codigo mas corto y facil de leer!`,
        },
      },
      {
        type: "demo",
        data: {
          message: "Mira como 5 lineas se convierten en 1:",
          beforeCode: ["Avanzar", "Avanzar", "Avanzar", "Avanzar", "Avanzar"],
          afterCode: ["Repetir 5 veces: { Avanzar }"],
          gridSetup: {
            size: 6,
            jorc: { x: 0, y: 0, facing: "east" },
            target: { x: 5, y: 0, type: "coin" },
          },
        },
      },
      {
        type: "practice",
        data: {
          challenge: "Usa un bucle para que Jorc avance 4 casillas y recoja la moneda",
          availableBlocks: ["move", "loop"],
          maxBlocks: 1,
          gridSetup: {
            size: 5,
            jorc: { x: 0, y: 0, facing: "east" },
            target: { x: 4, y: 0, type: "coin" },
          },
          solution: ["Repetir 4: Avanzar"],
        },
      },
      {
        type: "summary",
        data: {
          summaryPoints: [
            "Un BUCLE repite acciones varias veces",
            "Hace el codigo mas corto y facil de leer",
            "Solo necesitas decir cuantas veces repetir",
          ],
          quiz: {
            question: "Para que sirve un bucle?",
            options: [
              { value: "a", label: "Para hacer el codigo mas largo" },
              { value: "b", label: "Para repetir acciones sin escribirlas muchas veces", correct: true },
              { value: "c", label: "Para borrar bloques" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "loop-2",
    title: "Bucles con patrones",
    duration: "10 min",
    icon: "Repeat2",
    description: "Repite patrones de varios bloques juntos",
    category: "loop",
    order: 2,
    requiredLesson: "loop-1",
    content: [
      {
        type: "story",
        data: {
          dialogue: `Un bucle puede repetir MAS de una accion!

Imagina que quieres hacer un cuadrado:
- Avanzar, Girar
- Avanzar, Girar
- Avanzar, Girar
- Avanzar, Girar

Con un bucle seria:
Repetir 4 veces: { Avanzar, Girar Derecha }

Puedes meter varios bloques dentro del bucle y todos se repetiran juntos!`,
        },
      },
      {
        type: "demo",
        data: {
          message: "Observa como Jorc hace un cuadrado:",
          demoCode: ["Repetir 4 veces:", "  Avanzar", "  Avanzar", "  Girar Derecha"],
          gridSetup: {
            size: 4,
            jorc: { x: 0, y: 0, facing: "east" },
          },
        },
      },
      {
        type: "practice",
        data: {
          challenge: "Haz que Jorc recorra el camino en zigzag recogiendo las 3 monedas",
          availableBlocks: ["move", "turnRight", "turnLeft", "loop"],
          maxBlocks: 4,
          gridSetup: {
            size: 4,
            jorc: { x: 0, y: 0, facing: "east" },
            target: { x: 3, y: 0, type: "coin" },
          },
          solution: ["Repetir 3: { Avanzar, Girar Derecha, Avanzar, Girar Izquierda }"],
        },
      },
      {
        type: "summary",
        data: {
          summaryPoints: [
            "Un bucle puede contener varios bloques",
            "Todos los bloques dentro se repiten juntos",
            "Es perfecto para patrones que se repiten",
          ],
          quiz: {
            question: "Cuantos bloques puedes poner dentro de un bucle?",
            options: [
              { value: "a", label: "Solo 1" },
              { value: "b", label: "Maximo 2" },
              { value: "c", label: "Los que necesites", correct: true },
            ],
          },
        },
      },
    ],
  },
]

export const conditionalLessons: Lesson[] = [
  {
    id: "cond-1",
    title: "Que es una condicion?",
    duration: "8 min",
    icon: "GitBranch",
    description: "Aprende a hacer que tu programa tome decisiones",
    category: "conditional",
    order: 1,
    requiredWorld: 2,
    content: [
      {
        type: "story",
        data: {
          dialogue: `En la vida real, tomamos decisiones todo el tiempo:

Si llueve -> llevo paraguas
Si no llueve -> no llevo paraguas

En programacion es igual! Podemos hacer que Jorc decida que hacer:

Si hay obstaculo adelante:
  Girar
Si no hay obstaculo:
  Avanzar

A esto le llamamos CONDICION: una pregunta que el programa hace antes de decidir que hacer.`,
        },
      },
      {
        type: "demo",
        data: {
          message: "Mira como Jorc decide que hacer:",
          demoCode: ["Si hay obstaculo:", "  Girar Derecha", "Sino:", "  Avanzar"],
          gridSetup: {
            size: 4,
            jorc: { x: 0, y: 0, facing: "east" },
            obstacles: [{ x: 1, y: 0, type: "rock" }],
            target: { x: 3, y: 1, type: "coin" },
          },
        },
      },
      {
        type: "practice",
        data: {
          challenge: "Usa una condicion para que Jorc esquive la roca y llegue a la moneda",
          availableBlocks: ["move", "turnRight", "conditional", "sensorObstacle"],
          maxBlocks: 5,
          gridSetup: {
            size: 3,
            jorc: { x: 0, y: 0, facing: "east" },
            obstacles: [{ x: 1, y: 0, type: "rock" }],
            target: { x: 2, y: 0, type: "coin" },
          },
          solution: ["Si hay obstaculo: Girar", "Avanzar", "Avanzar"],
        },
      },
      {
        type: "summary",
        data: {
          summaryPoints: [
            "Una CONDICION es una pregunta que hace el programa",
            "Segun la respuesta, el programa hace cosas diferentes",
            "Usa SI... SINO... para crear decisiones",
          ],
          quiz: {
            question: "Que es una condicion en programacion?",
            options: [
              { value: "a", label: "Un tipo de bucle" },
              { value: "b", label: "Una pregunta para decidir que hacer", correct: true },
              { value: "c", label: "Un bloque de movimiento" },
            ],
          },
        },
      },
    ],
  },
]

export const allLessons = [...basicLessons, ...loopLessons, ...conditionalLessons]

export const glossary: Record<string, GlossaryTerm[]> = {
  A: [
    {
      term: "Algoritmo",
      definition:
        "Una receta paso a paso para resolver un problema. Como las instrucciones para armar un barco pirata.",
      example: "Algoritmo para hacer un sandwich: 1) Tomar pan, 2) Poner jamon, 3) Cerrar.",
      relatedTerms: ["Secuencia", "Programa"],
    },
  ],
  B: [
    {
      term: "Bloque",
      definition: "Una pieza de codigo que hace una accion. Como una orden que le das a Jorc.",
      example: '"Avanzar" es un bloque que hace que Jorc camine una casilla.',
      relatedTerms: ["Codigo", "Comando"],
    },
    {
      term: "Bucle",
      definition: "Repetir una accion varias veces sin escribir el codigo varias veces.",
      example: 'En vez de escribir "Avanzar" 10 veces, usas "Repetir 10: Avanzar"',
      relatedTerms: ["Loop", "Repetir"],
    },
    {
      term: "Bug",
      definition: "Un error en el codigo. Como cuando Jorc choca con una roca porque le diste una orden equivocada.",
      example: "Si Jorc gira a la izquierda cuando deberia ir a la derecha, eso es un bug.",
      relatedTerms: ["Error", "Debug"],
    },
  ],
  C: [
    {
      term: "Codigo",
      definition: "Instrucciones escritas en un lenguaje que la computadora entiende.",
      example: "Los bloques que armas en BloxMision son codigo.",
      relatedTerms: ["Programa", "Bloque"],
    },
    {
      term: "Condicion",
      definition: "Una pregunta que el programa hace antes de decidir que hacer.",
      example: '"Hay obstaculo?" es una condicion. Si la respuesta es SI, Jorc gira.',
      relatedTerms: ["Si", "Decision"],
    },
  ],
  D: [
    {
      term: "Debug",
      definition: "Buscar y arreglar errores (bugs) en el codigo.",
      example: "Cuando tu codigo no funciona, haces debug para encontrar el problema.",
      relatedTerms: ["Bug", "Error"],
    },
  ],
  L: [
    {
      term: "Loop",
      definition: "Otra palabra para Bucle. Significa repetir algo varias veces.",
      example: "Un loop de 5 repeticiones ejecuta el codigo 5 veces.",
      relatedTerms: ["Bucle", "Repetir"],
    },
  ],
  P: [
    {
      term: "Programa",
      definition: "Una lista de instrucciones que le dices a la computadora que haga.",
      example: "Tu codigo en BloxMision es un programa que controla a Jorc.",
      relatedTerms: ["Codigo", "Algoritmo"],
    },
  ],
  S: [
    {
      term: "Secuencia",
      definition: "Hacer cosas en un orden especifico, una despues de otra.",
      example: "Primero avanzar, luego girar, luego abrir cofre. Ese orden es una secuencia.",
      relatedTerms: ["Orden", "Algoritmo"],
    },
    {
      term: "Sensor",
      definition: "Un bloque que detecta cosas alrededor de Jorc, como obstaculos o cofres.",
      example: '"Hay obstaculo adelante?" es un sensor que mira si hay algo bloqueando.',
      relatedTerms: ["Condicion", "Detectar"],
    },
  ],
}

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.id === id)
}

export function getLessonsByCategory(category: Lesson["category"]): Lesson[] {
  return allLessons.filter((lesson) => lesson.category === category)
}

export function isLessonUnlocked(lesson: Lesson, completedLessons: string[], completedWorlds: number): boolean {
  if (lesson.requiredLesson && !completedLessons.includes(lesson.requiredLesson)) {
    return false
  }
  if (lesson.requiredWorld && completedWorlds < lesson.requiredWorld) {
    return false
  }
  return true
}
