import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors"
import { ChatService as KavkaChatService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_connect';
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { IChat } from "@app/models/chat";
import { CreateChannelResponse } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_pb";
import { ChannelChatDetail, ChatType, GroupChatDetail } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";

@Injectable({ providedIn: 'root' })
export class ChatService {
    private store = inject(Store)
    private activeUser: IUser | undefined;
    private client: PromiseClient<typeof KavkaChatService>;

    constructor() {
        this.store.select(AuthSelector.selectActiveUser).subscribe((user) => {
            this.activeUser = user;
        })

        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaChatService, transport);
    }

    GetUserChats() {
        return new Promise<IChat[]>((resolve, reject) => {
            const userId = this.activeUser.userId;
            this.client.getUserChats({ userId }).then((response) => {
                console.log("[ChatService] User chats loaded");

                resolve(response.chats as any)
            }).catch(() => reject)
        })
    }

    CreateChannel(title: string, username: string) {
        return new Promise<IChat>((resolve, reject) => {
            this.client.createChannel({ title, username }).then((response) => {
                resolve(this.transformGrpcChatToLocalModel(response));
            }).catch(() => reject)
        })
    }

    transformGrpcChatToLocalModel(protoModel: CreateChannelResponse) {
        const model: IChat = {
            chatId: protoModel.chat.chatId,
            chatType: protoModel.chat.chatType.toString(),
            chatDetail: null,
            avatar: null,
            lastMessage: protoModel.chat.lastMessage as any,
        }

        switch (protoModel.chat.chatType) {
            case ChatType.CHANNEL:
                model.chatDetail = (protoModel.chat.chatDetail as any).channelChatDetail
                break;
            case ChatType.GROUP:
                model.chatDetail = (protoModel.chat.chatDetail as any).groupChatDetail
                break;
            case ChatType.DIRECT:
                model.chatDetail = (protoModel.chat.chatDetail as any).directChatDetail
                break;
            default:
                break;
        }

        return model
    }
}



// const chats = this.client.getUserChats({ userId })

// for await (const chat of chats) {
//     console.log(chat);
// }