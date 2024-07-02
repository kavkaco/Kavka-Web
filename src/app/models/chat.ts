import { IUser } from './auth';
import { ILastMessage } from './message';

export interface IChatItem {
  isActive: boolean;
  chatId: string;
  title: string;
  avatar: string | undefined;
  lastMessageType: string;
  lastMessageCaption?: string;
}

// FIXME - remove this
export interface IActiveChat {
  chatId: string;
}

export interface IChat {
  chatId: string;
  chatType: string;
  chatDetail: ChatDetail;
  lastMessageType: ILastMessage;
}

enum ChatDetail {
  ChatDetail_Channel,
  ChatDetail_Group,
  ChatDetail_Direct,
}

export interface ChatDetail_Channel {
  title: string;
  members: IUser[];
  admins: IUser[];
  removedUsers: IUser[];
  owner: string;
  username: string;
  description: string;
}

export interface ChatDetail_Group {
  title: string;
  members: IUser[];
  admins: IUser[];
  removedUsers: IUser[];
  owner: string;
  username: string;
  description: string;
}
export interface ChatDetail_Direct {
  userInfo: IUser;
}
