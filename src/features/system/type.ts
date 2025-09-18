export type User = {
    id: string;
    email: string
}

export type UserInfo = {
    ward: string;
    level: string;
    schoolName: string;
}

export type SystemStore = {
    user?: User
    info?: UserInfo;
    form?: any;
    isLoading: boolean
}

export type SystemStoreActions = {
    setUser: (user: User) => void;
    setInfo: (info: UserInfo) => void;
    setForm: (form: any) => void;
    setIsLoading: (isLoading: boolean) => void;
}