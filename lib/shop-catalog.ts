/**
 * Static Shop Catalog
 * 
 * Items are defined here in TypeScript instead of Firestore to:
 * 1. Avoid reads on every Bazar visit
 * 2. Enable easy updates without Firebase deploys
 * 3. Keep catalog versioned in git
 * 
 * Only dynamic data (discounts, limited availability) would need Firestore.
 */

import type { ShopItem, ShopCategory, ItemRarity } from './types'

// ============ AVATARS ============
const avatars: ShopItem[] = [
    {
        id: 'avatar-default',
        name: 'Jorc Clásico',
        description: 'Tu apariencia de grumete original',
        category: 'avatar',
        rarity: 'common',
        price: 0,
        thumbnailEmoji: '🏴‍☠️',
        isDefault: true,
    },
    {
        id: 'avatar-marinero',
        name: 'Jorc Marinero',
        description: 'Listo para surcar los mares',
        category: 'avatar',
        rarity: 'common',
        price: 100,
        thumbnailEmoji: '⚓',
    },
    {
        id: 'avatar-capitan',
        name: 'Jorc Capitán',
        description: 'El líder de la tripulación',
        category: 'avatar',
        rarity: 'common',
        price: 250,
        thumbnailEmoji: '🎖️',
    },
    {
        id: 'avatar-pirata-legendario',
        name: 'Jorc Pirata Legendario',
        description: 'Fama en los Siete Mares',
        category: 'avatar',
        rarity: 'rare',
        price: 500,
        thumbnailEmoji: '⭐',
    },
    {
        id: 'avatar-fantasma',
        name: 'Jorc Fantasma',
        description: 'Del otro lado del velo',
        category: 'avatar',
        rarity: 'rare',
        price: 800,
        thumbnailEmoji: '👻',
    },
    {
        id: 'avatar-dorado',
        name: 'Jorc Dorado',
        description: 'Bañado en oro puro',
        category: 'avatar',
        rarity: 'epic',
        price: 1500,
        thumbnailEmoji: '✨',
    },
]

// ============ PETS ============
const pets: ShopItem[] = [
    {
        id: 'pet-loro',
        name: 'Loro Verde',
        description: 'Un compañero parlanchín',
        category: 'pet',
        rarity: 'common',
        price: 150,
        thumbnailEmoji: '🦜',
    },
    {
        id: 'pet-mono',
        name: 'Mono Travieso',
        description: 'Le encanta robar monedas',
        category: 'pet',
        rarity: 'common',
        price: 200,
        thumbnailEmoji: '🐒',
    },
    {
        id: 'pet-cangrejo',
        name: 'Cangrejo Ermitaño',
        description: 'Pequeño pero valiente',
        category: 'pet',
        rarity: 'common',
        price: 180,
        thumbnailEmoji: '🦀',
    },
    {
        id: 'pet-pulpo',
        name: 'Pulpo Mágico',
        description: 'Ocho brazos de ayuda',
        category: 'pet',
        rarity: 'rare',
        price: 600,
        thumbnailEmoji: '🐙',
    },
    {
        id: 'pet-dragon',
        name: 'Dragón Marino',
        description: 'El guardián de los océanos',
        category: 'pet',
        rarity: 'epic',
        price: 1200,
        thumbnailEmoji: '🐉',
    },
]

