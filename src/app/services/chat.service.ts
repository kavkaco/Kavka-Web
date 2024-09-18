import { inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors";
import { ConnectError, createPromiseClient, PromiseClient } from "@connectrpc/connect";
import { GrpcTransportService } from "@app/services/grpc-transport.service";
import { Chat, ChatDetail, ChatType, DirectChatDetail } from "kavka-core/model/chat/v1/chat_pb";
import { ChatService as KavkaChatService } from "kavka-core/chat/v1/chat_connect";
import { User } from "kavka-core/model/user/v1/user_pb";
import * as ChatSelector from "@store/chat/chat.selectors";
import { take } from "rxjs";
import { ChatActions } from "@app/store/chat/chat.actions";
import { convertChatsToChatItems, IChatItem } from "@app/models/chat";
import {
    PlainMessage,
    BinaryReadOptions,
    JsonValue,
    JsonReadOptions,
    BinaryWriteOptions,
    JsonWriteOptions,
    JsonWriteStringOptions,
    MessageType,
} from "@bufbuild/protobuf";

export class ChatNotFoundError extends Error {
    constructor() {
        super();
        this.message = "ChatNotFound";
    }
}

@Injectable({ providedIn: "root" })
export class ChatService {
    private store = inject(Store);
    private activeUser: User | undefined;
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

    GetDirectChat(recipientUserId: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .getDirectChat({ recipientUserId })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: ConnectError) => {
                    if (e.message == "[not_found] not found") {
                        reject(new ChatNotFoundError());
                        return;
                    }

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

    CreateDirect(recipientUserId: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .createDirect({ recipientUserId })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] CreateDirect", e.message);
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

    JoinChat(chatId: string) {
        return new Promise<Chat>((resolve, reject) => {
            this.client
                .joinChat({ chatId })
                .then(response => {
                    resolve(response.chat);
                })
                .catch((e: Error) => {
                    console.error("[ChatService] JoinChat", e.message);
                    reject(e);
                });
        });
    }

    activateChat(chatId: string) {
        this.store
            .select(ChatSelector.selectChat(chatId))
            .pipe(take(1))
            .subscribe(chat => {
                this.store.dispatch(ChatActions.setActiveChat({ chat }));
            });
    }

    // Check if the chat does not exists in the local chats
    // we prepare to fetch the chat from the back-end and add to store
    activateUncreatedChat(item: IChatItem, usersCollection: User[]) {
        const chatId = item.chatId;
        const chatType = item.chatType;

        this.store
            .select(ChatSelector.selectChats)
            .pipe(take(1))
            .subscribe(localChats => {
                const chatIdx = localChats.findIndex(_chat => _chat.chatId === chatId);
                if (chatIdx !== -1) {
                    // exist
                    this.activateChat(chatId);
                }

                if (chatType == ChatType.DIRECT) {
                    const recipientUserId = item.metadata.recipientUserId || "";

                    this.GetDirectChat(recipientUserId)
                        .then(fetchedChat => {
                            this.store.dispatch(ChatActions.setActiveChat({ chat: fetchedChat }));
                        })
                        .catch(e => {
                            if (e instanceof ChatNotFoundError) {
                                const foundUser = usersCollection.find(
                                    _user => _user.userId === recipientUserId
                                );

                                if (foundUser) {
                                    const chat: any = {
                                        chatId: undefined,
                                        chatType: ChatType.DIRECT,
                                        chatDetail: new ChatDetail({
                                            chatDetailType: {
                                                case: "directDetail",
                                                value: new DirectChatDetail({
                                                    recipient: foundUser,
                                                }),
                                            },
                                        }),
                                    };

                                    this.store.dispatch(ChatActions.setActiveChat({ chat }));
                                }
                            }
                        });
                } else {
                    this.GetChat(chatId).then(fetchedChat => {
                        this.store.dispatch(ChatActions.setActiveChat({ chat: fetchedChat }));
                    });
                }
            });
    }

    // This method is used to merge users and chats collection from difference source and cast all to ChatItems model
    mergeChatItems(chatsCollection: Chat[], usersCollection: User[]) {
        return new Promise<IChatItem[]>(resolve => {
            const finalChatItems: IChatItem[] = [];

            this.store
                .select(ChatSelector.selectChats)
                .pipe(take(1))
                .subscribe(async localChats => {
                    await chatsCollection.forEach(chat => {
                        const alreadyExistIdx = finalChatItems.findIndex(
                            _chat => _chat.chatId === chat.chatId
                        );

                        // Add to list if it does not exist in local chat items
                        if (alreadyExistIdx === -1) {
                            finalChatItems.push(convertChatsToChatItems([chat])[0]);
                        }
                    });

                    await usersCollection.forEach(user => {
                        const alreadyExistIdx = localChats.findIndex(_chat => {
                            const chatDetail = _chat.chatDetail.chatDetailType
                                .value as DirectChatDetail;

                            if (chatDetail.recipient && user.userId) {
                                return chatDetail.recipient.userId === user.userId;
                            }

                            return false;
                        });
                        if (alreadyExistIdx === -1) {
                            finalChatItems.push({
                                chatType: ChatType.DIRECT,
                                metadata: {
                                    recipientUserId: user.userId,
                                },
                                chatId: undefined,
                                title: user.name + " " + user.lastName,
                                lastMessage: undefined,
                            });
                        }
                    });
                });

            resolve(finalChatItems);
        });
    }
}
