import { Message } from "kavka-core/model/message/v1/message_pb";

export enum MessageType {
    Text,
    Image,
    Voice,
    File,
    Sticker,
}

export type IMessage = Message;

export function getMessageCreatedAtTimestamp(createdAtBigInt: bigint): string {
    const date = new Date(Number(createdAtBigInt));

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().locale;

    const timeString = date.toLocaleTimeString(userTimezone, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return timeString;
}
