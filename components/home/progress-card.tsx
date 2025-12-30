"use client"

import { Map, Trophy, Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapViewer } from "@/components/map/map-viewer"
import type { User, TreasureFragment } from "@/lib/types"

interface ProgressCardProps {
  user: User
  fragments?: TreasureFragment[]
}

export function ProgressCard({ user, fragments = [] }: ProgressCardProps) {
  const { currentWorld, streak, treasureFragments } = user

  if (!currentWorld) return null

  const levelProgress = (currentWorld.completedLevels / currentWorld.totalLevels) * 100

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
    <Card className="w-full max-w-md border-2 border-ocean-200 bg-white/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-ocean-800">
          <Map className="size-5 text-ocean-500" />
          Tu progreso
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Current World */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ocean-700">{currentWorld.name}</span>
            <span className="text-ocean-500">
              Nivel {currentWorld.completedLevels}/{currentWorld.totalLevels}
            </span>
          </div>
          <Progress value={levelProgress} className="h-2.5 bg-ocean-100" />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around rounded-xl bg-ocean-50 p-3">
          {/* Streak */}
          {streak !== undefined && streak > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Flame className="size-5 text-orange-500" />
                <span className="font-bold text-ocean-800">{streak}</span>
              </div>
              <span className="text-xs text-ocean-500">dias seguidos</span>
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
  )
}
