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
    selector: "app-help",
    templateUrl: "./help.component.html",
    styles: []
})
export class HelpComponent implements OnInit {
    // resultList: any[] = [];
    // isShowTab: boolean = true;
    // isVisible: boolean = false;
    // fileList: UploadFile[] = [];
    // fileList2: UploadFile[] = [];
    // fileList3: UploadFile[] = [];
    // nfileList: UploadFile[] = [];
    // m_index: number = 0;
    // tab1: object;
    // PercentNum: number;
    // T_progress: any;
	// defaultSetEntity: object;
	// go_ResponseText:object={};
	// now_page:number;//当前页
	// total_page:number;
	// pageSize: number;
	// selectAble:boolean;
	// fristFlag:boolean;
	// colors: string [] = [];
	// file_obj:object={
	// 	name:'',
	// 	time:''
	// };

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
