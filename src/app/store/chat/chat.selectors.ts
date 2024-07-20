import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '@app/store/chat/chat.reducers';
import { ChatDetail_Channel, ChatDetail_Direct, ChatDetail_Group, IChat, IChatItem } from '@app/models/chat';
import { MessageType } from '@app/models/message';

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
        return chats.map((chat: IChat) => {
            let title: string;

            switch (chat.chatType) {
                case "channel":
                    title = ((chat.chatDetail) as ChatDetail_Channel).title
                    break;
                case "group":
                    title = ((chat.chatDetail) as ChatDetail_Group).title
                    break;
                case "direct":
                    const userInfo = ((chat.chatDetail) as ChatDetail_Direct).userInfo
                    title = `${userInfo.name} ${userInfo.lastName}`
                    break;
                default:
                    title = "ERROR"
                    break;
            }
            return {
                chatId: chat.chatId,
                lastMessage: chat.lastMessage,
                title: title,
                avatar: chat.avatar
            }
        }) as IChatItem[]
    }
);

