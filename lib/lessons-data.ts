import type { GlossaryTerm } from "./types"

/**
 * Academy 2.0 Lesson Data
 * All lessons follow the new format with content.story, content.demo, content.practice, content.summary
 */

// =============================================================================
// BASIC LESSONS - Isla Secuencia
// =============================================================================

export const basicLessons = [
  {
    id: "lesson-1",
    title: "Qué es un programa?",
    duration: "5 min",
    icon: "Monitor",
    description: "Aprende qué es programar y por qué es como dar órdenes a un pirata",
    category: "basic",
    order: 1,
    world: 1,
    content: {
      story: {
        character: "jorc",
        dialogue: `¡Ahoy, grumete! Bienvenido a bordo del *Perla de Código*.\n\nSoy Jorc, tu capitán. Tengo un secreto: soy muy fuerte, pero **no sé qué hacer si tú no me lo dices**.\n\nUn **PROGRAMA** es simplemente una lista de órdenes que tú me das. Si me dices:\n1. Avanzar\n2. Girar a la derecha\n3. Abrir el cofre\n\n¡Yo haré exactamente eso! Ni más, ni menos.`
      },
      demo: {
        gridSize: 4,
        steps: [
          { code: ["Avanzar", "Girar", "Avanzar"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Jorc está listo en la salida (0,0)." },
          { code: ["Avanzar", "Girar", "Avanzar"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "east" }, message: "Si dices 'Avanzar', doy un paso al frente." },
          { code: ["Avanzar", "Girar", "Avanzar"], activeLineIndex: 1, jorcState: { x: 1, y: 0, facing: "south" }, message: "Si dices 'Girar', cambio mi rumbo a la derecha." },
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
        quiz: { questions: [] }
      }
    }
  }
]

// =============================================================================
// LOOP LESSONS - Isla Bucle
// =============================================================================

export const loopLessons = [
  {
    id: "loop-1",
    title: "¿Qué es un bucle?",
    duration: "9 min",
    icon: "Repeat",
    description: "Aprende a repetir acciones sin escribir lo mismo muchas veces",
    category: "loop",
    order: 1,
    world: 2,
    requiredLesson: "lesson-1",
    content: {
      story: {
        character: "jorc",
        dialogue: `Imagina que tienes que dar 10 pasos.\n\n**La forma ABURRIDA:**\nAvanzar\nAvanzar\nAvanzar... (¡10 veces!)\n\n**La forma INTELIGENTE:**\nRepetir 10 veces: Avanzar\n\n¡Eso es un **BUCLE**! Es como decirme: "Haz esto varias veces sin que yo tenga que escribirlo cada vez."\n\nLos bucles hacen tu código más corto y fácil de leer.`
      },
      demo: {
        gridSize: 6,
        steps: [
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Jorc está en el inicio. Vamos a repetir 5 veces 'Avanzar'." },
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 1, y: 0, facing: "east" }, message: "Repetición 1: Avanzar → Jorc avanza." },
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 2, y: 0, facing: "east" }, message: "Repetición 2: Avanzar → ¡Sigue avanzando!" },
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 3, y: 0, facing: "east" }, message: "Repetición 3: Avanzar." },
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 4, y: 0, facing: "east" }, message: "Repetición 4: Avanzar." },
          { code: ["Repetir 5:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 5, y: 0, facing: "east" }, message: "Repetición 5: ¡Llegamos! Solo 2 líneas de código para 5 pasos." }
        ]
      },
      practice: {
        exercises: [
          {
            id: "loop1-ex1",
            type: "choice",
            prompt: "¿Para qué sirve un bucle?",
            options: [
              { id: "a", label: "Para hacer el código más largo", isCorrect: false },
              { id: "b", label: "Para repetir acciones sin escribirlas muchas veces", isCorrect: true },
              { id: "c", label: "Para borrar bloques", isCorrect: false }
            ],
            hint: "Piensa en cómo Jorc avanzó 5 veces con solo 2 líneas."
          },
          {
            id: "loop1-ex2",
            type: "choice",
            prompt: "Si quiero que Jorc avance 8 casillas, ¿cuál es mejor?",
            options: [
              { id: "a", label: "Escribir 'Avanzar' 8 veces", isCorrect: false },
              { id: "b", label: "Repetir 8: Avanzar", isCorrect: true },
              { id: "c", label: "Girar 8 veces", isCorrect: false }
            ],
            hint: "Los bucles hacen el código más corto."
          },
          {
            id: "loop1-ex3",
            type: "choice",
            prompt: "'Repetir 3: Avanzar' hace que Jorc avance...",
            options: [
              { id: "a", label: "1 casilla", isCorrect: false },
              { id: "b", label: "3 casillas", isCorrect: true },
              { id: "c", label: "6 casillas", isCorrect: false }
            ],
            hint: "El número dice cuántas veces se repite."
          }
        ]
      },
      summary: {
        keyPoints: [
          "Un BUCLE repite acciones varias veces.",
          "Hace el código más corto y fácil de leer.",
          "Solo necesitas decir cuántas veces repetir."
        ],
        quiz: { questions: [] }
      }
    }
  },
  {
    id: "loop-2",
    title: "Bucles con patrones",
    duration: "10 min",
    icon: "Repeat2",
    description: "Repite patrones de varios bloques juntos",
    category: "loop",
    order: 2,
    world: 2,
    requiredLesson: "loop-1",
    content: {
      story: {
        character: "jorc",
        dialogue: `¡Un bucle puede repetir MÁS de una acción!\n\nImagina que quieres hacer un cuadrado:\n- Avanzar, Girar\n- Avanzar, Girar\n- Avanzar, Girar\n- Avanzar, Girar\n\nCon un bucle sería:\n**Repetir 4: { Avanzar, Girar }**\n\n¡Puedes meter varios bloques dentro del bucle y todos se repetirán juntos!`
      },
      demo: {
        gridSize: 5,
        steps: [
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: -1, jorcState: { x: 1, y: 2, facing: "east" }, message: "Jorc va a hacer un cuadrado repitiendo 'Avanzar, Girar' 4 veces." },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 1, jorcState: { x: 2, y: 2, facing: "east" }, message: "Rep 1: Avanzar..." },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 2, jorcState: { x: 2, y: 2, facing: "south" }, message: "Rep 1: Girar. ¡Primer lado del cuadrado!" },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 1, jorcState: { x: 2, y: 3, facing: "south" }, message: "Rep 2: Avanzar..." },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 2, jorcState: { x: 2, y: 3, facing: "west" }, message: "Rep 2: Girar. ¡Segundo lado!" },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 1, jorcState: { x: 1, y: 3, facing: "west" }, message: "Rep 3: Avanzar..." },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 2, jorcState: { x: 1, y: 3, facing: "north" }, message: "Rep 3: Girar. ¡Tercer lado!" },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 1, jorcState: { x: 1, y: 2, facing: "north" }, message: "Rep 4: Avanzar..." },
          { code: ["Repetir 4:", "  Avanzar", "  Girar"], activeLineIndex: 2, jorcState: { x: 1, y: 2, facing: "east" }, message: "Rep 4: Girar. ¡Cuadrado completo con solo 3 líneas!" }
        ]
      },
      practice: {
        exercises: [
          {
            id: "loop2-ex1",
            type: "choice",
            prompt: "¿Cuántos bloques puedes poner dentro de un bucle?",
            options: [
              { id: "a", label: "Solo 1", isCorrect: false },
              { id: "b", label: "Máximo 2", isCorrect: false },
              { id: "c", label: "Los que necesites", isCorrect: true }
            ],
            hint: "En el demo pusimos 2 bloques (Avanzar y Girar)."
          },
          {
            id: "loop2-ex2",
            type: "choice",
            prompt: "'Repetir 3: { Avanzar, Girar }' ejecuta en total...",
            options: [
              { id: "a", label: "3 acciones", isCorrect: false },
              { id: "b", label: "6 acciones (3 Avanzar + 3 Girar)", isCorrect: true },
              { id: "c", label: "2 acciones", isCorrect: false }
            ],
            hint: "Se repiten AMBOS bloques 3 veces."
          }
        ]
      },
      summary: {
        keyPoints: [
          "Un bucle puede contener varios bloques.",
          "Todos los bloques dentro se repiten juntos.",
          "Es perfecto para patrones que se repiten."
        ],
        quiz: { questions: [] }
      }
    }
  }
]

