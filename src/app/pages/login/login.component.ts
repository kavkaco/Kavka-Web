import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { select, StateObservable, Store } from '@ngrx/store';
import * as authActions from '@store/auth/auth.actions';
import * as authSelectors from '@store/auth/auth.selectors';
import { IAccount } from '@models/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private store: Store) {}

  submitLogin() {
    alert('not implemented yet');
  }
}
