import { Component } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AutoGrowingInputDirective } from '@directives/auto-growing-input.directive';
import { FormsModule } from '@angular/forms';
import { MessageBubbleComponent } from '@components/message-bubble/message-bubble.component';

@Component({
  selector: 'app-active-chat',
  standalone: true,
  imports: [
    NgScrollbarModule,
    AutoGrowingInputDirective,
    FormsModule,
    MessageBubbleComponent,
  ],
  templateUrl: './active-chat.component.html',
  styleUrl: './active-chat.component.scss',
})
export class ActiveChatComponent {
  textInput: string = '';
}
