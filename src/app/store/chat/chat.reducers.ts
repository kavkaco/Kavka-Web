import { createReducer, on } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import { Chat } from "../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";
export interface ChatState {
    activeChats: string[];
    chats: Chat[];
}

const initialState: ChatState = {
    activeChats: [],
    chats: [],
};

export const chatReducer = createReducer(
    initialState,
    on(ChatActions.setActiveChat, (state, { chatId }) => {
        // Check duplicate
        if (state.activeChats.includes(chatId)) {
            return state
        }

        return {
            ...state,
            activeChats: [
                ...state.activeChats,
                chatId
            ]
        }
    }),
    on(ChatActions.removeActiveChat, (state, { }) => {
        const _activeChats = state.activeChats.slice(0, -1);
        return {
            ...state,
            activeChats: _activeChats
        }
    })
);
