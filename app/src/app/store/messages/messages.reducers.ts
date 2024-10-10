import { createReducer, on } from "@ngrx/store";
import { MessageActions } from "@app/store/messages/messages.actions";
import { IMessage } from "@app/models/message";

export interface IMessageStore {
    chatId: string;
    messages: IMessage[];
}

export interface MessagesState {
    messageStores: IMessageStore[];
}

const initialState: MessagesState = {
    messageStores: [],
};

export const messageReducer = createReducer(
    initialState,
    on(MessageActions.set, (state, { messagesList, chatId }) => {
        const messageStoreIndex = state.messageStores.findIndex(
            _messageStore => _messageStore.chatId === chatId
        );
        if (messageStoreIndex == -1) {
            return {
                ...state,
                messageStores: [
                    ...state.messageStores,
                    {
                        chatId: chatId,
                        messages: messagesList,
                    },
                ],
            };
        }

        const messageStore: IMessageStore = {
            chatId: state.messageStores[messageStoreIndex].chatId,
            messages: messagesList,
        };

        return {
            ...state,
            messageStores: [
                ...state.messageStores.slice(0, messageStoreIndex),
                messageStore,
                ...state.messageStores.slice(messageStoreIndex + 1),
            ],
        };
    }),
    on(MessageActions.add, (state, { chatId, message }) => {
        const idx = state.messageStores.findIndex(_item => _item.chatId === chatId);
        if (idx !== -1) {
            const messageStore: IMessageStore = state.messageStores[idx];

            return {
                ...state,
                messageStores: [
                    ...state.messageStores.slice(0, idx),
                    {
                        chatId,
                        messages: [...messageStore.messages, message],
                    },
                    ...state.messageStores.slice(idx + 1),
                ],
            };
        }

        return state;
    }),
    on(MessageActions.update, (state, { chatId, messageId, replaceWith }) => {
        const idx = state.messageStores.findIndex(_item => _item.chatId === chatId);
        if (idx !== -1) {
            const messageStore: IMessageStore = state.messageStores[idx];
            const messageIdx = messageStore.messages.findIndex(
                _message => _message.messageId === messageId
            );

            console.log("updating");

            if (messageIdx === -1) {
                console.log("[MessagesReducer] Message not found to update it");
                return state;
            }

            return {
                ...state,
                messageStores: [
                    ...state.messageStores.slice(0, idx),
                    {
                        chatId,
                        messages: [
                            ...messageStore.messages.slice(0, messageIdx),
                            replaceWith,
                            ...messageStore.messages.slice(messageIdx + 1),
                        ],
                    },
                    ...state.messageStores.slice(idx + 1),
                ],
            };
        }

        return state;
    })
);
