import { Component, HostListener, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { UserAvatarDropdownComponent } from "@components/user-avatar-dropdown/user-avatar-dropdown.component";
import { EventsService } from "@app/services/events.service";
@Component({
    selector: "app-platform",
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, UserAvatarDropdownComponent],
    templateUrl: "./platform.component.html",
    styleUrl: "./platform.component.scss",
})
export class PlatformComponent {
    private router = inject(Router);
    private eventsService = inject(EventsService);

    constructor() {
        this.eventsService.SubscribeEventsStream();
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
