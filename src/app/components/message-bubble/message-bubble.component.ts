import { Component, Input } from '@angular/core';

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
  @Input() messageCaption: string;
}
