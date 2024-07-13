import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '@app/store/auth/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUsers = createSelector(
  selectAuthState,
  (state: AuthState) => {
    return state.users;
  }
);

export const selectActiveUser = createSelector(
  selectAuthState,
  (state: AuthState) => {
    return state.users.filter(
      (_user) => _user.userId === state.activeUserId
    )[0];
  }
);
