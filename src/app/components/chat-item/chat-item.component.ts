import { Component, Input, output, Output } from '@angular/core';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss',
})
export class ChatItemComponent {
  @Input() isActive: boolean = false;
  @Input({ required: true }) chatId!: string;
  @Input({ required: true }) title!: string;
  @Input() avatar: string | undefined;
  @Input({ required: true }) lastMessageType!: string;
  @Input() lastMessageCaption?: string;

  submitActivateChat() {
    alert(this.chatId);
  }
}
