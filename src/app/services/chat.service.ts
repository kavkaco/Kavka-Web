import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors"
import { ChatService as KavkaChatService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_connect';
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { CreateChannelResponse } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_pb";
import { Chat, ChatType } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";

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
        return new Promise<Chat[]>((resolve, reject) => {
            const userId = this.activeUser.userId;
            this.client.getUserChats({ userId }).then((response) => {
                console.log("[ChatService] User chats loaded");

                resolve(response.chats)
            }).catch(() => reject)
        })
    }

    CreateChannel(title: string, username: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client.createChannel({ title, username }).then((response) => {
                resolve(response.chat);
            }).catch(() => reject)
        })
    }
}

