"use client"

import type React from "react"

import Link from "next/link"
import { Lock, Check, Clock, ChevronRight } from "lucide-react"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/lib/types"

interface LessonCardProps {
  lesson: Lesson
  isUnlocked: boolean
  isCompleted: boolean
}

export function LessonCard({ lesson, isUnlocked, isCompleted }: LessonCardProps) {
  const IconComponent =
    (Icons as Record<string, React.ComponentType<{ className?: string }>>)[lesson.icon] || Icons.BookOpen

  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 opacity-60">
        <div className="flex size-12 items-center justify-center rounded-full bg-gray-200">
          <Lock className="size-6 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-500">{lesson.title}</h3>
          <p className="text-sm text-gray-400">{lesson.description}</p>
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/aprender/leccion/${lesson.id}`}
      className={cn(
        "flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:shadow-md",
        isCompleted
          ? "border-green-200 bg-green-50 hover:border-green-300"
          : "border-ocean-200 bg-white hover:border-ocean-400",
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          isCompleted ? "bg-green-500" : "bg-ocean-500",
        )}
      >
        {isCompleted ? <Check className="size-6 text-white" /> : <IconComponent className="size-6 text-white" />}
      </div>

      <div className="flex-1">
        <h3 className={cn("font-semibold", isCompleted ? "text-green-800" : "text-gray-800")}>{lesson.title}</h3>
        <p className="text-sm text-gray-600">{lesson.description}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="size-3" />
          <span>{lesson.duration}</span>
        </div>
      </div>

      <ChevronRight className={cn("size-5", isCompleted ? "text-green-500" : "text-gray-400")} />
    </Link>
  )
}
