import { Component, ElementRef, inject, input, Input, model, ViewChild, viewChild } from '@angular/core';
import { ActiveChatComponent } from '@components/active-chat/active-chat.component';
import { ChatDetailDrawerComponent } from '@components/chat-detail-drawer/chat-detail-drawer.component';
import { ChatItemComponent } from '@components/chat-item/chat-item.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Store } from '@ngrx/store';
import * as ChatSelector from "@store/chat/chat.selectors"
import { ChatActions } from '@app/store/chat/chat.actions';
import { ChatService } from "@services/chat.service"
import { ChannelChatDetail, Chat, ChatType, DirectChatDetail, GroupChatDetail, LastMessage } from '../../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';
import { IChatItem } from '@app/models/chat';
import { BehaviorSubject } from 'rxjs';

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
  activeChat: Chat | null;
  searchText = '';

  chatItems: IChatItem[] = []
  filteredChatItems: IChatItem[] = []

  @ViewChild('createChatModal') createChatModalRef;
  createChatMenuActiveTab: string | undefined;
  channelTitleInput: string = "";
  channelUsernameInput: string = "";
  groupTitleInput: string = "";
  groupUsernameInput: string = "";

  constructor() {
    this.store.select(ChatSelector.selectActiveChat).subscribe((chat) => {
      if (chat !== null || chat !== undefined) {
        this.activeChat = chat;
        return
      }

      this.activeChat = null;
    })

    this.chatService.GetUserChats().then((chats) => {
      this.store.dispatch(ChatActions.set({ chats }))

      this.filteredChatItems = this.chatItems
    });

    this.store.select(ChatSelector.selectChats).subscribe((chats) => {
      this.chatItems = chats;
      this.filteredChatItems = this.filterChatsList(this.searchText, chats);
    })
  }

  activateChat(chatId: string) {
    this.store.dispatch(ChatActions.setActiveChat({ chatId }))
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
    this.chatService.CreateChannel(this.channelTitleInput, this.channelUsernameInput).then((chat) => {
      this.store.dispatch(ChatActions.add({ chat }))
    })
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
    this.filteredChatItems = this.filterChatsList(
      this.searchText,
      this.chatItems
    );
  }
}
