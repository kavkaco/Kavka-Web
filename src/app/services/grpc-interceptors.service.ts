import { Router } from "@angular/router";
import { AccountManagerService } from "@app/services/account-manager.service";
import { AuthService } from "@app/services/auth.service";
import { Interceptor } from "@connectrpc/connect";

// Do not use this interceptor for auth service!
export function useAuthInterceptorFactory(
    accountManagerService: AccountManagerService,
) {
    const authInterceptor: Interceptor = (next) => async (req) => {
        const activeAccount = accountManagerService.GetActiveAccount()
        if (activeAccount) {
            console.info('[AuthInterceptor]', 'Set access token');
            req.header.set('X-Access-Token', activeAccount.accessToken);
        }

        return await next(req);
    };

    return authInterceptor;
}

// Only to be used in auth service!
export function useRefreshTokenInterceptorFactory(
    accountManagerService: AccountManagerService,
    authService: AuthService
) {
    const refreshTokenInterceptor: Interceptor = (next) => async (req) => {
        console.log(["[RefreshTokenInterceptor] Refresh token interceptor called"]);

        AuthService.refreshTokenIfExpired(authService, accountManagerService)

        return await next(req);
    };

    return refreshTokenInterceptor;
}
