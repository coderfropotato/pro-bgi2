import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'htmlFilter'
})
export class HtmlFilter implements PipeTransform {
    constructor(
        private sanitizer: DomSanitizer
    ) { }

    transform(value: string, args?: any): object {
        return this.sanitizer.bypassSecurityTrustHtml(value);
    }
}
