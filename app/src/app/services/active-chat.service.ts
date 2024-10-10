import { ActiveChat, getChatTypeString } from "@app/models/chat";
import { Store } from "@ngrx/store";
import {
    ChannelChatDetail,
    Chat,
    ChatType,
    DirectChatDetail,
    GroupChatDetail,
} from "kavka-core/model/chat/v1/chat_pb";
import * as MessageSelector from "@store/messages/messages.selectors";
import * as AuthSelector from "@store/auth/auth.selectors";
import { MessageActions } from "@app/store/messages/messages.actions";
import { MessageService } from "@app/services/message.service";
import { take } from "rxjs";

export class ActiveChatService extends ActiveChat {
    constructor(
        private store: Store,
        private messageService: MessageService
    ) {
        super();
    }

    Load(chat: Chat) {
        if (chat === undefined) {
            console.error("[ActiveChatService] empty active chat constructed");

            return;
        }

        this.chatTypeString = getChatTypeString(chat.chatType);
        this.messages = [];

        // Fetch messages from store or if it not exists in the local store
        // we need to call a rpc unary from the server to get them!
        this.store
            .select(MessageSelector.selectChatMessages(chat.chatId))
            .subscribe(async _messages => {
                // Load messages from local store
                if (_messages) {
                    this.messages = _messages;
                    this.isLoading = false;
                    return;
                }

                this.isLoading = true;
                // The message are not accessible form the local and here we do unary call
                await this.messageService.FetchMessages(chat.chatId).then(fetchedMessages => {
                    this.messages = fetchedMessages;

                    this.store.dispatch(
                        MessageActions.set({
                            chatId: chat.chatId,
                            messagesList: fetchedMessages,
                        })
                    );

                    this.isLoading = false;
                });
            });

        if (chat.chatType == ChatType.CHANNEL) {
            const channelDetail = chat.chatDetail.chatDetailType.value as ChannelChatDetail;
            this.title = channelDetail.title;
            this.username = channelDetail.username;
            this.membersCount = channelDetail.members.length;
            this.description = channelDetail.description;
        } else if (chat.chatType == ChatType.GROUP) {
            const groupDetail = chat.chatDetail.chatDetailType.value as GroupChatDetail;
            this.title = groupDetail.title;
            this.username = groupDetail.username;
            this.membersCount = groupDetail.members.length;
            this.description = groupDetail.description;
        } else if (chat.chatType == ChatType.DIRECT) {
            const directDetail = chat.chatDetail.chatDetailType.value as DirectChatDetail;
            this.title = directDetail.recipient.name + " " + directDetail.recipient.lastName;
            this.username = directDetail.recipient.username;
            this.online = false;
            this.description = directDetail.recipient.biography;
        }

        this.isLoading = false;
    }

    setInputSectionStatus(activeChat: Chat) {
        this.store
            .select(AuthSelector.selectActiveUser)
            .pipe(take(1))
            .subscribe(activeUser => {
                const userId = activeUser.userId;

                if (activeChat.chatType === ChatType.CHANNEL) {
                    const channelDetail = activeChat.chatDetail.chatDetailType
                        .value as unknown as ChannelChatDetail;

                    if (channelDetail.admins.includes(userId)) {
                        this.inputSectionStatus = {
                            joined: true,
                            show: true,
                        };
                    } else {
                        if (channelDetail.members.includes(userId)) {
                            this.inputSectionStatus = {
                                joined: true,
                                show: false,
                            };
                        } else {
                            this.inputSectionStatus = {
                                joined: false,
                                show: false,
                            };
                        }
                    }
                } else if (activeChat.chatType === ChatType.GROUP) {
                    const groupDetail = activeChat.chatDetail.chatDetailType
                        .value as GroupChatDetail;
                    if (groupDetail.members.includes(userId)) {
                        this.inputSectionStatus = {
                            show: true,
                            joined: true,
                        };
                    } else {
                        this.inputSectionStatus = {
                            show: false,
                            joined: false,
                        };
                    }
                } else if (activeChat.chatType == ChatType.DIRECT) {
                    this.inputSectionStatus = {
                        show: true,
                        joined: true,
                    };
                }
            });
    }
}
