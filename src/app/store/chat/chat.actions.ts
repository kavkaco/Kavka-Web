import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Chat, LastMessage } from '../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';

export const ChatActions = createActionGroup({
  source: 'Chat',
  events: {
    SetActiveChat: props<{ chatId: string }>(),
    RemoveActiveChat: emptyProps(),
    Set: props<{ chats: Chat[] }>(),
    Remove: props<{ chatId: string }>(),
    Update: props<{
      chatId: string;
      changes: { chatDetail: any; lastMessage: LastMessage };
    }>(),
  },
});
