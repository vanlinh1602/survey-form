import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { SystemStore, SystemStoreActions } from '../type';

const initialState: SystemStore = {
    isLoading: false,
};

export const useSystemStore = create<SystemStore & SystemStoreActions>()(
    devtools((set) => ({
        ...initialState,
        setUser: (user) => set({ user }),
        setInfo: (info) => set({ info }),
        setForm: (form) => set({ form }),
        setSchools: (schools) => set({ schools }),
        setIsLoading: (isLoading) => set({ isLoading }),
    }))
);
