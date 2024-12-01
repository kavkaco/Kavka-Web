import { IMessage } from "@app/models/message";
import {
    ChannelChatDetail,
    Chat,
    ChatType,
    GroupChatDetail,
    LastMessage,
    DirectChatDetail,
} from "kavka-core/model/chat/v1/chat_pb";

export abstract class ActiveChat {
    // Chat Itself
    chatTypeString: string = "";
    textInput = "";

    // Chat Info
    title = "";
    username = "";
    description = "";
    avatar: string | undefined;

    // Chat Messages
    messages: IMessage[] = [];
    selectedMessages: string[] = [];

    inputSectionStatus: {
        show: boolean;
        joined: boolean;
    } = {
        joined: false,
        show: false,
    };

    isLoading: boolean = true;

    // Chat Status
    membersCount?: number | undefined;
    online?: boolean | undefined;
}
export interface IChatItem {
    chatType: ChatType;
    metadata?: any; // To carry extra data like recipient user id of direct chats
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
        } else if (chat.chatType == ChatType.DIRECT) {
            const recipient = (chat.chatDetail.chatDetailType.value as DirectChatDetail).recipient;
            title = recipient.name.trim() + " " + recipient.lastName.trim();
        }

        return { chatId: chat.chatId, title, lastMessage: chat.lastMessage };
    }) as IChatItem[];
}
