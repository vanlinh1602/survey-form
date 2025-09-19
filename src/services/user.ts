import { type User } from '@firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
} from 'firebase/firestore';

import { firestore } from './firebase';

export type UserStore = {
    id: string,
    email: string
    isAdmin?: boolean
}

export class UserService {
    static async getUser(user: User): Promise<UserStore> {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserStore;
        } else {
            await this.updateUser(user.uid, {
                id: user.uid,
                email: user.email || '',
            });
            return {
                id: user.uid,
                email: user.email || '',
            };
        }

    }


    static async updateUser(
        id: string,
        user: Partial<UserStore>
    ): Promise<void> {
        const docRef = doc(firestore, 'users', id);
        await setDoc(docRef, user, { merge: true });
    }



}