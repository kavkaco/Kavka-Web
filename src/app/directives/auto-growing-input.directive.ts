import { Directive, ElementRef, HostListener, Input } from "@angular/core";

@Directive({
    selector: "[appAutoGrowingInput]",
    standalone: true,
})
export class AutoGrowingInputDirective {
    @Input() initialHeight!: number;
    @Input() lineHeight!: number;
    @Input() borderWidth!: number;

    constructor(private el: ElementRef) {}

    @HostListener("keyup") onKeyup() {
        const textarea = this.el.nativeElement;

        this.setOverflow("hidden");

        if (textarea.value.trim() == "") {
            textarea.style.height = this.initialHeight + "px";
            return;
        }

        const heightNumber = this.calculateInputHeight(textarea.value);
        const heightCss = heightNumber + "px";

        if (heightNumber > 150) {
            this.setOverflow("auto");
            return;
        }

        textarea.style.height = heightCss;
    }

    calculateInputHeight(value: string) {
        const numberOfLineBreaks = (value.match(/\n/g) || []).length;
        if (numberOfLineBreaks == 0) {
            return this.initialHeight;
        }

        // min-height + lines x line-height + border
        return this.initialHeight + numberOfLineBreaks * this.lineHeight + this.borderWidth;
    }

    setOverflow(value: string) {
        this.el.nativeElement.style.overflow = value;
    }
}
