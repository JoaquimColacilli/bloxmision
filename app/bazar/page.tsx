"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SHOP_CATALOG, SHOP_CATEGORIES, RARITY_COLORS, getItemsByCategory, JORCOIN_SPRITE } from "@/lib/shop-catalog"
import { purchaseItem, getUserInventory, equipItem } from "@/src/lib/services/shopService"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Check, ShoppingBag, Sparkles, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { ShopItem, ShopCategory, ItemRarity } from "@/lib/types"

export default function BazarPage() {
    const { user, refreshUser } = useAuth()
    const router = useRouter()
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | "all">("all")
    const [inventory, setInventory] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [purchaseModal, setPurchaseModal] = useState<{ open: boolean; item: ShopItem | null }>({
        open: false,
        item: null,
    })
    const [purchasing, setPurchasing] = useState(false)
    const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; message: string } | null>(null)

    // New filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedRarity, setSelectedRarity] = useState<ItemRarity | "all">("all")
    const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name">("default")
    const [showOwned, setShowOwned] = useState<"all" | "owned" | "not-owned">("all")

    // Load user inventory on mount
    useEffect(() => {
        if (user?.id) {
            getUserInventory(user.id).then((items) => {
                setInventory(items)
                setLoading(false)
            })
        }
    }, [user?.id])

    // Get filtered and sorted items using useMemo
    const filteredItems = useMemo(() => {
        let items = selectedCategory === "all" ? SHOP_CATALOG : getItemsByCategory(selectedCategory)

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            )
        }

        // Filter by rarity
        if (selectedRarity !== "all") {
            items = items.filter(item => item.rarity === selectedRarity)
        }

        // Filter by ownership
        if (showOwned !== "all") {
            items = items.filter(item => {
                const owned = inventory.includes(item.id) || item.isDefault
                return showOwned === "owned" ? owned : !owned
            })
        }

        // Sort items
        switch (sortBy) {
            case "price-asc":
                items = [...items].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
                break
            case "price-desc":
                items = [...items].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
                break
            case "name":
                items = [...items].sort((a, b) => a.name.localeCompare(b.name))
                break
            default:
                // Keep original order
                break
        }

        return items
    }, [selectedCategory, searchQuery, selectedRarity, sortBy, showOwned, inventory])

    const handlePurchaseClick = (item: ShopItem) => {
        setPurchaseResult(null)
        setPurchaseModal({ open: true, item })
    }

    const handleConfirmPurchase = async () => {
        if (!user?.id || !purchaseModal.item) return

        setPurchasing(true)
        const result = await purchaseItem(user.id, purchaseModal.item.id)
        setPurchasing(false)

        if (result.success) {
            setPurchaseResult({ success: true, message: `¡${purchaseModal.item.name} es tuyo!` })
            setInventory((prev) => [...prev, purchaseModal.item!.id])
            await refreshUser()
            // Close after a short delay
            setTimeout(() => {
                setPurchaseModal({ open: false, item: null })
                setPurchaseResult(null)
            }, 2000)
        } else {
            setPurchaseResult({ success: false, message: result.message || "Error al comprar" })
        }
    }

    const handleEquip = async (item: ShopItem) => {
        if (!user?.id) return
        await equipItem(user.id, item.id, item.category)
        await refreshUser()
    }

    const userBalance = user?.jorCoins || 0

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-ocean-50">
                <Card className="p-8 text-center">
                    <p className="text-ocean-600">Iniciá sesión para ver el Bazar</p>
                    <Link href="/auth" className="mt-4 inline-block">
                        <Button>Iniciar sesión</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-sand-100">
            {/* Header */}
            <div className="border-b border-ocean-200 bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Title & Back */}
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="size-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-ocean-900">⚓ El Bazar de Jorc</h1>
                                <p className="text-ocean-600">¡Intercambiá tus JorCoins por equipo pirata!</p>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-lg">
                            <CardContent className="flex items-center gap-4 p-4">
                                <Image
                                    src={JORCOIN_SPRITE}
                                    alt="JorCoin"
                                    width={56}
                                    height={56}
                                    className="shrink-0"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                                <div>
                                    <p className="text-sm font-medium text-yellow-700">Tu tesoro</p>
                                    <p className="text-3xl font-bold text-yellow-900">{userBalance.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ShopCategory | "all")}>
                    {/* Category Tabs */}
                    <TabsList className="mb-6 flex-wrap">
                        <TabsTrigger value="all" className="gap-2">
                            <ShoppingBag className="size-4" />
                            Todo
                        </TabsTrigger>
                        {SHOP_CATEGORIES.map((cat) => (
                            <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                                <span>{cat.icon}</span>
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Filters Bar */}
                    <div className="mb-8 rounded-xl bg-white/60 backdrop-blur-sm border border-ocean-200 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ocean-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-white border-ocean-200 focus:border-ocean-400"
                                />
                            </div>

                            {/* Filter Controls */}
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Rarity Filter */}
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="size-4 text-ocean-500" />
                                    <Select value={selectedRarity} onValueChange={(v) => setSelectedRarity(v as ItemRarity | "all")}>
                                        <SelectTrigger className="w-[130px] bg-white border-ocean-200">
                                            <SelectValue placeholder="Rareza" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            <SelectItem value="common">
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-gray-400" />
                                                    Común
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="rare">
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-blue-500" />
                                                    Raro
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="epic">
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-purple-500" />
                                                    Épico
                                                </span>
                                            </SelectItem>
                                            <SelectItem value="legendary">
                                                <span className="flex items-center gap-2">
                                                    <span className="size-2 rounded-full bg-yellow-500" />
                                                    Legendario
                                                </span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort By */}
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="size-4 text-ocean-500" />
                                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                                        <SelectTrigger className="w-[150px] bg-white border-ocean-200">
                                            <SelectValue placeholder="Ordenar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Por defecto</SelectItem>
                                            <SelectItem value="price-asc">Precio: menor</SelectItem>
                                            <SelectItem value="price-desc">Precio: mayor</SelectItem>
                                            <SelectItem value="name">Nombre A-Z</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Ownership Filter */}
                                <Select value={showOwned} onValueChange={(v) => setShowOwned(v as typeof showOwned)}>
                                    <SelectTrigger className="w-[130px] bg-white border-ocean-200">
                                        <SelectValue placeholder="Propiedad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="owned">Mis items</SelectItem>
                                        <SelectItem value="not-owned">Sin comprar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-3 pt-3 border-t border-ocean-100 text-sm text-ocean-600">
                            Mostrando <strong>{filteredItems.length}</strong> items
                            {searchQuery && ` para "${searchQuery}"`}
                            {selectedRarity !== "all" && ` de rareza ${selectedRarity}`}
                        </div>
                    </div>

                    {/* Items Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-ocean-800 mb-2">No se encontraron items</h3>
                            <p className="text-ocean-600">Probá con otros filtros o buscá algo diferente</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => {
                                    setSearchQuery("")
                                    setSelectedRarity("all")
                                    setSortBy("default")
                                    setShowOwned("all")
                                }}
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredItems.map((item) => {
                                const owned = inventory.includes(item.id) || item.isDefault
                                const canAfford = userBalance >= (item.discountPrice || item.price)
                                const equipped = user?.equippedItems?.[item.category === "accessory" ? "hat" : item.category] === item.id;

                                return (
                                    <Card
                                        key={item.id}
                                        className={`overflow-hidden transition-all hover:shadow-lg ${owned ? "ring-2 ring-green-400" : ""
                                            }`}
                                    >
                                        {/* Item Preview */}
                                        <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-ocean-100 to-ocean-200">
                                            {item.thumbnailUrl ? (
                                                <Image
                                                    src={item.thumbnailUrl}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="object-contain pixelated"
                                                    style={{ imageRendering: 'pixelated' }}
                                                />
                                            ) : (
                                                <span className="text-7xl">{item.thumbnailEmoji}</span>
                                            )}

                                            {/* Rarity Badge */}
                                            <Badge
                                                className={`absolute right-2 top-2 ${RARITY_COLORS[item.rarity].bg} ${RARITY_COLORS[item.rarity].border} ${RARITY_COLORS[item.rarity].text} border`}
                                            >
                                                {item.rarity === "common" && "Común"}
                                                {item.rarity === "rare" && "Raro"}
                                                {item.rarity === "epic" && "Épico"}
                                                {item.rarity === "legendary" && "Legendario"}
                                            </Badge>

                                            {/* Owned Badge */}
                                            {owned && (
                                                <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs font-bold text-white">
                                                    <Check className="size-3" />
                                                    Tuyo
                                                </div>
                                            )}

                                            {/* Equipped indicator */}
                                            {equipped && (
                                                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-purple-500 px-2 py-1 text-xs font-bold text-white">
                                                    <Sparkles className="size-3" />
                                                    Equipado
                                                </div>
                                            )}
                                        </div>

                                        {/* Item Info */}
                                        <CardContent className="p-4">
                                            <h3 className="mb-1 text-lg font-bold text-ocean-900">{item.name}</h3>
                                            <p className="mb-4 text-sm text-ocean-600">{item.description}</p>

                                            <div className="flex items-center justify-between">
                                                {/* Price */}
                                                {item.isDefault ? (
                                                    <span className="text-sm font-medium text-green-600">Gratis</span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={JORCOIN_SPRITE}
                                                            alt="JorCoin"
                                                            width={24}
                                                            height={24}
                                                            style={{ imageRendering: 'pixelated' }}
                                                        />
                                                        <span className="font-bold text-yellow-700">
                                                            {item.discountPrice || item.price}
                                                        </span>
                                                        {item.discountPrice && (
                                                            <span className="text-sm text-gray-400 line-through">{item.price}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Button */}
                                                {owned ? (
                                                    equipped ? (
                                                        <Button variant="outline" size="sm" disabled>
                                                            Equipado
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEquip(item)}
                                                        >
                                                            Equipar
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        disabled={!canAfford}
                                                        onClick={() => handlePurchaseClick(item)}
                                                        className={canAfford ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900" : ""}
                                                    >
                                                        {canAfford ? "Comprar" : "Sin fondos"}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </Tabs>
            </div>

            {/* Purchase Confirmation Modal */}
            <Dialog open={purchaseModal.open} onOpenChange={(open) => setPurchaseModal({ open, item: purchaseModal.item })}>
                <DialogContent className="sm:max-w-md">
                    {purchaseResult ? (
                        // Result state
                        <div className="py-8 text-center">
                            {purchaseResult.success ? (
                                <>
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                                        <Check className="size-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-700">{purchaseResult.message}</h3>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100">
                                        <span className="text-2xl">😢</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-red-700">{purchaseResult.message}</h3>
                                </>
                            )}
                        </div>
                    ) : purchaseModal.item ? (
                        // Confirmation state
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-center">¿Comprar {purchaseModal.item.name}?</DialogTitle>
                                <DialogDescription className="text-center">
                                    Esta compra no se puede deshacer.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col items-center gap-4 py-6">
                                {purchaseModal.item.thumbnailUrl ? (
                                    <Image
                                        src={purchaseModal.item.thumbnailUrl}
                                        alt={purchaseModal.item.name}
                                        width={96}
                                        height={96}
                                        className="object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                ) : (
                                    <span className="text-7xl">{purchaseModal.item.thumbnailEmoji}</span>
                                )}
                                <div className="flex items-center gap-2 text-xl font-bold">
                                    <Image
                                        src={JORCOIN_SPRITE}
                                        alt="JorCoin"
                                        width={32}
                                        height={32}
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                    <span className="text-yellow-700">
                                        {purchaseModal.item.discountPrice || purchaseModal.item.price} JorCoins
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Te quedarán{" "}
                                    <strong>
                                        {userBalance - (purchaseModal.item.discountPrice || purchaseModal.item.price)}
                                    </strong>{" "}
                                    JorCoins
                                </p>
                            </div>

                            <DialogFooter className="flex-col gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => setPurchaseModal({ open: false, item: null })}
                                    disabled={purchasing}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleConfirmPurchase}
                                    disabled={purchasing}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
                                >
                                    {purchasing ? "Comprando..." : "¡Sí, comprar!"}
                                </Button>
                            </DialogFooter>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
