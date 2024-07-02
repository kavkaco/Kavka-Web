import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IChat } from '@models//chat';
import { ILastMessage } from '@models//message';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    Add: props<{ chat: IChat }>(),
    Remove: props<{ chatId: string }>(),
    Update: props<{
      chatId: string;
      changes: { chatDetail: any; lastMessage: ILastMessage };
    }>(),
  },
});
