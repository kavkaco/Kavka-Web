import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDetailDrawerComponent } from './chat-detail-drawer.component';

describe('ChatDetailDrawerComponent', () => {
  let component: ChatDetailDrawerComponent;
  let fixture: ComponentFixture<ChatDetailDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatDetailDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDetailDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
