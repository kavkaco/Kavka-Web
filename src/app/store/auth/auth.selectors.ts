import {
  createFeature,
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { IAccount } from '@models//auth';
import { AuthState } from '@app/store/auth/auth.reducer';
import { LocalStorageKeys } from '@app/store/auth/local_storage_keys';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

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

export const getSavedActiveAccount = createSelector(
  selectAuthState,
  (state: AuthState) => {
    let activeAccountId: string | null;

    if (isPlatformBrowser(PLATFORM_ID)) {
      activeAccountId = localStorage.getItem(LocalStorageKeys.ActiveAccountKey);
      if (activeAccountId == undefined || activeAccountId!.trim().length == 0) {
        return undefined;
      }
    }

    return state.accountsList.filter(
      (_account) => _account.userId == activeAccountId
    )[0];
  }
);
