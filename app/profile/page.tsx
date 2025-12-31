"use client"

import { useState } from "react"
import { MenuLayout } from "@/components/layouts/menu-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Star, Map } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import Image from "next/image"
import { isValidPlayerLevel, getRankIconPath, type PlayerLevel } from "@/lib/types/player-level"
import { getNextLevelThreshold } from "@/lib/game/xpCalculator"
import { RanksModal } from "@/components/home/ranks-modal"

export default function ProfilePage() {
  const { user } = useAuth()
  const [ranksModalOpen, setRanksModalOpen] = useState(false)

  // Calculate XP progress towards next level
  const nextLevelThreshold = user ? getNextLevelThreshold(user.totalXP) : 1
  const xpProgress = nextLevelThreshold > 0 ? Math.min((user?.totalXP ?? 0) / nextLevelThreshold * 100, 100) : 100

  // Get rank icon if valid level
  const rankIcon = user && isValidPlayerLevel(user.playerLevel)
    ? getRankIconPath(user.playerLevel as PlayerLevel)
    : null

  // Get streak value (handle both object and number formats)
  const streakValue = user && typeof user.streak === 'object'
    ? user.streak?.current
    : 0

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto flex flex-col gap-6 px-4 py-8">
          {user && (
            <>
              {/* Profile Card */}
              <Card className="mx-auto w-full max-w-md border-2 border-ocean-300 bg-white">
                <CardHeader className="items-center text-center">
                  <Avatar className="size-24 border-4 border-ocean-300">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                    <AvatarFallback className="bg-ocean-500 text-2xl font-bold text-white">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4 text-2xl text-ocean-800">{user.displayName}</CardTitle>

                  {/* Clickable Rank Badge */}
                  <button
                    onClick={() => setRanksModalOpen(true)}
                    className="flex items-center gap-2 rounded-full border-2 border-ocean-200 bg-gradient-to-r from-ocean-50 to-gold-50 px-4 py-2 transition-all hover:border-gold-400 hover:shadow-md"
                  >
                    {rankIcon && (
                      <div className="relative size-8">
                        <Image
                          src={rankIcon}
                          alt={user.playerLevel}
                          fill
                          className="object-contain"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                    )}
                    <span className="font-medium text-ocean-700">{user.playerLevel}</span>
                    <span className="text-xs text-ocean-400">▸</span>
                  </button>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  {/* XP Progress */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-ocean-600">Experiencia del nivel</span>
                      <span className="font-medium text-ocean-800">
                        {user.totalXP}/{nextLevelThreshold} XP
                      </span>
                    </div>
                    <Progress value={xpProgress} className="h-3 bg-ocean-100" />
                    <div className="mt-1 text-right text-xs text-ocean-400">
                      {user.totalXP} XP total
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="border-ocean-200 bg-ocean-50">
                      <CardContent className="flex flex-col items-center gap-1 p-4">
                        <Trophy className="size-6 text-gold-600" />
                        <span className="text-2xl font-bold text-ocean-800">{user.totalXP}</span>
                        <span className="text-xs text-ocean-500">XP Total</span>
                      </CardContent>
                    </Card>

                    <Card className="border-ocean-200 bg-ocean-50">
                      <CardContent className="flex flex-col items-center gap-1 p-4">
                        <Flame className="size-6 text-orange-500" />
                        <span className="text-2xl font-bold text-ocean-800">{streakValue}</span>
                        <span className="text-xs text-ocean-500">Días seguidos</span>
                      </CardContent>
                    </Card>

                    <Card className="border-ocean-200 bg-ocean-50">
                      <CardContent className="flex flex-col items-center gap-1 p-4">
                        <Star className="size-6 text-gold-400" />
                        <span className="text-2xl font-bold text-ocean-800">
                          {user.currentLevel || 0}
                        </span>
                        <span className="text-xs text-ocean-500">Nivel actual</span>
                      </CardContent>
                    </Card>

                    <Card className="border-ocean-200 bg-ocean-50">
                      <CardContent className="flex flex-col items-center gap-1 p-4">
                        <Map className="size-6 text-ocean-500" />
                        <span className="text-2xl font-bold text-ocean-800">{user.treasureFragments || 0}/15</span>
                        <span className="text-xs text-ocean-500">Fragmentos</span>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Ranks Modal */}
              <RanksModal
                open={ranksModalOpen}
                onOpenChange={setRanksModalOpen}
                totalXP={user.totalXP}
                playerLevel={user.playerLevel}
              />
            </>
          )}
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
