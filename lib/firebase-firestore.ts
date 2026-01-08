import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { getPlayerLevel, getXPToNextLevel, getCurrentLevelXP, getNextLevelThreshold } from "@/lib/game/xpCalculator"
import type { User } from "./types"

/**
 * User profile document structure in Firestore
 */
export interface UserProfile {
    uid: string  // Required by security rules
    displayName: string
    email: string
    totalXP: number
    currentXP: number
    nextLevelThreshold: number
    playerLevel: string
    currentWorld: number
    currentLevel: number
    streak: {
        current: number
        longest: number
        lastPlayedDate: string  // ISO date string for easier handling
        frozenDays: number
    }
    badges: string[]
    treasureFragments: number  // Deprecated, kept for backwards compatibility
    settings: {
        soundEnabled: boolean
        musicEnabled: boolean
        hintsEnabled: boolean
    }
    // Treasure Fragment System (new)
    unlockedFragmentsMap: Record<string, true>  // { "fragment-1-1": true, ... }
    treasureFragmentsCount: number               // Must equal Object.keys(unlockedFragmentsMap).length
    mapCompleted: boolean                        // True when treasureFragmentsCount === 15
    createdAt: Date
    updatedAt: Date
}

/**
 * Get a user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        return null
    }

    return docSnap.data() as UserProfile
}

/**
 * Create a new user profile in Firestore
 * Called client-side when user registers or logs in for first time
 */
export async function createUserProfile(
    uid: string,
    displayName: string,
    email: string
): Promise<UserProfile> {
    const now = new Date()

    // Profile structure that matches security rules validation
    const profile: UserProfile = {
        uid,  // Required by security rules
        displayName,
        email,
        totalXP: 0,  // Must be 0 for new users (rule validation)
        currentXP: 0,
        nextLevelThreshold: 100,
        playerLevel: "Grumete",  // Must be "Grumete" for new users
        currentWorld: 1,  // Must be 1 for new users
        currentLevel: 1,  // Must be 1 for new users
        streak: {
            current: 0,
            longest: 0,
            lastPlayedDate: "",
            frozenDays: 1,
        },
        badges: [],
        treasureFragments: 0,  // Deprecated
        settings: {
            soundEnabled: true,
            musicEnabled: true,
            hintsEnabled: true,
        },
        // Treasure Fragment System - initialized empty
        unlockedFragmentsMap: {},
        treasureFragmentsCount: 0,
        mapCompleted: false,
        createdAt: now,
        updatedAt: now,
    }

    const docRef = doc(db, "users", uid)
    await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })

    return profile
}



/**
 * Convert Firestore UserProfile to app's User type
 */
export function toAppUser(uid: string, profile: UserProfile): User {
    // Calculate derived XP stats to ensure consistency using the totalXP
    const totalXP = profile.totalXP || 0

    // Cast profile to any to access fields that might not be in UserProfile interface
    const profileAny = profile as any

    return {
        id: uid,
        displayName: profile.displayName,
        email: profile.email,
        totalXP: profile.totalXP,
        currentXP: getCurrentLevelXP(totalXP),    // Use calculated value
        nextLevelThreshold: getNextLevelThreshold(totalXP), // Threshold for next player level
        playerLevel: getPlayerLevel(totalXP),     // Use calculated value
        currentWorld: profile.currentWorld,
        currentLevel: profile.currentLevel,
        streak: {
            current: profile.streak?.current ?? 0,
            longest: profile.streak?.longest ?? 0,
        },
        badges: profile.badges,
        treasureFragments: profile.treasureFragmentsCount ?? profile.treasureFragments ?? 0,
        // Treasure Fragment System
        unlockedFragmentsMap: profile.unlockedFragmentsMap ?? {},
        treasureFragmentsCount: profile.treasureFragmentsCount ?? 0,
        mapCompleted: profile.mapCompleted ?? false,
        // JorCoins Economy System
        jorCoins: profileAny.jorCoins ?? 0,
        jorCoinsEarned: profileAny.jorCoinsEarned ?? 0,
        jorCoinsSpent: profileAny.jorCoinsSpent ?? 0,
        equippedItems: profileAny.equippedItems ?? { avatar: 'avatar-default' },
    }
}

/**
 * Update a user's profile data
 * Note: Security rules require uid to remain unchanged
 */
export async function updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
    const docRef = doc(db, "users", uid)
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    })
}
