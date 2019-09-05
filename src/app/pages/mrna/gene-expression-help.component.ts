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

  /*
  { 'RNAref',
    'RNAref+smallRNA',
    'RNAseq',
    'lncRNA',
    'lncRNA+smallRNA',
    'smallRNA'
  }
 */

  library_method: string;
  //polyA_selected  /   rRNA_removal  /   smallRNA_common /  smallRNA_UMI  /  circRNA  / lncRNA  /   other   等；
   /*
    { '',
      'NO_INFO',
      'No_INFO',
      'Other',
      'polyA_selected',
      'polyA_selected+smallRNA_UMI',
      'polyA_selected+smallRNA_common',
      'rRNA_removal',
      'rRNA_removal+smallRNA_UMI',
      'rRNA_removal+smallRNA_common',
      'smallRNA',
      'smallRNA_UMI',
      'smallRNA_common'
    }
   */

  seq_platform: string; 
  //BGISEQ-500  /  MGISEQ-2000  /  Hiseq4000  /  Hiseq2500  /  Hiseq2000  /  HiseqX；（其中 ，BGISEQ-500和MGISEQ-2000对应的seq_platform_series为BGISEQ；Hiseq开头的系列对应Illumina；）

  /*
    { 'BGISEQ',
      'BGISEQ+BGISEQ-500',
      'BGISEQ-500',
      'BGISEQ500',
      'Hiseq4000',
      'NO_INFO',
      'bgiseq2000',
      'bgiseq500',
      'hBGISEQ',
      'hiseq2000',
      'hiseq4000',
      'hiseq4000+BGISEQ-500'
    }
  */

  seq_platform_series: string;
  //BGISEQ  /  Illumina等；（可能不提供）

  mflag1: boolean = false;//适用产品：RNAseq、RNAref
  mflag2: boolean = false;//适用产品：lncRNA
  mflag3: boolean = false;//适用产品：smallRNA + library_method: smallRNA_common
  mflag4: boolean = false;//适用产品：smallRNA + library_method: smallRNA_UMI
  mflag5: boolean = false;//适用产品：circRNA
  mflag6: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  mflag7: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  mflag8: boolean = false;//适用产品：RNAseq、RNAref、lncRNA、smallRNA、circRNA
  

  DEGseq_flag: boolean = false;
  DESeq2_flag: boolean = false;
  EBSeq_flag: boolean = false;
  Noiseq_flag: boolean = false;
  PossionDis_flag: boolean = false;

  constructor(
    private modalService: NzModalService,
    private ajaxService: AjaxService,
    private store: StoreService,
	private http: HttpClient,
	private message: NzMessageService
  ) { }

  ngOnInit() {

      ///显示五个模块--开始
      this.DEGseq_flag = false;
      this.DESeq2_flag = false;
      this.EBSeq_flag = false;
      this.Noiseq_flag = false;
      this.PossionDis_flag = false;


      let tempobj = JSON.parse(JSON.stringify(this.store.getStore('diff_threshold')));

      console.log(tempobj)

      for (const key in tempobj) {
        if(key=="PossionDis"){
          this.PossionDis_flag = true;
        }
        if(key=="Noiseq"){
          this.Noiseq_flag = true;
        }
        if(key=="EBSeq"){
          this.EBSeq_flag = true;
        }
        if(key=="DESeq2"){
          this.DESeq2_flag = true;
        }
        if(key=="DEGseq"){
          this.DEGseq_flag = true;
        }
      }
      ///显示五个模块--结束



      ////////////////////////////////////////////////////////////////
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

      let circRNA_flag = false;
      let smallRNA_common_flag = false;
      let smallRNA_UMI_flag = false;

      this.library_method.split("+").forEach((d) => {
        if(d.indexOf('circRNA') != -1){
          circRNA_flag = true;
        }
        if(d.indexOf('smallRNA_common') != -1 ){
          smallRNA_common_flag = true;
        }
        if(d.indexOf('smallRNA_UMI') != -1 ){
          smallRNA_UMI_flag = true;
        }
      })


      this.seq_platform = this.store.getStore("seq_platform");
      if(this.seq_platform.indexOf('Hiseq') != -1){
          this.seq_platform_series = "Illumina";
      }else{
          this.seq_platform_series = "BGISEQ";
      }

      

      temp = this.project_type.split("+");
      temp.forEach((d) => {
          if(d == "RNAseq" || d == "RNAref"){
            this.mflag1 = true;
          }

          if(d == "lncRNA"){
            this.mflag2 = true;
          }

          //RNAseq、RNAref、lncRNA、lncRNA、lncRNA
          if(d == "RNAseq" || d == "RNAref" || d=="lncRNA" || d=="smallRNA" || circRNA_flag){
            this.mflag6 = true;
            this.mflag7 = true;
            this.mflag8 = true;
          }
      });

      if(temp.indexOf('smallRNA') > -1){
          if(smallRNA_common_flag){
            this.mflag3 = true;
          }
          if(smallRNA_UMI_flag){
            this.mflag4 = true;
          }
      }

      if(circRNA_flag){
        this.mflag5 = true;
      }

  }

}
