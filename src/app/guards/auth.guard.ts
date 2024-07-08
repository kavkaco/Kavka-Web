import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IAccount } from '@app/models/auth';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@app/store/auth/auth.actions';
import { Store } from '@ngrx/store';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  const store = inject(Store);

  if (isPlatformBrowser(platformId)) {
    let isAllowedRoute = true;

    await authService
      .Authenticate()
      .catch((e) => {
        isAllowedRoute = false;
        router.navigate(['/auth/login']);
      })
      .then((account: IAccount) => {
        store.dispatch(
          AuthActions.add({
            account,
          })
        );
      });

    return true;
  }

  return true;
};
