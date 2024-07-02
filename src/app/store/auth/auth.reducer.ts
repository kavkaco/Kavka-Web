import { ActionCreatorProps, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { IAccount } from '@models//auth';

export interface AuthStore {
  accountsList: IAccount[];
}

const initialState: AuthStore = {
  accountsList: [],
};

function isAccountAlreadyExist(
  accounts: IAccount[],
  account: IAccount
): boolean {
  let exists = false;

  for (let i = 0; i < accounts.length; i++) {
    const _account = accounts[i];

    if (
      _account.username == account.username ||
      _account.email == account.email
    ) {
      exists = true;
      break;
    }
  }

  return exists;
}

export const authReducer = createReducer(
  initialState,
  on(AuthActions.add, (state, { account }) => {
    if (isAccountAlreadyExist(state.accountsList, account)) {
      throw new Error('account already exists');
    }

    return {
      ...state,
      accountsList: [...state.accountsList, account],
    };
  }),
  on(AuthActions.remove, (state, { userId }) => ({
    accountsList: state.accountsList.filter(
      (_account) => _account.userId !== userId
    ),
  })),
  on(AuthActions.update, (state, { userId, updates }) => {
    const existingAccountIndex = state.accountsList.findIndex(
      (account) => account.userId === userId
    );

    if (existingAccountIndex !== -1) {
      const updatedAccount = {
        ...state.accountsList[existingAccountIndex],
        ...updates,
      };

      return {
        ...state,
        accountsList: [
          ...state.accountsList.slice(0, existingAccountIndex),
          updatedAccount,
          ...state.accountsList.slice(existingAccountIndex + 1),
        ],
      };
    }

    return state;
  })
);
