import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '@app/store/chat/chat.reducers';
import { IChatItem } from '@app/models/chat';
import { MessageType } from '@app/models/message';
import { ChannelChatDetail, Chat, ChatDetail, ChatType, DirectChatDetail, GroupChatDetail } from '../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';
import { MessagesState } from '@app/store/messages/messages.reducers';
import { Message } from '../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/message/v1/message_pb';

export const selectMessageState = createFeatureSelector<MessagesState>('message');

export const selectChatMessages = (chatId: string) => createSelector(
    selectMessageState,
    (state: MessagesState): Message[] | undefined => {
        const messageStore = state.messageStores.find((_messageStore) => _messageStore.chatId === chatId);

        if (messageStore) {
            return messageStore.messages
        }

        return undefined
    }
);
