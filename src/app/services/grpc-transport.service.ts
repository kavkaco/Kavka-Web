import { Injectable } from '@angular/core';
import { Transport } from '@connectrpc/connect';
import {
  ConnectTransportOptions,
  createConnectTransport,
} from '@connectrpc/connect-web';
import { environment } from '@environments/environment.development';

@Injectable({ providedIn: 'root' })
export class GrpcTransportService {
  private _transport: Transport;

  private options: ConnectTransportOptions = {
    baseUrl: environment.grpcTransportBaseUrl,
    defaultTimeoutMs: 7000,
  };

  constructor() {
    this._transport = createConnectTransport(this.options);
  }

  get transport() {
    return this._transport;
  }
}
