import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { getChatTypeString } from "@app/models/chat";
import { getMessageCreatedAtTimestamp } from "@app/models/message";

import { ChatType } from "kavka-core/model/chat/v1/chat_pb";

@Component({
    selector: "app-message-bubble",
    standalone: true,
    imports: [],
    templateUrl: "./message-bubble.component.html",
    styleUrl: "./message-bubble.component.scss",
})
export class MessageBubbleComponent implements OnInit {
    showAvatar = false;

    @Input() isSelfMessage: boolean;
    @Input() senderTitle?: string;
    @Input() senderAvatar?: string;
    @Input() messageCaption: any;
    @Input() chatType: ChatType;
    @Input() createdAt: bigint;
    @Input() messageSelected: boolean;

    chatTypeString: string;
    messageTimestamp: string;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {
        if (this.messageCaption !== undefined && this.messageCaption !== null) {
            try {
                this.messageCaption = this.messageCaption.replace(/\n\r?/g, "<br>");
                this.messageCaption = this.sanitizer.bypassSecurityTrustHtml(this.messageCaption);
            } catch {
                this.messageCaption = "Sanitization failed!";
            }
        }

        if (this.chatType == ChatType.GROUP && !this.isSelfMessage) {
            this.showAvatar = true;
        }

        this.chatTypeString = getChatTypeString(this.chatType);
        this.messageTimestamp = getMessageCreatedAtTimestamp(this.createdAt);
    }
}
