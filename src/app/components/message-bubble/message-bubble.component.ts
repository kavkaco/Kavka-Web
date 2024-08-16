import { Component, Input, OnChanges, OnInit } from "@angular/core";
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
export class MessageBubbleComponent implements OnChanges, OnInit {
    showAvatar = true;

    @Input() isSelfMessage: boolean;
    @Input() senderTitle?: string;
    @Input() senderAvatar?: string;
    @Input() messageCaption: any;
    @Input() chatType: ChatType;
    @Input() createdAt: bigint;
    chatTypeString: string;
    messageTimestamp: string;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges() {
        if (this.messageCaption !== undefined && this.messageCaption !== null) {
            try {
                this.messageCaption = this.messageCaption.replace(/\n\r?/g, "<br>");
                this.messageCaption = this.sanitizer.bypassSecurityTrustHtml(this.messageCaption);
            } catch (error) {
                this.messageCaption = "";
            }
        }
    }

    ngOnInit() {
        if (this.chatType == ChatType.CHANNEL || this.isSelfMessage) {
            this.showAvatar = false;
        }

        this.chatTypeString = getChatTypeString(this.chatType);
        this.messageTimestamp = getMessageCreatedAtTimestamp(this.createdAt);
    }
}
