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
}

export type SystemStore = {
    user?: User
    info?: UserInfo;
    form?: any;
    schools?: Record<string, Option[]>
    isLoading: boolean
}

export type SystemStoreActions = {
    setUser: (user: User) => void;
    setInfo: (info: UserInfo) => void;
    setForm: (form: any) => void;
    setSchools: (schools: Record<string, Option[]>) => void;
    setIsLoading: (isLoading: boolean) => void;
}