import { createActionGroup, props } from "@ngrx/store";
import { Message } from "kavka-core/model/message/v1/message_pb";

export const MessageActions = createActionGroup({
    source: "Message",
    events: {
        Set: props<{ chatId: string; messagesList: Message[] }>(),
        Add: props<{ chatId: string; message: Message }>(),
        Remove: props<{ chatId: string; messageId: string }>(),
        Update: props<{
            chatId: string;
            messageId: string;
            changes: { message: Message };
        }>(),
    },
});
