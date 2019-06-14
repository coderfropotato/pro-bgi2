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
import { NzMessageService } from 'ng-zorro-antd';

declare const d3: any;
declare const gooalD3: any;
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
	isSts:boolean=false;

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
		genome_url:"",//
		genome_version_official:"",
		genebank_desc:""
	};

	btn_show: boolean = true;

	//转录本信息
	defaultUrl: string;
	rna_params: object;
	rna_flag: boolean = true;
	rna_rows: object[] = [];
	rna_baseThead: object[] = [];

	rows: object[] = [];
	baseThead: object[] = [];

	//样本表达量（FPKM）
	expressive_defaultUrl: string;
	expressive_params_g: object;
	expressive_g_flag: boolean = true;
	expressive_g_data: object[] = [];
	expressive_g_header: object[] = [];

	expressive_params_t: object;
	expressive_t_flag: boolean = true;
	expressive_t_data: object[] = [];
	expressive_t_header: object[] = [];

	//expressive_params: object;
	expressive_rows: object[] = [];
	expressive_baseThead: object[] = [];
	expressive_geneType: string;
	expressive_index: number = 0;
	line_flag:boolean = true;
	line_flag2:boolean = true;

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

	//miRNA靶向信息
	miRnaTarget_defaultUrl: string;
	miRnaTarget_params_g: object;
	miRnaTarget_params_g_flag: boolean = true;
	miRnaTarget_params_t: object;
	miRnaTarget_params_t_flag: boolean = true;
	miRnaTarget_index: number = 0;

	//mRna二次结构
	precursor_defaultUrl: string;
	precursor_params: object;
	precursor_geneType: string;
	precursor_image: string;

	//可变剪切
	alternative_defaultUrl: string;
	alternative_params: object;
	alternative_flag: boolean = true;
	alternative_rows: object[] = [];
	alternative_baseThead: object[] = [];

	//SNP
	snp_defaultUrl: string;
	snp_params: object;
	snp_flag: boolean = true;

	//INDEL
	indel_defaultUrl: string;
	indel_params: object;
	indel_flag: boolean = true;

	//融合基因
	fusion_defaultUrl: string;
	fusion_params: object;
	fusion_flag: boolean = true;

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
	geneType:string = '';
	species:string = '';
	loadTable: boolean = false;
	loadTable3: boolean = false;

	t_show: boolean = false;
	c_show: boolean = false;
	d_show: boolean = false;

	t_params: object;
	t_content: string;
	c_params: object;
	c_content: string;
	d_params: object;
	d_content: string;

	tcd_defaultUrl: string;

	isLoading: boolean = false;
	isLoading2: boolean = false;

	msigdbFlag: boolean = false;
	loadTable2: boolean = false;
	msigdbFlagBtn: boolean = false;

	// scroll: any;
	scroll: any = { x: "0", y: "0" };
	scroll2: any = { x: "0", y: "0" };

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
		private geneService: GeneService,
		private nzMessage: NzMessageService
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
			let type = params['params']['type'];
			this.lcid = params['params']['lcid'];
			this.geneID = params['params']['id'];
			this.geneType = params['params']['geneType'];
			this.species = params['params']['species'];
			this.isSts = type==='sts' ? true : false;
		 });	 
	}

	ngOnInit() {
		(async () => {
			try {
				if(this.geneType == "rna"){
					await this.getGeneID();
				}

				this.geneParamsUsed = {
					LCID: this.lcid,
					geneType: "gene",
					geneID: this.geneID,
					isSts:this.isSts
				}

				this.transcriptParamsUsed = {
					LCID: this.lcid,
					geneType: "rna",
					geneID: this.geneID,
					isSts:this.isSts
				}

				//基因信息
				this.gene_url = `${config['javaPath']}/geneDetail/info`;
				this.gene_params = this.geneParamsUsed;

				await this.getGeneInformation();//基因信息

				//转录本信息
				this.defaultUrl = `${config['javaPath']}/geneDetail/rnaID`;
				this.rna_params = this.geneParamsUsed;

				//样本表达量
				this.expressive_geneType = "gene";
				this.expressive_defaultUrl = `${config['javaPath']}/geneDetail/exp`;
				this.expressive_params_g = this.geneParamsUsed;
				this.expressive_params_t = this.transcriptParamsUsed;
				//this.expressive_params = this.geneParamsUsed;//折线图
				
				this.loadTable3 = true;

				//组间差异
				this.groupDiff_defaultUrl = `${config['javaPath']}/geneDetail/groupDiff`;
				this.groupDiff_params_g = this.geneParamsUsed;
				this.groupDiff_params_t = this.transcriptParamsUsed;

				//样本间差异
				this.sampleDiff_defaultUrl = `${config['javaPath']}/geneDetail/sampleDiff`;
				this.sampleDiff_params_g = this.geneParamsUsed;
				this.sampleDiff_params_t = this.transcriptParamsUsed;
				

				//miRna靶向信息
				this.miRnaTarget_defaultUrl = `${config['javaPath']}/geneDetail/miRNATarget`;
				this.miRnaTarget_params_g = this.geneParamsUsed;
				this.miRnaTarget_params_t = this.transcriptParamsUsed;

				//mRna二次结构
				this.precursor_geneType = "gene";
				this.precursor_defaultUrl = `${config['javaPath']}/geneDetail/precursor`;
				this.precursor_params = this.geneParamsUsed;

				//可变剪切
				this.alternative_defaultUrl = `${config['javaPath']}/geneDetail/getAS`;
				this.alternative_params = this.geneParamsUsed;

				//SNP
				this.snp_defaultUrl = `${config['javaPath']}/geneDetail/snp`;
				this.snp_params = this.geneParamsUsed;

				//INDEL
				this.indel_defaultUrl = `${config['javaPath']}/geneDetail/indel`;
				this.indel_params = this.geneParamsUsed;

				//融合基因
				this.fusion_defaultUrl = `${config['javaPath']}/geneDetail/getFusion`;
				this.fusion_params = this.geneParamsUsed;

				//文献信息
				this.document_defaultUrl = `${config['javaPath']}/geneDetail/article`;
				this.document_params = {
					LCID: this.lcid,
					geneType: "gene",
					geneID: this.geneID,
					size:this.documentPage,
					isSts:this.isSts
				};

				this.tcd_defaultUrl = `${config['javaPath']}/geneDetail/getSequence`;
				this.t_params={
					LCID: this.lcid,
					type: "rna.fa",
					geneID: this.geneID,
					isSts:this.isSts
				};
				this.c_params={
					LCID: this.lcid,
					type: "cds.fa",
					geneID: this.geneID,
					isSts:this.isSts
				};
				this.d_params={
					LCID: this.lcid,
					type: "protein.fa",
					geneID: this.geneID,
					isSts:this.isSts
				};

				// 功能注释信息
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

				this.loadTable = true;

				await this.getPrecursor();//二次结构
				await this.getDocumentInformation();//文献信息

				await this.getAlternative();

				//转录本序列
				//CDS序列
				//蛋白序列
				await this.getTsequence();
				await this.getCsequence();
				await this.getDsequence();

				// 功能注释信息
				await this.getGoMolecular();// GO Molecular Function
				await this.getGOCellular();// GO Cellular Component
				await this.getGOBiological();// GO Cellular Component

				await this.getRna();

			}catch (error){

			}
		})();
	}

	async getGeneID(){
		return new Promise((resolve, reject) => {
			this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/geneDetail/getGeneID`,
				data: {
					"LCID": this.lcid,
					"geneType": "rna",
					"id": this.geneID,
					"isSts":this.isSts
				}

			})
			.subscribe((data: any) => {
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					// console.log(data);
					this.geneID = data["data"].geneID;
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			);
		})
	}

	async getAlternative(){
		this.isLoading = true;
		return new Promise((resolve, reject) => {
			this.ajaxService
			.getDeferData({
				url: this.alternative_defaultUrl,
				data: this.alternative_params
			})
			.subscribe((data: any) => {
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					this.isLoading = false;
					this.alternative_flag = false;
					resolve("success");
					return;
				} else if (data.status == '-1') {
					this.isLoading = false;
					this.alternative_flag = false;
					resolve("success");
					return;
				} else if (data.status == '-2') {
					this.isLoading = false;
					this.alternative_flag = false;
					resolve("success");
					return;
				} else {
					this.alternative_rows = data['data']['rows'];
					this.alternative_baseThead = data['data']['baseThead'];
					this.alternative_flag = this.alternative_rows.length>0?true:false;

					if(this.alternative_rows.length>5){
						$(`#as_id .ant-table-body`).css("height", `210px`);
                        this.scroll["y"] = `210px`;
					}else{
						this.scroll = { x: "100%"}
					}
				}
				this.isLoading = false;
				resolve("success");
			},
			error => {
				reject("error");
			}
			);
		})
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

	SelectedExpressiveChange(num) {
		// console.log(num)
		this.expressive_index = num;
		if(num==0){
			this.line_flag = false;
			this.line_flag2 = true;
		}else{
			this.line_flag2 = false;
			this.line_flag = true;
		}
	}


	//折线图
	drawLineChart(){
		// console.log(this.expressive_g_data);
		let data = this.expressive_g_data;
		let tempdata = data[0];
		let tempArray = [];
		// for (const key in tempdata) {
		// 	let tempObj = {};
		// 	if( key != "gene_id"){
		// 		//tempObj["x"] = key.indexOf("_") != -1 ? key.split("_")[1]:key;
		// 		tempObj["x"] = key;
		// 		tempObj["y"] = tempdata[key];
		// 		tempArray.push(tempObj);
		// 	}
		// }
        for (let i = 0; i < this.expressive_g_header.length; i++) {
            let header = this.expressive_g_header[i];
            if (header["true_key"] === "gene_id" || header["true_key"] == "rna_id") {
                continue;
            }
            let tempObj = {};
            tempObj["x"] = header["name"].split(" ")[0];
            if (!tempdata.hasOwnProperty(header["true_key"])) {
                tempObj["y"] = 0;
            } else {
                tempObj["y"] = Math.log10(tempdata[header["true_key"]] + 1);
            }
            tempArray.push(tempObj);
        }
		if(tempArray.length == 0){
			return;
		}

		let that = this;

		let config: object = {
			chart: {
				// title: "折线图",
				smooth:true,
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				width:600,
				height:450,
				el: "#lineChartDiv",
				type: "line",
				data: tempArray
			},
			axis: {
				x: {
					title: "Sample Name",
					rotate: 70,
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
				},
				y: {
					title: "log2(Value+1)",
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					}
				}
			},
			"tooltip": function(d) {
				return "<span>Sample name："+d.x+"</span><br><span>log10(FPKM+1)："+d.y+"</span>"
			}
		}
		this.chartLine=new gooalD3().init(config);
	}

	drawLineChart2(){
		// console.log(this.expressive_t_data);
		let data = this.expressive_t_data;
		let tempdata = data[0];
		let tempArray = [];

		for (let i = 0; i < this.expressive_t_header.length; i++) {
            let header = this.expressive_t_header[i];
            if (header["true_key"] === "gene_id" || header["true_key"] == "rna_id") {
                continue;
            }
            let tempObj = {};
            tempObj["x"] = header["name"].split(" ")[0];
            if (!tempdata.hasOwnProperty(header["true_key"])) {
                tempObj["y"] = 0;
            } else {
                tempObj["y"] = Math.log10(tempdata[header["true_key"]] + 1);
            }
            tempArray.push(tempObj);
        }
		if(tempArray.length == 0){
			return;
		}
		// for (const key in tempdata) {
		// 	let tempObj = {};
		// 	if( key != "gene_id"){
		// 		tempObj["x"] = key;
		// 		tempObj["y"] = tempdata[key];
		// 		tempArray.push(tempObj);
		// 	}
		// }
		// if(tempArray.length == 0){
		// 	return;
		// }

		let that = this;
		let config: object = {
			chart: {
				title: "折线图",
				smooth:true,
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
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
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
				},
				y: {
					title: "log2(Value+1)",
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					}
				}
			},
			"tooltip": function(d) {
				return "<span>x:"+d.key+"</span><br><span>y:"+d.value+"</span>"
			}
		}
		this.chartLine2=new gooalD3().init(config);
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
			// case "alternative":
			// 	this.alternative_flag = tempData.length>0?true:false;
			// 	break;
			case "SNP":
				// console.log(data);
				this.snp_flag = tempData.length>0?true:false;
				break;
			case "INDEL":
				this.indel_flag = tempData.length>0?true:false;
				break;
			case "fusion":
				this.fusion_flag = tempData.length>0?true:false;
				break;
			case "FPKM_gene":
				this.expressive_g_flag = tempData.length>0?true:false;
				this.expressive_g_data = tempData;
				this.expressive_g_header = data["data"]["baseThead"];
				// if(this.expressive_index == 0){
				// 	this.drawLineChart(this.expressive_g_data);
				// }
				if(this.expressive_g_flag){
					this.drawLineChart();
					this.line_flag = false;
				}
				break;
			case "FPKM_trans":
				this.expressive_t_flag = tempData.length>0?true:false;
				this.expressive_t_data = tempData;
				this.expressive_t_header = data["data"]["baseThead"];

				// if(this.expressive_t_flag){
				// 	this.drawLineChart2()
				// 	this.line_flag2 = true;
				// }
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
			case "miRna_target_gene":
				this.miRnaTarget_params_g_flag = tempData.length>0?true:false;
				break;
			case "miRna_target_trans":
				this.miRnaTarget_params_t_flag = tempData.length>0?true:false;
				break;
			default:
				break;
		}
	}

	T_click(){
		this.t_show = !this.t_show;
	}

	CDS_click(){
		this.c_show = !this.c_show;
	}

	D_click(){
		this.d_show = !this.d_show;
	}

	async getTsequence(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.tcd_defaultUrl,
				data:this.t_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.t_content = data['data']['seq'];
					//console.log(data['data']['seq']);
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}
	async getCsequence(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.tcd_defaultUrl,
				data:this.c_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.c_content = data['data']['seq'];
					//console.log(data['data']['seq']);
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}
	async getDsequence(){
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.tcd_defaultUrl,
				data:this.d_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					this.d_content = data['data']['seq'];
					//console.log(data['data']['seq']);
				}
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}

	download(filename, text) {
		var date = new Date();
		var d = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " +date.getHours()+ ":" + date.getMinutes()+":"+date.getSeconds();
		let tempName = filename +d+".txt";
		var pom = document.createElement('a');
		pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		pom.setAttribute('download', tempName);
		if (document.createEvent) {
			var event = document.createEvent('MouseEvents');
			event.initEvent('click', true, true);
			pom.dispatchEvent(event);
		} else {
			pom.click();
		}
	}

	downPDF(data){
		if(data.pdfLink==0){
			//this.nzMessage.create(`warning`, `不支持不支持下载!`);
		}else{
			let tempUrl = `http://biosys.bgi.com/project/production/BGI_${this.lcid}/Structure_and_variation/Alternative_splicing/AS_plot/${data['as_group_name']}/${data['as_id']}_${data['as_group_name']}_${data['as_type']}_${this.geneID}.pdf`;
			window.open(tempUrl);
		}
		// let tempUrl = `http://biosys.bgi.com/project/test/BGI_${this.lcid}/Structure_and_variation/Alternative_splicing/AS_plot/${data['as_group_name']}/${data['as_id']}_${data['as_group_name']}_${data['as_type']}_${this.geneID}.pdf`;
		// window.open(tempUrl);
	}

	loadMsigdb(){
		this.msigdbFlag = true;
		this.loadTable2 = true;
		this.msigdbFlagBtn = true;
	}

	async getRna(){
		this.isLoading2 = true;
		return new Promise((resolve,reject)=>{
			this.ajaxService
			.getDeferData({
				url:this.defaultUrl,
				data:this.rna_params
			})
			.subscribe((data:any)=>{
				if (data.status == '0' && (data.data.length == 0 || $.isEmptyObject(data.data))) {
					return;
				} else if (data.status == '-1') {
					return;
				} else if (data.status == '-2') {
					return;
				} else {
					console.log(data['data']['seq']);
					this.rna_rows = data['data']['rows'];
					this.rna_baseThead = data['data']['baseThead'];
					this.rna_flag = this.rna_rows.length>0?true:false;

					if(this.rna_rows.length>5){
						//this.scroll2 = { x: "100%",y:"200px"}
						$(`#rna_id .ant-table-body`).css("height", `200px`);
                        this.scroll2["y"] = `200px`;
					}else{
						this.scroll2 = { x: "100%"}
					}
				}
				this.isLoading2 = false;
				resolve("success");
			},
			error => {
				reject("error");
			}
			)
		})
	}
}
