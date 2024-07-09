import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IAccount } from '@app/models/auth';
import { AccountManagerService } from '@app/services/account-manager.service';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@app/store/auth/auth.actions';
import { Store } from '@ngrx/store';
import * as AuthSelector from '@store/auth/auth.selectors';
import { take } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const accountManagerService = inject(AccountManagerService);
  const platformId = inject(PLATFORM_ID);
  const store = inject(Store);

  if (isPlatformBrowser(platformId)) {
    const accountId = accountManagerService.GetSavedActiveAccountId();
    const tokens = accountManagerService.GetActiveAccountsTokens();

    if (
      accountId == null ||
      tokens.refreshToken == null ||
      tokens.accessToken == null
    ) {
      console.info('[AuthGuard]', 'Unauthorized');
      router.navigate(['/auth/login']);
      return true;
    }

    await authService
      .Authenticate(tokens.accessToken)
      .then((account: IAccount) => {
        store.dispatch(
          AuthActions.add({
            account,
          })
        );

        console.info('[AuthGuard]', 'Authenticated');
      })
      .catch(async (e: Error) => {
        console.error('[AuthGuard][AuthService->Authenticate]', e.message);

        authService
          .RefreshToken(tokens.refreshToken, tokens.accessToken)
          .then((newAccessToken) => {
            // accountManagerService.

            authService
              .Authenticate(tokens.accessToken)
              .then((account: IAccount) => {
                store.dispatch(
                  AuthActions.add({
                    account,
                  })
                );

                console.info('[AuthGuard]', 'Access Token Refreshed');
                console.info('[AuthGuard]', 'Authenticated');
              });
          })
          .catch(() => {
            router.navigate(['/auth/login']);
          });

        router.navigate(['/auth/login']);
      });

    return true;
  }

  return true;
};
