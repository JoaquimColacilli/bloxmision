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
  },
  // NEW: ONBOARDING - MANDATORY FOR EVERYTHING
  {
    id: "onboarding",
    title: "Tu Primera Aventura",
    duration: "5 min",
    icon: "Map",
    description: "Aprende los movimientos básicos para navegar el barco",
    category: "basic",
    order: 0, // First
    world: 1,
    content: {
      story: {
        character: "jorc",
        dialogue: `¡Atención tripulación! Antes de zarpar hacia aguas peligrosas, necesitamos probar que sabes manejar el barco.\n\nTienes 4 herramientas principales:\n\n**Avanzar**: Mueve el barco una casilla al frente.\n**Girar Derecha/Izquierda**: Rota el barco sin moverse.\n**Recoger Moneda**: ¡Para llevarse el tesoro!\n\n¿Listo para la prueba?`
      },
      demo: {
        gridSize: 4,
        steps: [
          { code: ["Avanzar", "Girar Derecha", "Avanzar", "Recoger"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Vamos por esa moneda en (1,1)." },
          { code: ["Avanzar", "Girar Derecha", "Avanzar", "Recoger"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "east" }, message: "Avanzar: un paso al este." },
          { code: ["Avanzar", "Girar Derecha", "Avanzar", "Recoger"], activeLineIndex: 1, jorcState: { x: 1, y: 0, facing: "south" }, message: "Girar Derecha: ahora miramos al sur." },
          { code: ["Avanzar", "Girar Derecha", "Avanzar", "Recoger"], activeLineIndex: 2, jorcState: { x: 1, y: 1, facing: "south" }, message: "Avanzar: llegamos a la moneda." },
          { code: ["Avanzar", "Girar Derecha", "Avanzar", "Recoger"], activeLineIndex: 3, jorcState: { x: 1, y: 1, facing: "south" }, message: "Recoger: ¡Clink! Tesoro guardado." }
        ]
      },
      practice: {
        exercises: [
          {
            id: "onb-1",
            type: "choice",
            prompt: "Si quieres ir a la derecha, pero estás mirando al frente, ¿qué haces primero?",
            options: [
              { id: "a", label: "Avanzar de costado", isCorrect: false },
              { id: "b", label: "Usar Girar Derecha", isCorrect: true },
              { id: "c", label: "Gritarle al barco", isCorrect: false }
            ],
            hint: "El barco no camina de costado, primero debe girar."
          },
          {
            id: "onb-2",
            type: "choice",
            prompt: "El bloque 'Girar'...",
            options: [
              { id: "a", label: "Mueve el barco y gira a la vez", isCorrect: false },
              { id: "b", label: "Solo rota el barco, no lo mueve de casilla", isCorrect: true },
              { id: "c", label: "Hace girar el mundo", isCorrect: false }
            ],
            hint: "Mira la demo: el barco rota en su lugar."
          },
          {
            id: "onb-3",
            type: "choice",
            prompt: "Pasaste por encima de una moneda. ¿Ya es tuya?",
            options: [
              { id: "a", label: "Sí, es automático", isCorrect: false },
              { id: "b", label: "No, tengo que usar 'Recoger Moneda'", isCorrect: true },
              { id: "c", label: "Solo si el barco es rojo", isCorrect: false }
            ],
            hint: "¡Tienes que dar la orden de recoger!"
          }
        ]
      },
      summary: {
        keyPoints: [
          "El barco hace EXACTAMENTE lo que dices en orden.",
          "Girar NO mueve, solo rota.",
          "Usa Recoger Moneda para agarrar tesoros.",
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
    world: 1, // Changed from 2 to 1 (Intro at 1-10)
    requiredLesson: "onboarding", // Chain from onboarding

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
export const functionLessons = [
  // NEW: FUNCTIONS - World 5 (Intro)
  {
    id: "functions-1",
    title: "Tus Propios Bloques",
    duration: "12 min",
    icon: "Zap", // Represents magic/function
    description: "Crea hechizos (funciones) para enseñar trucos nuevos a Jorc",
    category: "function",
    order: 1,
    world: 5,
    requiredLesson: "cond-1",
    content: {
      story: {
        character: "jorc",
        dialogue: `¡Capitán! Me duelen los brazos de tanto repetir las mismas órdenes para hacer un cuadrado una y otra vez.\n\n¿Y si te enseño un truco de magia? Se llama **FUNCIÓN**.\n\nEs como enseñarme una palabra nueva. Tú me dices:\n"Cuando diga 'HacerCuadrado', camina 4 veces y gira".\n\n¡Y luego solo tienes que decir 'HacerCuadrado'! ¡Magia de programación!`
      },
      demo: {
        gridSize: 5,
        steps: [
          { code: ["Definir 'Saltar':", "  Avanzar", "  Avanzar"], activeLineIndex: -1, jorcState: { x: 0, y: 0, facing: "east" }, message: "Primero DEFINIMOS qué hace 'Saltar' (avanza 2 veces)." },
          { code: ["Llamar 'Saltar'"], activeLineIndex: 0, jorcState: { x: 1, y: 0, facing: "east" }, message: "Ahora LLAMAMOS al hechizo. ¡Jorc ejecuta lo de adentro!" },
          { code: ["Llamar 'Saltar'"], activeLineIndex: 0, jorcState: { x: 2, y: 0, facing: "east" }, message: "¡Y otra vez! Dos pasos con un solo bloque." }
        ]
      },
      practice: {
        exercises: [
          {
            id: "func-1",
            type: "choice",
            prompt: "¿Para qué sirve Definir Función?",
            options: [
              { id: "a", label: "Para ponerle nombre al barco", isCorrect: false },
              { id: "b", label: "Para crear un bloque nuevo con instrucciones dentro", isCorrect: true },
              { id: "c", label: "Para terminar el nivel", isCorrect: false }
            ],
            hint: "Es como crear tu propio bloque personalizado."
          },
          {
            id: "func-2",
            type: "choice",
            prompt: "Si Defines una función pero nunca la Llamas...",
            options: [
              { id: "a", label: "El código dentro NO se ejecuta", isCorrect: true },
              { id: "b", label: "Se ejecuta una vez", isCorrect: false },
              { id: "c", label: "Da error", isCorrect: false }
            ],
            hint: "La definición solo 'enseña', la llamada 'hace'."
          }
        ]
      },
      summary: {
        keyPoints: [
          "DEFINIR enseña cómo hacer algo nuevo.",
          "LLAMAR ejecuta eso que enseñaste.",
          "¡Úsalo para no escribir lo mismo una y otra vez!",
        ],
        quiz: { questions: [] }
      }
    }
  }
]

export const variableLessons = [
  // NEW: VARIABLES - World 5 (Level 5-7)
  {
    id: "variables-1",
    title: "La Bitácora del Capitán",
    duration: "10 min",
    icon: "Database",
    description: "Usa la memoria del barco para recordar números y contar tesoros",
    category: "memory",
    order: 1,
    world: 5,
    requiredLesson: "functions-1",
    content: {
      story: {
        character: "jorc",
        dialogue: `A veces encontramos tantos tesoros que pierdo la cuenta. ¡Necesitamos anotarlos!\n\nUna **VARIABLE** es como una página en mi bitácora donde anoto un número a lápiz.\n\nPuedo escribir 'Monedas = 0'.\nY cuando recojo una, borro y pongo 'Monedas = 1'.\n¡Así nunca olvido cuánto tenemos!`
      },
      demo: {
        gridSize: 4,
        steps: [
          { code: ["Var 'cofre' = 0", "Avanzar", "Cambiar 'cofre' por 1"], activeLineIndex: 0, jorcState: { x: 0, y: 0, facing: "east" }, message: "Creamos la variable 'cofre' en 0." },
          { code: ["Var 'cofre' = 0", "Avanzar", "Cambiar 'cofre' por 1"], activeLineIndex: 2, jorcState: { x: 1, y: 0, facing: "east" }, message: "¡Encontramos uno! Sumamos 1 a 'cofre'. Ahora vale 1." }
        ]
      },
      practice: {
        exercises: [
          {
            id: "var-1",
            type: "choice",
            prompt: "¿Qué es una variable?",
            options: [
              { id: "a", label: "Un lugar para guardar/recordar datos", isCorrect: true },
              { id: "b", label: "Una variación del barco", isCorrect: false },
              { id: "c", label: "Un camino que cambia", isCorrect: false }
            ],
            hint: "Es como la bitácora donde anotas números."
          },
          {
            id: "var-2",
            type: "choice",
            prompt: "Si 'puntos = 5' y le sumas 1...",
            options: [
              { id: "a", label: "Queda en 5", isCorrect: false },
              { id: "b", label: "Ahora vale 6", isCorrect: true },
              { id: "c", label: "Se borra todo", isCorrect: false }
            ],
            hint: "¡Exacto! 5 + 1 = 6."
          }
        ]
      },
      summary: {
        keyPoints: [
          "Una VARIABLE guarda información.",
          "Puedes cambiar su valor (sumar, restar).",
          "Úsala para contar cosas o recordar estados.",
        ],
        quiz: { questions: [] }
      }
    }
  }
]

// =============================================================================
// UNIFIED LESSONS ARRAY
// =============================================================================

export const allLessons = [...basicLessons, ...loopLessons, ...conditionalLessons, ...functionLessons, ...variableLessons]


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
