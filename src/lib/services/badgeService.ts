import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export interface Badge {
    id: string;
    name: string;
    description: string;
    category: 'progress' | 'effort' | 'mastery' | 'surprise';
    icon: string;
}

export const BADGES: Badge[] = [
    {
        id: 'first-island',
        name: 'Primera Isla Conquistada',
        description: 'Completaste todos los niveles de Isla Secuencia',
        category: 'progress',
        icon: '🏝️'
    },
    {
        id: 'persistent',
        name: 'Persistente',
        description: 'Completaste un nivel después de 5+ intentos',
        category: 'effort',
        icon: '💪'
    },
    {
        id: 'perfect-code',
        name: 'Código Perfecto',
        description: 'Completaste 5 niveles con código óptimo',
        category: 'mastery',
        icon: '⭐'
    },
    {
        id: 'no-hints',
        name: 'Sin Pistas',
        description: 'Completaste 10 niveles sin usar pistas',
        category: 'mastery',
        icon: '🧠'
    },
    {
        id: 'early-bird',
        name: 'Madrugador',
        description: 'Jugaste antes de las 9 AM',
        category: 'surprise',
        icon: '🌅'
    },
    {
        id: 'night-owl',
        name: 'Nocturno',
        description: 'Jugaste después de las 7 PM',
        category: 'surprise',
        icon: '🌙'
    }
];

export interface BadgeContext {
    userId: string;
    levelId?: string;
    attempts?: number;
    usedHints?: number;
    isOptimal?: boolean;
}

/**
 * Verifica y otorga badges
 */
export async function checkAndAwardBadges(
    userId: string,
    context: BadgeContext
): Promise<string[]> {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        const currentBadges = userDoc.data()?.badges || [];

        const stats = await getUserStats(userId);
        const newBadges: string[] = [];

        // Verificar cada badge
        for (const badge of BADGES) {
            if (currentBadges.includes(badge.id)) continue;

            const earned = await checkBadgeCondition(badge.id, { ...context, ...stats });

            if (earned) {
                newBadges.push(badge.id);
            }
        }

        // Guardar nuevos badges
        if (newBadges.length > 0) {
            await updateDoc(doc(db, 'users', userId), {
                badges: arrayUnion(...newBadges)
            });
        }

        return newBadges;

    } catch (error) {
        console.error('Error checking badges:', error);
        return [];
    }
}

/**
 * Verifica condición de un badge
 */
async function checkBadgeCondition(
    badgeId: string,
    context: any
): Promise<boolean> {
    switch (badgeId) {
        case 'persistent':
            return context.attempts >= 5;

        case 'perfect-code':
            return context.optimalLevelsCount >= 5;

        case 'no-hints':
            return context.noHintLevelsCount >= 10;

        case 'early-bird':
            return new Date().getHours() < 9;

        case 'night-owl':
            return new Date().getHours() >= 19;

        default:
            return false;
    }
}

/**
 * Obtiene estadísticas del usuario
 */
async function getUserStats(userId: string) {
    const q = query(
        collection(db, 'progress'),
        where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);

    let optimalCount = 0;
    let noHintCount = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isOptimal) optimalCount++;
        if (data.usedHints === 0) noHintCount++;
    });

    return {
        optimalLevelsCount: optimalCount,
        noHintLevelsCount: noHintCount
    };
}

/**
 * Obtiene info de un badge
 */
export function getBadgeInfo(badgeId: string) {
    return BADGES.find(b => b.id === badgeId);
}

/**
 * Obtiene todos los badges del usuario
 */
export async function getUserBadges(userId: string): Promise<Badge[]> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const badgeIds = userDoc.data()?.badges || [];

    return badgeIds
        .map((id: string) => getBadgeInfo(id))
        .filter((b: Badge | undefined): b is Badge => b !== undefined);
}
