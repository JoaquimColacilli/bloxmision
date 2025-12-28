"use client"

import type * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface AuthInputProps extends React.ComponentProps<"input"> {
  label: string
  error?: string
}

export function AuthInput({ label, error, id, className, onBlur, ...props }: AuthInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-")
  const errorId = `${inputId}-error`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="text-ocean-800">
        {label}
      </Label>
      <Input
        id={inputId}
        className={cn(
          "h-12 rounded-xl border-2 border-ocean-200 bg-sand-50 px-4 text-base transition-all",
          "placeholder:text-ocean-400",
          "focus-visible:border-ocean-500 focus-visible:ring-ocean-500/20",
          error && "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-400/20",
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onBlur={onBlur}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-500 flex items-center gap-1" role="alert" aria-live="polite">
          <span aria-hidden="true">⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}
