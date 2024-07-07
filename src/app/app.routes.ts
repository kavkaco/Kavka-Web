import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { SignupComponent } from './pages/signup/signup.component';
import { BlankAppFormComponent } from './layouts/blank-app-form/blank-app-form.component';
import { PlatformComponent } from './layouts/platform/platform.component';
import { SettingsComponent } from './pages/platform/settings/settings.component';
import { ChatsComponent } from './pages/platform/chats/chats.component';
import { authGuard } from '@app/guards/auth.guard';
import { AccountCreatedComponent } from '@app/pages/account-created/account-created.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: BlankAppFormComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'forgot_password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },
      {
        path: 'account_created',
        component: AccountCreatedComponent,
      },
    ],
  },
  {
    path: 'p',
    component: PlatformComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'u',
        component: ChatsComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/p/u',
    pathMatch: 'full',
  },
];
