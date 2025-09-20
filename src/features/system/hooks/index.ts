import { cloneDeep, unset } from 'lodash';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { Report, SystemStore, SystemStoreActions } from '../type';

const initialState: SystemStore = {
    isLoading: false,
};

export const useSystemStore = create<SystemStore & SystemStoreActions>()(
    devtools((set) => ({
        ...initialState,
        setUser: (user) => set({ user }),
        setReports: (reports) => set({ reports }),
        setReport: (id: string, report: Partial<Report>) => {
            const { info, form } = report;
            set((state) => {
                const updatedState = cloneDeep(state.reports?.[id]) || {};
                if (info) {
                    updatedState.info = info;
                }
                if (form) {
                    updatedState.form = form;
                }
                return {
                    reports: {
                        ...state.reports,
                        [id]: updatedState
                    }
                };
            });
        },
        setSchools: (schools) => set({ schools }),
        deleteReport: (id) => {
            set((state) => {
                const updatedState = cloneDeep(state.reports) || {};
                unset(updatedState, id);
                return {
                    reports: updatedState
                };
            });
        },
        setIsLoading: (isLoading) => set({ isLoading }),
        clearData: () => set((state) => ({
            isLoading: false,
            user: undefined,
            reports: undefined,
            schools: state.schools,
        })),
    }))
);
