import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { IAccount } from '@app/models/auth';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@store/auth/auth.actions';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';
import { take } from 'rxjs';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, RouterLink, FormsModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  platformId = inject(PLATFORM_ID);
  emailInput = '';
  passwordInput = '';
  rememberMeInput = true;
  formErrors: string[] = [];
  accountsList: IAccount[] | null = null;

  showSelectAccount: boolean = false;

  addNewFormError(msg: string) {
    const i = this.formErrors.findIndex((_msg) => _msg.trim() === msg.trim());

    if (i === -1) this.formErrors.push(msg);
  }

  private authService = inject(AuthService);

  constructor(private router: Router, private store: Store) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.accountsList = this.authService.GetSavedAccountsList();

      if (this.accountsList && this.accountsList.length > 0) {
        this.showSelectAccount = true;
      }
    }
  }

  submitLogin() {
    this.authService
      .Login(this.emailInput, this.passwordInput)
      .then((response) => {
        const user = response.user!;

        const account: IAccount = {
          userId: user.userId,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          accessToken: response.accessToken,
        };

        this.store
          .select(AuthSelectors.selectAccountsList)
          .pipe(take(1))
          .subscribe((accountsList) => {
            if (isAccountAlreadyExist(accountsList, account)) {
              this.addNewFormError('This account already exists!');
              return;
            }

            this.store.dispatch(
              AuthActions.add({
                account,
              })
            );

            this.router.navigate(['/']);
          });
      })
      .catch((err: Error) => {
        this.addNewFormError(err.message);
      });
  }
}
