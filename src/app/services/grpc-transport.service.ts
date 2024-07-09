import { inject, Injectable } from '@angular/core';
import { AccountManagerService } from '@app/services/account-manager.service';
import { AuthService } from '@app/services/auth.service';
import { Interceptor, Transport } from '@connectrpc/connect';
import {
  ConnectTransportOptions,
  createConnectTransport,
} from '@connectrpc/connect-web';
import { environment } from '@environments/environment.development';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '@store/auth/auth.selectors';
import { take } from 'rxjs';

function useAuthInterceptorFactory(store: Store) {
  const authInterceptor: Interceptor = (next) => async (req) => {
    await store
      .select(AuthSelectors.selectActiveAccount)
      .pipe(take(1))
      .subscribe((activeAccount) => {
        console.info('[AuthInterceptor]', 'Set X-Access-Token');

        req.header.set('X-Access-Token', activeAccount?.accessToken);
      });

    return await next(req);
  };

  return authInterceptor;
}

@Injectable({ providedIn: 'root' })
export class GrpcTransportService {
  private _transport: Transport;
  private store = inject(Store);

  private options: ConnectTransportOptions = {
    baseUrl: environment.grpcTransportBaseUrl,
    defaultTimeoutMs: 7000,
    interceptors: [useAuthInterceptorFactory(this.store)],
  };

  constructor() {
    this._transport = createConnectTransport(this.options);
  }

  get transport() {
    return this._transport;
  }
}
