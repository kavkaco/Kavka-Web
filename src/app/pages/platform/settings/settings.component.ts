import { isPlatformBrowser } from "@angular/common";
import { Component, inject, PLATFORM_ID, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import * as AuthSelectors from "@app/store/auth/auth.selectors";
import { NgScrollbar } from "ngx-scrollbar";
import { User } from "kavka-core/model/user/v1/user_pb";

@Component({
    selector: "app-settings",
    standalone: true,
    imports: [NgScrollbar],
    templateUrl: "./settings.component.html",
    styleUrl: "./settings.component.scss",
})
export class SettingsComponent implements OnInit {
    platformId = inject(PLATFORM_ID);
    user: User | undefined;
    users: User[] | undefined;

    constructor(private store: Store) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.store.select(AuthSelectors.selectActiveUser).subscribe(user => {
                this.user = user;
            });

            this.store.select(AuthSelectors.selectUsers).subscribe(users => {
                this.users = users;
            });
        }
    }
}
