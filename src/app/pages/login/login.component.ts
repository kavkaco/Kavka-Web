import { Component, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { select, Store } from '@ngrx/store';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '@app/services/auth.service';
import { AuthActions } from '@store/auth/auth.actions';
import * as AuthSelectors from '@app/store/auth/auth.selectors';
import { isUserAlreadyExist } from '@app/store/auth/auth.reducer';
import { take } from 'rxjs';
import { AsyncPipe, isPlatformBrowser } from '@angular/common';
import { AccountManagerService } from '@app/services/account-manager.service';
import { GrpcTransportService } from '@app/services/grpc-transport.service';
import { ILocalStorageAccount } from '@app/models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, RouterLink, ReactiveFormsModule, AsyncPipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  platformId = inject(PLATFORM_ID);
  accountsList: ILocalStorageAccount[] | null = null;
  activeAccountId: string = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    rememberMe: new FormControl(true),
  });
  formErrors: string[] = [];

  showSelectAccount: boolean = false;

  addNewFormError(msg: string) {
    const i = this.formErrors.findIndex((_msg) => _msg.trim() === msg.trim());

    if (i === -1) this.formErrors.push(msg);
  }

  private transport = inject(GrpcTransportService).transport;
  private authService = new AuthService();
  private accountManagerService = inject(AccountManagerService);

  constructor(private router: Router, private store: Store) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.activeAccountId =
        this.accountManagerService.GetActiveAccountId();
      this.accountsList = this.accountManagerService.GetAccountsList();

      if (this.accountsList && this.accountsList.length > 0) {
        this.showSelectAccount = true;
      }
    }
  }

  submitLogin() {
    this.formErrors = [];

    this.authService
      .Login(
        this.loginForm.controls.email.value,
        this.loginForm.controls.password.value
      )
      .then(({ user, accessToken, refreshToken }) => {
        this.store
          .select(AuthSelectors.selectUsers)
          .pipe(take(1))
          .subscribe((users) => {
            if (isUserAlreadyExist(users, user)) {
              this.addNewFormError('This account already exists!');
              return;
            }

            // Add tokens to local storage
            this.accountManagerService.SaveAccount({
              accountId: user.userId,
              email: user.email,
              accessToken,
              refreshToken,
            })

            // Update the ngrx store and add user
            this.store.dispatch(AuthActions.add({ user }));

            this.router.navigate(['/']);
          });
      })
      .catch((err: Error) => {
        this.addNewFormError(err.message);
      });
  }

  activateAccount(accountId: string) {
    const isActivated = this.accountManagerService.ActivateAccount(accountId);
    if (isActivated) {
      this.router.navigate(['/']);
    }
  }
}
