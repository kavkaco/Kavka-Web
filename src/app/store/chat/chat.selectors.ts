import { createFeatureSelector, createSelector } from "@ngrx/store";
import { ChatState } from "@app/store/chat/chat.reducers";
import { convertChatsToChatItems, IChatItem } from "@app/models/chat";
import { Chat } from "kavka-core/model/chat/v1/chat_pb";

export const selectChatState = createFeatureSelector<ChatState>("chat");

export const selectActiveChat = createSelector(selectChatState, (state: ChatState) => {
    return state.chats.find(_chat => _chat.chatId === state.activeChat);
});

export const selectChatItems = createSelector(selectChatState, (state: ChatState) => {
    return convertChatsToChatItems(state.chats);
});
export const selectChats = createSelector(selectChatState, (state: ChatState) => {
    return state.chats;
});
