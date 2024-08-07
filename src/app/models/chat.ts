import { ChatType, LastMessage } from '../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';
import { IUser } from './auth';

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