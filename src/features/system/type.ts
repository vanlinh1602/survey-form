import type { Option } from '@/components/SearchSelect';

export type User = {
    id: string;
    email: string
    isAdmin?: boolean
}

export type UserInfo = {
    ward: string;
    level: string;
    school: string;
    user?: string;
}

export type Report = {
    info?: UserInfo;
    form?: any;
}

export type SystemStore = {
    user?: User
    reports?: Record<string, Report>
    schools?: Record<string, Option[]>
    isLoading: boolean
}

export type SystemStoreActions = {
    setUser: (user: User) => void;
    setReports: (reports: Record<string, Report>) => void;
    setReport: (id: string, report: Partial<Report>) => void;
    deleteReport: (id: string) => void;
    setSchools: (schools: Record<string, Option[]>) => void;
    setIsLoading: (isLoading: boolean) => void;
    clearData: () => void
}