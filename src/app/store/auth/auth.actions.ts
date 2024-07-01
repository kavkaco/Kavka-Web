import { createAction, props } from '@ngrx/store';
import { IAccount } from '../../models/auth';

export const addAccount = createAction(
  '[Auth Component] AddAccount',
  props<{ newAccount: IAccount }>
);

export const logoutAccount = createAction(
  '[Auth Component] LogoutAccount',
  props<{ userId: string }>
);

export const updateAccount = createAction(
  '[Auth Component] UpdateAccount',
  props<{
    name: string;
    lastName: string;
  }>
);

export const getAccountsList = createAction('[Auth Component] GetAccountsList');
