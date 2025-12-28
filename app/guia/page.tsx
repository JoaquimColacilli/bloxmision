"use client"

import type React from "react"

import { useState, useMemo, useCallback, Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Search, Move, Zap, RefreshCw, Eye, Database, Code } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { HelpModal } from "@/components/help/help-modal"
import { blockHelpData, type BlockHelp } from "@/lib/block-help-data"
import { cn } from "@/lib/utils"

type CategoryFilter = "all" | "movement" | "actions" | "control" | "sensors" | "memory" | "commands"

const categoryConfig: Record<
  string,
  { label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string }
> = {
  movement: {
    label: "Movimiento",
    icon: <Move className="size-4" />,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  actions: {
    label: "Acciones",
    icon: <Zap className="size-4" />,
    color: "bg-violet-500",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  control: {
    label: "Control",
    icon: <RefreshCw className="size-4" />,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  sensors: {
    label: "Sensores",
    icon: <Eye className="size-4" />,
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  memory: {
    label: "Memoria",
    icon: <Database className="size-4" />,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  commands: {
    label: "Mis Comandos",
    icon: <Code className="size-4" />,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
}

const categories: CategoryFilter[] = ["all", "movement", "actions", "control", "sensors", "memory", "commands"]

function GuiaContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  const allBlocks = useMemo(() => Object.values(blockHelpData), [])

  const filteredBlocks = useMemo(() => {
    return allBlocks.filter((block) => {
      const matchesSearch =
        searchQuery === "" ||
        block.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "all" || block.category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [allBlocks, searchQuery, categoryFilter])

  const groupedBlocks = useMemo(() => {
    const groups: Record<string, BlockHelp[]> = {}
    filteredBlocks.forEach((block) => {
      if (!groups[block.category]) {
        groups[block.category] = []
      }
      groups[block.category].push(block)
    })
    return groups
  }, [filteredBlocks])

  const handleBlockClick = useCallback((blockId: string) => {
    setSelectedBlockId(blockId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedBlockId(null)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-ocean-600 hover:text-ocean-800">
            <ArrowLeft className="size-4" />
            Volver al inicio
          </Link>
          <h1 className="text-2xl font-bold text-ocean-800 sm:text-3xl">Guia de Bloques</h1>
          <p className="mt-1 text-ocean-600">Aprende que hace cada bloque y como usarlo</p>
        </div>

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ocean-400" />
            <Input
              type="text"
              placeholder="Buscar bloque por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-ocean-200 bg-white pl-10 focus-visible:ring-ocean-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isAll = cat === "all"
              const config = isAll ? null : categoryConfig[cat]
              const isActive = categoryFilter === cat

              return (
                <Button
                  key={cat}
                  variant="outline"
                  size="sm"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "gap-1.5 transition-all",
                    isActive
                      ? isAll
                        ? "border-ocean-500 bg-ocean-500 text-white"
                        : cn(config?.color, "border-transparent text-white")
                      : "border-ocean-200 bg-white text-ocean-600 hover:bg-ocean-50",
                  )}
                >
                  {config?.icon}
                  {isAll ? "Todos" : config?.label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-ocean-500">
          {filteredBlocks.length} {filteredBlocks.length === 1 ? "bloque encontrado" : "bloques encontrados"}
        </p>

        {/* Block grid */}
        {filteredBlocks.length === 0 ? (
          <div className="rounded-lg border border-ocean-200 bg-white p-8 text-center">
            <p className="text-ocean-600">No se encontraron bloques con esa busqueda.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
              }}
              className="mt-2 text-ocean-500"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : categoryFilter === "all" ? (
          // Grouped view when showing all
          <div className="space-y-6">
            {Object.entries(groupedBlocks).map(([category, blocks]) => {
              const config = categoryConfig[category]
              if (!config) return null

              return (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <div className={cn("flex size-6 items-center justify-center rounded text-white", config.color)}>
                      {config.icon}
                    </div>
                    <h2 className="font-semibold text-ocean-800">{config.label}</h2>
                    <span className="text-sm text-ocean-400">({blocks.length})</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {blocks.map((block) => (
                      <BlockCard
                        key={block.id}
                        block={block}
                        config={config}
                        onClick={() => handleBlockClick(block.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Flat grid when filtering by category
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBlocks.map((block) => {
              const config = categoryConfig[block.category]
              return (
                <BlockCard key={block.id} block={block} config={config} onClick={() => handleBlockClick(block.id)} />
              )
            })}
          </div>
        )}
      </div>

      {/* Help modal */}
      {selectedBlockId && (
        <HelpModal
          isOpen={!!selectedBlockId}
          onClose={handleCloseModal}
          blockId={selectedBlockId}
          availableBlockIds={allBlocks.map((b) => b.id)}
        />
      )}
    </div>
  )
}

interface BlockCardProps {
  block: BlockHelp
  config: (typeof categoryConfig)[string]
  onClick: () => void
}

function BlockCard({ block, config, onClick }: BlockCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-lg border p-4 text-left transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ocean-400",
        config.bgColor,
        config.borderColor,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg text-sm font-bold text-white",
            config.color,
          )}
        >
          {block.title.charAt(0)}
        </div>
        <h3 className="font-semibold text-ocean-800 group-hover:text-ocean-900">{block.title}</h3>
      </div>
      <p className="line-clamp-2 text-sm text-ocean-600">{block.description}</p>
    </button>
  )
}

export default function GuiaPage() {
  return (
    <MenuLayout>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-ocean-500">Cargando...</div>
          </div>
        }
      >
        <GuiaContent />
      </Suspense>
    </MenuLayout>
  )
}
