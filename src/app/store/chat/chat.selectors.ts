import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '@app/store/chat/chat.reducers';
import { IChatItem } from '@app/models/chat';
import { MessageType } from '@app/models/message';
import { ChannelChatDetail, Chat, ChatDetail, ChatType, DirectChatDetail, GroupChatDetail } from '../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';

export const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectLastActiveChat = createSelector(
    selectChatState,
    (state: ChatState) => {
        return state.chats.filter(
            (_chat) => _chat.chatId === state.activeChats[0]
        )[0];
    }
);

export const selectActiveChats = createSelector(
    selectChatState,
    (state: ChatState) => {
        return state.activeChats
    }
);

export const selectChats = createSelector(
    selectChatState,
    (state: ChatState) => {
        return state.chats
    }
);

export const selectChatItems = createSelector(
    selectChats,
    (chats) => {
        return chats.map((chat: Chat) => {
            let title: string;

            switch (chat.chatType) {
                case ChatType.CHANNEL:
                    title = (chat.chatDetail.chatDetailType.value as ChannelChatDetail).title
                    break;
                case ChatType.GROUP:
                    title = (chat.chatDetail.chatDetailType.value as GroupChatDetail).title
                    break;
                // FIXME
                // case ChatType.DIRECT: //
                //     const userInfo = ((chat.chatDetail) as DirectChatDetail).
                //     title = `${userInfo.name} ${userInfo.lastName}`
                //     break;
                default:
                    title = ""
                    break;
            }

            return {
                chatId: chat.chatId,
                lastMessage: chat.lastMessage,
                title: title,
                // avatar: chat.avatar
            }
        }) as IChatItem[]
    }
);

