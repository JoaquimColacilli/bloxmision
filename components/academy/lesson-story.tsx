"use client"

import { JorcSprite } from "@/components/jorc/jorc-sprite"
import type { LessonSectionData } from "@/lib/types"

interface LessonStoryProps {
  data: LessonSectionData
}

export function LessonStory({ data }: LessonStoryProps) {
  const paragraphs = data.dialogue?.split("\n\n") || []

  return (
    <div className="flex flex-col items-center gap-6">
      <JorcSprite expression="happy" size="large" />

      <div className="relative max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        {/* Speech bubble arrow */}
        <div className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 rotate-45 bg-white" />

        <div className="relative space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line text-base leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
