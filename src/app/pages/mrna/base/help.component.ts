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
export class BasicHelpComponent implements OnInit {

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
	sflag: number = 0;

    nflag:number = 0;
    /////分析流程（再分三种）

    ////project_type: RNAseq  7
    ////project_type: RNAref  8
    ////project_type: lncRNA  9

    tempIndex: number = 0;
	tempMenu: any[] = [];
	tempMenu2: any[] = [];
	tempMenu3: any[] = [];

	itemFlag: boolean = false;
	itemNum: number = 0;
	itemFlag2: boolean = false;
	itemNum2: number = 0;
	itemFlag3: boolean = false;
	itemNum3: number = 0;
	itemFlag4: boolean = false;
	itemNum4: number = 0;

	itemFlag2_1: boolean = false;
	itemNum2_1: number = 0;
	itemFlag2_2: boolean = false;
	itemNum2_2: number = 0;

	itemFlag3_1: boolean = false;
	itemNum3_1: number = 0;
	itemFlag3_2: boolean = false;
	itemNum3_2: number = 0;

	itemFlag4_1: boolean = false;
	itemNum4_1: number = 0;
	itemFlag4_2: boolean = false;
	itemNum4_2: number = 0;
	itemFlag4_3: boolean = false;
    itemNum4_3: number = 0;

    constructor(
        private modalService: NzModalService,
        private ajaxService: AjaxService,
        private store: StoreService,
		private http: HttpClient,
		private message: NzMessageService
    ) {}

    ngOnInit() {

        this.GeneListIndex();

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

        temp = this.project_type.split("+");

        if(temp.indexOf('smallRNA') > -1){
            if(temp.length>1){
                this.mflag = 3;
            }else{
                this.mflag = 2;
            }
        }else{
            this.mflag = 0;
        }

		let RNAseq_flag = false;
		let RNAref_flag = false;
		let lncRNA2_flag = false;
		temp.forEach((d) => {
			if(d.indexOf('RNAseq') != -1){
				RNAseq_flag = true;
			}
			if(d.indexOf('RNAref') != -1){
				RNAref_flag = true;
			}
			if(d.indexOf('lncRNA') != -1){
				lncRNA2_flag = true;
			}
		});
        //this.mflag = 3;
        ///////////////////////////////////////////////////////////////////////

		this.seq_platform = this.store.getStore("seq_platform");

		let Illumina_flag = false;
		let BGISEQ_flag = false;

		this.seq_platform.split("+").forEach((d) => {
			if(d.indexOf('hiseq') != -1){
				Illumina_flag = true;
			}
			if(d.indexOf('BGISEQ') != -1 || d.indexOf('MGISEQ') != -1){
				BGISEQ_flag = true;
			}
		});

		let polyA_selected_flag = false;
		let other_flag = false;
		let rRNA_removal_flag = false;
		let lncRNA_flag = false;
		let circRNA_flag = false;
		let smallRNA_common_flag =false;
		let smallRNA_UMI_flag = false;

		this.library_method.split("+").forEach((d) => {
			if(d.indexOf('polyA_selected') != -1){
				polyA_selected_flag = true;
			}
			if(d.indexOf('other') != -1 ){
				other_flag = true;
			}
			if(d.indexOf('rRNA_removal') != -1 ){
				rRNA_removal_flag = true;
			}
			if(d.indexOf('lncRNA') != -1 ){
				lncRNA_flag = true;
			}
			if(d.indexOf('circRNA') != -1 ){
				circRNA_flag = true;
			}
			if(d.indexOf('smallRNA_common') != -1 ){
				smallRNA_common_flag = true;
			}
			if(d.indexOf('smallRNA_UMI') != -1 ){
				smallRNA_UMI_flag = true;
			}
		})

        // if(this.seq_platform.indexOf('Hiseq') != -1){
        //     this.seq_platform_series = "Illumina";
        // }else{
        //     this.seq_platform_series = "BGISEQ";
		// }

       if((Illumina_flag && polyA_selected_flag)||(Illumina_flag && other_flag)||(Illumina_flag && rRNA_removal_flag)){
            this.tflag = 4;
       }

       if((BGISEQ_flag && polyA_selected_flag)||(BGISEQ_flag && other_flag)||(BGISEQ_flag && rRNA_removal_flag)){
            this.tflag = 5;
        }

        if(Illumina_flag && lncRNA_flag){
            this.tflag = 6;
        }

        if(BGISEQ_flag && lncRNA_flag){
            this.tflag = 7;
        }

        if(Illumina_flag && circRNA_flag){
            this.tflag = 8;
        }

        if(BGISEQ_flag && circRNA_flag){
            this.tflag = 9;
        }

		console.log(this.tflag)
        //    if(BGISEQ_flag && this.library_method == "polyA_selected"){
        //         this.tflag = 5;
        //    }

        //    if(this.library_method == "rRNA_removal"){
        //         this.tflag = 6;
        //    }

        if(smallRNA_common_flag){
            this.sflag = 61;
        }

        if(smallRNA_UMI_flag){
            this.sflag = 62;
        }



       if(RNAseq_flag){
            this.nflag = 7;
       }
       if(RNAref_flag){
            this.nflag = 8;
       }
       if(lncRNA2_flag){
            this.nflag = 9;
       }

    }

