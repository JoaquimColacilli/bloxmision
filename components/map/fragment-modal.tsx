"use client"

import { useEffect, useRef } from "react"
import { X, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { TreasureFragment } from "@/lib/types"

interface FragmentModalProps {
  fragment: TreasureFragment | null
  open: boolean
  onClose: () => void
}

export function FragmentModal({ fragment, open, onClose }: FragmentModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus close button on open
  useEffect(() => {
    if (open) {
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    }
  }, [open])

  if (!fragment) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md border-2 border-gold-300 bg-sand-50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-ocean-800">
            <MapPin className="size-5 text-gold-600" />
            Fragmento #{fragment.order}
          </DialogTitle>
          {fragment.unlockedByLevel && (
            <DialogDescription className="text-ocean-500">
              Desbloqueado en el nivel {fragment.unlockedByLevel}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Large fragment image */}
          <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-xl border-4 border-gold-400 shadow-lg">
            <img
              src={
                fragment.imageUrl ||
                `/placeholder.svg?height=300&width=300&query=detailed treasure map piece ${fragment.order} ancient pirate`
              }
              alt={`Fragmento ${fragment.order} del mapa del tesoro`}
              className="size-full object-cover"
            />
            {/* Decorative corners */}
            <div className="absolute left-0 top-0 size-4 border-l-4 border-t-4 border-gold-600" />
            <div className="absolute right-0 top-0 size-4 border-r-4 border-t-4 border-gold-600" />
            <div className="absolute bottom-0 left-0 size-4 border-b-4 border-l-4 border-gold-600" />
            <div className="absolute bottom-0 right-0 size-4 border-b-4 border-r-4 border-gold-600" />
          </div>

          {/* Revealed text */}
          {fragment.revealedText && (
            <div className="rounded-lg bg-ocean-100/50 p-4">
              <p className="text-center font-serif text-sm italic text-ocean-700">"{fragment.revealedText}"</p>
            </div>
          )}

          {/* Close button */}
          <Button
            ref={closeButtonRef}
            onClick={onClose}
            className="mx-auto w-fit bg-ocean-600 text-white hover:bg-ocean-700"
          >
            <X className="mr-2 size-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
