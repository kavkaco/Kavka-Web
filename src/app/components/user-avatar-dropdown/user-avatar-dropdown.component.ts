import { Component, Input } from "@angular/core";

@Component({
    selector: "app-user-avatar-dropdown",
    standalone: true,
    imports: [],
    templateUrl: "./user-avatar-dropdown.component.html",
    styleUrl: "./user-avatar-dropdown.component.scss",
})
export class UserAvatarDropdownComponent {
    @Input() dropDownPosition!: string;
}
