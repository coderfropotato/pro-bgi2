import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from './../../super/service/promptService';
import config from '../../../config';
import { GeneService } from './../../super/service/geneService';
import { resolve } from 'url';

declare const d3: any;
declare const d4: any;
declare const Venn: any;
declare const $:any;

@Component({
  selector: 'app-gene-detail',
  templateUrl: './gene-detail.component.html'
})
export class GeneDetailComponent implements OnInit {
	@ViewChild('lineChart') lineChart;

	title: string;
	geneID: string;

	//基因信息
	gene_url: string;
	gene_params: object;
	geneInfoList: object = {
		gene_id:"",//基因ID
		url_ncbi_gene_id:"",//NCBI 基因链接
		url_hgnc_gene_id:"",//HGNC 基因链接
		url_ensembl_gene_id:"",//Ensembl 基因链接
		url_genecard_gene_id:"",//GeneCard 基因链接
		url_mirbase_gene_id:"",//miRbase 基因链接
		url_kegg_gene_id:"",//kegg 基因链接
		gene_symbol:"",//基因名
		gene_full_name:"",//基因全名
		gene_other_symbol:"",//其它基因名
		tf_family:"",//转录因子家族
		gene_chr:"",//Chr
		gene_start:"",//起始位置
		gene_end:"",//终止位置
		gene_map_loc:"",//染色体位置
		genome_source:"",//
		genome_version:"",//
		genome_url:""//
	};

	btn_show: boolean = true;

	//转录本信息
	defaultUrl: string;
	rna_params: object;
	rows: object[] = [];
	baseThead: object[] = [];

	//样本表达量（FPKM）
	expressive_defaultUrl: string;
	expressive_params_g: object;
	expressive_params_t: object;
	// expressive_rows: object[] = [];
	// expressive_baseThead: object[] = [];
	// expressive_geneType: string;
	// expressive_index: number = 0;

	//折线图
	// chartUrl: string;
    // chartEntity: object;
	// chart:any;

	//组间差异
	groupDiff_defaultUrl: string;
	groupDiff_params_g: object;
	groupDiff_params_t: object;
	// groupDiff_rows: object[] = [];
	// groupDiff_baseThead: object[] = [];
	// groupDiff_geneType: string;
	groupDiff_index: number = 0;

	//样本间差异
	sampleDiff_defaultUrl: string;
	sampleDiff_params_g: object;
	sampleDiff_params_t: object;
	// sampleDiff_rows: object[] = [];
	// sampleDiff_baseThead: object[] = [];
	// sampleDiff_geneType: string;
	sampleDiff_index: number = 0;

	//mRna二次结构
	precursor_defaultUrl: string;
	precursor_params: object;
	precursor_geneType: string;
	precursor_image: string;

	geneParamsUsed: object;
	transcriptParamsUsed: object;

