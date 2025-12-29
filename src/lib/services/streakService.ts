import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface StreakData {
    current: number;
    longest: number;
    lastPlayedDate: string;
    frozenDays: number;
}

/**
 * Actualiza la racha del usuario
 */
export async function updateUserStreak(userId: string): Promise<StreakData> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentStreak = userData.streak as StreakData;

    const today = getCurrentDateUTC();
    const lastPlayed = currentStreak.lastPlayedDate;

    // Si es el mismo día, no hacer nada
    if (lastPlayed === today) {
        return currentStreak;
    }

    const daysDiff = getDaysDifference(lastPlayed, today);

    let newStreak: StreakData;

    if (daysDiff === 1) {
        // Día consecutivo
        newStreak = {
            current: currentStreak.current + 1,
            longest: Math.max(currentStreak.longest, currentStreak.current + 1),
            lastPlayedDate: today,
            frozenDays: 1
        };
    } else if (daysDiff === 2 && currentStreak.frozenDays > 0) {
        // Usó día de gracia
        newStreak = {
            current: currentStreak.current + 1,
            longest: Math.max(currentStreak.longest, currentStreak.current + 1),
            lastPlayedDate: today,
            frozenDays: 0
        };
    } else {
        // Racha rota
        newStreak = {
            current: 1,
            longest: currentStreak.longest,
            lastPlayedDate: today,
            frozenDays: 1
        };
    }

    await updateDoc(userRef, { streak: newStreak });

    return newStreak;
}

/**
 * Obtiene la racha actual del usuario
 */
export async function getUserStreak(userId: string): Promise<StreakData> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        return { current: 0, longest: 0, lastPlayedDate: '', frozenDays: 1 };
    }

    return userDoc.data().streak as StreakData || {
        current: 0,
        longest: 0,
        lastPlayedDate: '',
        frozenDays: 1
    };
}

// Helpers
function getCurrentDateUTC(): string {
    return new Date().toISOString().split('T')[0];
}

function getDaysDifference(date1: string, date2: string): number {
    if (!date1) return 999; // Primera vez jugando

    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
