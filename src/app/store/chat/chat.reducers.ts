import { createReducer, on } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import { Chat } from "kavka-core/model/chat/v1/chat_pb";
export interface ChatState {
    activeChat: {
        chat: Chat;
        isChatCreated: boolean;
    } | null;
    chats: Chat[];
}

const initialState: ChatState = {
    activeChat: null,
    chats: [],
};

export const chatReducer = createReducer(
    initialState,
    on(ChatActions.setActiveChat, (state, { chat, isChatCreated }) => {
        return {
            ...state,
            activeChat: {
                chat,
                isChatCreated,
            },
        };
    }),
    on(ChatActions.removeActiveChat, state => {
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
        const idx = state.chats.findIndex(_chat => _chat.chatId == chat.chatId);
        if (idx === -1) {
            // chat does not exist
            return {
                ...state,
                chats: [chat, ...state.chats],
            };
        }

        // chat exists and only left to update it!
        return {
            ...state,
            ...ChatActions.update({
                chatId: chat.chatId,
                changes: { chatDetail: chat.chatDetail, lastMessage: chat.lastMessage },
            }),
        };
    })
);
