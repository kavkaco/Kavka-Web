import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserAvatarDropdownComponent } from '@components/user-avatar-dropdown/user-avatar-dropdown.component';

@Component({
  selector: 'app-platform',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserAvatarDropdownComponent,
  ],
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss',
})
export class PlatformComponent {}
