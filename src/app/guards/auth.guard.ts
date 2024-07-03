import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateFn,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@app/store/auth/auth.actions';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const store = inject(Store);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    console.log('is here');

    router.parseUrl('/');

    let isAllowedRoute = false;

    await store
      .select(AuthSelectors.getSavedActiveAccount)
      .pipe(take(1))
      .subscribe((_activeAccount) => {
        if (_activeAccount == undefined) {
          router.navigate(['/auth/login']);
          return;
        }

        authService.Authenticate(_activeAccount.authToken).then((response) => {
          const accountId = response.user!.userId;

          store.dispatch(AuthActions.setActiveAccount({ accountId }));

          store.dispatch(
            AuthActions.update({
              accountId,
              updates: { account: response.user! },
            })
          );
        });

        isAllowedRoute = true;
      });

    return isAllowedRoute;
  }

  return true;
};
