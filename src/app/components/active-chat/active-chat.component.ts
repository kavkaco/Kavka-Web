import {
    Component,
    ElementRef,
    HostListener,
    inject,
    Input,
    ViewChild,
    OnInit,
    AfterViewInit,
    OnChanges,
    AfterContentInit,
} from "@angular/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { AutoGrowingInputDirective } from "@directives/auto-growing-input.directive";
import { FormsModule } from "@angular/forms";
import { MessageBubbleComponent } from "@components/message-bubble/message-bubble.component";
import * as MessageSelector from "@store/messages/messages.selectors";
import { MessageService } from "@app/services/message.service";
import { MessageActions } from "@app/store/messages/messages.actions";
import { Store } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import {
    ChannelChatDetail,
    Chat,
    ChatType,
    GroupChatDetail,
} from "kavka-core/model/chat/v1/chat_pb";
import { Message } from "kavka-core/model/message/v1/message_pb";
import { ChatService } from "@app/services/chat.service";
import { User } from "kavka-core/model/user/v1/user_pb";
import { getChatTypeString } from "@app/models/chat";
import { IMessage } from "@app/models/message";

@Component({
    selector: "app-active-chat",
    standalone: true,
    imports: [NgScrollbarModule, AutoGrowingInputDirective, FormsModule, MessageBubbleComponent],
    templateUrl: "./active-chat.component.html",
    styleUrl: "./active-chat.component.scss",
})
export class ActiveChatComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit {
    private store = inject(Store);
    private messageService = inject(MessageService);
    private chatService = inject(ChatService);

    @Input() activeUser: User;
    @Input() activeChat: Chat;
    @ViewChild("messagesScrollbar") messagesScrollbarRef: ElementRef;
    @ViewChild("messageContextMenu") messageContextMenuRef: ElementRef;

    // Active chat extra detail
    chatTypeString: string;
    textInput = "";
    title = "";
    username = "";
    description = "";
    membersCount?: number | undefined;
    online?: boolean | undefined;
    avatar: string | undefined;
    messages: IMessage[];
    selectedMessages = [] as string[];
    inputSectionStatus: {
        show: boolean;
        joined: boolean;
    };
    isLoading = true;

    showMessageContextMenu = false;
    selectedMessageCaption: string | null;

    isMessageSelected(messageId: string) {
        return this.selectedMessages.includes(messageId);
    }

    copySelectedMessageCaption() {
        navigator.clipboard.writeText(this.selectedMessageCaption || "").then(() => {
            console.log("[ActiveChat] Message Caption Copied");
        });
    }

    toggleSelectMessage(event: MouseEvent, messageId: string) {
        event.preventDefault();
        if (!this.selectedMessages.includes(messageId)) {
            this.selectedMessages.push(messageId);
            return;
        }

        this.selectedMessages = this.selectedMessages.filter(
            _messageId => _messageId !== messageId
        );
    }

    openMessageContextMenu(event: MouseEvent, messageId: string) {
        event.preventDefault();
        const el = this.messageContextMenuRef.nativeElement as HTMLElement;
        const menuRect = el.getBoundingClientRect();

        el.style.top = event.clientY - menuRect.height + "px";
        el.style.left = event.clientX + "px";

        const message = this.messages.find(_message => _message.messageId === messageId);
        if (message !== undefined) {
            this.selectedMessageCaption = message.payload.value.text.trim();
            this.showMessageContextMenu = true;

            return;
        }

        this.showMessageContextMenu = false;
    }

    closeMessageContextMenu() {
        this.showMessageContextMenu = false;
    }

    ngOnInit() {
        this.inputSectionStatus = {
            show: false,
            joined: false,
        };
    }

    ngOnChanges() {
        this.prepareActiveChat();
    }

    ngAfterContentInit() {
        this.prepareActiveChat();
    }

    ngAfterViewInit() {
        this.scrollToBottom(this.messagesScrollbarRef);
    }