// ============ ACCESSORIES ============
const accessories: ShopItem[] = [
    {
        id: 'acc-sombrero-pirata',
        name: 'Sombrero Pirata',
        description: 'El clásico sombrero de tres picos',
        category: 'accessory',
        rarity: 'common',
        price: 80,
        thumbnailEmoji: '🎩',
    },
    {
        id: 'acc-parche',
        name: 'Parche en el Ojo',
        description: 'Misterioso y cool',
        category: 'accessory',
        rarity: 'common',
        price: 60,
        thumbnailEmoji: '🏴‍☠️',
    },
    {
        id: 'acc-bandana',
        name: 'Bandana Roja',
        description: 'El viento no te molestará',
        category: 'accessory',
        rarity: 'common',
        price: 70,
        thumbnailEmoji: '🎀',
    },
    {
        id: 'acc-tricornio',
        name: 'Tricornio del Capitán',
        description: 'Solo para los que mandan',
        category: 'accessory',
        rarity: 'rare',
        price: 300,
        thumbnailEmoji: '👑',
    },
    {
        id: 'acc-corona',
        name: 'Corona Dorada',
        description: 'Digno de la realeza pirata',
        category: 'accessory',
        rarity: 'epic',
        price: 1000,
        thumbnailEmoji: '👑',
    },
]

// ============ WEAPONS ============
const weapons: ShopItem[] = [
    {
        id: 'weapon-espada-madera',
        name: 'Espada de Madera',
        description: 'Para practicar esgrima',
        category: 'weapon',
        rarity: 'common',
        price: 100,
        thumbnailEmoji: '🗡️',
    },
    {
        id: 'weapon-sable',
        name: 'Sable Pirata',
        description: 'Afilado y letal',
        category: 'weapon',
        rarity: 'common',
        price: 200,
        thumbnailEmoji: '⚔️',
    },
    {
        id: 'weapon-catalejo',
        name: 'Catalejo',
        description: 'Para ver el horizonte',
        category: 'weapon',
        rarity: 'common',
        price: 150,
        thumbnailEmoji: '🔭',
    },
    {
        id: 'weapon-legendaria',
        name: 'Espada Legendaria',
        description: 'Forjada en los volcanes submarinos',
        category: 'weapon',
        rarity: 'rare',
        price: 800,
        thumbnailEmoji: '🔥',
    },
]

// ============ EFFECTS ============
const effects: ShopItem[] = [
    {
        id: 'effect-burbujas',
        name: 'Estela de Burbujas',
        description: 'Deja un rastro de burbujas',
        category: 'effect',
        rarity: 'common',
        price: 120,
        thumbnailEmoji: '🫧',
    },
    {
        id: 'effect-chispas',
        name: 'Chispas Doradas',
        description: 'Brillás mientras te movés',
        category: 'effect',
        rarity: 'rare',
        price: 250,
        thumbnailEmoji: '✨',
    },
    {
        id: 'effect-estrellas',
        name: 'Rastro de Estrellas',
        description: 'Como una estrella fugaz',
        category: 'effect',
        rarity: 'rare',
        price: 400,
        thumbnailEmoji: '⭐',
    },
]

// ============ FULL CATALOG ============

export const SHOP_CATALOG: ShopItem[] = [
    ...avatars,
    ...pets,
    ...accessories,
    ...weapons,
    ...effects,
]

// Get items by category
export function getItemsByCategory(category: ShopCategory): ShopItem[] {
    return SHOP_CATALOG.filter(item => item.category === category)
}

// Get single item by ID
export function getItemById(itemId: string): ShopItem | undefined {
    return SHOP_CATALOG.find(item => item.id === itemId)
}

// Get default items (free ones)
export function getDefaultItems(): ShopItem[] {
    return SHOP_CATALOG.filter(item => item.isDefault)
}

// Categories metadata for UI
export const SHOP_CATEGORIES: { id: ShopCategory; name: string; icon: string }[] = [
    { id: 'avatar', name: 'Avatares', icon: '👤' },
    { id: 'pet', name: 'Mascotas', icon: '🦜' },
    { id: 'accessory', name: 'Accesorios', icon: '🎩' },
    { id: 'weapon', name: 'Armas', icon: '⚔️' },
    { id: 'effect', name: 'Efectos', icon: '✨' },
]

// Rarity colors for UI
export const RARITY_COLORS: Record<ItemRarity, { bg: string; border: string; text: string }> = {
    common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
    rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
    epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
    legendary: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
}
