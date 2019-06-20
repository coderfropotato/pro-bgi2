import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { NzModalService, UploadFile } from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd';
import { StoreService } from "./../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import config from "../../../config";
declare const $: any;
declare const SparkMD5:any;

@Component({
    selector: "app-upload",
    templateUrl: "./help.component.html",
    styles: []
})
export class HelpComponent implements OnInit {

    constructor(
        private modalService: NzModalService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
		private http: HttpClient,
		private message: NzMessageService
    ) {}

    ngOnInit() {
		
    }

}
