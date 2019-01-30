import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { NzModalService, UploadFile } from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd';
import { StoreService } from "../../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import config from "../../../../config";
declare const $: any;
declare const SparkMD5:any;

@Component({
    selector: "app-help",
    templateUrl: "./help.component.html",
    styles: []
})
export class HelpComponent implements OnInit {

    mflag: number = 0;
    // 第一种情况：只有lncRNA、RNAref、RNAseq，无miRNA，显示以下8项；（序号用6.1-6.8） number = 0; 
    // 第二种情况：只有miRNA、无其他RNA，显示以下6项；（序号用6.1-6.6） number = 2;
    // 第三种情况：同时有miRNA和其他RNA，所有内容都要显示，显示10项。（序号用6.1-6.10）number = 3;

    constructor(
        private modalService: NzModalService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
		private http: HttpClient,
		private message: NzMessageService
    ) {}

    ngOnInit() {
        this.mflag = 3;
    }

}