// =============================================================================
// CONDITIONAL LESSONS - Isla Decisión
// =============================================================================

export const conditionalLessons = [
  {
    id: "cond-1",
    title: "¿Qué es una condición?",
    duration: "8 min",
    icon: "GitBranch",
    description: "Aprende a hacer que tu programa tome decisiones",
    category: "conditional",
    order: 1,
    world: 3,
    requiredLesson: "loop-2",
    content: {
      story: {
        character: "jorc",
        dialogue: `En la vida real, tomamos decisiones todo el tiempo:\n\n☔ Si llueve → llevo paraguas\n☀️ Si no llueve → no llevo paraguas\n\nEn programación es igual. Podemos hacer que yo decida qué hacer:\n\n**Si hay obstáculo adelante:**\n  Girar\n**Si no hay obstáculo:**\n  Avanzar\n\nA esto le llamamos **CONDICIÓN**: una pregunta que el programa hace antes de decidir qué hacer.`
      },
      demo: {
        gridSize: 4,
        obstacle: { x: 2, y: 0 }, // Rock at (2,0) so Jorc has to decide
        steps: [
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Jorc empieza en (0,0). ¿Hay obstáculo adelante?" },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 0, jorcState: { x: 0, y: 0, facing: "east" }, message: "Revisa: No hay obstáculo en (1,0)." },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 3, jorcState: { x: 1, y: 0, facing: "east" }, message: "Condición FALSA → Ejecuta 'Sino: Avanzar'." },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "east" }, message: "Revisa otra vez: ¡Hay roca en (2,0)!" },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 1, jorcState: { x: 1, y: 0, facing: "south" }, message: "Condición VERDADERA → Ejecuta 'Girar'." },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "south" }, message: "Revisa: No hay obstáculo al sur." },
          { code: ["Si hay obstáculo:", "  Girar", "Sino:", "  Avanzar"], activeLineIndex: 3, jorcState: { x: 1, y: 1, facing: "south" }, message: "Condición FALSA → Avanzar. ¡Jorc esquivó la roca!" }
        ]
      },
      practice: {
        exercises: [
          {
            id: "cond1-ex1",
            type: "choice",
            prompt: "¿Qué es una condición en programación?",
            options: [
              { id: "a", label: "Un tipo de bucle", isCorrect: false },
              { id: "b", label: "Una pregunta para decidir qué hacer", isCorrect: true },
              { id: "c", label: "Un bloque de movimiento", isCorrect: false }
            ],
            hint: "Piensa en '¿Hay obstáculo?'"
          },
          {
            id: "cond1-ex2",
            type: "choice",
            prompt: "'Si hay moneda: Recoger' significa...",
            options: [
              { id: "a", label: "Siempre recoger", isCorrect: false },
              { id: "b", label: "Solo recoger si hay moneda", isCorrect: true },
              { id: "c", label: "Nunca recoger", isCorrect: false }
            ],
            hint: "La acción solo se ejecuta SI la condición es verdadera."
          },
          {
            id: "cond1-ex3",
            type: "choice",
            prompt: "¿Qué hace 'Sino' en una condición?",
            options: [
              { id: "a", label: "Termina el programa", isCorrect: false },
              { id: "b", label: "Se ejecuta cuando la condición es falsa", isCorrect: true },
              { id: "c", label: "Repite la condición", isCorrect: false }
            ],
            hint: "Si no llueve... no llevo paraguas."
          }
        ]
      },
      summary: {
        keyPoints: [
          "Una CONDICIÓN es una pregunta que hace el programa.",
          "Según la respuesta, el programa hace cosas diferentes.",
          "Usa SI... SINO... para crear decisiones."
        ],
        quiz: { questions: [] }
      }
    }
  }
]

