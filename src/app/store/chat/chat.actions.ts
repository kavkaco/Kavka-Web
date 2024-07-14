import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IChat } from '@models//chat';
import { ILastMessage } from '@models//message';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    SetActiveChat: props<{ chatId: string }>(),
    Add: props<{ chats: IChat[] }>(),
    Remove: props<{ chatId: string }>(),
    Update: props<{
      chatId: string;
      changes: { chatDetail: any; lastMessage: ILastMessage };
    }>(),
  },
});
