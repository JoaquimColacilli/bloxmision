/**
 * Shop Service
 * 
 * Handles JorCoins economy with:
 * - Idempotent transactions (using deterministic IDs)
 * - Subcollections for inventory & transactions (not arrays)
 * - Atomic updates for purchases
 */

import {
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    runTransaction,
    serverTimestamp,
    increment,
    Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { getItemById } from '@/lib/shop-catalog'
import type { InventoryItem, ShopTransaction, EquippedItems, ShopCategory } from '@/lib/types'

// ============ TYPES ============

export interface PurchaseResult {
    success: boolean
    message?: string
    newBalance?: number
}

export interface AwardResult {
    success: boolean
    awarded: boolean // false if already awarded (idempotent)
    newBalance?: number
}

// ============ PURCHASE ITEM ============

/**
 * Purchase an item from the shop.
 * 
 * Uses deterministic document IDs for idempotency:
 * - /users/{uid}/inventory/{itemId}
 * - /users/{uid}/transactions/purchase-{itemId}
 */
export async function purchaseItem(
    userId: string,
    itemId: string
): Promise<PurchaseResult> {
    const item = getItemById(itemId)

    if (!item) {
        return { success: false, message: 'Item no encontrado' }
    }

    if (item.isDefault) {
        return { success: false, message: 'Este item es gratuito por defecto' }
    }

    const userRef = doc(db, 'users', userId)
    const inventoryRef = doc(db, 'users', userId, 'inventory', itemId)
    const transactionRef = doc(db, 'users', userId, 'transactions', `purchase-${itemId}`)

    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Check if already owns this item (idempotency)
            const inventorySnap = await transaction.get(inventoryRef)
            if (inventorySnap.exists()) {
                return { success: false, message: 'Ya tenés este item', alreadyOwned: true }
            }

            // 2. Get user's current balance
            const userSnap = await transaction.get(userRef)
            if (!userSnap.exists()) {
                return { success: false, message: 'Usuario no encontrado' }
            }

            const userData = userSnap.data()
            const currentBalance = userData.jorCoins || 0
            const price = item.discountPrice || item.price

            // 3. Check sufficient funds
            if (currentBalance < price) {
                return {
                    success: false,
                    message: `Necesitás ${price - currentBalance} JorCoins más`
                }
            }

            // 4. Deduct coins from user
            const newBalance = currentBalance - price
            transaction.update(userRef, {
                jorCoins: newBalance,
                jorCoinsSpent: increment(price),
                updatedAt: serverTimestamp(),
            })

            // 5. Add to inventory subcollection
            transaction.set(inventoryRef, {
                itemId,
                purchasedAt: serverTimestamp(),
                pricePaid: price,
            })

            // 6. Record transaction
            transaction.set(transactionRef, {
                itemId,
                itemName: item.name,
                price,
                type: 'purchase',
                createdAt: serverTimestamp(),
            })

            return { success: true, newBalance }
        })

        if (!result.success && result.alreadyOwned) {
            // Return success for idempotency (they already have it)
            return { success: true, message: 'Ya tenés este item' }
        }

        return result

    } catch (error: any) {
        console.error('Error purchasing item:', error)
        return {
            success: false,
            message: error.message || 'Error al comprar item'
        }
    }
}

// ============ AWARD JORCOINS ============

/**
 * Award JorCoins to a user with idempotency.
 * 
 * Uses rewardId to prevent duplicate awards:
 * - /users/{uid}/transactions/reward-{rewardId}
 * 
 * @param userId User to award
 * @param amount Amount of JorCoins
 * @param rewardId Unique ID for this reward (e.g., "level-1-4", "streak-7")
 * @param reason Human-readable reason for logs
 */
