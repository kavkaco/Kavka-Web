import { Inject, inject, Injectable } from '@angular/core';
import { GrpcTransportService } from '@app/services/grpc-transport.service';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';
import { IAccount } from '@app/models/auth';
import { GetErrorMessage } from '@helpers/grpc_response';

import { AuthService as KavkaAuthService } from 'kavka-core/auth/v1/auth_connect';
import { LoginResponse } from 'kavka-core/auth/v1/auth_pb';

class UnauthorizedError extends Error {
  constructor() {
    super();
    this.message = 'Invalid email or password';
  }
}
class InternalServerError extends Error {
  constructor() {
    super();
    this.message = 'Internal server error!';
  }
}
class UniqueConstraintViolationError extends Error {
  constructor(field: string) {
    super();
    this.message = `${field} already exists.`;
  }
}

const localStorageKeys = {
  ActiveAccountKey: 'active_account',
  AccountsKey: 'accounts',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private transport = new GrpcTransportService().transport;
  private client: PromiseClient<typeof KavkaAuthService>;

  constructor() {
    this.client = createPromiseClient(KavkaAuthService, this.transport);
  }

  GetSavedActiveAccountId() {
    return localStorage.getItem(localStorageKeys.ActiveAccountKey);
  }

  SaveAccount(account: IAccount) {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    const accounts = JSON.parse(accountsString || '[]');

    if (!isAccountAlreadyExist(accounts, account)) {
      accounts.push(account);
    }

    accountsString = JSON.stringify(accounts);

    localStorage.setItem(localStorageKeys.AccountsKey, accountsString);
    localStorage.setItem(localStorageKeys.ActiveAccountKey, account.userId);
  }

  RemoveAccount(accountId: string) {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);
    if (accountsString == null || accountsString!.trim().length == 0) {
      return false;
    }

    let accounts: IAccount[] = JSON.parse(accountsString);

    accounts = accounts.filter((_account) => _account.userId !== accountId);

    accountsString = JSON.stringify(accounts);

    localStorage.setItem(localStorageKeys.AccountsKey, accountsString);

    return true;
  }

  GetSavedAccountsList() {
    const accountsString = localStorage.getItem(localStorageKeys.AccountsKey);
    if (accountsString == null || accountsString!.trim().length == 0) {
      return null;
    }

    try {
      const accounts = JSON.parse(accountsString);

      return accounts as IAccount[];
    } catch (_) {
      return null;
    }
  }

  ActivateAccount(accountId: string): boolean {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    const accounts = JSON.parse(accountsString || '[]');

    const account = accounts.filter(
      (_account) => _account.userId == accountId
    )[0];
    if (!account) {
      return false;
    }

    if (isAccountAlreadyExist(accounts, account)) {
      localStorage.setItem(localStorageKeys.ActiveAccountKey, accountId);
      return true;
    }

    return false;
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
            };

            this.SaveAccount(account);

            return resolve(response);
          }

          reject(new InternalServerError());
        })
        .catch((e: Error) => {
          if (e.message == '[permission_denied] invalid email or password') {
            reject(new UnauthorizedError());
          }

          reject(new InternalServerError());
        });
    });
  }

  Authenticate() {
    return new Promise((resolve: (resp: IAccount) => void, reject) => {
      const activeAccountId = this.GetSavedActiveAccountId();
      if (!activeAccountId) {
        reject();
        return;
      }

      const savedAccountsList = this.GetSavedAccountsList();
      if (!activeAccountId) {
        reject();
        return;
      }

      const account = savedAccountsList!.find(
        ({ userId }) => userId === activeAccountId
      );
      if (!account) {
        reject();
        return;
      }

      this.client
        .authenticate({ accessToken: account!.accessToken })
        .then((response) => {
          if (response.user) {
            return resolve(account);
          }

          reject(new UnauthorizedError());
        })
        .catch(() => reject(new InternalServerError()));
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
