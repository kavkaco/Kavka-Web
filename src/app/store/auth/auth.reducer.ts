import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { IUser } from '@app/models/auth';

export interface AuthState {
  activeUserId: string | undefined;
  users: IUser[];
}

const initialState: AuthState = {
  activeUserId: undefined,
  users: [],
};

export function isUserAlreadyExist(
  users: IUser[],
  user: IUser
): boolean {
  let exists = false;

  for (let i = 0; i < users.length; i++) {
    const _user = users[i];

    if (
      _user?.username == user.username ||
      _user?.email == user.email
    ) {
      exists = true;
      break;
    }
  }

  return exists;
}

export const authReducer = createReducer(
  initialState,
  // Update user if it already exists on the store, if not... adds it to the list of the users.
  on(AuthActions.add, (state, { user }) => {
    const existingUserIndex = state.users.findIndex((_user) => _user.userId === user.userId);

    if (existingUserIndex !== -1) {
      const updatedUser = {
        ...state.users[existingUserIndex],
        ...user,
      };

      return {
        ...state,
        users: [
          ...state.users.slice(0, existingUserIndex),
          updatedUser,
          ...state.users.slice(existingUserIndex + 1),
        ],
      };
    }

    return {
      ...state,
      users: [...state.users, user],
      activeUserId: user.userId,
    };
  }),
  on(AuthActions.remove, (state, { userId }) => {
    return {
      users: state.users.filter(
        (_user) => _user.userId !== userId
      ),
      activeUserId: undefined,
    };
  }),
  // on(AuthActions.update, (state, { userId, updates }) => {
  //   const existingUserIndex = state.users.findIndex(
  //     (_user) => _user.userId === userId
  //   );

  //   if (existingUserIndex !== -1) {
  //     const updatedUser = {
  //       ...state.users[existingUserIndex],
  //       ...updates,
  //     };

  //     return {
  //       ...state,
  //       users: [
  //         ...state.users.slice(0, existingUserIndex),
  //         updatedUser,
  //         ...state.users.slice(existingUserIndex + 1),
  //       ],
  //     };
  //   }

  //   return state;
  // }),
  on(AuthActions.setActiveUser, (state, { userId }) => {
    return {
      ...state,
      activeUserId: userId,
    };
  })
);
