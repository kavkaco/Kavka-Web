export function GetErrorMessage(e: Error): string {
    return e.message.split("] ")[1]?.trim() || "";
}
