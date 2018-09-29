import { Component, OnInit,OnDestroy  } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { MessageService } from '../../super/service/messageService';
import config from "../../../config";

@Component({
    selector: "app-cxzk1",
    templateUrl: "./cxzk1.component.html"
})
export class cxzk1Component implements OnInit {
    name: string;
    list: number[] = [1, 1, 1, 12, 1];
    title: string;
    subscription:Subscription;
    msg:string;

    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message:MessageService
    ) {
        this.translate.onLangChange.subscribe(res => {
            this.title = this.translate.instant("cxzk1Title");
        });

    }

    ngOnInit() {
        this.list = [1, 1, 1, 12, 1];
        this.name = "joke";

        this.http
            .post(`${config['url']}/User/login`, { name: "joke", age: 18 })
            .subscribe(
                res => {
                    console.log(res);
                },
                error => {
                    console.log(error.status + "  " + error.statusText);
                }
            );

        this.subscription = this.message.get().subscribe(data=>{
            console.log(data);
            this.msg = data.message;
        })
    }

    ngOnDestory(){
        this.subscription.unsubscribe();
    }
}
