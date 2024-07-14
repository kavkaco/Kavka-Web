import { IUser } from './auth';
import { ILastMessage } from './message';

export interface IChatItem {
  chatId: string;
  title: string;
  avatar?: string | undefined;
  lastMessage: ILastMessage;
}

export interface IChat {
  chatId: string;
  chatType: ChatType;
  chatDetail: ChatDetail_Channel | ChatDetail_Group | ChatDetail_Direct;
  lastMessage: ILastMessage;
  avatar?: string | undefined;
}

export enum ChatType {
  Channel,
  Group,
  Direct,
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
