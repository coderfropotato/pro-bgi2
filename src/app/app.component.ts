import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;
declare const document: any;
declare const window: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})

export class AppComponent {
    browserLang: string;
    constructor(
        private translate: TranslateService
    ) {
        this.translate.addLangs(['zh', 'en']);
        this.translate.setDefaultLang('zh');
        this.browserLang = this.translate.getBrowserLang();
        this.translate.use(this.browserLang.match(/zh|en/) ? this.browserLang : 'zh');
    }
    list: [
        {
            'name': 'joke',
            'age': 18
        }
    ];

    changeLan() {
        if (this.browserLang == 'zh') {
            this.translate.use('en');
            this.browserLang = 'en';
        } else {
            this.translate.use('zh');
            this.browserLang = 'zh';
        }
    }
}
