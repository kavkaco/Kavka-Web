import { Injectable } from '@angular/core';
import { IAccount } from '@app/models/auth';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';

const localStorageKeys = {
  ActiveAccountKey: 'active_account',
  AccountsKey: 'accounts',
};

@Injectable({
  providedIn: 'root',
})
export class AccountManagerService {
  constructor() {}

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

  GetActiveAccountsTokens() {
    const activeAccountId = this.GetSavedActiveAccountId();
    if (activeAccountId.trim() == '') {
      return undefined;
    }

    const savedAccountsList = this.GetSavedAccountsList();
    if (activeAccountId.length == 0) {
      return undefined;
    }

    const account = savedAccountsList!.find(
      ({ userId }) => userId === activeAccountId
    );

    if (account == null || account == undefined) {
      return undefined;
    }

    return {
      accessToken: account.accessToken,
      refreshToken: account.refreshToken,
    };
  }
}
