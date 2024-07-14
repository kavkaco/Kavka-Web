import { IChat, IChatItem } from "@app/models/chat";
import { ChatActions } from "@app/store/chat/chat.actions";
import { createReducer, on } from "@ngrx/store";

export interface ChatState {
    activeChats: string[];
    chats: IChat[];
    chatItems: IChatItem[];
}

const initialState: ChatState = {
    activeChats: [],
    chats: [],
    chatItems: []
};

export const chatReducer = createReducer(
    initialState,
    // on(ChatActions.add, (state, { chats }) => {
    //     state.chats.push(chats)
    // })
);
