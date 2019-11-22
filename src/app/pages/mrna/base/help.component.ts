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

    project_type: string="";

    library_method: string="";

    seq_platform: string="";
	seq_platform_series: string="";

    mflag: number = 0;
    // 第一种情况：只有lncRNA、RNAref、RNAseq，无miRNA，显示以下8项；（序号用6.1-6.8） number = 0;
    // 第二种情况：只有miRNA、无其他RNA，显示以下6项；（序号用6.1-6.6） number = 2;
    // 第三种情况：同时有miRNA和其他RNA，所有内容都要显示，显示10项。（序号用6.1-6.10）number = 3;

	// seq_platform_series
	Illumina_flag:boolean=false
	BGISEQ_flag:boolean=false
	//library_method
	//无“+”连接
	polyA_selected_flag:boolean=false
	rRNA_removal_flag:boolean=false
	smallRNA_common_flag:boolean=false
	smallRNA_UMI_flag:boolean=false
	//有“+”连接：两两或三三对应
	testPlan1:boolean=false
	testPlan2:boolean=false
	testPlan3:boolean=false
	testPlan4:boolean=false

	hasTestProcess:boolean=false
	hasSmallRNATest:boolean=false

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
		let that=this;

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
		
		//====================实验流程 start===============================
		if(this.project_type.indexOf('smallRNA')!=-1){
			this.hasSmallRNATest=true
		}else{
			this.hasSmallRNATest=false
		}

		if(this.project_type==='smallRNA'){
			this.hasTestProcess=false
		}else{
			this.hasTestProcess=true;
		}

		
		this.seq_platform = this.store.getStore("seq_platform");
		this.seq_platform_series=this.store.getStore('seq_platform_series');
		
		function getSeq_platform_series(d){
			switch (d) {
				case "Illumina":
					that.Illumina_flag = true;
					break;
				case "BGISEQ":
					that.BGISEQ_flag = true;
					break;
				default:
					break;
			}
		}

		if(this.seq_platform_series.indexOf('+')==-1){
			getSeq_platform_series(this.seq_platform_series);
		}

		function getLibrary_method(d){
			switch (d) {
				case "polyA_selected":
					that.polyA_selected_flag = true;
					break;
				case "rRNA_removal":
					that.rRNA_removal_flag = true;
					break;
				case "smallRNA_common":
					that.smallRNA_common_flag = true;
					break;
				case "smallRNA_UMI":
					that.smallRNA_UMI_flag = true;
					break;
				default:
					break;
			}
		}

		if(this.library_method.indexOf('+')==-1){
			getLibrary_method(this.library_method)
		}

		if(this.library_method.indexOf('+')!=-1 && this.seq_platform_series.indexOf('+')!=-1){
			let library_methods=this.library_method.split("+");
			let seq_platform_series=this.seq_platform_series.split("+");

			for(let i=0;i<library_methods.length;i++){
				switch (library_methods[i]) {
					case "polyA_selected":
						if(seq_platform_series[i]=='BGISEQ'){
							this.testPlan1=true;
						}else if(seq_platform_series[i]=='Illumina'){
							this.testPlan2=true;
						}
						break;
					case "rRNA_removal":
						if(seq_platform_series[i]=='BGISEQ'){
							this.testPlan3=true;
						}else if(seq_platform_series[i]=='Illumina'){
							this.testPlan4=true;
						}
						break;
					case "smallRNA_common":
						that.smallRNA_common_flag = true;
						break;
					case "smallRNA_UMI":
						that.smallRNA_UMI_flag = true;
						break;
					default:
						break;
				}
			}
			
		}
//===================实验流程 end=======================================

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
