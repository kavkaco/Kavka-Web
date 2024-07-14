import { Component, inject, Input, output, Output } from '@angular/core';
import { ILastMessage } from '@app/models/message';
import { Store } from '@ngrx/store';
import * as ChatSelector from "@app/store/chat/chat.selectors"
@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss',
})
export class ChatItemComponent {
  private store = inject(Store);

  @Input({ required: true }) chatId!: string;
  @Input({ required: true }) title!: string;
  @Input() avatar: string | undefined;
  @Input({ required: true }) lastMessage!: ILastMessage;
  isActive: boolean = false;

  constructor() {
    this.store.select(ChatSelector.selectLastActiveChat).subscribe((chat) => {
      if (chat && chat.chatId == this.chatId) {
        this.isActive = true;
        return
      }

      this.isActive = false;
    })
  }
}
