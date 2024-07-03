import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { IAccount } from '@app/models/auth';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@store/auth/auth.actions';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { isAccountAlreadyExist } from '@app/store/auth/auth.reducer';
import { take } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  emailInput = '';
  passwordInput = '';
  rememberMeInput = true;
  formErrors: string[] = [];

  addNewFormError(msg: string) {
    const i = this.formErrors.findIndex((_msg) => _msg.trim() === msg.trim());

    if (i === -1) this.formErrors.push(msg);
  }

  private authService = inject(AuthService);

  constructor(private router: Router, private store: Store) {}

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
          authToken: response.accessToken,
          refreshToken: response.refreshToken,
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
                rememberMe: this.rememberMeInput,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
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
