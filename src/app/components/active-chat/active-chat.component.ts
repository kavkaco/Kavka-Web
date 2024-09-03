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
import { ChatService } from "@app/services/chat.service";
import { User } from "kavka-core/model/user/v1/user_pb";
import { getChatTypeString } from "@app/models/chat";
import { IMessage } from "@app/models/message";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
    selector: "app-active-chat",
    standalone: true,
    imports: [NgScrollbarModule, AutoGrowingInputDirective, FormsModule, MessageBubbleComponent],
    templateUrl: "./active-chat.component.html",
    styleUrl: "./active-chat.component.scss",
    animations: [
        trigger("openClose", [
            state(
                "open",
                style({
                    opacity: 1,
                    marginTop: "0",
                    transform: "scale(1)",
                })
            ),
            state(
                "closed",
                style({
                    opacity: 0,
                    marginTop: "10px",
                    transform: "scale(0.8)",
                })
            ),
            transition("open => closed", [animate("0.08s ease-in")]),
            transition("closed => open", [animate("0.08s ease-out")]),
        ]),
    ],
})
export class ActiveChatComponent implements OnInit, OnChanges, AfterContentInit, AfterViewInit {
    private store = inject(Store);
    private messageService = inject(MessageService);
    private chatService = inject(ChatService);

    @Input() activeUser: User;
    @Input() activeChat: Chat;
    @ViewChild("messagesScrollbar") messagesScrollbarRef: ElementRef;

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

    selectedMessageCaption: string | null;

    @ViewChild("contextMenuRef") contextMenu!: ElementRef;
    showMessageContextMenu = false;

    longClickTimeoutTrigger = 650;
    messageLongClickTimeout: NodeJS.Timeout;

    contextMenuMouseEvent(event: MouseEvent) {
        event.preventDefault();

        if (this.contextMenu) {
            const el = this.contextMenu.nativeElement as HTMLElement;
            const rect = (
                this.messagesScrollbarRef.nativeElement as HTMLElement
            ).getBoundingClientRect();

            const elWidth = el.clientWidth;
            const elHeight = el.clientHeight;

            if (event.clientX > rect.width || event.clientX + elWidth > window.innerWidth) {
                console.log("yes");
                el.style.left = event.clientX - elWidth + "px";
            } else {
                console.log("no");
                console.log(event.clientX);

                el.style.left = event.clientX + "px";
            }

            if (event.clientY + 10 > rect.height) {
                el.style.top = event.clientY - elHeight + "px";
            } else {
                el.style.top = event.clientY + "px";
            }
        }

        this.showMessageContextMenu = true;
    }

    isMessageSelected(messageId: string) {
        return this.selectedMessages.includes(messageId);
    }

    copySelectedMessageCaption() {
        navigator.clipboard.writeText(this.selectedMessageCaption || "").then(() => {
            console.log("[ActiveChat] Message Caption Copied");
        });
    }

    messageMouseDown($event, messageId: string) {
        if (this.showMessageContextMenu == false) {
            if (this.selectedMessages.length == 0) {
                this.messageLongClickTimeout = setTimeout(() => {
                    this.toggleSelectMessage($event, messageId);
                }, this.longClickTimeoutTrigger);
            } else {
                if (this.selectedMessages.length > 0) {
                    this.toggleSelectMessage($event, messageId);
                }
            }
        }
    }

    messageMouseUp() {
        clearTimeout(this.messageLongClickTimeout);
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
                this.store.dispatch(
                    MessageActions.add({
                        chatId: this.activeChat.chatId,
                        message,
                    })
                );
                this.textInput = "";
                this.scrollToBottom(this.messagesScrollbarRef);
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
