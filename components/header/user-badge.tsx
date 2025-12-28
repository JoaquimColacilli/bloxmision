"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface UserBadgeProps {
  displayName: string
  avatar?: string
  variant?: "full" | "compact" | "minimal"
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function UserBadge({ displayName, avatar, variant = "full", className }: UserBadgeProps) {
  const initials = getInitials(displayName)

  const avatarElement = (
    <Avatar className={cn("border-2 border-ocean-300", variant === "full" ? "size-10" : "size-8", className)}>
      <AvatarImage
        src={avatar || `/placeholder.svg?height=40&width=40&query=pirate avatar ${displayName}`}
        alt={displayName}
      />
      <AvatarFallback className="bg-ocean-500 text-sm font-bold text-white">{initials}</AvatarFallback>
    </Avatar>
  )

  if (variant === "minimal" || variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatarElement}</TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{displayName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {avatarElement}
      <span className="hidden font-medium text-ocean-800 lg:block">{displayName}</span>
    </div>
  )
}
