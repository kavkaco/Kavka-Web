import { Inject, inject, Injectable } from '@angular/core';
import { GrpcTransportService } from '@app/services/grpc-transport.service';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';
import { IAccount } from '@app/models/auth';
import { GetErrorMessage } from '@helpers/grpc_response';

import { AuthService as KavkaAuthService } from 'kavka-core/auth/v1/auth_connect';
import { LoginResponse } from 'kavka-core/auth/v1/auth_pb';
import { AccountManagerService } from '@app/services/account-manager.service';

export class UnauthorizedError extends Error {
  constructor() {
    super();
    this.message = 'Invalid email or password';
  }
}
export class InternalServerError extends Error {
  constructor() {
    super();
    this.message = 'Internal server error!';
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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private transport = new GrpcTransportService().transport;
  private client: PromiseClient<typeof KavkaAuthService>;
  private accountManagerService = inject(AccountManagerService);

  constructor() {
    this.client = createPromiseClient(KavkaAuthService, this.transport);
  }

  Login(email: string, password: string) {
    return new Promise((resolve: (resp: LoginResponse) => void, reject) => {
      this.client
        .login({
          email,
          password,
        })
        .then((response) => {
          const user = response.user!;

          if (response.accessToken != '' && response.user) {
            const account: IAccount = {
              userId: user.userId,
              name: user.name,
              lastName: user.lastName,
              email: user.email,
              username: user.username,
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            };

            this.accountManagerService.SaveAccount(account);

            return resolve(response);
          }

          reject(new InternalServerError());
        })
        .catch((e: Error) => {
          if (GetErrorMessage(e) == 'invalid email or password') {
            reject(new UnauthorizedError());
            return;
          } else if (GetErrorMessage(e) == 'email not verified') {
            reject(new EmailNotVerifiedError());
            return;
          }

          console.error('[AuthService][Login]', e.message);

          reject(new InternalServerError());
        });
    });
  }

  Authenticate(accessToken: string) {
    return new Promise((resolve, reject) => {
      this.client
        .authenticate({ accessToken })
        .then((response) => {
          if (response.user) {
            resolve(response.user);
            return;
          }

          reject(new UnauthorizedError());
        })
        .catch((e) => {
          if (GetErrorMessage(e) == 'access denied') {
            reject(new UnauthorizedError());
            return;
          }

          console.error('[AuthService][Authenticate]', e.message);
          reject(new InternalServerError());
        });
    });
  }

  RefreshToken(refreshToken: string, accessToken: string) {
    return new Promise<string>(
      (resolve: (newAccessToken: string) => void, reject) => {
        this.client
          .refreshToken({
            accessToken: accessToken,
            refreshToken: refreshToken,
          })
          .then((response) => {
            if (response.accessToken) {
              resolve(response.accessToken);
              return;
            }

            reject(new InternalServerError());
          })
          .catch((e) => {
            console.error('[AuthService][RefreshToken]', e.message);

            reject(new UnauthorizedError());
          });
      }
    );
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
          verifyEmailRedirectUrl: '',
        })
        .then(() => {
          resolve();
        })
        .catch((e: Error) => {
          switch (GetErrorMessage(e)) {
            case 'email already exists':
              reject(new UniqueConstraintViolationError('Email'));
              break;
            case 'username already exists':
              reject(new UniqueConstraintViolationError('Username'));
              break;
            default:
              console.error('[AuthService][Register]', e.message);
              reject(new InternalServerError());
              break;
          }
        });
    });
  }
}
