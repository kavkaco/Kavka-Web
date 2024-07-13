import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Store } from '@ngrx/store';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { NgScrollbar } from 'ngx-scrollbar';
import { IUser } from '@app/models/auth';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NgScrollbar],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  platformId = inject(PLATFORM_ID);
  user: IUser | undefined;
  users: IUser[] | undefined;

  constructor(private store: Store) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store
        .select(AuthSelectors.selectActiveUser)
        .subscribe((user) => {
          this.user = user;
        });

      this.store
        .select(AuthSelectors.selectUsers)
        .subscribe((users) => {
          this.users = users;
        });
    }
  }
}
