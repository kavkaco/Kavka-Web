import { createReducer, on } from "@ngrx/store";
import { Message } from "../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/message/v1/message_pb";
import { MessageActions } from "@app/store/messages/messages.actions";

export interface IMessageStore {
    chatId: string
    messages: Message[]
}

export interface MessagesState {
    messageStores: IMessageStore[]
}

const initialState: MessagesState = {
    messageStores: []
};

export const messageReducer = createReducer(
    initialState,
    on(MessageActions.set, (state, { messagesList, chatId }) => {
        const messageStoreIndex = state.messageStores.findIndex((_messageStore) => _messageStore.chatId === chatId)
        if (messageStoreIndex == -1) {
            return {
                ...state,
                messageStores: [
                    ...state.messageStores,
                    {
                        chatId: chatId,
                        messages: messagesList
                    }
                ]
            }
        }

        const messageStore: IMessageStore = {
            chatId: state.messageStores[messageStoreIndex].chatId,
            messages: messagesList,
        }


        return {
            ...state,
            messageStores: [
                ...state.messageStores.slice(0, messageStoreIndex),
                messageStore,
                ...state.messageStores.slice(messageStoreIndex + 1)
            ],
        }
    })
);
