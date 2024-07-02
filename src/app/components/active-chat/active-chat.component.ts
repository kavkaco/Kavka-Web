import { Component } from '@angular/core';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AutoGrowingInputDirective } from '../../directives/auto-growing-input.directive';

@Component({
  selector: 'app-active-chat',
  standalone: true,
  imports: [NgScrollbarModule, AutoGrowingInputDirective],
  templateUrl: './active-chat.component.html',
  styleUrl: './active-chat.component.scss',
})
export class ActiveChatComponent {}
