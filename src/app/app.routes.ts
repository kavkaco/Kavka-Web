import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { SignupComponent } from './pages/signup/signup.component';
import { BlankAppFormComponent } from './layouts/blank-app-form/blank-app-form.component';
import { PlatformComponent } from './layouts/platform/platform.component';
import { MainComponent } from './pages/platform/main/main.component';
import { SettingsComponent } from './pages/platform/settings/settings.component';

export const routes: Routes = [
    {
        path: "auth",
        component: BlankAppFormComponent,
        children: [
            {
                path: "login",
                component: LoginComponent
            },
            {
                path: "forgot_password",
                component: ForgotPasswordComponent
            },
            {
                path: "signup",
                component: SignupComponent
            },
        ]
    },
    {
        path: "p",
        component: PlatformComponent,
        children: [
            {
                path: "u",
                component: MainComponent
            },
            {
                path: "settings",
                component: SettingsComponent
            },
        ]
    },
    {
        path: "",
        redirectTo: "/p/u",
        pathMatch: "full"
    },
];
