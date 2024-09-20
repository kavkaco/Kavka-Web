import { Component, inject, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import * as ChatSelector from "@app/store/chat/chat.selectors";

import { LastMessage } from "kavka-core/model/chat/v1/chat_pb";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "app-chat-item",
    standalone: true,
    imports: [],
    templateUrl: "./chat-item.component.html",
    styleUrl: "./chat-item.component.scss",
})
export class ChatItemComponent {
    private store = inject(Store);

    @Input({ required: true }) chatId!: string;
    @Input({ required: true }) title!: string;
    @Input() avatar: string | undefined;
    @Input({ required: true }) lastMessage!: LastMessage;
    isActive = false;

    constructor(private sanitizer: DomSanitizer) {
        this.store.select(ChatSelector.selectActiveChat).subscribe(activeChat => {
            if (activeChat && activeChat.chat && activeChat.chat.chatId == this.chatId) {
                this.isActive = true;
                return;
            }

            this.isActive = false;
        });
    }

    getFirstLine(text: string) {
        for (let i = 0; i < text.length; i++) {
            if (text[i] === "\n") {
                return text.substring(0, i);
            }
        }

        return text;
    }

    sanitizeLastMessageCaption(messageCaption: string) {
        messageCaption = this.getFirstLine(messageCaption).replace(/\n\r?/g, "<br>");
        return this.sanitizer.bypassSecurityTrustHtml(messageCaption);
    }
}