// =============================================================================
// UNIFIED LESSONS ARRAY
// =============================================================================

export const allLessons = [...basicLessons, ...loopLessons, ...conditionalLessons]

/**
 * Get lesson by ID - searches all lessons
 */
export function getLessonById(id: string) {
  return allLessons.find((lesson) => lesson.id === id)
}

/**
 * Get lessons by category
 */
export function getLessonsByCategory(category: string) {
  return allLessons.filter((lesson) => lesson.category === category)
}

/**
 * Check if a lesson is unlocked based on completed lessons
 */
export function isLessonUnlocked(lessonId: string, completedLessons: string[]): boolean {
  const lesson = getLessonById(lessonId) as any
  if (!lesson) return false

  // First lesson of each category is always unlocked if previous world is complete
  if (!lesson.requiredLesson) return true

  return completedLessons.includes(lesson.requiredLesson)
}

// =============================================================================
// GLOSSARY
// =============================================================================

export const glossary: Record<string, GlossaryTerm[]> = {
  A: [
    {
      term: "Algoritmo",
      definition: "Una receta paso a paso para resolver un problema. Como las instrucciones para armar un barco pirata.",
      example: "Algoritmo para hacer un sandwich: 1) Tomar pan, 2) Poner jamón, 3) Cerrar.",
      relatedTerms: ["Secuencia", "Programa"],
    },
  ],
  B: [
    {
      term: "Bloque",
      definition: "Una pieza de código que hace una acción. Como una orden que le das a Jorc.",
      example: '"Avanzar" es un bloque que hace que Jorc camine una casilla.',
      relatedTerms: ["Código", "Comando"],
    },
    {
      term: "Bucle",
      definition: "Repetir una acción varias veces sin escribir el código varias veces.",
      example: 'En vez de escribir "Avanzar" 10 veces, usas "Repetir 10: Avanzar"',
      relatedTerms: ["Loop", "Repetir"],
    },
    {
      term: "Bug",
      definition: "Un error en el código. Como cuando Jorc choca con una roca porque le diste una orden equivocada.",
      example: "Si Jorc gira a la izquierda cuando debería ir a la derecha, eso es un bug.",
      relatedTerms: ["Error", "Debug"],
    },
  ],
  C: [
    {
      term: "Código",
      definition: "Instrucciones escritas en un lenguaje que la computadora entiende.",
      example: "Los bloques que armas en BloxMision son código.",
      relatedTerms: ["Programa", "Bloque"],
    },
    {
      term: "Condición",
      definition: "Una pregunta que el programa hace antes de decidir qué hacer.",
      example: '"¿Hay obstáculo?" es una condición. Si la respuesta es SÍ, Jorc gira.',
      relatedTerms: ["Si", "Decisión"],
    },
  ],
  D: [
    {
      term: "Debug",
      definition: "Buscar y arreglar errores (bugs) en el código.",
      example: "Cuando tu código no funciona, haces debug para encontrar el problema.",
      relatedTerms: ["Bug", "Error"],
    },
  ],
  L: [
    {
      term: "Loop",
      definition: "Otra palabra para Bucle. Significa repetir algo varias veces.",
      example: "Un loop de 5 repeticiones ejecuta el código 5 veces.",
      relatedTerms: ["Bucle", "Repetir"],
    },
  ],
  P: [
    {
      term: "Programa",
      definition: "Una lista de instrucciones que le dices a la computadora que haga.",
      example: "Tu código en BloxMision es un programa que controla a Jorc.",
      relatedTerms: ["Código", "Algoritmo"],
    },
  ],
  S: [
    {
      term: "Secuencia",
      definition: "Hacer cosas en un orden específico, una después de otra.",
      example: "Primero avanzar, luego girar, luego abrir cofre. Ese orden es una secuencia.",
      relatedTerms: ["Orden", "Algoritmo"],
    },
    {
      term: "Sensor",
      definition: "Un bloque que detecta cosas alrededor de Jorc, como obstáculos o cofres.",
      example: '"¿Hay obstáculo adelante?" es un sensor que mira si hay algo bloqueando.',
      relatedTerms: ["Condición", "Detectar"],
    },
  ],
}
