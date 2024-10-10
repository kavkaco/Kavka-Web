import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { AccountManagerService } from "@app/services/account-manager.service";
import { AuthService } from "@app/services/auth.service";
import {
    useAuthInterceptorFactory,
    useRefreshTokenInterceptorFactory,
} from "@app/services/grpc-interceptors.service";
import { Transport } from "@connectrpc/connect";
import { ConnectTransportOptions, createConnectTransport } from "@connectrpc/connect-web";
import { environment } from "@environments/environment";

@Injectable({ providedIn: "root" })
export class GrpcTransportService {
    private _transport: Transport;

    private authService: AuthService;
    private accountManagerService = inject(AccountManagerService);
    private options: ConnectTransportOptions;
    private platformId = inject(PLATFORM_ID);

    constructor() {
        this.authService = new AuthService();

        this.options = {
            baseUrl: environment.grpcTransportBaseUrl,
            interceptors: [
                useRefreshTokenInterceptorFactory(
                    this.platformId,
                    this.accountManagerService,
                    this.authService
                ),
                useAuthInterceptorFactory(this.platformId, this.accountManagerService),
            ],
            defaultTimeoutMs: 20000,
        };

        this.establishConnection();
    }

    establishConnection() {
        this._transport = createConnectTransport(this.options);
    }

    get transport() {
        return this._transport;
    }
}
