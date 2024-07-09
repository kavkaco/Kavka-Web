import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { IAccount } from '@app/models/auth';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgScrollbar],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  platformId = inject(PLATFORM_ID);
  activeAccount: IAccount | undefined;
  accountsList: IAccount[] | undefined;

  constructor(private store: Store) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store
        .select(AuthSelectors.selectAccountsList)
        .subscribe((_accountsList) => {
          this.accountsList = _accountsList;
        });

      this.store
        .select(AuthSelectors.selectActiveAccount)
        .subscribe((_activeAccount) => {
          this.activeAccount = _activeAccount;
        });
    }
  }
}
