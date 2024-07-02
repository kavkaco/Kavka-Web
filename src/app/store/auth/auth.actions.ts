import { createAction, createActionGroup, props } from '@ngrx/store';
import { IAccount } from '@models/auth';

export const AuthActions = createActionGroup({
  source: 'auth',
  events: {
    Add: props<{ account: IAccount }>(),
    Remove: props<{ userId: string }>(),
    Update: props<{ userId: string; updates: { account: IAccount } }>(),
  },
});
