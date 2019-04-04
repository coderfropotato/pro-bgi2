import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { NzModalService, UploadFile } from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd';
import { StoreService } from "./../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import config from "./../../../config";
declare const $: any;
declare const SparkMD5:any;

@Component({
  selector: 'app-gene-expression-help',
  templateUrl: './gene-expression-help.component.html',
  styles: []
})
export class GeneExpressionHelpComponent implements OnInit {
  project_type: string;

  library_method: string;

  seq_platform: string;
  seq_platform_series: string;

  mflag: number = 0;
  // 第一种情况：只有lncRNA、RNAref、RNAseq，无miRNA，显示以下8项；（序号用6.1-6.8） number = 0;
  // 第二种情况：只有miRNA、无其他RNA，显示以下6项；（序号用6.1-6.6） number = 2;
  // 第三种情况：同时有miRNA和其他RNA，所有内容都要显示，显示10项。（序号用6.1-6.10）number = 3;

  tflag: number = 0;
  /////实验流程（还分三种情况）
  // 组合一：  4
  // 条件：
  // seq_platform_series: Illumina
  // library_method: polyA_selected

  // 组合二：  5
  // 条件：
  // seq_platform_series: BGISEQ
  // library_method: polyA_selected

  // 组合三：  6
  // 条件：
  // seq_platform_series: BGISEQ / Illumina
  // library_method: rRNA_removal

  nflag:number = 0;
  /////分析流程（再分三种）

  ////project_type: RNAseq  7
  ////project_type: RNAref  8
  ////project_type: lncRNA  9

  
  constructor(
    private modalService: NzModalService,
    private ajaxService: AjaxService,
    private store: StoreService,
		private http: HttpClient,
		private message: NzMessageService
  ) { }

  ngOnInit() {
      let temp = [];
      if(this.store.store.hasOwnProperty("project_type"))
      {
          this.project_type = this.store.getStore("project_type");
      }else{
          return;
      }

      if(this.store.store.hasOwnProperty("library_method"))
      {
          this.library_method = this.store.getStore("library_method");
      }else{
          return;
      }

      temp = this.project_type.split(",");

      if(temp.indexOf('miRNA') > -1){
          if(temp.length>1){
              this.mflag = 3;
          }else{
              this.mflag = 2;
          }
      }else{
          this.mflag = 0;
      }

      //this.mflag = 3;
      ///////////////////////////////////////////////////////////////////////

      this.seq_platform = this.store.getStore("seq_platform");

      if(this.seq_platform.indexOf('Hiseq') != -1){
          this.seq_platform_series = "Illumina";
      }else{
          this.seq_platform_series = "BGISEQ";
      }
  }

}
