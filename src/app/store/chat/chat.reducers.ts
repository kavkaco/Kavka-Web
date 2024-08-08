import { createReducer, on } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import { Chat } from "kavka-core/model/chat/v1/chat_pb";
export interface ChatState {
    activeChat: string | null;
    chats: Chat[];
}

const initialState: ChatState = {
    activeChat: null,
    chats: [],
};

export const chatReducer = createReducer(
    initialState,
    on(ChatActions.setActiveChat, (state, { chatId }) => {
        const chatIndex = state.chats.findIndex(_chat => _chat.chatId === chatId);

        if (chatIndex == -1) {
            return state;
        }

        return {
            ...state,
            activeChat: chatId,
        };
    }),
    on(ChatActions.removeActiveChat, (state, {}) => {
        return {
            ...state,
            activeChat: null,
        };
    }),
    on(ChatActions.set, (state, { chats }) => {
        return {
            ...state,
            chats,
        };
    }),
    on(ChatActions.update, (state, { chatId, changes }) => {
        const idx = state.chats.findIndex(_chat => _chat.chatId === chatId);
        if (idx === -1) {
            return state;
        }

        const updatedChat = { ...state.chats[idx], ...changes } as Chat;

        return {
            ...state,
            chats: [...state.chats.slice(0, idx), updatedChat, ...state.chats.slice(idx + 1)],
        };
    }),
    on(ChatActions.add, (state, { chat }) => {
        return {
            ...state,
            chats: [chat, ...state.chats],
        };
    })
);
