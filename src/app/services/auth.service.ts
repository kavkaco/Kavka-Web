import { inject } from "@angular/core";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GetErrorMessage } from "@helpers/grpc_response";
import { AuthService as KavkaAuthService } from "kavka-core/auth/v1/auth_connect";
import { AccountManagerService } from "@app/services/account-manager.service";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import { AuthActions } from "@app/store/auth/auth.actions";
import { ConnectTransportOptions, createGrpcWebTransport } from "@connectrpc/connect-web";
import { environment } from "@environments/environment.development";

export class UnauthorizedError extends Error {
    constructor() {
        super();
        this.message = "Unauthorized";
    }
}
export class InvalidEmailOrPasswordError extends Error {
    constructor() {
        super();
        this.message = "Invalid email or password";
    }
}
export class InternalServerError extends Error {
    constructor() {
        super();
        this.message = "Internal server error!";
    }
}
export class UniqueConstraintViolationError extends Error {
    constructor(field: string) {
        super();
        this.message = `${field} already taken.`;
    }
}
export class EmailNotVerifiedError extends Error {
    constructor() {
        super();
        this.message = `Your email is not verified!`;
    }
}

// Only auth services creates it's own grpc transport client!
export class AuthService {
    private client: PromiseClient<typeof KavkaAuthService>;
    private accountManagerService = inject(AccountManagerService);
    private store = inject(Store);

    constructor() {
        const options: ConnectTransportOptions = {
            baseUrl: environment.grpcTransportBaseUrl,
            defaultTimeoutMs: 7000,
        };

        const transport = createGrpcWebTransport(options);
        this.client = createPromiseClient(KavkaAuthService, transport);
    }

    static refreshTokenIfExpired(
        authService: AuthService,
        accountManagerService: AccountManagerService
    ) {
        return new Promise((resolve, reject) => {
            const activeAccount = accountManagerService.GetActiveAccount();
            if (activeAccount && activeAccount.accessToken && activeAccount.refreshToken) {
                const isAccessTokenExpired = AuthService.isAccessTokenExpired(
                    activeAccount.accessToken
                );

                if (isAccessTokenExpired) {
                    // Refresh access token and update on storage
                    authService
                        .RefreshToken(activeAccount.refreshToken, activeAccount.accountId)
                        .then(newAccessToken => {
                            console.log("[AccessTokenProtector] Refreshed");

                            activeAccount.accessToken = newAccessToken;

                            if (
                                !accountManagerService.UpdateAccessToken(
                                    activeAccount.accountId,
                                    newAccessToken
                                )
                            ) {
                                console.error("[AccessTokenProtector][UpdateAccessToken] Failed");
                                reject();
                            }

                            resolve(undefined);
                        })
                        .catch(e => {
                            console.error([
                                "[AccessTokenProtector]",
                                "Refreshing token failed:",
                                e,
                            ]);
                            reject();
                        });
                }

                resolve(undefined);
            } else {
                console.error(
                    "[RefreshTokenInterceptor]",
                    "Unable to get refreshToken or accessToken of active account!"
                );
                reject();
            }
        });
    }

    static isAccessTokenExpired(accessToken: string): boolean {
        try {
            const decodedToken = JSON.parse(atob(accessToken.split(".")[1]));
            const expiry = decodedToken.exp - 80;
            return Date.now() / 1000 >= expiry;
        } catch {
            return true;
        }
    }

    loadUser() {
        return new Promise(
            (
                resolve: ({ user, accessToken }: { user: IUser; accessToken: string }) => void,
                reject
            ) => {
                // Get the tokens of active account from local storage
                const activeAccount = this.accountManagerService.GetActiveAccount();

                if (activeAccount) {
                    this.Authenticate(activeAccount.accessToken)
                        .then((user: IUser) => {
                            // Update state for user
                            this.store.dispatch(
                                AuthActions.add({
                                    user,
                                })
                            );

                            resolve({ user, accessToken: activeAccount.accessToken });

                            console.info("[AuthService][LoadUser]", "Authenticated");
                        })
                        .catch(async (e: Error) => {
                            console.error("[AuthService][LoadUser][Authenticate]", e.message);

                            reject();
                        });
                } else {
                    reject();
                    console.warn("[AuthService][LoadUser] No active account recognized");
                }
            }
        );
    }

    Login(email: string, password: string) {
        return new Promise(
            (
                resolve: (resp: { user: IUser; accessToken: string; refreshToken: string }) => void,
                reject
            ) => {
                this.client
                    .login({
                        email,
                        password,
                    })
                    .then(response => {
                        if (response.accessToken != "" && response.user) {
                            return resolve({
                                user: response.user,
                                accessToken: response.accessToken,
                                refreshToken: response.refreshToken,
                            });
                        }

                        reject(new InternalServerError());
                    })
                    .catch((e: Error) => {
                        console.error("[AuthService][Login]", e.message);

                        switch (GetErrorMessage(e)) {
                            case "email not verified":
                                reject(new EmailNotVerifiedError());
                                break;
                            case "invalid email or password":
                                reject(new InvalidEmailOrPasswordError());
                                break;
                            default:
                                reject(new InternalServerError());
                                break;
                        }
                    });
            }
        );
    }

    Authenticate(accessToken: string) {
        return new Promise((resolve, reject) => {
            this.client
                .authenticate({ accessToken })
                .then(response => {
                    if (response.user) {
                        resolve(response.user);
                        return;
                    }

                    reject(new UnauthorizedError());
                })
                .catch(e => {
                    console.error("[AuthService][Authenticate]", e);

                    switch (GetErrorMessage(e)) {
                        case "access denied":
                            reject(new UnauthorizedError());
                            break;
                        default:
                            reject(new InternalServerError());
                            break;
                    }
                });
        });
    }

    RefreshToken(refreshToken: string, userId: string) {
        return new Promise<string>((resolve: (newAccessToken: string) => void, reject) => {
            this.client
                .refreshToken({
                    userId: userId,
                    refreshToken: refreshToken,
                })
                .then(response => {
                    if (response.accessToken) {
                        resolve(response.accessToken);
                        return;
                    }

                    reject(new InternalServerError());
                })
                .catch(e => {
                    console.error("[AuthService][RefreshToken]", e);

                    reject(new UnauthorizedError());
                });
        });
    }

    Register(
        firstName: string,
        lastName: string,
        email: string,
        username: string,
        password: string
    ) {
        return new Promise<void>((resolve, reject: (reason: Error) => void) => {
            this.client
                .register({
                    name: firstName,
                    lastName,
                    username,
                    email,
                    password,
                    verifyEmailRedirectUrl: "",
                })
                .then(() => {
                    resolve();
                })
                .catch((e: Error) => {
                    console.error("[AuthService][Register]", e);

                    switch (GetErrorMessage(e)) {
                        case "email already exists":
                            reject(new UniqueConstraintViolationError("Email"));
                            break;
                        case "username already exists":
                            reject(new UniqueConstraintViolationError("Username"));
                            break;
                        default:
                            reject(new InternalServerError());
                            break;
                    }
                });
        });
    }
}
