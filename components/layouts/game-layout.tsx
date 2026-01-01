"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { X, Package, Code2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { XPBar } from "@/components/header/xp-bar"
import { useAuth } from "@/contexts/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GameLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
  rightPanel?: ReactNode
  bottomControls?: ReactNode
  codeArea?: ReactNode
  blocksCount?: number
}

export function GameLayout({
  children,
  sidebar,
  rightPanel,
  bottomControls,
  codeArea,
  blocksCount = 0,
}: GameLayoutProps) {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<"blocks" | "code">("blocks")

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ocean-100">
      {/* Compact Header */}
      <header className="flex h-12 items-center justify-between border-b border-ocean-200 bg-sand-50 px-4">
        <Link href="/" className="flex items-center gap-2 text-ocean-800">
          <Image src="/BM_LOGO.png" alt="BloxMision" width={24} height={24} className="rounded" />
          <span className="text-sm font-bold">BloxMision</span>
        </Link>

        {user && (
          <XPBar
            totalXP={user.totalXP}
            nextLevelThreshold={user.nextLevelThreshold}
            playerLevel={user.playerLevel}
            variant="compact"
          />
        )}

        <div className="flex items-center gap-1">
          <Link href="/worlds">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-ocean-600 hover:text-ocean-800" aria-label="Volver a las islas">
              <Compass className="size-4" />
              <span className="hidden sm:inline">Islas</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="icon" className="size-8" aria-label="Volver al inicio">
              <X className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      {isMobile ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* GameGrid - 50% superior */}
          <div className="h-1/2 min-h-0 overflow-auto bg-sand-50 p-2">{children}</div>

          {/* Tabs */}
          <div className="flex border-b border-ocean-300 bg-sand-50" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === "blocks"}
              aria-controls="tab-panel-blocks"
              onClick={() => setActiveTab("blocks")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200",
                activeTab === "blocks"
                  ? "border-b-3 border-ocean-500 bg-ocean-50 text-ocean-800"
                  : "border-b-3 border-transparent text-ocean-500 hover:bg-ocean-50/50",
              )}
            >
              <Package className="size-4" />
              Bloques
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "code"}
              aria-controls="tab-panel-code"
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-all duration-200",
                activeTab === "code"
                  ? "border-b-3 border-gold-500 bg-gold-50 text-ocean-800"
                  : "border-b-3 border-transparent text-ocean-500 hover:bg-ocean-50/50",
              )}
            >
              <Code2 className="size-4" />
              Mi Codigo
              {blocksCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ocean-900">
                  {blocksCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content - ~40% */}
          <div className="flex-1 min-h-0 overflow-hidden bg-ocean-50">
            {/* Blocks Tab Panel */}
            <div
              id="tab-panel-blocks"
              role="tabpanel"
              aria-labelledby="tab-blocks"
              className={cn(
                "h-full overflow-auto p-3 transition-all duration-200",
                activeTab === "blocks" ? "block animate-in slide-in-from-left-2" : "hidden",
              )}
            >
              {sidebar}
            </div>

            {/* Code Tab Panel */}
            <div
              id="tab-panel-code"
              role="tabpanel"
              aria-labelledby="tab-code"
              className={cn(
                "h-full overflow-auto transition-all duration-200",
                activeTab === "code" ? "block animate-in slide-in-from-right-2" : "hidden",
              )}
            >
              {codeArea}
            </div>
          </div>

          {/* Fixed Controls - ~10% at bottom */}
          <div className="shrink-0 border-t border-ocean-200 bg-white p-2 pb-safe">{bottomControls}</div>
        </div>
      ) : (
        // Desktop: Three-column layout (unchanged)
        <div className="grid flex-1 grid-cols-[240px_1fr_340px] gap-2 overflow-hidden p-2">
          {/* Left Sidebar - Block Palette */}
          <aside className="flex flex-col gap-2 overflow-hidden rounded-xl bg-sand-50 p-3" role="complementary">
            {sidebar || (
              <div className="flex flex-1 items-center justify-center text-sm text-ocean-400">Paleta de bloques</div>
            )}
          </aside>

          {/* Center - Game Grid + Code Area */}
          <div className="flex flex-col gap-2 overflow-hidden">
            {/* Game Grid */}
            <div className="flex-1 overflow-auto rounded-xl bg-sand-50 p-3">{children}</div>

            {/* Execution Controls */}
            {bottomControls && <div className="rounded-xl bg-sand-50 p-3">{bottomControls}</div>}
          </div>

          {/* Right Panel - Code Area + Jorc */}
          <aside className="flex flex-col overflow-auto rounded-xl bg-sand-50 p-3" role="complementary">
            {rightPanel || (
              <div className="flex flex-1 items-center justify-center text-sm text-ocean-400">Panel de Jorc</div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
