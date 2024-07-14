import { ChatType, IChat } from "@app/models/chat";
import { createReducer, on } from "@ngrx/store";
import { ILastMessage, MessageType } from "@app/models/message";
import { ChatActions } from "@app/store/chat/chat.actions";
export interface ChatState {
    activeChats: string[];
    chats: IChat[];
}

const initialState: ChatState = {
    activeChats: [],
    chats: [
        {
            chatId: "chat1",
            chatType: ChatType.Channel,
            chatDetail: {
                title: "My Channel Name",
                members: [],
                admins: [],
                removedUsers: [],
                owner: "user123",
                username: "channel_username",
                description: "This is a channel description",
            },
            lastMessage: {
                caption: "Hi!",
                type: MessageType.Text
            } as ILastMessage,
            avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq2q83JcZgPQfNlAnwAJkBJ-eS9OK7UUzJ5Q&s"
        },
    ],
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
