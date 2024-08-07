import {
    Component,
    ElementRef,
    HostListener,
    inject,
    Input,
    ViewChild,
    OnInit,
    OnChanges,
    AfterViewInit,
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
export class ActiveChatComponent implements OnInit, OnChanges, AfterViewInit, AfterContentInit {
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
    userHasAccessToSendMessage = false;

    ngOnInit() {
        this.store
            .select(AuthSelector.selectActiveUser)
            .pipe(take(1))
            .subscribe(activeUser => {
                this.activeUser = activeUser;
            });
    }

    ngOnChanges() {
        let detail;
        switch (this.activeChat.chatType) {
            case ChatType.CHANNEL:
                detail = this.activeChat.chatDetail.chatDetailType.value as ChannelChatDetail;
                this.title = detail.title;
                this.username = detail.username;
                this.membersCount = detail.members.length;
                this.description = detail.description;
                break;
            case ChatType.GROUP:
                detail = this.activeChat.chatDetail.chatDetailType.value as GroupChatDetail;
                this.title = detail.title;
                this.username = detail.username;
                this.membersCount = detail.members.length;
                this.description = detail.description;
                break;
            default:
                break;
        }

        // Fetch messages from store or if it not exists in the local store
        // we need to call a rpc unary from the server to get them!
        this.store
            .select(MessageSelector.selectChatMessages(this.activeChat.chatId))
            .subscribe(async _messages => {
                // Load messages from local store
                if (_messages) {
                    this.messages = _messages;
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
                    });
            });
    }

    ngAfterViewInit() {
        this.scrollToBottom(this.messagesScrollbarRef);
    }

    ngAfterContentInit() {
        let detail;
        switch (this.activeChat.chatType) {
            case ChatType.CHANNEL:
                detail = this.activeChat.chatDetail.chatDetailType.value as ChannelChatDetail;
                this.userHasAccessToSendMessage = (detail.admins as string[]).includes(
                    this.activeUser.userId
                );
                break;
            case ChatType.GROUP:
                detail = this.activeChat.chatDetail.chatDetailType.value as GroupChatDetail;
                this.userHasAccessToSendMessage = true;
                break;
        }

        setTimeout(() => {
            this.isLoading = false;
        }, 250);
    }

    scrollToBottom(elRef: ElementRef) {
        setTimeout(() => {
            const el = elRef.nativeElement as HTMLElement;
            el.scrollTop = el.scrollHeight;
        }, 100);
    }

    @HostListener("window:keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        if (event.ctrlKey && event.key == "Enter") {
            this.submitSendTextMessage();
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
}
