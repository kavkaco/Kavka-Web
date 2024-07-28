import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import { MessageService as KavkaMessageService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/message/message_connect';
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { Message } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/model/message/v1/message_pb";

@Injectable({ providedIn: 'root' })
export class MessageService {
    private store = inject(Store)
    private client: PromiseClient<typeof KavkaMessageService>;

    constructor() {
        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaMessageService, transport);
    }

    FetchMessages(chatId: string) {
        return new Promise<Message[]>((resolve, reject) => {
            this.client.fetchMessages({ chatId }).then((response) => {
                resolve(response.messages as Message[])
            }).catch((e: Error) => {
                console.error("[MessageService][FetchMessages] Unable to load chat messages: " + e.message);

                reject(undefined)
            })
        })
    }
}