  	constructor(
		private message: MessageService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private promptService: PromptService,
		private addColumnService: AddColumnService,
		private router: Router,
		private geneService: GeneService
	) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	ngOnInit() {
		this.geneID = "374443";

		this.geneParamsUsed = {
			LCID: this.storeService.getStore('LCID'),
			geneType: "gene",
			geneID: this.geneID
		}

		this.transcriptParamsUsed = {
			LCID: this.storeService.getStore('LCID'),
			geneType: "transcript",
			geneID: this.geneID
		}
		
		//基因信息
		this.gene_url = `${config['javaPath']}/geneDetail/info`;
		this.gene_params = this.geneParamsUsed;

		//转录本信息
		this.defaultUrl = `${config['javaPath']}/geneDetail/rnaID`;
		this.rna_params = this.geneParamsUsed;

		//样本表达量
		//this.expressive_geneType = "gene";
		this.expressive_defaultUrl = `${config['javaPath']}/geneDetail/exp`;
		this.expressive_params_g = this.geneParamsUsed;

		this.expressive_params_t = this.transcriptParamsUsed

		// //折线图
		// this.chartUrl=`${config['javaPath']}/geneDetail/exp`;
        // this.chartEntity = {

		// };

		//组间差异
		//this.groupDiff_geneType = "gene";
		this.groupDiff_defaultUrl = `${config['javaPath']}/geneDetail/groupDiff`;
		this.groupDiff_params_g = this.geneParamsUsed;
		this.groupDiff_params_t = this.transcriptParamsUsed

		//样本间差异
		//this.sampleDiff_geneType = "gene";
		this.sampleDiff_defaultUrl = `${config['javaPath']}/geneDetail/sampleDiff`;
		this.sampleDiff_params_g = this.geneParamsUsed;
		this.sampleDiff_params_t = {
			LCID: this.storeService.getStore('LCID'),
			geneType: "transcript",
			geneID: this.geneID
		};

		//mRna二次结构
		this.precursor_geneType = "gene";
		this.precursor_defaultUrl = `${config['javaPath']}/geneDetail/precursor`;
		this.precursor_params = this.geneParamsUsed;
		//geneID:"hsa-miR-223-3p"

		(async () => {
			try {
				await this.getGeneInformation();//基因信息
				//await this.getRnaInformation();//转录本信息
				//await this.sampleExpression();//样本表达量
				//await this.getGroupDiff();//组间差异
				//await this.getSampleDiff();//样本间差异
				await this.getPrecursor();//样本间差异
			}catch (error){

			}
		})();
	}

