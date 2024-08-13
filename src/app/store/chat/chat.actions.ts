import { createActionGroup, emptyProps, props } from "@ngrx/store";
import { Chat, LastMessage } from "kavka-core/model/chat/v1/chat_pb";

export const ChatActions = createActionGroup({
    source: "Chat",
    events: {
        SetActiveChat: props<{ chat: Chat }>(),
        RemoveActiveChat: emptyProps(),
        Set: props<{ chats: Chat[] }>(),
        Add: props<{ chat: Chat }>(),
        Remove: props<{ chatId: string }>(),
        Update: props<{
            chatId: string;
            changes: { chatDetail: any; lastMessage: LastMessage };
        }>(),
    },
});
