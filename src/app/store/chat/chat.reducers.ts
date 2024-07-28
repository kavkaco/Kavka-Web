import { createReducer, on } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import { Chat } from "../../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";
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
        const chatIndex = state.chats.findIndex((_chat) => _chat.chatId === chatId);

        if (chatIndex == -1) {
            return state;
        }

        return {
            ...state,
            activeChat: chatId
        }
    }),
    on(ChatActions.removeActiveChat, (state, { }) => {
        return {
            ...state,
            activeChat: null
        }
    }),
    on(ChatActions.set, (state, { chats }) => {
        return {
            ...state,
            chats
        }
    })
);
