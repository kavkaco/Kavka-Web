import { inject, Injectable } from "@angular/core";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { MessageService as KavkaMessageService } from "kavka-core/message/message_connect";
import { Message } from "kavka-core/model/message/v1/message_pb";

@Injectable({ providedIn: "root" })
export class MessageService {
    private client: PromiseClient<typeof KavkaMessageService>;

    constructor() {
        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaMessageService, transport);
    }

    FetchMessages(chatId: string) {
        return new Promise<Message[]>((resolve, reject) => {
            this.client
                .fetchMessages({ chatId })
                .then(response => {
                    resolve(response.messages as Message[]);
                })
                .catch((e: Error) => {
                    console.error(
                        "[MessageService][FetchMessages] Unable to load chat messages: " + e.message
                    );

                    reject(undefined);
                });
        });
    }

    SendTextMessage(chatId: string, text: string) {
        return new Promise((resolve, reject) => {
            this.client
                .sendTextMessage({ chatId, text })
                .then(response => {
                    resolve(response.message);
                    return;
                })
                .catch((e: Error) => {
                    console.error("[MessageService][SendTextMessage] " + e.message);
                    reject();
                });
        });
    }
}
