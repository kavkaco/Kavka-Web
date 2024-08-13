import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";

import { Chat } from "kavka-core/model/chat/v1/chat_pb";
import { ChatService as KavkaChatService } from "kavka-core/chat/v1/chat_connect";

@Injectable({ providedIn: "root" })
export class ChatService {
    private store = inject(Store);
    private activeUser: IUser | undefined;
    private client: PromiseClient<typeof KavkaChatService>;

    constructor() {
        this.store.select(AuthSelector.selectActiveUser).subscribe(user => {
            this.activeUser = user;
        });

        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaChatService, transport);
    }

    GetChat(chatId: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .getChat({ chatId })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] GetChat", e.message);
                    reject(e);
                });
        });
    }

    GetUserChats() {
        return new Promise<Chat[]>((resolve, reject) => {
            const userId = this.activeUser.userId;
            this.client
                .getUserChats({ userId })
                .then(response => {
                    console.log("[ChatService] User chats loaded");
                    resolve(response.chats);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] GetUserChats", e.message);
                    reject(e);
                });
        });
    }

    CreateChannel(title: string, username: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .createChannel({ title, username })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] CreateChannel", e.message);
                    reject(e);
                });
        });
    }

    CreateGroup(title: string, username: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .createGroup({ title, username })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] CreateGroup", e.message);
                    reject(e);
                });
        });
    }
}
