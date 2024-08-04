import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollDown]',
  standalone: true
})
export class ScrollDownDirective {
  constructor(private elementRef: ElementRef) { }

  ngAfterViewChecked() {
    this.scrollToBottomInternal();
  }

  scrollToBottomInternal() {
    const element = this.elementRef.nativeElement as HTMLElement;
    element.scrollTop = element.scrollHeight;
  }
}
