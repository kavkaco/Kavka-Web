export interface IChatItem {
    isActive: boolean
    chatId: string
    title: string
    avatar: string | undefined
    lastMessageType: string
    lastMessageCaption?: string
}

export interface IActiveChat {
    chatId: string;
}