	//基因信息
	async getGeneInformation(){
		return new Promise((resolve, reject) => {
			this.ajaxService
			.getDeferData({
				url: this.gene_url,
				data: this.gene_params
			})
			.subscribe((data: any) => {
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.geneInfoList = data['data'];
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			);
		})
	}

	//转录本信息
	async getRnaInformation(){
		return new Promise((resolve, reject) => {
			// this.ajaxService
			// .getDeferData({
			// 	url: this.defaultUrl,
			// 	data: this.rna_params
			// })
			// .subscribe((data: any) => {
			// 	if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
			// 		return;
			// 	} else if (data.status == '-1') {
			// 		return;
			// 	} else if (data.status == '-2') {
			// 		return;
			// 	} else {
			// 		this.rows = data['data']['rows'];
			// 		this.baseThead = data['data']['baseThead'];
			// 	}
			// 	resolve("success");
			// },
			// error => {
			// 	reject("error");
			// }
			// );
		})
	}

	//样本表达量
	sampleExpression(){
		// return new Promise((resolve, reject) => {
		// 	this.ajaxService
		// 	.getDeferData({
		// 		url: this.expressive_defaultUrl,
		// 		data: this.expressive_params
		// 	})
		// 	.subscribe((data: any) => {
		// 		if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
		// 			return;
		// 		} else if (data.status == '-1') {
		// 			return;
		// 		} else if (data.status == '-2') {
		// 			return;
		// 		} else {
		// 			this.expressive_rows = data['data']['rows'];
		// 			this.expressive_baseThead = data['data']['baseThead'];
		// 			this.drawLineChart();
		// 		}
		// 		resolve("success");
		// 	},
		// 	error => {
		// 		reject("error");
		// 	}
		// 	);
		// })
	}

	//折线图
	drawLineChart(){
		// let tempArray = [];
		// for (const key in this.expressive_rows[0]) {
		// 	let tempObj = {};
		// 	if( key != "gene_id"){
		// 		tempObj["x"] = key;
		// 		tempObj["y"] = this.expressive_rows[0][key];
		// 		tempArray.push(tempObj);
		// 	}
		// }
		// console.log(tempArray);
		// let config: object = {
		// 	chart: {
		// 		title: "折线图",
		// 		smooth:true,
		// 		dblclick: function(event) {
		// 			var name = prompt("请输入需要修改的标题", "");
		// 			if (name) {
		// 			this.setChartTitle(name);
		// 			this.updateTitle();
		// 		}
		// 	},
		// 	width:600,
		// 	height:450,
		// 	el: "#lineChartDiv",
		// 	type: "line",
		// 	data: tempArray
		// 	},
		// 	axis: {
		// 		x: {
		// 			title: "Sample name",
		// 			rotate: 60,
		// 			dblclick: function(event) {
		// 				var name = prompt("请输入需要修改的标题", "");
		// 				if (name) {
		// 					this.setXTitle(name);
		// 					this.updateTitle();
		// 				}
		// 			}
		// 		},
		// 		y: {
		// 			title: "log10(FPKM+1)",
		// 			dblclick: function(event) {
		// 			var name = prompt("请输入需要修改的标题", "");
		// 			if (name) {
		// 				this.setYTitle(name);
		// 				this.updateTitle();
		// 			}
		// 			}
		// 		}
		// 	},
		// 	"tooltip": function(d) {
		// 		return "<span>x:"+d.key+"</span><br><span>y:"+d.value+"</span>"
		// 	}
		// }
		// new d4().init(config);
	}

	// SelectedExpressiveChange(num) {
	// 	this.expressive_index = num;
	// 	if(num==0){
	// 		this.expressive_params["geneType"] = "gene";
	// 	}else{
	// 		this.expressive_params["geneType"] = "transcript";
	// 	}
	// 	//this.sampleExpression();
	// }
	
	// //组间差异
	// async getGroupDiff(){
	// 	return new Promise((resolve, reject) => {
	// 		this.ajaxService
	// 		.getDeferData({
	// 			url: this.groupDiff_defaultUrl,
	// 			data: this.groupDiff_params
	// 		})
	// 		.subscribe((data: any) => {
	// 			if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
	// 				return;
	// 			} else if (data.status == '-1') {
	// 				return;
	// 			} else if (data.status == '-2') {
	// 				return;
	// 			} else {
	// 				this.groupDiff_rows = data['data']['rows'];
	// 				this.groupDiff_baseThead = data['data']['baseThead'];
	// 			}
	// 			resolve("success");
	// 		},
	// 		error => {
	// 			reject("error");
	// 		}
	// 		);
	// 	})
	// }

	SelectedGroupDiffChange(num) {
	// 	this.groupDiff_index = num;
	// 	if(num==0){
	// 		this.groupDiff_params["geneType"] = "gene";
	// 	}else{
	// 		this.groupDiff_params["geneType"] = "transcript";
	// 	}
	// 	this.getGroupDiff();
	}

	//样本差异
	async getSampleDiff(){
		// return new Promise((resolve, reject) => {
		// 	this.ajaxService
		// 	.getDeferData({
		// 		url: this.sampleDiff_defaultUrl,
		// 		data: this.sampleDiff_params
		// 	})
		// 	.subscribe((data: any) => {
		// 		if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
		// 			return;
		// 		} else if (data.status == '-1') {
		// 			return;
		// 		} else if (data.status == '-2') {
		// 			return;
		// 		} else {
		// 			this.sampleDiff_rows = data['data']['rows'];
		// 			this.sampleDiff_baseThead = data['data']['baseThead'];
		// 		}
		// 		resolve("success");
		// 	},
		// 	error => {
		// 		reject("error");
		// 	}
		// 	);
		// })
	}

	SelectedSampleDiffChange(num) {
		// this.sampleDiff_index = num;
		// if(num==0){
		// 	this.sampleDiff_params["geneType"] = "gene";
		// }else{
		// 	this.sampleDiff_params["geneType"] = "transcript";
		// }
		// this.getSampleDiff();
	}

	//mRna二次结构
	async getPrecursor(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.precursor_defaultUrl,
				data:this.precursor_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					console.log(data['data'])
					this.precursor_image = "data:image/png;base64,"+data['data']["image"];

				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	btnShow(){
		this.btn_show = !this.btn_show;
	}

	//转录本信息
	down_transcripts(){
		console.log("转录本信息");
	}

	//
	down_expressive_gene(){
		console.log("转录本信息");
	}

	down_expressive_transcripts(){

	}

	down_gene_group(){

	}

	down_gene_sample(){
		
	}

}
