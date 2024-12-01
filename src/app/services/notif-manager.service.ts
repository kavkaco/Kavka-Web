import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as ConnectivitySelector from "@store/connectivity/connectivity.selectors";
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
} from "@tauri-apps/plugin-notification";

@Injectable({
    providedIn: "root",
})
export class NotifManagerService {
    private store = inject(Store);

    private permissionGranted: boolean = false;
    public connectivity: boolean = true;

    constructor() {
        isPermissionGranted()
            .then(value => {
                this.permissionGranted = value;
            })
            .finally(async () => {
                if (!this.permissionGranted) {
                    const permission = await requestPermission();

                    this.permissionGranted = permission === "granted";
                }
            });

        this.store.select(ConnectivitySelector.selectIsOnline).subscribe(value => {
            this.connectivity = value;
        });
    }

    public SendNotif(title: string, body: string) {
        if (this.permissionGranted) {
            sendNotification({
                title,
                body,
            });
        }
    }
}
