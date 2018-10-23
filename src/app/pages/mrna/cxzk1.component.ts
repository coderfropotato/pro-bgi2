import { GlobalService } from './../../super/service/globalService';
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { MessageService } from "../../super/service/messageService";
import {ColorPickerService} from 'ngx-color-picker';
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

    @ViewChild("colorPickerTpl")colorPickerTpl;
    color: string = "#ccc";
    beforeColor:string = "#ccc";

    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message: MessageService,
        private globalService:GlobalService,
        private colorPickerService:ColorPickerService
    ) {
        let browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|zh/) ? browserLang : "zh");
    }

    ngOnInit() {}

    ngOnDestory() {}

    colorPickerTest(){
        this.globalService.openColorPicker(this.colorPickerTpl,this.color,()=>{
            this.beforeColor = this.color;
            console.log(`confirm:${this.color}`)
        },(color)=>{
            this.color = this.beforeColor;
            console.log(`cancel:${this.color}`)
        });
    }

    sizeChange() {
        console.log(this.pageSize);
        this.pageIndex = 1;
    }

    changeTotal() {
        this.total = 10;
        this.pageIndex = 1;
    }

    indexChange() {
        console.log(this.pageIndex);
    }
}
