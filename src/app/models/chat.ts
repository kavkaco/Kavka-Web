import { IUser } from "./auth";

import {
    ChannelChatDetail,
    Chat,
    ChatType,
    GroupChatDetail,
    LastMessage,
} from "kavka-core/model/chat/v1/chat_pb";

export interface IChatItem {
    chatId: string;
    title: string;
    avatar?: string | undefined;
    lastMessage: LastMessage;
}

export function getChatTypeString(chatType: ChatType): string {
    let chatTypeString = "";

    switch (chatType) {
        case ChatType.CHANNEL:
            chatTypeString = "channel";
            break;
        case ChatType.GROUP:
            chatTypeString = "group";
            break;
        case ChatType.DIRECT:
            chatTypeString = "direct";
            break;
    }

    return chatTypeString;
}

export function convertChatsToChatItems(chats: Chat[]): IChatItem[] {
    return chats.map(chat => {
        let title;

        if (chat.chatType == ChatType.CHANNEL) {
            title = (chat.chatDetail.chatDetailType.value as ChannelChatDetail).title;
        } else if (chat.chatType == ChatType.GROUP) {
            title = (chat.chatDetail.chatDetailType.value as GroupChatDetail).title;
        }

        return { chatId: chat.chatId, title, lastMessage: chat.lastMessage };
    }) as IChatItem[];
}
