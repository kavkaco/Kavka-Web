import { inject, Injectable } from '@angular/core';
import { GrpcTransportService } from '@app/services/grpc-transport.service';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
// import { AuthService as GrpcAuthService } from 'kavka-core/auth/v1/auth_connect';
import { AuthService as GrpcAuthService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/auth/v1/auth_connect';
import {
  AuthenticateResponse,
  LoginResponse,
} from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/auth/v1/auth_pb';

class UnauthorizedError extends Error {
  constructor() {
    super();
    this.message = 'Invalid email or password';
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private transport = inject(GrpcTransportService).transport;
  private client;

  constructor() {
    this.client = createPromiseClient(GrpcAuthService, this.transport);
  }

  Login(email: string, password: string) {
    return new Promise((resolve: (resp: LoginResponse) => void, reject) => {
      this.client
        .login({
          email,
          password,
        })
        .then((response) => {
          if (response.accessToken != '' && response.user) {
            return resolve(response);
          }

          reject(new UnauthorizedError());
        })
        .catch(() => reject(new UnauthorizedError()));
    });
  }

  Authenticate(accessToken: string) {
    return new Promise(
      (resolve: (resp: AuthenticateResponse) => void, reject) => {
        this.client
          .authenticate({ accessToken })
          .then((response) => {
            if (response.user) {
              return resolve(response);
            }

            reject(new UnauthorizedError());
          })
          .catch(() => reject(new UnauthorizedError()));
      }
    );
  }
}
