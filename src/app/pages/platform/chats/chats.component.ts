import { Component, ElementRef, inject, input, Input, model, ViewChild, viewChild } from '@angular/core';
import { ActiveChatComponent } from '@components/active-chat/active-chat.component';
import { ChatDetailDrawerComponent } from '@components/chat-detail-drawer/chat-detail-drawer.component';
import { ChatItemComponent } from '@components/chat-item/chat-item.component';
import { IChat, IChatItem } from '@models/chat';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Store } from '@ngrx/store';
import * as ChatSelector from "@store/chat/chat.selectors"
import { ChatActions } from '@app/store/chat/chat.actions';
import { ChatService } from "@services/chat.service"

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ChatDetailDrawerComponent,
    ActiveChatComponent,
    ChatItemComponent,
    NgScrollbarModule,
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss',
})
export class ChatsComponent {
  private chatService = inject(ChatService);
  private store = inject(Store);
  activeChat: IChat | undefined;
  searchText = '';

  chatItems: IChatItem[] = []
  filteredChatItems: IChatItem[] = []
  showActiveChat = false;

  @ViewChild('createChatModal') createChatModalRef;
  createChatMenuActiveTab: string | undefined;
  channelTitleInput: string = "";
  channelUsernameInput: string = "";
  groupTitleInput: string = "";
  groupUsernameInput: string = "";

  constructor() {
    this.store.select(ChatSelector.selectLastActiveChat).subscribe((chat) => {
      this.activeChat = chat;
    })

    this.store.select(ChatSelector.selectChatItems).subscribe((chatItems) => {
      this.chatItems = chatItems
    })

    this.store.select(ChatSelector.selectLastActiveChat).subscribe((chat) => {
      this.showActiveChat = chat !== undefined;
    })

    this.chatService.GetUserChats().then((chats) => {
      this.store.dispatch(ChatActions.add({
        chats
      }))
    });
  }

  activateChat(chatId: string) {
    this.store.dispatch(ChatActions.setActiveChat({
      chatId: chatId
    }))
  }

  filterChatsList(input: string, sourceList: IChatItem[]): IChatItem[] {
    if (input.trim().length == 0) {
      return sourceList;
    }

    let temp: IChatItem[] = [];

    sourceList.forEach((item) => {
      if (item.title.toLowerCase().indexOf(input.toLowerCase()) > -1) {
        temp.push(item);
      }
    });

    return temp;
  }

  submitCreateChannel() {
    this.chatService.CreateChannel(this.channelTitleInput, this.channelUsernameInput)
    this.closeCreateChatModal()
  }

  submitCreateGroup() {
    this.createChatMenuActiveTab = undefined;
    this.closeCreateChatModal()
  }

  closeCreateChatModal() {
    this.createChatModalRef.nativeElement.querySelector('.modal-overlay').click()
    this.createChatMenuActiveTab = undefined;
    this.channelTitleInput = ""
    this.channelUsernameInput = ""
    this.groupTitleInput = ""
    this.groupUsernameInput = ""
  }

  onSearchInputChange() {
    this.chatItems = this.filterChatsList(
      this.searchText,
      this.chatItems
    );
  }
}