    prepareActiveChat() {
        // Fetch messages from store or if it not exists in the local store
        // we need to call a rpc unary from the server to get them!
        this.store
            .select(MessageSelector.selectChatMessages(this.activeChat.chatId))
            .subscribe(async _messages => {
                // Load messages from local store
                if (_messages) {
                    this.messages = _messages;
                    this.scrollToBottomAfterGettingNewMessage();
                    this.isLoading = false;
                    return;
                }

                this.isLoading = true;
                // The message are not accessible form the local and here we do unary call
                await this.messageService
                    .FetchMessages(this.activeChat.chatId)
                    .then(fetchedMessages => {
                        this.messages = fetchedMessages;

                        this.messages.forEach(message => {
                            message.sent = true;
                        });

                        this.store.dispatch(
                            MessageActions.set({
                                chatId: this.activeChat.chatId,
                                messagesList: fetchedMessages,
                            })
                        );

                        this.scrollToBottomAfterGettingNewMessage();
                        this.isLoading = false;
                    });
            });

        this.chatTypeString = getChatTypeString(this.activeChat.chatType);

        this.setLocalChatDetail();
        this.setInputSectionStatus();
        console.log("[ActiveChat] Chat Loaded");
    }

    submitJoinChat() {
        this.chatService.JoinChat(this.activeChat.chatId).then(chat => {
            this.activeChat = chat;
            this.store.dispatch(ChatActions.add({ chat }));
            this.setInputSectionStatus();

            console.log(this.inputSectionStatus);
        });
    }

    isScrollAtBottom(elRef: ElementRef) {
        if (elRef) {
            const el = elRef.nativeElement as HTMLElement;
            return el.scrollTop + el.clientHeight >= el.scrollHeight;
        }

        return false;
    }

    scrollToBottom(elRef: ElementRef) {
        setTimeout(() => {
            if (elRef && elRef.nativeElement) {
                const el = elRef.nativeElement as HTMLElement;
                el.scrollTop = el.scrollHeight;
            }
        }, 100);
    }

    scrollToBottomAfterGettingNewMessage() {
        if (this.isScrollAtBottom(this.messagesScrollbarRef)) {
            this.scrollToBottom(this.messagesScrollbarRef);
        }
    }

    setInputSectionStatus() {
        if (this.activeChat.chatType === ChatType.CHANNEL) {
            const channelDetail = this.activeChat.chatDetail.chatDetailType
                .value as unknown as ChannelChatDetail;

            if (channelDetail.admins.includes(this.activeUser.userId)) {
                this.inputSectionStatus = {
                    joined: true,
                    show: true,
                };
            } else {
                if (channelDetail.members.includes(this.activeUser.userId)) {
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
        }
        if (this.activeChat.chatType === ChatType.GROUP) {
            const groupDetail = this.activeChat.chatDetail.chatDetailType.value as GroupChatDetail;
            if (groupDetail.members.includes(this.activeUser.userId)) {
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
        }
    }

    setLocalChatDetail() {
        if (this.activeChat.chatType == ChatType.CHANNEL) {
            const channelDetail = this.activeChat.chatDetail.chatDetailType
                .value as ChannelChatDetail;
            this.title = channelDetail.title;
            this.username = channelDetail.username;
            this.membersCount = channelDetail.members.length;
            this.description = channelDetail.description;
        } else if (this.activeChat.chatType == ChatType.GROUP) {
            const groupDetail = this.activeChat.chatDetail.chatDetailType.value as GroupChatDetail;
            this.title = groupDetail.title;
            this.username = groupDetail.username;
            this.membersCount = groupDetail.members.length;
            this.description = groupDetail.description;
        }
    }

    submitSendTextMessage() {
        this.messageService
            .SendTextMessage(this.activeChat.chatId, this.textInput.trim())
            .then((message: IMessage) => {
                message.sent = false;

                this.store.dispatch(
                    MessageActions.add({
                        chatId: this.activeChat.chatId,
                        message,
                    })
                );
                this.textInput = "";
                this.scrollToBottom(this.messagesScrollbarRef);

                console.log("sent");
            });
    }

    submitCloseChat() {
        this.store.dispatch(ChatActions.removeActiveChat());
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key == "Enter") {
            this.submitSendTextMessage();
        }
    }
}
