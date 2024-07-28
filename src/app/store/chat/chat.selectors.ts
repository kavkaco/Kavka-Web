import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '@app/store/chat/chat.reducers';
import { IChatItem } from '@app/models/chat';
import { MessageType } from '@app/models/message';
import { ChannelChatDetail, Chat, ChatDetail, ChatType, DirectChatDetail, GroupChatDetail } from '../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectActiveChat = createSelector(
    selectChatState,
    (state: ChatState) => {
        return state.chats.find((_chat) => _chat.chatId === state.activeChat)
    }
);

export const selectChats = createSelector(
    selectChatState,
    (state: ChatState) => {
        return state.chats
    }
);
