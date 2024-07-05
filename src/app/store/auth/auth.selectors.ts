import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '@app/store/auth/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAccountsList = createSelector(
  selectAuthState,
  (state: AuthState) => {
    return state.accountsList;
  }
);

export const selectActiveAccount = createSelector(
  selectAuthState,
  (state: AuthState) => {
    return state.accountsList.filter(
      (_account) => _account.userId === state.activeAccountId
    )[0];
  }
);
