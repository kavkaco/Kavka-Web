import { Component, input, Input, model } from '@angular/core';
import { ActiveChatComponent } from '../../../components/active-chat/active-chat.component';
import { ChatDetailDrawerComponent } from '../../../components/chat-detail-drawer/chat-detail-drawer.component';
import { ChatItemComponent } from '../../../components/chat-item/chat-item.component';
import { IChatItem } from '../../../models/chat';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ChatDetailDrawerComponent,
    ActiveChatComponent,
    ChatItemComponent,
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss',
})
export class ChatsComponent {
  searchText = '';

  // FIXME - mode to ngrx
  chatsListOfStore: IChatItem[] = [
    {
      isActive: true,
      title: 'Amupxm',
      chatId: '1',
      lastMessageType: 'video',
      lastMessageCaption: 'Hi Taha! How is it going on?',
      avatar: 'https://pics.craiyon.com/2023-07-15/dc2ec5a571974417a5551420a4fb0587.webp',
    },
    {
      isActive: false,
      title: 'Taha Dostifam',
      chatId: '5',
      lastMessageType: 'text',
      lastMessageCaption: 'Kavka is awesome!',
      avatar: 'https://avatars.githubusercontent.com/u/72092675?v=4',
    },
    {
      isActive: false,
      title: 'Darling',
      chatId: '2',
      lastMessageType: 'file',
      lastMessageCaption: 'Please print this when you coming back',
      avatar: 'https://play-lh.googleusercontent.com/jInS55DYPnTZq8GpylyLmK2L2cDmUoahVacfN_Js_TsOkBEoizKmAl5-p8iFeLiNjtE=w526-h296-rw',
    },
    {
      isActive: false,
      title: 'Bob',
      chatId: '3',
      lastMessageType: 'file',
      lastMessageCaption: 'Good night dude.',
      avatar: 'https://images.sftcdn.net/images/t_app-cover-l,f_auto/p/e76d4296-43f3-493b-9d50-f8e5c142d06c/2117667014/boys-profile-picture-screenshot.png',
    },
  ];
  chatsList: IChatItem[] = this.chatsListOfStore;

  filterChatsList(input: string, sourceList: IChatItem[]): IChatItem[] {
    if (input.trim().length == 0) {
      return sourceList;
    }

    let temp: IChatItem[] = [];

    sourceList.forEach((item) => {
      if (item.title.toLowerCase().indexOf(input) > -1) {
        temp.push(item);
      }
    });

    return temp;
  }

  
  onSearchInputChange() {
    this.chatsList = this.filterChatsList(
      this.searchText,
      this.chatsListOfStore
    );
  }
}
