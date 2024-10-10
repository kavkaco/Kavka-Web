import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { provideAnimations } from "@angular/platform-browser/animations";
import { connectivityReducer } from './store/connectivity/connectivity.reducers';
import { authReducer } from './store/auth/auth.reducer';
import { chatReducer } from './store/chat/chat.reducers';
import { messageReducer } from './store/messages/messages.reducers';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
        provideAnimations(),
        provideStore(),
        provideStoreDevtools({}),
        provideState("connectivity", connectivityReducer),
        provideState("auth", authReducer),
        provideState("chat", chatReducer),
        provideState("message", messageReducer),
      ]
};
