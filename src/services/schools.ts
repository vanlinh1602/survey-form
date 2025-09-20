import {
    collection,
    deleteDoc,
    doc,
    documentId,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from 'firebase/firestore';

import { firestore } from './firebase';

export type SchoolsStore = {
    label: string,
    value: string
    type: string
}

export class SchoolsService {
    static async getReport(id: string): Promise<SchoolsStore> {
        const docRef = doc(firestore, 'schools', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as SchoolsStore;
        }
        throw new Error('School not found');
    }

    static async getSchoolWithId(ids: string[]): Promise<SchoolsStore[]> {
        if (!ids || ids.length === 0) {
            return [];
        }
        const schoolRef = collection(firestore, 'schools');
        const q = query(schoolRef, where(documentId(), 'in', ids));
        const snapshot = await getDocs(q);
        return snapshot.docs?.map((docSnap) => docSnap.data() as SchoolsStore) ?? [];
    }

    static async getAllSchools(): Promise<SchoolsStore[]> {
        const schoolRef = collection(firestore, 'schools');
        const q = query(schoolRef);
        const docs = await getDocs(q);
        return docs.docs?.map((docSnap) => docSnap.data() as SchoolsStore) ?? [];
    }

    static async updateSchool(
        id: string,
        school: Partial<SchoolsStore>
    ): Promise<void> {
        const docRef = doc(firestore, 'schools', id);
        await setDoc(docRef, school, { merge: true });
    }


    static async deleteSchool(id: string): Promise<void> {
        const docRef = doc(firestore, 'schools', id);
        await deleteDoc(docRef);
    }
}