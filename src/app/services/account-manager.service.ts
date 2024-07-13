import { Injectable } from '@angular/core';
import { ILocalStorageAccount } from '@app/models/auth';
import { isUserAlreadyExist } from '@app/store/auth/auth.reducer';

const localStorageKeys = {
  ActiveAccountKey: 'active_account',
  AccountsKey: 'accounts',
};

export function isAccountAlreadyExist(
  accounts: ILocalStorageAccount[],
  account: ILocalStorageAccount
): boolean {
  let exists = false;

  for (let i = 0; i < accounts.length; i++) {
    const _account = accounts[i];

    if (_account?.accountId == account.accountId) {
      exists = true;
      break;
    }
  }

  return exists;
}

@Injectable({
  providedIn: 'root',
})
export class AccountManagerService {
  constructor() { }

  GetActiveAccountId() {
    return localStorage.getItem(localStorageKeys.ActiveAccountKey);
  }

  SaveAccount(account: ILocalStorageAccount) {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    const accounts = JSON.parse(accountsString || '[]');

    if (!isAccountAlreadyExist(accounts, account)) {
      accounts.push(account);
    }

    accountsString = JSON.stringify(accounts);

    localStorage.setItem(localStorageKeys.AccountsKey, accountsString);
    localStorage.setItem(localStorageKeys.ActiveAccountKey, account.accountId);
  }

  UpdateAccessToken(accountId, newAccessToken): boolean {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    const accounts = JSON.parse(accountsString || '[]');

    const account: ILocalStorageAccount = accounts!.find(
      ({ accountId }) => accountId === accountId
    );
    if (account == null || account == undefined) {
      return false;
    }

    account.accessToken = newAccessToken;

    accountsString = JSON.stringify(accounts);

    localStorage.setItem(localStorageKeys.AccountsKey, accountsString);

    return true
  }

  RemoveAccount(accountId: string): boolean {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    if (accountsString == null || accountsString!.trim().length == 0) {
      return false;
    }

    let accounts: ILocalStorageAccount[] | null = JSON.parse(accountsString);

    accounts = accounts.filter((_account) => _account.accountId !== accountId);

    accountsString = JSON.stringify(accounts);

    localStorage.setItem(localStorageKeys.AccountsKey, accountsString);

    return true;
  }

  GetAccountsList(): ILocalStorageAccount[] | null {
    const accountsString = localStorage.getItem(localStorageKeys.AccountsKey);
    if (accountsString == null || accountsString!.trim().length == 0) {
      return null;
    }

    try {
      const accounts = JSON.parse(accountsString);

      return accounts as ILocalStorageAccount[];
    } catch (_) {
      return null;
    }
  }

  GetActiveAccount(): ILocalStorageAccount | undefined {
    const activeAccountId = this.GetActiveAccountId();
    if (activeAccountId == null || activeAccountId.trim() == '') {
      return undefined;
    }

    const accountsList = this.GetAccountsList();
    if (activeAccountId.length == 0) {
      return undefined;
    }

    const account = accountsList!.find(
      ({ accountId }) => accountId === activeAccountId
    );

    if (account == null || account == undefined) {
      return undefined;
    }

    return account;
  }

  ActivateAccount(accountId: string): boolean {
    let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

    const accounts = JSON.parse(accountsString || '[]');

    const account = accounts.filter(
      (_account: ILocalStorageAccount) => _account.accountId == accountId
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
}
