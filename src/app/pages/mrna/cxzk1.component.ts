import { Component, OnInit,OnDestroy  } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { MessageService } from '../../super/service/messageService';


@Component({
    selector: "app-cxzk1",
    templateUrl: "./cxzk1.component.html"
})
export class cxzk1Component implements OnInit {
    name: string;
    list: number[] = [];
    subscription:Subscription;
    msg:string;

    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message:MessageService
    ) {
        let browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|zh/) ? browserLang : 'zh');
    }

    ngOnInit() {
        this.list = [1, 1, 1, 12, 1];
        this.name = "joke";

        this.subscription = this.message.get().subscribe(data=>{
            this.msg = data.message;
        })
    }

    ngOnDestory(){
        this.subscription.unsubscribe();
    }
}
