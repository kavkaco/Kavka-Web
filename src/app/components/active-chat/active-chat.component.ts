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
    AfterContentChecked,
    AfterContentInit,
} from "@angular/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { AutoGrowingInputDirective } from "@directives/auto-growing-input.directive";
import { FormsModule } from "@angular/forms";
import { MessageBubbleComponent } from "@components/message-bubble/message-bubble.component";
import * as MessageSelector from "@store/messages/messages.selectors";
import { MessageService } from "@app/services/message.service";
import { MessageActions } from "@app/store/messages/messages.actions";
import { IUser } from "@app/models/auth";
import { Store } from "@ngrx/store";
import * as AuthSelector from "@store/auth/auth.selectors";
import { take } from "rxjs";
import { ChatActions } from "@app/store/chat/chat.actions";
import {
    ChannelChatDetail,
    Chat,
    ChatType,
    GroupChatDetail,
} from "kavka-core/model/chat/v1/chat_pb";
import { Message } from "kavka-core/model/message/v1/message_pb";

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

    textInput = "";
    activeUser: IUser;
    @Input() activeChat: Chat;
    @ViewChild("messagesScrollbar") messagesScrollbarRef: ElementRef;
    isLoading = true;

    title = "";
    username = "";
    description = "";
    membersCount?: number | undefined;
    online?: boolean | undefined;
    avatar: string | undefined;
    messages: Message[];

    inputSectionStatus: {
        show: boolean;
        joined: boolean;
    };

    ngOnInit() {
        this.inputSectionStatus = {
            show: false,
            joined: false,
        };

        this.store
            .select(AuthSelector.selectActiveUser)
            .pipe(take(1))
            .subscribe(activeUser => {
                this.activeUser = activeUser;
            });
    }

    ngOnChanges() {
        this.isLoading = true;

        // Fetch messages from store or if it not exists in the local store
        // we need to call a rpc unary from the server to get them!
        this.store
            .select(MessageSelector.selectChatMessages(this.activeChat.chatId))
            .subscribe(async _messages => {
                // Load messages from local store
                if (_messages) {
                    this.messages = _messages;
                    this.scrollToBottomAfterGettingNewMessage();
                    return;
                }

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
                    });
            });

        this.setLocalChatDetail();

        setTimeout(() => {
            this.isLoading = false;
        }, 100);
    }

    ngAfterContentInit() {
        this.setInputSectionStatus();
    }

    ngAfterViewInit() {
        this.scrollToBottom(this.messagesScrollbarRef);
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
        switch (this.activeChat.chatType) {
            case ChatType.CHANNEL:
                const channelDetail = this.activeChat.chatDetail.chatDetailType
                    .value as ChannelChatDetail;

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
                break;
            case ChatType.GROUP:
                const groupDetail = this.activeChat.chatDetail.chatDetailType
                    .value as GroupChatDetail;
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
                break;
        }
    }

    setLocalChatDetail() {
        switch (this.activeChat.chatType) {
            case ChatType.CHANNEL:
                const channelDetail = this.activeChat.chatDetail.chatDetailType
                    .value as ChannelChatDetail;
                this.title = channelDetail.title;
                this.username = channelDetail.username;
                this.membersCount = channelDetail.members.length;
                this.description = channelDetail.description;
                break;
            case ChatType.GROUP:
                const groupDetail = this.activeChat.chatDetail.chatDetailType
                    .value as GroupChatDetail;
                this.title = groupDetail.title;
                this.username = groupDetail.username;
                this.membersCount = groupDetail.members.length;
                this.description = groupDetail.description;
                break;
        }
    }

    submitSendTextMessage() {
        this.messageService
            .SendTextMessage(this.activeChat.chatId, this.textInput.trim())
            .then(() => {
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
