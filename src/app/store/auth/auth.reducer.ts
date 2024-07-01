import { ActionCreatorProps, createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { IAccount } from '../../models/auth';

export interface AuthStore {
  accountsList: IAccount[];
}

const initialState: AuthStore = {
  accountsList: [],
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.addAccount, (state, args: any) => {
    // TODO - check dup

    console.log('args', args);

    return {
      ...state,
      accountsList: [...state.accountsList, args.newAccount],
    };
  }),
  on(AuthActions.getAccountsList, (state: any) => {
    console.log(state);

    return state.accountsList;
  })
);
