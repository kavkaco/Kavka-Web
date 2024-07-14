import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatActions } from '@app/store/chat/chat.actions';
import { UserAvatarDropdownComponent } from '@components/user-avatar-dropdown/user-avatar-dropdown.component';
import { Store } from '@ngrx/store';
import * as ChatSelector from "@app/store/chat/chat.selectors"
import { take } from 'rxjs';
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
export class PlatformComponent {
  private store = inject(Store);
  private router = inject(Router);

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.store.select(ChatSelector.selectActiveChats).pipe(take(1)).subscribe((activeChats: string[]) => {
        if (activeChats && activeChats.length > 0) {
          this.store.dispatch(ChatActions.removeActiveChat())
          return
        }

        this.router.navigate(["/"])
      })
    }
  }
}
