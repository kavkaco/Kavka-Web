import { AfterContentInit, Component, HostListener, inject, OnChanges } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { EventsService } from "@app/services/events.service";
import { User } from "kavka-core/model/user/v1/user_pb";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors";
import { take } from "rxjs";

@Component({
    selector: "app-platform",
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: "./platform.component.html",
    styleUrl: "./platform.component.scss",
})
export class PlatformComponent implements AfterContentInit, OnChanges {
    private store = inject(Store);
    private router = inject(Router);
    private eventsService = inject(EventsService);
    activeUser: User;

    isPWAInstalled = false;
    installPWAEvent: any | undefined;

    constructor() {
        this.eventsService.SubscribeEventsStream();

        this.store
            .select(AuthSelector.selectActiveUser)
            .pipe(take(1))
            .subscribe(_activeUser => {
                this.activeUser = _activeUser;
            });
    }

    loadPwaInstallationStatus() {
        setTimeout(() => {
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                    this.isPWAInstalled = registration.active ? true : false;
                    console.info("[ServiceWorker] Installation Status: " + this.isPWAInstalled);
                });
            } else {
                console.error("ServiceWorker is not supported in this browser.");
            }
        }, 2000);
    }

    ngAfterContentInit() {
        window.addEventListener("beforeinstallprompt", event => {
            event.preventDefault();
            this.installPWAEvent = event;
        });

        window.addEventListener("appinstalled", () => {
            this.isPWAInstalled = true;
            console.info("[Platform] App is installed");
        });

        this.loadPwaInstallationStatus();
    }

    ngOnChanges() {
        this.loadPwaInstallationStatus();
    }

    installPWA() {
        if (this.installPWAEvent) {
            this.installPWAEvent.prompt();
        } else {
            alert("PWA installation is not available.");
        }
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();

            const routerUrl = this.router.url;
            if (routerUrl !== "/p/u" && routerUrl !== "/") {
                this.router.navigate(["/"]);
                return;
            }
        }
    }
}
