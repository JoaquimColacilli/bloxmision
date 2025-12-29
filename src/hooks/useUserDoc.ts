'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User } from '@/src/types';

export function useUserDoc(uid: string | null) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!uid) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = onSnapshot(
            doc(db, 'users', uid),
            (snapshot) => {
                if (snapshot.exists()) {
                    setUser({ uid: snapshot.id, ...snapshot.data() } as User);
                } else {
                    setUser(null);
                }
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching user:', err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [uid]);

    return { user, loading, error };
}
