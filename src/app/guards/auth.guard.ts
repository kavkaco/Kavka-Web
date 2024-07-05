import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {
    let isAllowedRoute = true;

    await authService.Authenticate().catch((e) => {
      isAllowedRoute = false;
      router.navigate(['/auth/login']);
    });

    return true;
  }

  return true;
};
