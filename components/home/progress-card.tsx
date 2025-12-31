"use client"

import { useState } from "react"
import { Map, Trophy, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapViewer } from "@/components/map/map-viewer"
import { RanksModal } from "./ranks-modal"
import { getNextLevelThreshold } from "@/lib/game/xpCalculator"
import { isValidPlayerLevel, getRankIconPath, type PlayerLevel } from "@/lib/types/player-level"
import Image from "next/image"
import type { User, TreasureFragment } from "@/lib/types"

interface ProgressCardProps {
  user: User
  fragments?: TreasureFragment[]
}

export function ProgressCard({ user, fragments = [] }: ProgressCardProps) {
  const [ranksModalOpen, setRanksModalOpen] = useState(false)
  const { treasureFragments, totalXP, playerLevel } = user

  // Calculate XP progress towards next level
  const nextLevelThreshold = getNextLevelThreshold(totalXP)
  const xpProgress = nextLevelThreshold > 0 ? Math.min((totalXP / nextLevelThreshold) * 100, 100) : 100

  // Get streak value (handle both object and number formats)
  const streakValue = typeof user.streak === 'object' ? user.streak?.current : (user.streak ?? 0)

  // Get rank icon
  const rankIcon = isValidPlayerLevel(playerLevel)
    ? getRankIconPath(playerLevel as PlayerLevel)
    : null

  const displayFragments: TreasureFragment[] =
    fragments.length > 0
      ? fragments
      : Array.from({ length: 15 }).map((_, i) => ({
        id: `frag-${i + 1}`,
        order: i + 1,
        unlocked: i < (treasureFragments || 0),
        imageUrl: `/fragments/fragment-${i + 1}.png`,
      }))

  return (
    <>
      <Card className="w-full max-w-md border-2 border-ocean-200 bg-white/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-ocean-800">
            <Map className="size-5 text-ocean-500" />
            Tu progreso
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* XP & Level Progress - Clickable */}
          <button
            onClick={() => setRanksModalOpen(true)}
            className="flex flex-col gap-2 rounded-xl border-2 border-ocean-200 bg-gradient-to-r from-ocean-50 to-gold-50 p-3 text-left transition-all hover:border-gold-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {rankIcon && (
                  <div className="relative size-8">
                    <Image
                      src={rankIcon}
                      alt={playerLevel}
                      fill
                      className="object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                )}
                <span className="font-semibold text-ocean-800">{playerLevel}</span>
                <span className="text-xs text-ocean-400">▸ Ver rangos</span>
              </div>
              <span className="text-ocean-500">
                {totalXP}/{nextLevelThreshold} XP
              </span>
            </div>
            <Progress value={xpProgress} className="h-2.5 bg-ocean-100" />
            <div className="text-right text-xs text-ocean-400">
              {totalXP} XP total
            </div>
          </button>

          {/* Stats Row */}
          <div className="flex items-center justify-around rounded-xl bg-ocean-50 p-3">
            {/* Streak */}
            {streakValue > 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Flame className="size-5 text-orange-500" />
                  <span className="font-bold text-ocean-800">{streakValue}</span>
                </div>
                <span className="text-xs text-ocean-500">días seguidos</span>
              </div>
            )}

            {/* Treasure Fragments */}
            {treasureFragments !== undefined && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Trophy className="size-5 text-gold-600" />
                  <span className="font-bold text-ocean-800">{treasureFragments}/15</span>
                </div>
                <span className="text-xs text-ocean-500">fragmentos</span>
              </div>
            )}
          </div>

          <MapViewer fragments={displayFragments} />
        </CardContent>
      </Card>

      {/* Ranks Modal */}
      <RanksModal
        open={ranksModalOpen}
        onOpenChange={setRanksModalOpen}
        totalXP={totalXP}
        playerLevel={playerLevel}
      />
    </>
  )
}
