import { Component } from '@angular/core';
import { ChatDetailDrawerComponent } from '../../../components/chat-detail-drawer/chat-detail-drawer.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ChatDetailDrawerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
