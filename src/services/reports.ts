import {
    deleteDoc,
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';

import type { UserInfo } from '@/features/system/type';

import { firestore } from './firebase';

export type ReportsStore = {
    info: UserInfo,
    form: any
}

export class ReportsService {
    static async getReport(id: string): Promise<ReportsStore> {
        const docRef = doc(firestore, 'reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ReportsStore;
        }
        throw new Error('Report not found');
    }

    static async updateReport(
        id: string,
        report: Partial<ReportsStore>
    ): Promise<void> {
        const docRef = doc(firestore, 'reports', id);
        await setDoc(docRef, report, { merge: true });
    }


    static async deleteReport(id: string): Promise<void> {
        const docRef = doc(firestore, 'reports', id);
        await deleteDoc(docRef);
    }
}