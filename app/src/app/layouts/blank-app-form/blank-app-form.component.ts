import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import appVersion from "@environments/app-version";
@Component({
    selector: "app-blank-app-form",
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: "./blank-app-form.component.html",
    styleUrl: "./blank-app-form.component.scss",
})
export class BlankAppFormComponent {
    appVersion = appVersion;
}
