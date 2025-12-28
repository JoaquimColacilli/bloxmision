"use client"

import { MenuLayout } from "@/components/layouts/menu-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Star, Map } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/auth-guard"

export default function ProfilePage() {
  const { user } = useAuth()

  const xpProgress = user ? (user.currentXP / user.xpToNextLevel) * 100 : 0

  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-8">
          {user && (
            <Card className="mx-auto max-w-md border-2 border-ocean-300 bg-white">
              <CardHeader className="items-center text-center">
                <Avatar className="size-24 border-4 border-ocean-300">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                  <AvatarFallback className="bg-ocean-500 text-2xl font-bold text-white">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 text-2xl text-ocean-800">{user.displayName}</CardTitle>
                <p className="text-ocean-600">{user.playerLevel}</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {/* XP Progress */}
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-ocean-600">Experiencia</span>
                    <span className="font-medium text-ocean-800">
                      {user.currentXP}/{user.xpToNextLevel} XP
                    </span>
                  </div>
                  <Progress value={xpProgress} className="h-3 bg-ocean-100" />
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
                      <span className="text-2xl font-bold text-ocean-800">{user.streak?.current || 0}</span>
                      <span className="text-xs text-ocean-500">Dias seguidos</span>
                    </CardContent>
                  </Card>

                  <Card className="border-ocean-200 bg-ocean-50">
                    <CardContent className="flex flex-col items-center gap-1 p-4">
                      <Star className="size-6 text-gold-400" />
                      <span className="text-2xl font-bold text-ocean-800">
                        {user.currentWorld?.completedLevels || 0}
                      </span>
                      <span className="text-xs text-ocean-500">Niveles</span>
                    </CardContent>
                  </Card>

                  <Card className="border-ocean-200 bg-ocean-50">
                    <CardContent className="flex flex-col items-center gap-1 p-4">
                      <Map className="size-6 text-ocean-500" />
                      <span className="text-2xl font-bold text-ocean-800">{user.treasureFragments || 0}/8</span>
                      <span className="text-xs text-ocean-500">Fragmentos</span>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
