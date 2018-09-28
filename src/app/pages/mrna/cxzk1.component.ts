import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import config from "../../../config";

@Component({
    selector: "app-cxzk1",
    templateUrl: "./cxzk1.component.html"
})
export class cxzk1Component implements OnInit {
    name: string;
    list: number[] = [1, 1, 1, 12, 1];
    title: string;

    constructor(
        private http: HttpClient,
        private translate: TranslateService
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
    }
}
