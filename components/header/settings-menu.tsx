"use client"

import { useState } from "react"
import { Settings, Volume2, Music, Lightbulb, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Settings as SettingsType } from "@/lib/types"

interface SettingsMenuProps {
  settings: SettingsType
  onToggleSetting: (setting: keyof SettingsType, value: boolean) => void
  onLogout: () => void
}

function SettingsContent({
  settings,
  onToggleSetting,
  onLogout,
  onClose,
}: SettingsMenuProps & { onClose?: () => void }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    if (showLogoutConfirm) {
      onLogout()
      onClose?.()
    } else {
      setShowLogoutConfirm(true)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Volume2 className="size-5 text-ocean-600" />
          <span className="text-sm font-medium text-ocean-800">Sonidos</span>
        </div>
        <Switch
          checked={settings.sound}
          onCheckedChange={(checked) => onToggleSetting("sound", checked)}
          aria-label="Activar o desactivar sonidos"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Music className="size-5 text-ocean-600" />
          <span className="text-sm font-medium text-ocean-800">Musica</span>
        </div>
        <Switch
          checked={settings.music}
          onCheckedChange={(checked) => onToggleSetting("music", checked)}
          aria-label="Activar o desactivar musica"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="size-5 text-ocean-600" />
          <span className="text-sm font-medium text-ocean-800">Pistas</span>
        </div>
        <Switch
          checked={settings.hints}
          onCheckedChange={(checked) => onToggleSetting("hints", checked)}
          aria-label="Activar o desactivar pistas"
        />
      </div>

      <div className="mt-4 border-t border-ocean-200 pt-4">
        {showLogoutConfirm ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm text-ocean-600">Seguro que quieres salir?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent"
                onClick={() => setShowLogoutConfirm(false)}
              >
                No, quedarme
              </Button>
              <Button variant="destructive" size="sm" className="flex-1" onClick={handleLogout}>
                Si, salir
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Cerrar sesion
          </Button>
        )}
      </div>
    </div>
  )
}

export function SettingsMenu({ settings, onToggleSetting, onLogout }: SettingsMenuProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const triggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="size-9 text-ocean-600 hover:bg-ocean-100 hover:text-ocean-800"
      aria-label="Abrir configuracion"
    >
      <Settings className="size-5" />
    </Button>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
        <DrawerContent className="bg-sand-50">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-ocean-800">Configuracion</DrawerTitle>
            <DrawerDescription className="text-ocean-600">Ajusta tu experiencia pirata</DrawerDescription>
          </DrawerHeader>
          <SettingsContent
            settings={settings}
            onToggleSetting={onToggleSetting}
            onLogout={onLogout}
            onClose={() => setOpen(false)}
          />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full bg-transparent">
                Cerrar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-sand-50">
        <DropdownMenuLabel className="text-ocean-800">Configuracion</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SettingsContent
          settings={settings}
          onToggleSetting={onToggleSetting}
          onLogout={onLogout}
          onClose={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
