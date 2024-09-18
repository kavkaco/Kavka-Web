import {
    Component,
    ElementRef,
    HostListener,
    inject,
    Input,
    ViewChild,
    AfterViewInit,
    OnChanges,
    AfterContentInit,
    OnInit,
    SimpleChanges,
} from "@angular/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { AutoGrowingInputDirective } from "@directives/auto-growing-input.directive";
import { FormsModule } from "@angular/forms";
import { MessageBubbleComponent } from "@components/message-bubble/message-bubble.component";
import { MessageService } from "@app/services/message.service";
import { Store } from "@ngrx/store";
import { ChatActions } from "@app/store/chat/chat.actions";
import { Chat } from "kavka-core/model/chat/v1/chat_pb";
import { ChatService } from "@app/services/chat.service";
import { User } from "kavka-core/model/user/v1/user_pb";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { ActiveChatService } from "@app/services/active-chat.service";
import * as MessageSelector from "@store/messages/messages.selectors";

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
    activeChatService: ActiveChatService;

    @Input() activeUser: User;
    @Input() activeChat: Chat;
    @ViewChild("messagesScrollbar") messagesScrollbarRef: ElementRef;

    selectedMessageCaption: string | null;

    @ViewChild("contextMenuRef") contextMenu!: ElementRef;
    showMessageContextMenu = false;

    longClickTimeoutTrigger = 650;
    messageLongClickTimeout: NodeJS.Timeout;

    ngOnInit() {
        this.activeChatService = new ActiveChatService(this.store, this.messageService);

        this.store
            .select(MessageSelector.selectChatMessages(this.activeChat.chatId))
            .subscribe(() => {
                this.scrollToBottomAfterGettingNewMessage();
            });
    }

    updateActiveChatState() {
        this.activeChatService?.Load(this.activeChat);
        this.activeChatService?.setInputSectionStatus(this.activeChat);
    }

    ngOnChanges() {
        this.updateActiveChatState();
    }

    ngAfterContentInit() {
        this.updateActiveChatState();
    }

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
                el.style.left = event.clientX - elWidth + "px";
            } else {
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
        return this.activeChatService.selectedMessages.includes(messageId);
    }

    copySelectedMessageCaption() {
        navigator.clipboard.writeText(this.selectedMessageCaption || "").then(() => {
            console.log("[ActiveChat] Message Caption Copied");
        });
    }

    messageMouseDown(event, messageId: string) {
        if (event.button === 0) {
            if (this.activeChatService.selectedMessages.length == 0) {
                this.messageLongClickTimeout = setTimeout(() => {
                    this.toggleSelectMessage(event, messageId);
                }, this.longClickTimeoutTrigger);
            } else {
                if (this.activeChatService.selectedMessages.length > 0) {
                    this.toggleSelectMessage(event, messageId);
                }
            }
        }
    }

    messageMouseUp() {
        clearTimeout(this.messageLongClickTimeout);
    }

    toggleSelectMessage(event: MouseEvent, messageId: string) {
        event.preventDefault();
        if (!this.activeChatService.selectedMessages.includes(messageId)) {
            this.activeChatService.selectedMessages.push(messageId);
            return;
        }

        this.activeChatService.selectedMessages = this.activeChatService.selectedMessages.filter(
            _messageId => _messageId !== messageId
        );
    }

    ngAfterViewInit() {
        this.scrollToBottom(this.messagesScrollbarRef);
    }

    submitJoinChat() {
        this.chatService.JoinChat(this.activeChat.chatId).then(chat => {
            this.activeChat = chat;
            this.store.dispatch(ChatActions.add({ chat }));
            this.activeChatService.setInputSectionStatus(this.activeChat);
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

    submitSendTextMessage() {
        this.messageService
            .SendTextMessage(this.activeChat.chatId, this.activeChatService.textInput.trim())
            .then(() => {
                this.activeChatService.textInput = "";
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
