import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from 'firebase/firestore';

import type { UserInfo } from '@/features/system/type';

import { firestore } from './firebase';

export type ReportsStore = {
    info: UserInfo,
    form: any
}

export class ReportsService {
    static async getReport(id: string): Promise<ReportsStore | null> {
        const docRef = doc(firestore, 'reports', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as ReportsStore;
        }
        return null;
    }


    static async getUserReport(id: string, email: string): Promise<Record<string, ReportsStore>> {
        if (!id || !email) return {};
        const allReport: Record<string, ReportsStore> = {};
        const reportWithId = await this.getReport(id);
        if (reportWithId) {
            allReport[id] = reportWithId;
        }
        const reportRef = collection(firestore, 'reports');
        const q = query(
            reportRef,
            where('info.user', '==', email),
        );
        const docs = await getDocs(q);
        docs.docs.forEach((docSnap) => {
            allReport[docSnap.id] = docSnap.data() as ReportsStore;
        }, {} as Record<string, ReportsStore>);
        return allReport;
    }

    static async queryReport(level: string): Promise<ReportsStore[]> {
        const reportRef = collection(firestore, 'reports');
        const q = query(reportRef, where('info.level', '==', level));
        const docs = await getDocs(q);
        return docs.docs.map((docSnap) => docSnap.data() as ReportsStore);
    }

    static async getAllReport(): Promise<ReportsStore[]> {
        const reportRef = collection(firestore, 'reports');
        const docs = await getDocs(reportRef);
        return docs.docs.map((docSnap) => docSnap.data() as ReportsStore);
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