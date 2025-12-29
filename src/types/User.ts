import { Timestamp } from 'firebase/firestore';

export interface User {
    uid: string;
    displayName: string;
    email: string;
    createdAt: Timestamp;
    currentWorld: number;        // 1-5
    currentLevel: number;
    totalXP: number;
    playerLevel: string;
    streak: {
        current: number;
        longest: number;
        lastPlayedDate: string;     // YYYY-MM-DD
        frozenDays: number;
    };
    badges: string[];
    settings: {
        soundEnabled: boolean;
        musicEnabled: boolean;
        hintsEnabled: boolean;
    };
    // Treasure Fragment System
    unlockedFragmentsMap: Record<string, true>;  // { "fragment-1-1": true, ... }
    treasureFragmentsCount: number;               // Must equal Object.keys(unlockedFragmentsMap).length
    mapCompleted: boolean;                        // True when treasureFragmentsCount === 15
}

