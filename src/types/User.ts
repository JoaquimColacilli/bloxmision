import { Timestamp } from 'firebase/firestore';

export interface User {
    uid: string;
    displayName: string;
    email: string;
    createdAt: Timestamp;
    currentWorld: number;        // 1-5
    currentLevel: number;
    totalXP: number;
    playerLevel: 'Grumete' | 'Marinero' | 'Navegante' | 'Capitán Junior' | 'Capitán Experto';
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
}
