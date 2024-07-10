import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { IAccount } from '@models/auth';

export interface AuthState {
  activeAccountId: string | undefined;
  accountsList: IAccount[];
}

const initialState: AuthState = {
  activeAccountId: undefined,
  accountsList: [],
};

export function isAccountAlreadyExist(
  accounts: IAccount[],
  account: IAccount
): boolean {
  let exists = false;

  for (let i = 0; i < accounts.length; i++) {
    const _account = accounts[i];

    if (
      _account?.username == account.username ||
      _account?.email == account.email
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
    return {
      ...state,
      accountsList: [...state.accountsList, account],
      activeAccountId: account.userId,
    };
  }),
  on(AuthActions.remove, (state, { accountId }) => {
    return {
      accountsList: state.accountsList.filter(
        (_account) => _account.userId !== accountId
      ),
      activeAccountId: undefined,
    };
  }),
  on(AuthActions.update, (state, { accountId, updates }) => {
    const existingAccountIndex = state.accountsList.findIndex(
      (account) => account.userId === accountId
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
  }),
  on(AuthActions.setActiveAccount, (state, { accountId }) => {
    return {
      ...state,
      activeAccountId: accountId,
    };
  })
);
