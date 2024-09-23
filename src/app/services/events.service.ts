import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { ChatActions } from "@app/store/chat/chat.actions";
import { MessageActions } from "@app/store/messages/messages.actions";
import { EventsService as KavkaEventsService } from "kavka-core/events/v1/events_connect";
import { AddChat, AddMessage, SubscribeEventsStreamResponse } from "kavka-core/events/v1/events_pb";
import { ConnectivityActions } from "@app/store/connectivity/connectivity.actions";
import { IMessage } from "@app/models/message";
import { ChatService } from "@app/services/chat.service";
import * as ChatSelector from "@store/chat/chat.selectors";
import { take } from "rxjs";
import { ChatType } from "kavka-core/model/chat/v1/chat_pb";
import { MessageService } from "@app/services/message.service";
import * as MessageSelector from "@store/messages/messages.selectors";

@Injectable({ providedIn: "root" })
export class EventsService {
    private store = inject(Store);
    private chatService = inject(ChatService);
    private messageService = inject(MessageService);
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
        } catch {
            this.store.dispatch(ConnectivityActions.set({ online: false }));
            console.warn("[EventsService] Stream terminated");

            setTimeout(() => {
                console.warn("[EventsService] Establishing stream connection...");

                // Refresh data like chats, messages, profile, etc...
                this.chatService.GetUserChats().then(chats => {
                    this.store.dispatch(ChatActions.set({ chats }));
                });

                this.store
                    .select(ChatSelector.selectActiveChat)
                    .pipe(take(1))
                    .subscribe(activeChat => {
                        if (activeChat.chat.chatType != ChatType.DIRECT) {
                            this.chatService.GetChat(activeChat.chat.chatId).then(chat => {
                                this.store.dispatch(
                                    ChatActions.setActiveChat({ chat: chat, isChatCreated: true })
                                );
                            });
                        } else {
                            this.chatService.GetDirectChat(activeChat.chat.chatId).then(chat => {
                                this.store.dispatch(
                                    ChatActions.setActiveChat({ chat: chat, isChatCreated: true })
                                );
                            });
                        }

                        this.messageService.FetchMessages(activeChat.chat.chatId).then(messages => {
                            this.store.dispatch(
                                MessageActions.set({
                                    chatId: activeChat.chat.chatId,
                                    messagesList: messages,
                                })
                            );
                        });
                    });

                this.SubscribeEventsStream();
            }, 2500);
        }
    }

    addMessage(ie: SubscribeEventsStreamResponse) {
        const event = ie.payload.value as AddMessage;
        const chatId = event.chatId;
        const message = event.message as IMessage;

        this.store.dispatch(
            MessageActions.add({
                chatId,
                message,
            })
        );

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
