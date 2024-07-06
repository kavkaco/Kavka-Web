import { Inject, inject, Injectable } from '@angular/core';
import { GrpcTransportService } from '@app/services/grpc-transport.service';
import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';
import { IAccount } from '@app/models/auth';

import { AuthService as GrpcAuthService } from 'kavka-core/auth/v1/auth_connect';
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

const localStorageKeys = {
  ActiveAccountKey: 'active_account',
  AccountsKey: 'accounts',
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private transport = new GrpcTransportService().transport;
  private client;

  constructor() {
    this.client = createPromiseClient(GrpcAuthService, this.transport);
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

          reject(new UnauthorizedError());
        })
        .catch(() => {
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
}
