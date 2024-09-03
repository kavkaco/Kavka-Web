import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideClientHydration } from "@angular/platform-browser";
import { provideServiceWorker } from "@angular/service-worker";
import { provideState, provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { authReducer } from "./store/auth/auth.reducer";
import { chatReducer } from "@app/store/chat/chat.reducers";
import { messageReducer } from "@app/store/messages/messages.reducers";
import { connectivityReducer } from "@app/store/connectivity/connectivity.reducers";
import { provideAnimations } from "@angular/platform-browser/animations";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideClientHydration(),
        provideServiceWorker("ngsw-worker.js", {
            enabled: true,
            registrationStrategy: "registerWhenStable:30000",
        }),
        provideAnimations(),
        provideStore(),
        provideStoreDevtools({}),
        provideState("connectivity", connectivityReducer),
        provideState("auth", authReducer),
        provideState("chat", chatReducer),
        provideState("message", messageReducer),
    ],
};
