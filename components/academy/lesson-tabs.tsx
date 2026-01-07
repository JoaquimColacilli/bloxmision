"use client"

import { cn } from "@/lib/utils"
import { BookOpen, MonitorPlay, Puzzle, CheckCircle2 } from "lucide-react"

export type TabType = "story" | "demo" | "practice" | "summary"

interface LessonTabsProps {
    currentTab: TabType
    onTabChange: (tab: TabType) => void
    completedTabs: TabType[] // Which tabs are "done" (e.g. read story, finished demo)
    practiceCompleted: boolean // Specific check for Practice to gate Final Check
}

export function LessonTabs({
    currentTab,
    onTabChange,
    completedTabs,
    practiceCompleted
}: LessonTabsProps) {

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: "story", label: "Historia", icon: BookOpen },
        { id: "demo", label: "Demo", icon: MonitorPlay },
        { id: "practice", label: "Práctica", icon: Puzzle },
        { id: "summary", label: "Resumen", icon: CheckCircle2 },
    ]

    return (
        <nav className="flex w-full overflow-x-auto border-b border-ocean-200 bg-white p-1">
            <div className="mx-auto flex max-w-3xl w-full gap-1 p-1">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id
                    const isCompleted = completedTabs.includes(tab.id)
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "group flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                                isActive
                                    ? "bg-ocean-100 text-ocean-700 shadow-sm ring-1 ring-ocean-200"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                            )}
                        >
                            <Icon className={cn(
                                "size-4",
                                isActive ? "text-ocean-600" : isCompleted ? "text-green-500" : "text-gray-400"
                            )} />
                            <span className="hidden sm:inline">{tab.label}</span>

                            {/* Mobile indicator for completed */}
                            {isCompleted && !isActive && (
                                <span className="block h-1.5 w-1.5 rounded-full bg-green-500 sm:hidden" />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
