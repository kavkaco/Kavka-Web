enum MessageType {
    Text,
    Image,
    Voice,
    File,
    Sticker
}

export interface IMessage {};
export interface ILastMessage {
    type: MessageType,
    caption: string;
};