    GeneListIndex(){
		let mindex = 1;
		let mindex2 = 1;
		let mindex3 = 1;
		this.store.getStore('basicMenu').forEach((d) => {
			if(d.indexOf("001")==0 && d.length != 3){
				if(d.length == 6){
					this.tempMenu2.push({
						name:d,
						index:mindex
                    });
                    mindex++;
				}else{
					this.tempMenu3.push({
						name:d,
						father:d.substr(0,6)
					});
				}
			}
			if(d.length == 3){
				this.tempMenu.push({
                    name:d,
                    index:mindex2
                });
                mindex2++;
			}
		});

		// console.log(this.tempMenu);
		// console.log(this.tempMenu2);
		// console.log(this.tempMenu3);

		// this.tempMenu.forEach((d)=>{
		// 	if(d["name"]=="001"){
		// 		this.tempIndex =  d["index"];
		// 	}
        // })

        this.tempIndex = this.tempMenu.length +1;

		this.tempMenu2.forEach((d)=>{
			switch (d["name"]) {
				case "001001":
					this.itemFlag = true;
					this.itemNum = d["index"];
					break;
				case "001002":
					this.itemFlag2 = true;
					this.itemNum2 = d["index"];
					break;
				case "001003":
					this.itemFlag3 = true;
					this.itemNum3 = d["index"];
					break;
				case "001004":
					this.itemFlag4 = true;
					this.itemNum4 = d["index"];
					break;
				default:
					break;
			}
		})

		var map = {},
			dest = [];
		for(var i = 0; i < this.tempMenu3.length; i++){
			var ai = this.tempMenu3[i];
			if(!map[ai.father]){
				dest.push({
					father: ai.father,
					data: [ai]
				});
				map[ai.father] = ai;
			}else{
				for(var j = 0; j < dest.length; j++){
					var dj = dest[j];
					if(dj.father == ai.father){
						dj.data.push(ai);
						break;
					}
				}
			}
		}

		let tempArray = [];
		for (let index = 0; index < dest.length; index++) {
			let element = dest[index].data;
			for (let index2 = 0; index2 < element.length; index2++) {
				let element2 = element[index2];
				tempArray.push({
					name: element2["name"],
					index: index2+1
				})
			}
		}

		this.tempMenu3.length = 0;
		this.tempMenu3 = tempArray;
		// console.log(this.tempMenu3);

		this.tempMenu3.forEach((d)=>{
			switch (d["name"]) {
				case "001002001":
					this.itemFlag2_1 = true;
					this.itemNum2_1 = d["index"];
					break;
				case "001002002":
					this.itemFlag2_2 = true;
					this.itemNum2_2 = d["index"];
					break;
				case "001003001":
					this.itemFlag3_1 = true;
					this.itemNum3_1 = d["index"];
					break;
				case "001003002":
					this.itemFlag3_2 = true;
					this.itemNum3_2 = d["index"];
					break;
				case "001004001":
					this.itemFlag4_1 = true;
					this.itemNum4_1 = d["index"];
					break;
				case "001004002":
					this.itemFlag4_2 = true;
					this.itemNum4_2 = d["index"];
					break;
				case "001004003":
					this.itemFlag4_3 = true;
					this.itemNum4_3 = d["index"];
					break;
				default:
					break;
			}
		})

	}

}
