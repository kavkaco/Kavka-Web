import { Component, inject, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import * as AuthSelectors from "@app/store/auth/auth.selectors";
import { NgScrollbar } from "ngx-scrollbar";
import { User } from "kavka-core/model/user/v1/user_pb";
import { FormsModule } from "@angular/forms";
import * as ConnectivitySelector from "@app/store/connectivity/connectivity.selectors";
import { environment } from "@environments/environment";
@Component({
    selector: "app-settings",
    standalone: true,
    imports: [NgScrollbar, FormsModule],
    templateUrl: "./settings.component.html",
    styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
    appVersion = environment.appVersion;
    platformId = inject(PLATFORM_ID);
    user: User | undefined;
    users: User[] | undefined;
    avatar: string | undefined;
    isOnline = true;

    constructor(private store: Store) {
        this.store.select(ConnectivitySelector.selectIsOnline).subscribe(_isOnline => {
            this.isOnline = _isOnline;
        });

        this.store.select(AuthSelectors.selectActiveUser).subscribe(user => {
            this.user = user;
        });

        this.store.select(AuthSelectors.selectUsers).subscribe(users => {
            this.users = users;
        });
    }
}
