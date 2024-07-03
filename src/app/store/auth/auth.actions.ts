import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { IAccount, IAccountUpdatableFields } from '@models/auth';

export const AuthActions = createActionGroup({
  source: 'auth',
  events: {
    Add: props<{
      account: IAccount;
      rememberMe: boolean;
      accessToken: string;
      refreshToken: string;
    }>(),
    Remove: props<{ accountId: string }>(),
    Update: props<{
      accountId: string;
      updates: { account: IAccountUpdatableFields };
    }>(),
    SetActiveAccount: props<{ accountId: string }>(),
  },
});
