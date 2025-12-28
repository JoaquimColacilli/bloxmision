"use client"

import { MenuLayout } from "@/components/layouts/menu-layout"
import { TreasureMap } from "@/components/map/treasure-map"
import { ProtectedRoute } from "@/components/auth/auth-guard"
import { mockFragments } from "@/lib/mock-fragments"

export default function MapPage() {
  return (
    <ProtectedRoute>
      <MenuLayout>
        <div className="container mx-auto px-4 py-8">
          <TreasureMap fragments={mockFragments} onFragmentClick={(id) => console.log("Fragment clicked:", id)} />
        </div>
      </MenuLayout>
    </ProtectedRoute>
  )
}
