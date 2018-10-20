import { Component, OnInit, OnDestroy } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { MessageService } from "../../super/service/messageService";
declare const d4: any;

@Component({
    selector: "app-cxzk1",
    templateUrl: "./cxzk1.component.html"
})
export class cxzk1Component implements OnInit {
    subscription: Subscription;

    // pagination test data
    total: number = 100000;
    pageSize: number = 10;
    pageIndex: number = 1;
    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message: MessageService
    ) {
        let browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|zh/) ? browserLang : "zh");
    }

    ngOnInit() {
    }

    ngOnDestory() {}

    sizeChange(){
        console.log(this.pageSize);
        this.pageIndex = 1;
    }

    changeTotal(){
        this.total = 0;
        this.pageIndex = 1;
    }

    indexChange(){
        console.log(this.pageIndex);
    }


}
