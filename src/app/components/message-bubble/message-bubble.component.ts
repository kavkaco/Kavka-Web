import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss'
})
export class MessageBubbleComponent {
  @Input() isSelfMessage: boolean;
  @Input() senderTitle?: string;
  @Input() senderAvatar?: string;
  @Input() messageCaption: any;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnChanges() {
    this.messageCaption = this.messageCaption.replace(/\n\r?/g, '<br>');
    this.messageCaption = this.sanitizer.bypassSecurityTrustHtml(this.messageCaption);
  }
}
