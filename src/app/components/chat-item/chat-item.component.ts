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
        this.store.select(ChatSelector.selectActiveChat).subscribe(chat => {
            if (chat && chat.chatId == this.chatId) {
                this.isActive = true;
                return;
            }

            this.isActive = false;
        });
    }

    sanitizeLastMessageCaption(messageCaption: string) {
        messageCaption = messageCaption.replace(/\n\r?/g, "<br>");
        return this.sanitizer.bypassSecurityTrustHtml(messageCaption);
    }
}
