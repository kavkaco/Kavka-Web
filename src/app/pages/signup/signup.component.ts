import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private authService = inject(AuthService);

  constructor(private router: Router, private store: Store) {}

  signupForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.maxLength(15),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(30),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
    acceptTheTermsAndConditions: new FormControl(false, [
      Validators.requiredTrue,
    ]),
  });

  formErrors: string[] = [];

  submitSignup() {
    this.authService
      .Register(
        this.signupForm.controls.firstName.value,
        this.signupForm.controls.lastName.value,
        this.signupForm.controls.email.value,
        this.signupForm.controls.username.value,
        this.signupForm.controls.password.value
      )
      .then(() => {
        this.router.navigate(['/auth/account_created']);
      })
      .catch((e: Error) => {
        this.formErrors.push(e.message);
      });
  }
}
