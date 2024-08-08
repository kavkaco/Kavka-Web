export enum MessageType {
    Text,
    Image,
    Voice,
    File,
    Sticker,
}

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
