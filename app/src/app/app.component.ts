import { Component, inject, PLATFORM_ID } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { isPlatformBrowser } from "@angular/common";
import { ConnectivityActions } from "@app/store/connectivity/connectivity.actions";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: "./app.component.html",
})
export class AppComponent implements OnInit {
    title = "Kavka";

    private store = inject(Store);
    platformId = inject(PLATFORM_ID);

    public ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.addEventListener("online", () => {
                this.store.dispatch(ConnectivityActions.set({ online: true }));
            });

            window.addEventListener("offline", () => {
                this.store.dispatch(ConnectivityActions.set({ online: false }));
            });
        }
    }
}
