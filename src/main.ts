import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import "@fontsource/poppins";
import "@fontsource/vazirmatn";
import { provideStore } from '@ngrx/store';
import { authReducer } from './app/store/auth/auth.reducer';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
