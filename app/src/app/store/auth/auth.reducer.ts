import { createReducer, on } from "@ngrx/store";
import { AuthActions } from "./auth.actions";
import { User } from "kavka-core/model/user/v1/user_pb";

export interface AuthState {
    activeUserId: string | undefined;
    users: User[];
}

const initialState: AuthState = {
    activeUserId: undefined,
    users: [],
};

export function isUserAlreadyExist(users: User[], user: User): boolean {
    let exists = false;

    for (const _user of users) {
        if (_user?.username == user.username || _user?.email == user.email) {
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
        const existingUserIndex = state.users.findIndex(_user => _user.userId === user.userId);

        if (existingUserIndex !== -1) {
            const updatedUser = {
                ...state.users[existingUserIndex],
                ...user,
            } as User;

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
            users: state.users.filter(_user => _user.userId !== userId),
            activeUserId: undefined,
        };
    }),
    // on(AuthActions.update, (state, { userId, updates }) => {
    //   const existingUserIndex = state.users.findIndex(
    //     (_user) => _user.userId === userId
    //   );

    //   if (existingUserIndex === -1) {
    //     return state;
    //   }

    //   const updatedUser = {
    //     ...state.users[existingUserIndex],
    //     ...updates,
    //   };

    //   return {
    //     ...state,
    //     chats: [
    //       ...state.users.slice(0, existingUserIndex),
    //       updatedUser,
    //       ...state.users.slice(existingUserIndex + 1),
    //     ],
    //   };
    // }),
    on(AuthActions.setActiveUser, (state, { userId }) => {
        return {
            ...state,
            activeUserId: userId,
        };
    })
);
