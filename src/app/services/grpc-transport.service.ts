import { Injectable } from '@angular/core';
import { Transport } from '@connectrpc/connect';
import { createConnectTransport } from '@connectrpc/connect-web';
import { environment } from '@environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class GrpcTransportService {
  private _transport: Transport;

  constructor() {
    this._transport = createConnectTransport({
      baseUrl: environment.grpcTransportBaseUrl,
      defaultTimeoutMs: 7000,
    });
  }

  get transport() {
    return this._transport;
  }
}
