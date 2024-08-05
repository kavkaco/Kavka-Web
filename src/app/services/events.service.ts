import { inject, Injectable } from "@angular/core";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors"
import { EventsService as KavkaEventsService } from '/home/tahadostifam/Code/Kavka-Core/protobuf/gen/es/protobuf/events/v1/events_connect';
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { CreateChannelResponse } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/chat/v1/chat_pb";
import { ChatType } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/model/chat/v1/chat_pb";
import { AddChat, AddMessage, SubscribeEventsStreamResponse } from "../../../../Kavka-Core/protobuf/gen/es/protobuf/events/v1/events_pb";
import { ChatActions } from "@app/store/chat/chat.actions";
import { MessageActions } from "@app/store/messages/messages.actions";

@Injectable({ providedIn: 'root' })
export class EventsService {
    private store = inject(Store)
    private activeUser: IUser | undefined;
    private client: PromiseClient<typeof KavkaEventsService>;

    constructor() {
        this.store.select(AuthSelector.selectActiveUser).subscribe((user) => {
            this.activeUser = user;
        })

        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaEventsService, transport);
    }

    async SubscribeEventsStream() {
        const events = this.client.subscribeEventsStream({})

        for await (const event of events) {
            console.log(event.name, event.payload);

            switch (event.name) {
                // case "add-chat":
                //     this.addChat(event)
                //     break;
                case "add-message":
                    this.addMessage(event)
                    break;
                default:
                    break;
            }
        }
    }

    addMessage(ie: SubscribeEventsStreamResponse) {
        const event = (ie.payload.value as AddMessage);
        const message = event.message;
        const chatId = event.chatId;

        this.store.dispatch(MessageActions.add({ chatId, message }))
    }

    // addChat(ie: SubscribeEventsStreamResponse) {
    //     const chat = (ie.payload.value as AddChat).chat;

    //     // this.store.dispatch(ChatActions.)
    // }
}

