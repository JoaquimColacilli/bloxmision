import { Timestamp } from 'firebase/firestore';
import type { Block } from './Block';

export interface Progress {
    id: string;
    userId: string;
    levelId: string;
    completed: boolean;
    attempts: number;
    usedHints: number;
    codeUsed: Block[];
    isOptimal: boolean;
    completedAt: Timestamp;
    xpEarned: number;
}
