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

	//转录本信息
	expressive_defaultUrl: string;
	expressive_params: object;
	expressive_rows: object[] = [];
	expressive_baseThead: object[] = [];
	expressive_geneType: string;
	expressive_index: number = 0;

	//折线图
	// chartUrl: string;
    // chartEntity: object;
	// chart:any;
	
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
		
		//基因信息
		this.gene_url = `${config['javaPath']}/geneDetail/info`;
		this.gene_params = {
			LCID: this.storeService.getStore('LCID'),
			geneType: "gene",
			geneID: this.geneID
		};

		//转录本信息
		this.defaultUrl = `${config['javaPath']}/geneDetail/rnaID`;
		this.rna_params = {
			LCID: this.storeService.getStore('LCID'),
			geneType: "gene",
			geneID: this.geneID
		};

		//样本表达量
		this.expressive_geneType = "gene";
		this.expressive_defaultUrl = `${config['javaPath']}/geneDetail/exp`;
		this.expressive_params = {
			LCID: this.storeService.getStore('LCID'),
			geneType: this.expressive_geneType,
			geneID: this.geneID
		};

		// //折线图
		// this.chartUrl=`${config['javaPath']}/geneDetail/exp`;
        // this.chartEntity = {

		// };

		(async () => {
			try {
				await this.getGeneInformation();
				await this.getRnaInformation();
				await this.sampleExpression();
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
			this.ajaxService
			.getDeferData({
				url: this.defaultUrl,
				data: this.rna_params
			})
			.subscribe((data: any) => {
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.rows = data['data']['rows'];
					this.baseThead = data['data']['baseThead'];
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			);
		})
	}

	//样本表达量
	async sampleExpression(){
		return new Promise((resolve, reject) => {
			this.ajaxService
			.getDeferData({
				url: this.expressive_defaultUrl,
				data: this.expressive_params
			})
			.subscribe((data: any) => {
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.expressive_rows = data['data']['rows'];
					this.expressive_baseThead = data['data']['baseThead'];
					this.drawLineChart();
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			);
		})
	}

	drawLineChart(){
		let tempArray = [];
		for (const key in this.expressive_rows[0]) {
			let tempObj = {};
			if( key != "gene_id"){
				tempObj["x"] = key;
				tempObj["y"] = this.expressive_rows[0][key];
				tempArray.push(tempObj);
			}
		}
		console.log(tempArray);
		let config: object = {
			chart: {
				title: "折线图",
				smooth:true,
				dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
					this.setChartTitle(name);
					this.updateTitle();
				}
			},
			el: "#lineChartDiv",
			type: "line",
			data: tempArray
			},
			axis: {
				x: {
					title: "Sample name",
					rotate: 60,
					dblclick: function(event) {
						var name = prompt("请输入需要修改的标题", "");
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
				},
				y: {
					title: "log10(FPKM+1)",
					dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
						this.setYTitle(name);
						this.updateTitle();
					}
					}
				}
			},
			"tooltip": function(d) {
				return "<span>x:"+d.key+"</span><br><span>y:"+d.value+"</span>"
			}
		}
		new d4().init(config);
	}

	SelectedExpressiveChange(num) {
		//console.log(num);
		this.expressive_index = num;
		if(num==0){
			this.expressive_params["geneType"] = "gene";
		}else{
			this.expressive_params["geneType"] = "transcript";
		}
		this.sampleExpression();
    }
	btnShow(){
		this.btn_show = !this.btn_show;
	}

}