export async function awardJorCoins(
    userId: string,
    amount: number,
    rewardId: string,
    reason: string
): Promise<AwardResult> {
    const userRef = doc(db, 'users', userId)
    const transactionRef = doc(db, 'users', userId, 'transactions', `reward-${rewardId}`)

    try {
        const result = await runTransaction(db, async (transaction) => {
            // 1. Check if already awarded (idempotency)
            const txSnap = await transaction.get(transactionRef)
            if (txSnap.exists()) {
                // Already awarded, return success but don't add again
                const userData = (await transaction.get(userRef)).data()
                return {
                    success: true,
                    awarded: false,
                    newBalance: userData?.jorCoins || 0
                }
            }

            // 2. Get current balance
            const userSnap = await transaction.get(userRef)
            if (!userSnap.exists()) {
                return { success: false, awarded: false, message: 'Usuario no encontrado' }
            }

            const userData = userSnap.data()
            const currentBalance = userData.jorCoins || 0
            const newBalance = currentBalance + amount

            // 3. Update user balance
            transaction.update(userRef, {
                jorCoins: newBalance,
                jorCoinsEarned: increment(amount),
                updatedAt: serverTimestamp(),
            })

            // 4. Record transaction
            transaction.set(transactionRef, {
                itemId: null,
                itemName: reason,
                price: amount,
                type: 'reward',
                rewardReason: rewardId,
                createdAt: serverTimestamp(),
            })

            return { success: true, awarded: true, newBalance }
        })

        if (result.awarded) {
            console.log(`[JorCoins] Awarded ${amount} to ${userId} for: ${reason}`)
        }

        return result

    } catch (error: any) {
        console.error('Error awarding JorCoins:', error)
        return {
            success: false,
            awarded: false,
        }
    }
}

// ============ GET USER INVENTORY ============

/**
 * Get all items owned by a user.
 * Reads from /users/{uid}/inventory subcollection.
 */
export async function getUserInventory(userId: string): Promise<string[]> {
    try {
        const inventoryRef = collection(db, 'users', userId, 'inventory')
        const snapshot = await getDocs(inventoryRef)

        return snapshot.docs.map(doc => doc.id)
    } catch (error) {
        console.error('Error getting inventory:', error)
        return []
    }
}

// ============ EQUIP ITEM ============

/**
 * Equip an item (change current appearance).
 * Only updates the equippedItems map on user doc.
 */
export async function equipItem(
    userId: string,
    itemId: string,
    category: ShopCategory
): Promise<{ success: boolean }> {
    const item = getItemById(itemId)

    if (!item) {
        return { success: false }
    }

    // Map category to equipped slot
    const slotMap: Record<ShopCategory, keyof EquippedItems> = {
        avatar: 'avatar',
        pet: 'pet',
        accessory: 'hat',
        weapon: 'weapon',
        effect: 'effect',
    }

    const slot = slotMap[category]

    try {
        const userRef = doc(db, 'users', userId)
        await setDoc(userRef, {
            equippedItems: { [slot]: itemId },
            updatedAt: serverTimestamp(),
        }, { merge: true })

        return { success: true }
    } catch (error) {
        console.error('Error equipping item:', error)
        return { success: false }
    }
}

// ============ UNEQUIP ITEM ============

/**
 * Unequip an item from a slot.
 */
export async function unequipItem(
    userId: string,
    category: ShopCategory
): Promise<{ success: boolean }> {
    const slotMap: Record<ShopCategory, keyof EquippedItems> = {
        avatar: 'avatar',
        pet: 'pet',
        accessory: 'hat',
        weapon: 'weapon',
        effect: 'effect',
    }

    const slot = slotMap[category]

    try {
        const userRef = doc(db, 'users', userId)
        await setDoc(userRef, {
            equippedItems: { [slot]: null },
            updatedAt: serverTimestamp(),
        }, { merge: true })

        return { success: true }
    } catch (error) {
        console.error('Error unequipping item:', error)
        return { success: false }
    }
}

// ============ INITIALIZE USER ECONOMY ============

/**
 * Initialize JorCoins fields for a new user.
 * Call this when user first signs up.
 */
export async function initializeUserEconomy(userId: string): Promise<void> {
    const userRef = doc(db, 'users', userId)

    try {
        await setDoc(userRef, {
            jorCoins: 0,
            jorCoinsEarned: 0,
            jorCoinsSpent: 0,
            equippedItems: {
                avatar: 'avatar-default',
            },
        }, { merge: true })

        // Add default avatar to inventory
        const inventoryRef = doc(db, 'users', userId, 'inventory', 'avatar-default')
        await setDoc(inventoryRef, {
            itemId: 'avatar-default',
            purchasedAt: serverTimestamp(),
            pricePaid: 0,
        })

    } catch (error) {
        console.error('Error initializing user economy:', error)
    }
}
