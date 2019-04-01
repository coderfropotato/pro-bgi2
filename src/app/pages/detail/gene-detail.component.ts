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
	LCID: string;

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
	rna_flag: boolean = true;

	rows: object[] = [];
	baseThead: object[] = [];

	//样本表达量（FPKM）
	expressive_defaultUrl: string;
	expressive_params_g: object;
	expressive_g_flag: boolean = true;
	expressive_g_data: object[] = [];

	expressive_params_t: object;
	expressive_t_flag: boolean = true;
	expressive_t_data: object[] = [];

	expressive_params: object;
	expressive_rows: object[] = [];
	expressive_baseThead: object[] = [];
	expressive_geneType: string;
	expressive_index: number = 0;
	line_flag:boolean = false;
	line_flag2:boolean = false;

	//折线图
	// chartUrl: string;
    // chartEntity: object;
	// chart:any;
	chartLine:any;
	chartLine2:any;

	//组间差异
	groupDiff_defaultUrl: string;
	groupDiff_params_g: object;
	groupDiff_params_g_flag: boolean = true;
	groupDiff_params_t: object;
	groupDiff_params_t_flag: boolean = true;
	groupDiff_index: number = 0;

	//样本间差异
	sampleDiff_defaultUrl: string;
	sampleDiff_params_g: object;
	sampleDiff_params_g_flag: boolean = true;
	sampleDiff_params_t: object;
	sampleDiff_params_t_flag: boolean = true;
	sampleDiff_index: number = 0;

	//mRna二次结构
	precursor_defaultUrl: string;
	precursor_params: object;
	precursor_geneType: string;
	precursor_image: string;

	//SNP
	snp_defaultUrl: string;
	snp_params: object;
	snp_flag: boolean = true;

	//INDEL
	indel_defaultUrl: string;
	indel_params: object;
	indel_flag: boolean = true;

	//文献信息
	document_defaultUrl: string;
	document_params: object;
	documentList: object [] = [];
	documentPage: number = 10;  //每页10条
	documentTotal: number = 0; //文献总条数
	load_more_show: boolean = true;
	isSpinning: boolean = false;

	geneParamsUsed: object;
	transcriptParamsUsed: object;

	//功能注释信息
	functional_url: string;
	go_molecular_params: object;

	kegg_pathway_parameter: string = "kegg_pathway"; //KEGG Pathway
	kegg_reaction_parameter: string = "kegg_reaction";//KEGG Reaction
	kegg_module_parameter: string = "kegg_module";//KEGG Module
	kegg_disease_parameter: string = "kegg_disease";//KEGG Disease
	go_molecular_parameter: string = "go_f";//GO Molecular Function
	go_cellular_parameter: string = "go_c";//GO Cellular Component
	go_biological_parameter: string = "go_p";//GO Biological Process
	pfam_parameter: string = "pfam";//Pfam
	reactome_parameter: string = "reactome";//Reactome
	InterPro_parameter: string = "interpro";//InterPro
	cog_parameter: string = "cog";//COG
	eggnog_parameter: string = "eggnog";//EggNOG
	msigdb_H_parameter: string = "msigdb_h";//Msigdb_H
	msigdb_C1_parameter: string = "msigdb_c1";//Msigdb C1
	msigdb_C2_CGP_parameter: string = "msigdb_c2_cgp";//MsigDB C2_CGP
	msigdb_C2_CP_BIOCARTA_parameter: string = "msigdb_c2_cp_biocarta";//MsigDB C2_CP_BIOCARTA
	msigDB_C2_CP_parameter: string = "msigdb_C2_CP";//MsigDB C2_CP
	msigdb_C2_CP_KEGG_parameter: string = "msigdb_c2_cp_kegg";//MsigDB C2_CP_KEGG
	msigdb_C2_CP_REACTOME_parameter: string = "msigdb_c2_cp_reactome";//MsigDB C2_CP_REACTOME
	msigdb_C3_MIR_parameter: string = "msigdb_c3_mir";//MsigDB C3_MIR
	msigdb_C3_TFT_parameter: string = "msigdb_c3_tft";//MsigDB C3_TFT
	msigdb_C4_CGN_parameter: string = "msigdb_c4_cgn";//MsigDB C4_CGN
	msigdb_C4_CM_parameter: string = "msigdb_c4_cm";//MsigDB C4_CM
	msigdb_C5_BP_parameter: string = "msigdb_c5_bp";//MsigDB C5_BP
	msigdb_C5_CC_parameter: string = "msigdb_c5_cc";//MsigDB C5_CC
	msigdb_C5_MF_parameter: string = "msigdb_c5_mf";//MsigDB C5_MF
	msigdb_C6_parameter: string = "msigdb_c6";//Msigdb C6
	msigdb_C7_parameter: string = "msigdb_c7";//Msigdb C7
	msigdb_ARCHIVED_C5_MF_parameter: string = "msigdb_archived_c5_mf";//MsigDB ARCHIVED_C5_MF
	msigdb_ARCHIVED_C5_CC_parameter: string = "msigdb_archived_c5_cc";//MsigDB ARCHIVED_C5_CC
	msigdb_ARCHIVED_C5_BP_parameter: string = "msigdb_archived_c5_bp";//MsigDB ARCHIVED_C5_BP
	tf_cofactors_parameter: string = "tf_cofactors";//TF Cofactors
	tf_parameter: string = "tf";//Transcription Factor

	//GO Molecular Function
	go_f_list: object[] = [];
	go_f_flag: boolean = true;
	//GO Cellular Component
	go_c_list: object[] = [];
	go_c_flag: boolean = true;
	//GO Biological Process
	go_b_list: object[] = [];
	go_b_flag: boolean = true;
	
	kegg_way_url: string;//KEGG Pathway
	kegg_way_flag: boolean = true;
	kegg_reaction_url: string;//kegg_reaction
	kegg_reaction_flag: boolean = true;
	kegg_module_url: string;//KEGG Module
	kegg_module_flag: boolean = true;
	kegg_disease_url: string;//KEGG Disease
	kegg_disease_flag: boolean = true;
	pfam_url: string;//Pfam
	pfam_flag: boolean = true;
	reactome_url: string;//Reactome
	reactome_flag: boolean = true;
	interpro_url: string;//InterPro
	interpro_flag: boolean = true;
	cog_url: string;//COG
	cog_flag: boolean = true;
	eggnog_url: string;//EggNOG
	eggnog_flag: boolean = true;
	msigdb_h_url: string;//Msigdb_H
	msigdb_h_flag: boolean = true;
	msigdb_c1_url: string;//Msigdb C1
	msigdb_c1_flag: boolean = true;
	msigdb_c2_cgp_url: string;//MsigDB C2_CGP
	msigdb_c2_cgp_flag: boolean = true;
	msigdb_c2_cp_biocarta_url: string;//MsigDB C2_CP_BIOCARTA
	msigdb_c2_cp_biocarta_flag: boolean = true;
	msigdb_C2_CP_url: string;//MsigDB C2_CP
	msigdb_C2_CP_flag: boolean = true;
	msigdb_c2_cp_kegg_url: string;//MsigDB C2_CP_KEGG
	msigdb_c2_cp_kegg_flag: boolean = true;
	msigdb_c2_cp_reactome_url: string;//MsigDB C2_CP_REACTOME
	msigdb_c2_cp_reactome_flag: boolean = true;
	msigdb_c3_mir_url: string;//MsigDB C3_MIR
	msigdb_c3_mir_flag: boolean = true;
	msigdb_c3_tft_url: string;//MsigDB C3_TFT
	msigdb_c3_tft_flag: boolean = true;
	msigdb_c4_cgn_url: string;//MsigDB C4_CGN
	msigdb_c4_cgn_flag: boolean = true;
	msigdb_c4_cm_url: string;//MsigDB C4_CM
	msigdb_c4_cm_flag: boolean = true;
	msigdb_c5_bp_url: string;//MsigDB C5_BP
	msigdb_c5_bp_flag: boolean = true;
	msigdb_c5_cc_url: string;//MsigDB C5_CC
	msigdb_c5_cc_flag: boolean = true;
	msigdb_c5_mf_url: string;//MsigDB C5_MF
	msigdb_c5_mf_flag: boolean = true;
	msigdb_c6_url: string;//Msigdb C6
	msigdb_c6_flag: boolean = true;
	msigdb_c7_url: string;//Msigdb C7
	msigdb_c7_flag: boolean = true;
	msigdb_archived_c5_mf_url: string;//MsigDB ARCHIVED_C5_MF
	msigdb_archived_c5_mf_flag: boolean = true;
	msigdb_archived_c5_cc_url: string;//MsigDB ARCHIVED_C5_CC
	msigdb_archived_c5_c_flag: boolean = true;
	msigdb_archived_c5_bp_url: string;//MsigDB ARCHIVED_C5_BP
	msigdb_archived_c5_bp_flag: boolean = true;
	tf_cofactors_url: string;//TF Cofactors
	tf_cofactors_flag: boolean = true;
	tf_url: string;//Transcription Factor
	tf_flag: boolean = true;

	lcid:string = '';

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
		private routes:ActivatedRoute,
		private geneService: GeneService
	) {
		let langs = ['zh', 'en'];
		this.translate.addLangs(langs);
		this.translate.setDefaultLang('zh');
		let curLang = localStorage.getItem('lang');
		if(langs.includes(curLang)){
			this.translate.use(curLang)
		}else{
			this.translate.use('zh')
		}

		this.routes.paramMap.subscribe((params) => {
			this.lcid = params['params']['lcid'];
			this.geneID = params['params']['id'];
		});
	}

	ngOnInit() {
		this.geneParamsUsed = {
			LCID: this.lcid,
			geneType: "gene",
			geneID: this.geneID
		}

		this.transcriptParamsUsed = {
			LCID: this.lcid,
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
		this.expressive_geneType = "gene";
		this.expressive_defaultUrl = `${config['javaPath']}/geneDetail/exp`;
		this.expressive_params_g = this.geneParamsUsed;
		this.expressive_params_t = this.transcriptParamsUsed;
		this.expressive_params = this.geneParamsUsed;//折线图

		// //折线图

		//组间差异
		//this.groupDiff_geneType = "gene";
		this.groupDiff_defaultUrl = `${config['javaPath']}/geneDetail/groupDiff`;
		this.groupDiff_params_g = this.geneParamsUsed;
		this.groupDiff_params_t = this.transcriptParamsUsed

		//样本间差异
		//this.sampleDiff_geneType = "gene";
		this.sampleDiff_defaultUrl = `${config['javaPath']}/geneDetail/sampleDiff`;
		this.sampleDiff_params_g = this.geneParamsUsed;
		this.sampleDiff_params_t = this.transcriptParamsUsed;

		//mRna二次结构
		this.precursor_geneType = "gene";
		this.precursor_defaultUrl = `${config['javaPath']}/geneDetail/precursor`;
		this.precursor_params = this.geneParamsUsed;
		//geneID:"hsa-miR-223-3p"

		//SNP
		this.snp_defaultUrl = `${config['javaPath']}/geneDetail/snp`;
		this.snp_params = this.geneParamsUsed;

		//INDEL
		this.indel_defaultUrl = `${config['javaPath']}/geneDetail/indel`;
		this.indel_params = this.geneParamsUsed;

		//文献信息
		this.document_defaultUrl = `${config['javaPath']}/geneDetail/article`;
		this.document_params = {
			LCID: this.lcid,
			geneType: "gene",
			geneID: this.geneID,
			size:this.documentPage
		};

		// 功能注释信息

		// KEGG Pathway kegg_pathway
		this.functional_url = `${config['javaPath']}/geneDetail/annotation/`;
		this.go_molecular_params = this.geneParamsUsed;

		//KEGG Pathway
		this.kegg_way_url = `${config['javaPath']}/geneDetail/annotation/`+this.kegg_pathway_parameter;
		this.kegg_reaction_url = `${config['javaPath']}/geneDetail/annotation/`+this.kegg_reaction_parameter;
		this.kegg_module_url = `${config['javaPath']}/geneDetail/annotation/`+this.kegg_module_parameter;
		this.kegg_disease_url = `${config['javaPath']}/geneDetail/annotation/`+this.kegg_disease_parameter;
		this.pfam_url = `${config['javaPath']}/geneDetail/annotation/`+this.pfam_parameter;
		this.reactome_url = `${config['javaPath']}/geneDetail/annotation/`+this.reactome_parameter;
		this.interpro_url = `${config['javaPath']}/geneDetail/annotation/`+this.InterPro_parameter;
		this.cog_url = `${config['javaPath']}/geneDetail/annotation/`+this.cog_parameter;
		this.eggnog_url = `${config['javaPath']}/geneDetail/annotation/`+this.eggnog_parameter;
		this.msigdb_h_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_H_parameter;
		this.msigdb_c1_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C1_parameter;
		this.msigdb_c2_cgp_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C2_CGP_parameter;
		this.msigdb_c2_cp_biocarta_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C2_CP_BIOCARTA_parameter;
		this.msigdb_C2_CP_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigDB_C2_CP_parameter;
		this.msigdb_c2_cp_kegg_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C2_CP_KEGG_parameter;
		this.msigdb_c2_cp_reactome_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C2_CP_REACTOME_parameter;
		this.msigdb_c3_mir_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C3_MIR_parameter;
		this.msigdb_c3_tft_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C3_TFT_parameter;
		this.msigdb_c4_cgn_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C4_CGN_parameter;
		this.msigdb_c4_cm_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C4_CM_parameter;
		this.msigdb_c5_bp_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C5_BP_parameter;
		this.msigdb_c5_cc_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C5_CC_parameter;
		this.msigdb_c5_mf_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C5_MF_parameter;
		this.msigdb_c6_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C6_parameter;
		this.msigdb_c7_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_C7_parameter;
		this.msigdb_archived_c5_mf_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_ARCHIVED_C5_MF_parameter;
		this.msigdb_archived_c5_cc_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_ARCHIVED_C5_CC_parameter;
		this.msigdb_archived_c5_bp_url = `${config['javaPath']}/geneDetail/annotation/`+this.msigdb_ARCHIVED_C5_BP_parameter;
		this.tf_cofactors_url = `${config['javaPath']}/geneDetail/annotation/`+this.tf_cofactors_parameter;
		this.tf_url = `${config['javaPath']}/geneDetail/annotation/`+this.tf_parameter;

		(async () => {
			try {
				await this.getGeneInformation();//基因信息
				//await this.getRnaInformation();//转录本信息
				//await this.sampleExpression();//折线图
				//await this.getGroupDiff();//组间差异
				//await this.getSampleDiff();//样本间差异
				await this.getPrecursor();//二次结构
				await this.getDocumentInformation();//文献信息

				// 功能注释信息
				await this.getGoMolecular();// GO Molecular Function
				await this.getGOCellular();// GO Cellular Component
				await this.getGOBiological();// GO Cellular Component

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

	//折线图
	// async sampleExpression(){
	// 	return new Promise((resolve, reject) => {
	// 		this.ajaxService
	// 		.getDeferData({
	// 			url: this.expressive_defaultUrl,
	// 			data: this.expressive_params
	// 		})
	// 		.subscribe((data: any) => {
	// 			if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
	// 				return;
	// 			} else if (data.status == '-1') {
	// 				return;
	// 			} else if (data.status == '-2') {
	// 				return;
	// 			} else {
	// 				this.expressive_rows = data['data']['rows'];
	// 				this.expressive_baseThead = data['data']['baseThead'];
	// 				if(data['data']['rows'].length != 0){
	// 					this.drawLineChart();
	// 					this.line_flag = true;
	// 				}
					
	// 			}
	// 			resolve("success");
	// 		},
	// 		error => {
	// 			reject("error");
	// 		}
	// 		);
	// 	})
	// }

	SelectedExpressiveChange(num) {
		this.expressive_index = num;
		if(num==0){
			//this.expressive_g_flag = this.expressive_g_data.length > 0?true:false;
			this.drawLineChart(this.expressive_g_data);
		}else{
			//this.expressive_t_flag = this.expressive_g_data.length > 0?true:false;
			this.drawLineChart2(this.expressive_t_data);
		}
	}


	//折线图
	drawLineChart(data){
		document.getElementById("lineChartDiv").innerHTML = "";
		let tempdata = data[0];
		let tempArray = [];
		for (const key in tempdata) {
			let tempObj = {};
			if( key != "gene_id"){
				tempObj["x"] = key;
				tempObj["y"] = tempdata[key];
				tempArray.push(tempObj);
			}
		}
		//console.log(tempArray);
		this.line_flag2 = false;
		if(tempArray.length == 0){
			return;
		}else{
			this.line_flag = true;
		}

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
			width:600,
			height:450,
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
		this.chartLine=new d4().init(config);
	}

	drawLineChart2(data){
		document.getElementById("lineChartDiv2").innerHTML = "";
		let tempdata = data[0];
		let tempArray = [];
		for (const key in tempdata) {
			let tempObj = {};
			if( key != "gene_id"){
				tempObj["x"] = key;
				tempObj["y"] = tempdata[key];
				tempArray.push(tempObj);
			}
		}
		//console.log(tempArray);
		this.line_flag = false;
		if(tempArray.length == 0){
			return;
		}else{
			this.line_flag2 = true;
		}

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
			width:600,
			height:450,
			el: "#lineChartDiv2",
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
		this.chartLine2=new d4().init(config);
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
					if(data['data']["image"] != ""){
						this.precursor_image = "data:image/png;base64,"+data['data']["image"];
					}

				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	//文献信息
	async getDocumentInformation(){
		this.isSpinning = true;
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.document_defaultUrl,
				data:this.document_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					//console.log(data['data'])
					this.isSpinning = false;
					this.documentList = data['data']['rows'];
					this.documentTotal = data['data']['total'];
					if(this.documentTotal <= this.documentPage){
						this.load_more_show = false;
					}
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	// GO Molecular Function
	async getGoMolecular(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.functional_url+this.go_molecular_parameter,
				data:this.go_molecular_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					//console.log(data['data']['rows'])
					this.go_f_list = data['data']['rows'];
					if(data['data']['rows'].length == 0){
						this.go_f_flag = false;
					}
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	// GO Cellular Component
	async getGOCellular(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.functional_url+this.go_biological_parameter,
				data:this.go_molecular_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					//console.log(data['data']);
					this.go_b_list = data['data']['rows'];
					if(data['data']['rows'].length == 0){
						this.go_b_flag =false;
					}
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	//GO Biological Process
	async getGOBiological(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.functional_url+this.go_cellular_parameter,
				data:this.go_molecular_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					//console.log(data['data']);
					this.go_c_list = data['data']['rows'];
					if(data['data']['rows'].length == 0){
						this.go_c_flag =false;
					}
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

	//转录本信息 下载
	down_transcripts(){
		//console.log("转录本信息");
	}

	loadMore(){
		this.document_params["size"] = this.documentTotal;
		this.getDocumentInformation();
		this.load_more_show = false;
	}

	drawKEGGPathway(data){
		let tempData = data["data"]["rows"];
		switch (data.type) {
			case this.kegg_pathway_parameter:
				this.kegg_way_flag = tempData.length>0?true:false;
				break;
			case this.kegg_reaction_parameter:
				this.kegg_reaction_flag = tempData.length>0?true:false;
				break;
			case this.kegg_module_parameter:
				this.kegg_module_flag = tempData.length>0?true:false;
				break;
			case this.kegg_disease_parameter:
				this.kegg_disease_flag = tempData.length>0?true:false;
				break;
				case this.pfam_parameter:
				this.pfam_flag = tempData.length>0?true:false;
				break;
			case this.reactome_parameter:
				this.reactome_flag = tempData.length>0?true:false;
				break;
			case this.InterPro_parameter:
				this.interpro_flag = tempData.length>0?true:false;
				break;
			case this.cog_parameter:
				this.cog_flag = tempData.length>0?true:false;
				break;
			case this.eggnog_parameter:
				this.eggnog_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_H_parameter:
				this.msigdb_h_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C1_parameter:
				this.msigdb_c1_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C2_CGP_parameter:
				this.msigdb_c2_cgp_flag = tempData.length>0?true:false;
				break;
				case this.msigdb_C2_CP_BIOCARTA_parameter:
				this.msigdb_c2_cp_biocarta_flag = tempData.length>0?true:false;
				break;
			case this.msigDB_C2_CP_parameter:
				this.msigdb_C2_CP_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C2_CP_KEGG_parameter:
				this.msigdb_c2_cp_kegg_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C2_CP_REACTOME_parameter:
				this.msigdb_c2_cp_reactome_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C3_MIR_parameter:
				this.msigdb_c3_mir_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C3_TFT_parameter:
				this.msigdb_c3_tft_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C4_CGN_parameter:
				this.msigdb_c4_cgn_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C4_CM_parameter:
				this.msigdb_c4_cm_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C5_BP_parameter:
				this.msigdb_c5_bp_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C5_CC_parameter:
				this.msigdb_c5_cc_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C5_MF_parameter:
				this.msigdb_c5_mf_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_C6_parameter:
				this.msigdb_c6_flag = tempData.length>0?true:false;
				break;
				case this.msigdb_C7_parameter:
				this.msigdb_c7_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_ARCHIVED_C5_MF_parameter:
				this.msigdb_archived_c5_mf_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_ARCHIVED_C5_CC_parameter:
				this.msigdb_archived_c5_c_flag = tempData.length>0?true:false;
				break;
			case this.msigdb_ARCHIVED_C5_BP_parameter:
				this.msigdb_archived_c5_bp_flag = tempData.length>0?true:false;
				break;
			case this.tf_cofactors_parameter:
				this.tf_cofactors_flag = tempData.length>0?true:false;
				break;
			case this.tf_parameter:
				this.tf_flag = tempData.length>0?true:false;
				break;
			case "SNP":
				this.snp_flag = tempData.length>0?true:false;
				break;
			case "INDEL":
				this.indel_flag = tempData.length>0?true:false;
				break;
			case "FPKM_gene":
				this.expressive_g_flag = tempData.length>0?true:false;
				this.expressive_g_data = tempData;
				if(this.expressive_index == 0){
					this.drawLineChart(this.expressive_g_data);
				}
				break;
			case "FPKM_trans":
				this.expressive_t_flag = tempData.length>0?true:false;
				this.expressive_t_data = tempData;
				if(this.expressive_index == 1){
					this.drawLineChart(this.expressive_t_data);
				}
				break;
			
			case "diff_group_gene":
				this.groupDiff_params_g_flag = tempData.length>0?true:false;
				break;
			case "diff_group_trans":
				this.groupDiff_params_t_flag = tempData.length>0?true:false;
				break;
			case "diff_sample_gene":
				this.sampleDiff_params_g_flag = tempData.length>0?true:false;
				break;
			case "diff_sample_trans":
				this.sampleDiff_params_t_flag = tempData.length>0?true:false;
				break;
			case "rna_type":
			    this.rna_flag = tempData.length>0?true:false;
				break;
			default:
				break;
		}
	}
}
