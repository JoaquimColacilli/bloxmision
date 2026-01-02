import type { BlockCategoryData } from "@/lib/types"
import { getLevelConfig } from "./mock-level-data"

export const mockBlockCategories: BlockCategoryData[] = [
  {
    id: "movement",
    name: "Movimiento",
    color: "#3B82F6", // blue-500
    bgColor: "#DBEAFE", // blue-100
    borderColor: "#2563EB", // blue-600
    icon: "move",
    blocks: [
      {
        id: "forward",
        type: "forward",
        category: "movement",
        label: "Avanzar",
        shape: "command",
        params: [{ name: "pasos", type: "number", default: 1, min: 1, max: 10 }],
      },
      { id: "turn-right", type: "turn-right", category: "movement", label: "Girar Derecha", shape: "command" },
      { id: "turn-left", type: "turn-left", category: "movement", label: "Girar Izquierda", shape: "command" },
      {
        id: "backward",
        type: "backward",
        category: "movement",
        label: "Retroceder",
        shape: "command",
        params: [{ name: "pasos", type: "number", default: 1, min: 1, max: 10 }],
      },
    ],
  },
  {
    id: "actions",
    name: "Acciones",
    color: "#8B5CF6", // violet-500
    bgColor: "#EDE9FE", // violet-100
    borderColor: "#7C3AED", // violet-600
    icon: "zap",
    blocks: [
      { id: "open-chest", type: "open-chest", category: "actions", label: "Abrir Cofre", shape: "command" },
      { id: "collect-coin", type: "collect-coin", category: "actions", label: "Recoger Moneda", shape: "command" },
      { id: "push-rock", type: "push-rock", category: "actions", label: "Empujar Roca", shape: "command" },
      { id: "use-lever", type: "use-lever", category: "actions", label: "Usar Palanca", shape: "command" },
    ],
  },
  {
    id: "control",
    name: "Control",
    color: "#F97316", // orange-500
    bgColor: "#FFEDD5", // orange-100
    borderColor: "#EA580C", // orange-600
    icon: "repeat",
    blocks: [
      {
        id: "repeat",
        type: "repeat",
        category: "control",
        label: "Repetir",
        shape: "loop",
        params: [{ name: "veces", type: "number", default: 3, min: 1, max: 20 }],
      },
      { id: "repeat-until", type: "repeat-until", category: "control", label: "Repetir hasta", shape: "loop" },
      { id: "if-blocked", type: "if-blocked", category: "control", label: "Si Bloqueado", shape: "conditional" },
      { id: "if", type: "if", category: "control", label: "Si", shape: "conditional" },
      { id: "if-else", type: "if-else", category: "control", label: "Si-Sino", shape: "conditional" },
    ],
  },
  {
    id: "sensors",
    name: "Sensores",
    color: "#EAB308", // yellow-500
    bgColor: "#FEF9C3", // yellow-100
    borderColor: "#CA8A04", // yellow-600
    icon: "eye",
    blocks: [
      { id: "has-obstacle", type: "sensor", category: "sensors", label: "Hay obstaculo?", shape: "sensor" },
      { id: "has-chest", type: "sensor", category: "sensors", label: "Hay cofre?", shape: "sensor" },
      { id: "touching-wall", type: "sensor", category: "sensors", label: "Tocando pared?", shape: "sensor" },
      {
        id: "coins-gt",
        type: "sensor",
        category: "sensors",
        label: "Monedas >",
        shape: "sensor",
        params: [{ name: "cantidad", type: "number", default: 0, min: 0, max: 99 }],
      },
    ],
  },
  {
    id: "memory",
    name: "Memoria",
    color: "#22C55E", // green-500
    bgColor: "#DCFCE7", // green-100
    borderColor: "#16A34A", // green-600
    icon: "database",
    blocks: [
      { id: "variable", type: "variable", category: "memory", label: "Variable", shape: "variable" },
      { id: "create-var", type: "variable", category: "memory", label: "Crear variable", shape: "variable" },
      { id: "set-var", type: "variable", category: "memory", label: "Establecer", shape: "variable" },
      { id: "change-var", type: "variable", category: "memory", label: "Cambiar", shape: "variable" },
      { id: "show-var", type: "variable", category: "memory", label: "Ver valor", shape: "variable" },
    ],
  },
  {
    id: "commands",
    name: "Mis Comandos",
    color: "#EF4444", // red-500
    bgColor: "#FEE2E2", // red-100
    borderColor: "#DC2626", // red-600
    icon: "code",
    blocks: [
      { id: "function-define", type: "define", category: "commands", label: "Definir Función", shape: "loop" },
      { id: "function-call", type: "call", category: "commands", label: "Llamar Función", shape: "command" },
      { id: "define-cmd", type: "define", category: "commands", label: "Definir", shape: "loop" },
      { id: "call-cmd", type: "call", category: "commands", label: "Llamar", shape: "command" },
    ],
  },
]

// Helper to get blocks for a specific level based on level configuration
export function getBlocksForLevel(levelId: string): BlockCategoryData[] {
  const config = getLevelConfig(levelId)
  const availableBlockIds = config.availableBlocks || ["forward"]

  // Filter categories to only include blocks that are available for this level
  return mockBlockCategories
    .map((category) => ({
      ...category,
      blocks: category.blocks.filter((block) => availableBlockIds.includes(block.id)),
    }))
    .filter((category) => category.blocks.length > 0)
}

