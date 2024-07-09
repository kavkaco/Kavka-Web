export interface IAccount {
  userId: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface IAccountUpdatableFields {
  name?: string;
  lastName?: string;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface IUser {
  name: string;
  lastName: string;
}
