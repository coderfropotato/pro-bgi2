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
  //配置文件中类型最多只有四种：lncRNA、RNAref、RNAseq、miRNA。【用英文逗号隔开】

  library_method: string;
  //polyA_selected  /   rRNA_removal  /   smallRNA_common /  smallRNA_UMI  /  circRNA  / lncRNA  /   other   等；

  seq_platform: string; 
  //BGISEQ-500  /  MGISEQ-2000  /  Hiseq4000  /  Hiseq2500  /  Hiseq2000  /  HiseqX；（其中 ，BGISEQ-500和MGISEQ-2000对应的seq_platform_series为BGISEQ；Hiseq开头的系列对应Illumina；）

  seq_platform_series: string;
  //BGISEQ  /  Illumina等；（可能不提供）

  // 第一种情况：只有lncRNA、RNAref、RNAseq，无miRNA，显示以下8项；（序号用6.1-6.8） number = 0;
  // 第二种情况：只有miRNA、无其他RNA，显示以下6项；（序号用6.1-6.6） number = 2;
  // 第三种情况：同时有miRNA和其他RNA，所有内容都要显示，显示10项。（序号用6.1-6.10）number = 3;

  mflag1: boolean = false;//适用产品：RNAseq、RNAref
  mflag2: boolean = false;//适用产品：lncRNA
  mflag3: boolean = false;//适用产品：smallRNA + library_method: smallRNA_common
  mflag4: boolean = false;//适用产品：smallRNA + library_method: smallRNA_UMI
  mflag5: boolean = false;//适用产品：circRNA
  mflag6: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  mflag7: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  mflag8: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  
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

      this.seq_platform = this.store.getStore("seq_platform");

      if(this.seq_platform.indexOf('Hiseq') != -1){
          this.seq_platform_series = "Illumina";
      }else{
          this.seq_platform_series = "BGISEQ";
      }


      temp = this.project_type.split(",");

      temp.forEach((d) => {
          if(d == "RNAseq" || d == "RNAref"){
            this.mflag1 = true;
          }

          if(d == "lncRNA"){
            this.mflag2 = true;
          }

          //RNAseq、RNAref、lncRNA、lncRNA、lncRNA
          if(d == "RNAseq" || d == "RNAref" || d=="lncRNA" || d=="miRNA" || this.library_method=="circRNA"){
            this.mflag6 = true;
            this.mflag7 = true;
            this.mflag8 = true;
          }
      });

      if(temp.indexOf('miRNA') > -1){
          if(this.library_method == "smallRNA_common"){
            this.mflag3 = true;
          }
          if(this.library_method == "smallRNA_UMI"){
            this.mflag4 = true;
          }
      }else{
          
      }

      if(this.library_method == "circRNA"){
        this.mflag5 = true;
      }

    //  console.log(this.mflag1)
    //  console.log(this.mflag2)
    //  console.log(this.mflag3)
    //  console.log(this.mflag4)
    //  console.log(this.mflag5)
    //  console.log(this.mflag6)
    //  console.log(this.mflag7)
    //  console.log(this.mflag8)
  }

}
