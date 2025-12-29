'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Level } from '@/src/types';

export function useLevels(worldId: number) {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                setLoading(true);

                const q = query(
                    collection(db, 'levels'),
                    where('worldId', '==', worldId),
                    orderBy('levelNumber', 'asc')
                );

                const snapshot = await getDocs(q);
                const levelsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Level[];

                setLevels(levelsData);
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching levels:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchLevels();
    }, [worldId]);

    return { levels, loading, error };
}
