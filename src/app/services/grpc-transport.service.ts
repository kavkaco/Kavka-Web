import { inject, Injectable } from "@angular/core";
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

    constructor() {
        this.options = {
            baseUrl: environment.grpcTransportBaseUrl,
            interceptors: [
                useRefreshTokenInterceptorFactory(this.accountManagerService, this.authService),
                useAuthInterceptorFactory(this.accountManagerService),
            ],
            defaultTimeoutMs: 20000,
        };

        this.establishConnection();
        this.authService = new AuthService();
    }

    establishConnection() {
        this._transport = createConnectTransport(this.options);
    }

    get transport() {
        return this._transport;
    }
}
