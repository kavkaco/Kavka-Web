export interface ILocalStorageAccount {
    accountId: string;
    email: string;
    accessToken: string;
    refreshToken: string;
}
export interface IUserUpdatableFields {
    name?: string;
    lastName?: string;
    username?: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface IUser {
    userId: string;
    name: string;
    lastName: string;
    username: string;
    email: string;
}
