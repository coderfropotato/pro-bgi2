import { Directive, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Directive({
    selector: '[tooltip]'
})

export class TooltipDirective {
    constructor(
        private el: ElementRef,
        private renderer2: Renderer2
    ) { }

    ngAfterViewInit() {
        this.renderer2.addClass(this.el.nativeElement, 'btn');
    }
}
