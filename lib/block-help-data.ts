export interface BlockHelp {
  id: string
  title: string
  category: "movement" | "actions" | "control" | "sensors" | "memory" | "commands"
  description: string
  visual: {
    before: string[][]
    after: string[][]
  }
  tips: string[]
  related: string[]
}

export const blockHelpData: Record<string, BlockHelp> = {
  forward: {
    id: "forward",
    title: "Avanzar",
    category: "movement",
    description: "Jorc camina hacia adelante en la direccion que esta mirando.",
    visual: {
      before: [
        ["🏴‍☠️→", "⬜", "⬜"],
        ["⬜", "⬜", "⬜"],
      ],
      after: [
        ["⬜", "🏴‍☠️→", "⬜"],
        ["⬜", "⬜", "⬜"],
      ],
    },
    tips: ["Combinalo con Girar para cambiar de direccion", "Puedes avanzar varios pasos a la vez con el numero"],
    related: ["turn-right", "turn-left", "backward"],
  },
  "turn-right": {
    id: "turn-right",
    title: "Girar Derecha",
    category: "movement",
    description: "Jorc gira 90 grados a la derecha sin moverse de lugar.",
    visual: {
      before: [["🏴‍☠️↑"]],
      after: [["🏴‍☠️→"]],
    },
    tips: ["Usalo para explorar en diferentes direcciones", "Recuerda: ↑ → ↓ → ← → ↑ (gira en circulo)"],
    related: ["forward", "turn-left"],
  },
  "turn-left": {
    id: "turn-left",
    title: "Girar Izquierda",
    category: "movement",
    description: "Jorc gira 90 grados a la izquierda sin moverse de lugar.",
    visual: {
      before: [["🏴‍☠️↑"]],
      after: [["🏴‍☠️←"]],
    },
    tips: ["Igual que Girar Derecha pero al otro lado", "Combina ambos giros para hacer maniobras complicadas"],
    related: ["forward", "turn-right"],
  },
  backward: {
    id: "backward",
    title: "Retroceder",
    category: "movement",
    description: "Jorc camina hacia atras sin cambiar la direccion que mira.",
    visual: {
      before: [
        ["⬜", "🏴‍☠️→", "⬜"],
        ["⬜", "⬜", "⬜"],
      ],
      after: [
        ["🏴‍☠️→", "⬜", "⬜"],
        ["⬜", "⬜", "⬜"],
      ],
    },
    tips: ["Util para salir de callejones sin girar", "Jorc sigue mirando hacia adelante"],
    related: ["forward", "turn-right", "turn-left"],
  },
  "open-chest": {
    id: "open-chest",
    title: "Abrir Cofre",
    category: "actions",
    description: "Jorc abre el cofre del tesoro que tiene enfrente.",
    visual: {
      before: [["🏴‍☠️→", "📦"]],
      after: [["🏴‍☠️→", "💰"]],
    },
    tips: ["Debes estar justo al lado del cofre", "Los cofres pueden contener monedas, gemas o fragmentos del mapa"],
    related: ["collect-coin", "forward"],
  },
  "collect-coin": {
    id: "collect-coin",
    title: "Recoger Moneda",
    category: "actions",
    description: "Jorc recoge la moneda o tesoro de la casilla donde esta.",
    visual: {
      before: [["🏴‍☠️🪙"]],
      after: [["🏴‍☠️✓"]],
    },
    tips: ["Primero muevete a la casilla de la moneda", "Algunas monedas estan escondidas"],
    related: ["open-chest", "forward"],
  },
  "push-rock": {
    id: "push-rock",
    title: "Empujar Roca",
    category: "actions",
    description: "Jorc empuja la roca que tiene enfrente una casilla.",
    visual: {
      before: [["🏴‍☠️→", "🪨", "⬜"]],
      after: [["⬜", "🏴‍☠️→", "🪨"]],
    },
    tips: ["Solo puedes empujar si hay espacio detras de la roca", "Usa las rocas para activar interruptores"],
    related: ["forward", "use-lever"],
  },
  "use-lever": {
    id: "use-lever",
    title: "Usar Palanca",
    category: "actions",
    description: "Jorc activa la palanca que tiene enfrente.",
    visual: {
      before: [["🏴‍☠️→", "🔴"]],
      after: [["🏴‍☠️→", "🟢"]],
    },
    tips: ["Las palancas abren puertas y puentes", "Algunas palancas se desactivan solas"],
    related: ["push-rock", "forward"],
  },
  repeat: {
    id: "repeat",
    title: "Repetir",
    category: "control",
    description: "Ejecuta los bloques de adentro N veces. Ahorra espacio en tu codigo!",
    visual: {
      before: [["🏴‍☠️→", "⬜", "⬜", "⬜"]],
      after: [["⬜", "⬜", "⬜", "🏴‍☠️→"]],
    },
    tips: [
      "En vez de Avanzar, Avanzar, Avanzar, usa Repetir 3: Avanzar",
      "Puedes meter otros bloques Repetir adentro (bucles anidados)",
    ],
    related: ["repeat-until", "if"],
  },
  "repeat-until": {
    id: "repeat-until",
    title: "Repetir Hasta",
    category: "control",
    description: "Repite los bloques hasta que la condicion sea verdadera.",
    visual: {
      before: [["🏴‍☠️→", "⬜", "⬜", "🧱"]],
      after: [["⬜", "⬜", "🏴‍☠️→", "🧱"]],
    },
    tips: ["Perfecto cuando no sabes cuantas veces repetir", "Usalo con sensores como Hay obstaculo?"],
    related: ["repeat", "has-obstacle"],
  },
  if: {
    id: "if",
    title: "Si",
    category: "control",
    description: "Solo ejecuta los bloques de adentro si la condicion es verdadera.",
    visual: {
      before: [["🏴‍☠️→", "🪨", "⬜"]],
      after: [["🏴‍☠️↓", "🪨", "⬜"]],
    },
    tips: ["Usalo con sensores: Si hay obstaculo entonces Girar", "Perfecto para evitar choques"],
    related: ["has-obstacle", "has-chest", "if-else"],
  },
  "if-else": {
    id: "if-else",
    title: "Si-Sino",
    category: "control",
    description: "Ejecuta unos bloques si es verdadero, otros si es falso.",
    visual: {
      before: [["🏴‍☠️→", "❓"]],
      after: [["⬜", "🏴‍☠️→"]],
    },
    tips: ["Si hay cofre entonces Abrir, sino Avanzar", "Mas flexible que solo Si"],
    related: ["if", "has-chest"],
  },
  "if-blocked": {
    id: "if-blocked",
    title: "Si Bloqueado",
    category: "control",
    description: "Detecta si hay un obstaculo (roca, muro, kraken) adelante. Si hay algo bloqueando, ejecuta los bloques de adentro.",
    visual: {
      before: [["🏴‍☠️→", "🪨", "⬜"]],
      after: [["🏴‍☠️↓", "🪨", "⬜"]],
    },
    tips: [
      "Solo detecta obstaculos fisicos, no el borde del mapa",
      "Perfecto para esquivar rocas automaticamente",
      "Combinalo con Repetir para un autopiloto inteligente",
      "Ejemplo: Si Bloqueado entonces Girar Derecha",
    ],
    related: ["if", "repeat", "has-obstacle"],
  },
  "has-obstacle": {
    id: "has-obstacle",
    title: "Hay obstaculo?",
    category: "sensors",
    description: "Detecta si hay algo bloqueando el camino adelante.",
    visual: {
      before: [["🏴‍☠️→", "🪨"]],
      after: [["✅"]],
    },
    tips: ["Devuelve Si o No", "Combinalo con Si para evitar choques"],
    related: ["if", "repeat-until"],
  },
  "has-chest": {
    id: "has-chest",
    title: "Hay cofre?",
    category: "sensors",
    description: "Detecta si hay un cofre enfrente de Jorc.",
    visual: {
      before: [["🏴‍☠️→", "📦"]],
      after: [["✅"]],
    },
    tips: ["Usalo para abrir cofres automaticamente", "Si hay cofre entonces Abrir Cofre"],
    related: ["open-chest", "if"],
  },
  "touching-wall": {
    id: "touching-wall",
    title: "Tocando pared?",
    category: "sensors",
    description: "Detecta si Jorc esta junto a una pared.",
    visual: {
      before: [["🧱", "🏴‍☠️→"]],
      after: [["✅"]],
    },
    tips: ["Util para navegar laberintos", "Sigue la pared derecha para salir"],
    related: ["has-obstacle", "repeat-until"],
  },
  "coins-gt": {
    id: "coins-gt",
    title: "Monedas >",
    category: "sensors",
    description: "Compara cuantas monedas tienes con un numero.",
    visual: {
      before: [["🪙🪙🪙", "> 2?"]],
      after: [["✅"]],
    },
    tips: ["Util para desbloquear puertas especiales", "Monedas > 5 significa mas de 5 monedas"],
    related: ["collect-coin", "if"],
  },
  "create-var": {
    id: "create-var",
    title: "Crear Variable",
    category: "memory",
    description: "Crea un espacio de memoria para guardar un numero.",
    visual: {
      before: [["📝 tesoro = ?"]],
      after: [["📝 tesoro = 0"]],
    },
    tips: ["Dale un nombre facil de recordar", "Empieza en 0 o el valor que quieras"],
    related: ["set-var", "change-var"],
  },
  "set-var": {
    id: "set-var",
    title: "Establecer",
    category: "memory",
    description: "Cambia el valor de una variable a un numero especifico.",
    visual: {
      before: [["tesoro = 5"]],
      after: [["tesoro = 10"]],
    },
    tips: ["El valor anterior se pierde", "Usa Cambiar si quieres sumar o restar"],
    related: ["create-var", "change-var"],
  },
  "change-var": {
    id: "change-var",
    title: "Cambiar",
    category: "memory",
    description: "Suma o resta al valor actual de una variable.",
    visual: {
      before: [["tesoro = 5", "+3"]],
      after: [["tesoro = 8"]],
    },
    tips: ["Usa numeros negativos para restar", "Perfecto para contar monedas"],
    related: ["create-var", "set-var"],
  },
  "show-var": {
    id: "show-var",
    title: "Ver Valor",
    category: "memory",
    description: "Muestra el valor actual de una variable.",
    visual: {
      before: [["tesoro = 5"]],
      after: [["💬 5"]],
    },
    tips: ["Util para depurar tu codigo", "Jorc dira el valor en voz alta"],
    related: ["create-var", "set-var"],
  },
  "define-cmd": {
    id: "define-cmd",
    title: "Definir Comando",
    category: "commands",
    description: "Crea tu propio bloque con varios pasos adentro.",
    visual: {
      before: [["🆕 GirarYAvanzar"]],
      after: [["= Girar + Avanzar"]],
    },
    tips: ["Agrupa bloques que repites mucho", "Dale un nombre que explique lo que hace"],
    related: ["call-cmd"],
  },
  "call-cmd": {
    id: "call-cmd",
    title: "Llamar Comando",
    category: "commands",
    description: "Ejecuta un comando personalizado que creaste.",
    visual: {
      before: [["📞 GirarYAvanzar"]],
      after: [["Girar + Avanzar"]],
    },
    tips: ["Ahorra espacio en tu codigo", "Puedes llamarlo muchas veces"],
    related: ["define-cmd"],
  },
}

// Get help for available blocks only
export function getHelpForBlocks(blockIds: string[]): BlockHelp[] {
  return blockIds.map((id) => blockHelpData[id]).filter((help): help is BlockHelp => help !== undefined)
}
