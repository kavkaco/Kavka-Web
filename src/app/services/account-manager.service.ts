import { Injectable } from "@angular/core";
import { ILocalStorageAccount } from "@app/models/auth";
import { debug } from "console";
import { User } from "kavka-core/model/user/v1/user_pb";

const localStorageKeys = {
    ActiveAccountKey: "active_account",
    AccountsKey: "accounts",
};

export function isAccountAlreadyExist(
    accounts: ILocalStorageAccount[],
    account: ILocalStorageAccount
): boolean {
    let exists = false;

    for (const _account of accounts) {
        if (_account?.accountId == account.accountId) {
            exists = true;
            break;
        }
    }

    return exists;
}

@Injectable({
    providedIn: "root",
})
export class AccountManagerService {
    GetActiveAccountId() {
        return localStorage.getItem(localStorageKeys.ActiveAccountKey);
    }

    SaveAccount(account: ILocalStorageAccount) {
        let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

        const accounts = JSON.parse(accountsString || "[]");

        if (!isAccountAlreadyExist(accounts, account)) {
            accounts.push(account);
        }

        accountsString = JSON.stringify(accounts);

        localStorage.setItem(localStorageKeys.AccountsKey, accountsString);
        localStorage.setItem(localStorageKeys.ActiveAccountKey, account.accountId);
    }

    UpdateAccessToken(accountId, newAccessToken): boolean {
        let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

        const accounts: ILocalStorageAccount[] = JSON.parse(accountsString || "[]");

        const account = accounts.find(account => {
            return account.accountId === accountId;
        });

        if (account) {
            account.accessToken = newAccessToken;

            accountsString = JSON.stringify(accounts);

            localStorage.setItem(localStorageKeys.AccountsKey, accountsString);

            return true;
        }

        return false;
    }

    RemoveAccount(accountId: string): boolean {
        let accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

        if (accountsString == null || accountsString!.trim().length == 0) {
            return false;
        }

        let accounts: ILocalStorageAccount[] | null = JSON.parse(accountsString);

        accounts = accounts.filter(_account => _account.accountId !== accountId);

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
        } catch {
            return null;
        }
    }

    GetActiveAccount(): ILocalStorageAccount | undefined {
        const activeAccountId = this.GetActiveAccountId();
        if (activeAccountId == null || activeAccountId.trim() == "") {
            return undefined;
        }

        const accountsList = this.GetAccountsList();
        if (activeAccountId.length == 0) {
            return undefined;
        }

        const account = accountsList!.find(({ accountId }) => accountId === activeAccountId);

        if (account == null || account == undefined) {
            return undefined;
        }

        return account;
    }

    ActivateAccount(accountId: string): boolean {
        const accountsString = localStorage.getItem(localStorageKeys.AccountsKey);

        const accounts = JSON.parse(accountsString || "[]");

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
