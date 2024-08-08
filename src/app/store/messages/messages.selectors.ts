import { createFeatureSelector, createSelector } from "@ngrx/store";
import { MessagesState } from "@app/store/messages/messages.reducers";
import { Message } from "kavka-core/model/message/v1/message_pb";

export const selectMessageState = createFeatureSelector<MessagesState>("message");

export const selectChatMessages = (chatId: string) =>
    createSelector(selectMessageState, (state: MessagesState): Message[] | undefined => {
        const messageStore = state.messageStores.find(
            _messageStore => _messageStore.chatId === chatId
        );

        if (messageStore) {
            return messageStore.messages;
        }

        return undefined;
    });
