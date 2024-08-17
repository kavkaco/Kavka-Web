import { inject, Injectable, signal } from "@angular/core";
import { Store } from "@ngrx/store";
import { CallOptions, createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { ChatActions } from "@app/store/chat/chat.actions";
import { MessageActions } from "@app/store/messages/messages.actions";
import { EventsService as KavkaEventsService } from "kavka-core/events/v1/events_connect";
import { AddChat, AddMessage, SubscribeEventsStreamResponse } from "kavka-core/events/v1/events_pb";
import { ConnectivityActions } from "@app/store/connectivity/connectivity.actions";

@Injectable({ providedIn: "root" })
export class EventsService {
    private store = inject(Store);
    private client: PromiseClient<typeof KavkaEventsService>;

    constructor() {
        const transport = inject(GrpcTransportService).transport;
        this.client = createPromiseClient(KavkaEventsService, transport);
    }

    async SubscribeEventsStream() {
        const events = this.client.subscribeEventsStream({});

        try {
            this.store.dispatch(ConnectivityActions.set({ online: true }));
            for await (const event of events) {
                console.log(event.name, event.payload);

                switch (event.name) {
                    case "add-chat":
                        this.addChat(event);
                        break;
                    case "add-message":
                        this.addMessage(event);
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            this.store.dispatch(ConnectivityActions.set({ online: false }));
            console.error("[EventsService] Stream terminated");
            console.error("[EventsService] Stream Getting ready to establish stream again");

            setTimeout(() => {
                console.error("[EventsService] Establishing stream connection...");
                this.SubscribeEventsStream();
            }, 2500);
        }
    }

    addMessage(ie: SubscribeEventsStreamResponse) {
        const event = ie.payload.value as AddMessage;
        const message = event.message;
        const chatId = event.chatId;

        this.store.dispatch(MessageActions.add({ chatId, message }));

        // Update last message of the chat
        this.store.dispatch(
            ChatActions.update({
                chatId,
                changes: {
                    lastMessage: {
                        messageType: message.type,
                        messageCaption: message.payload.value.text,
                    } as any,
                },
            } as any)
        );
    }

    addChat(ie: SubscribeEventsStreamResponse) {
        const chat = (ie.payload.value as AddChat).chat;

        this.store.dispatch(ChatActions.add({ chat }));
    }
}
