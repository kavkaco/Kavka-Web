import { isPlatformBrowser } from "@angular/common";
import { AccountManagerService } from "@app/services/account-manager.service";
import { AuthService } from "@app/services/auth.service";
import { Interceptor } from "@connectrpc/connect";

// Do not use this interceptor for auth service!
export function useAuthInterceptorFactory(
    platformId: object,
    accountManagerService: AccountManagerService
) {
    const authInterceptor: Interceptor = next => async req => {
        if (isPlatformBrowser(platformId)) {
            const activeAccount = accountManagerService.GetActiveAccount();
            if (activeAccount) {
                req.header.set("X-Access-Token", activeAccount.accessToken);
            }
        }

        return await next(req);
    };

    return authInterceptor;
}

// Only to be used in auth service!
export function useRefreshTokenInterceptorFactory(
    platformId: object,
    accountManagerService: AccountManagerService,
    authService: AuthService
) {
    const refreshTokenInterceptor: Interceptor = next => async req => {
        if (isPlatformBrowser(platformId)) {
            AuthService.refreshTokenIfExpired(authService, accountManagerService);
        }

        return await next(req);
    };

    return refreshTokenInterceptor;
}
