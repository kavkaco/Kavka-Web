import { Component } from '@angular/core';
import { ActiveChatComponent } from '../../../components/active-chat/active-chat.component';
import { ChatDetailDrawerComponent } from '../../../components/chat-detail-drawer/chat-detail-drawer.component';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [ChatDetailDrawerComponent, ActiveChatComponent],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent {

}
