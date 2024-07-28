import { LastMessage } from '../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb';
import { IUser } from './auth';

export interface IChatItem {
  chatId: string;
  title: string;
  avatar?: string | undefined;
  lastMessage: LastMessage;
}