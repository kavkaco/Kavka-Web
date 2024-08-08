import { isPlatformBrowser } from "@angular/common";
import { inject, PLATFORM_ID } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AccountManagerService } from "@app/services/account-manager.service";
import { AuthService } from "@app/services/auth.service";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors";
import { take } from "rxjs";

export const authGuard: CanActivateFn = async () => {
    const platformId = inject(PLATFORM_ID);
    const authService = new AuthService();
    const accountManagerService = inject(AccountManagerService);
    const router = inject(Router);
    const store = inject(Store);

    let isRouteAllowed = false;

    if (isPlatformBrowser(platformId)) {
        await AuthService.refreshTokenIfExpired(authService, accountManagerService)
            .then(async () => {
                await authService
                    .loadUser()
                    .then(() => {
                        // Select user from store
                        store
                            .select(AuthSelector.selectActiveUser)
                            .pipe(take(1))
                            .subscribe(user => {
                                if (user) {
                                    isRouteAllowed = true;
                                    return;
                                }

                                console.warn("[AuthGuard]", "No active account found at store.");
                            });

                        isRouteAllowed = true;
                    })
                    .catch(e => {
                        console.error("[AuthGuard] Filed to load user: ", e);
                    });
            })
            .catch(e => {
                console.error("[AuthGuard][RefreshIfExpired] Error: ", e);
            });

        if (!isRouteAllowed) {
            router.navigate(["/auth/login"]);
        }

        return isRouteAllowed;
    }

    return false;
};
