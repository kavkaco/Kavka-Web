import { Message } from "kavka-core/model/message/v1/message_pb";

export enum MessageType {
    Text,
    Image,
    Voice,
    File,
    Sticker,
}

export interface IMessage extends Message {}

export function getMessageCreatedAtTimestamp(createdAtBigInt: bigint): string {
    const tsNumber = Number(createdAtBigInt);
    const date = new Date(tsNumber);

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().locale;

    const timeString = date.toLocaleTimeString(userTimezone, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return timeString;
}
