import { createActionGroup, props } from '@ngrx/store';
import { IMessage } from '@models//message';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    Add: props<{ chatId: string; message: IMessage }>(),
    Remove: props<{ chatId: string }>(),
    Update: props<{
      chatId: string;
      messageId: string;
      changes: { message: IMessage };
    }>(),
  },
});
