import { AddColumnService } from '../../super/service/addColumnService';
import { StoreService } from '../../super/service/storeService';
import { PageModuleService } from '../../super/service/pageModuleService';
import { MessageService } from '../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from '../../super/service/promptService';
import config from '../../../config';
declare const d3: any;
declare const d4: any;
declare const Venn: any;

@Component({
	selector: 'app-diff-expression-number-page',
	template: `<app-diff-expression-number-component *ngIf="showModule" [defaultGeneType]="defaultGeneType">
                    <div *ngIf="rootGeneType===config['geneTypeAll']" class="gene-switch gene-switch-module" (click)="handlerSwitchChange()">
                        <span>{{defaultGeneType | translate}}</span><i class="iconfont icon-qiehuan"></i>
                    </div>
                    <div *ngIf="rootGeneType!==config['geneTypeAll']" class="gene-switch gene-switch-module nocursor">
                        <span>{{defaultGeneType | translate}}</span>
                    </div>
                </app-diff-expression-number-component>`,
	styles: []
})
export class DiffVennNumberPage {
	private moduleRouteName: string = 'diff-expression-number'; // 模块默认路由 通过路由名称查找菜单配置项（geneType）；
	config: object = config;
	rootGeneType: string = this.storeService.getStore('menuRouteMap')[this.moduleRouteName]['geneType']; // 来自菜单 可配置  all gene transcript
	defaultGeneType: string = this.rootGeneType === this.config['geneTypeAll']
		? this.config['geneTypeOfGene']
		: this.rootGeneType;
	showModule: boolean = true;

	constructor(private storeService: StoreService, private translate: TranslateService) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	handlerSwitchChange() {
		this.defaultGeneType =
			this.defaultGeneType === config['geneTypeOfGene']
				? config['geneTypeOfTranscript']
				: config['geneTypeOfGene'];
		this.showModule = false;
		setTimeout(() => {
			this.showModule = true;
		}, 30);
	}
}

@Component({
	selector: 'app-diff-expression-number-component',
	templateUrl: './diff-expression-number.component.html',
	styles: []
})
export class DiffExpressionNumberComponent implements OnInit {
	// 表格高度相关
	@ViewChild('left') left;
	@ViewChild('right') right;
	@ViewChild('func') func;
	@ViewChild('addColumn') addColumn;
	@ViewChild('diffVennNumberChart') diffVennNumberChart;
	@ViewChild('transformTable') transformTable;
	@Input('defaultGeneType') defaultGeneType;

	switch: string = 'right';
	tableUrl: string;
	// 默认收起模块描述
	expandModuleDesc: boolean = false;

	// vennEntity: object;
	defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;
	defaultDefaultChecked: boolean;
	defaultCheckStatusInParams: boolean;
	defaultEmitBaseThead: boolean;
	defaultShowFilterStatus: boolean = false;

	extendEntity: object;
	extendUrl: string;
	extendTableId: string;
	extendDefaultChecked: boolean;
	extendCheckStatusInParams: boolean;
	extendEmitBaseThead: boolean;
	baseThead: any[] = [];
	applyOnceSearchParams: boolean;

	venSelectAllData: string[] = [];
	selectConfirmData: string[] = [];

	panelShow: boolean = false;

	tableEntity: object = {};
	selectPanelData: object[] = [];
	venn_or_upsetR: boolean;

	//图例颜色
	isShowColorPanel: boolean = false;
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color

	isShowColorPanelL: boolean = false;
	legendIndexL: number = 0; //当前点击图例的索引
	colorL: string; //当前选中的color

	isShowSpan_PossionDis: boolean = false;
	isShowSpan_NOIseq: boolean = false;
	isShowSpan_DEGseq: boolean = false;
	isShowSpan_DESeq2: boolean = false;
	isShowSpan_EBSeq: boolean = false;

	//参数名字设置
	tempThreshold: object;
	thresholdName: string[] = [];

	p_show: boolean; //设置里面的PossionDis
	PossionDis: object = {
		log2FC: '',
		FDR: ''
	};
	p_log2FC: string;
	p_FDR: string;

	n_show: boolean; //设置里面的NOIseq
	NOIseq: object = {
		log2FC: '',
		probability: ''
	};
	n_log2FC: string;
	n_probability: string;

	d_show: boolean; //设置里面的DEGseq
	DEGseq: object = {
		log2FC: '',
		Qvalue: ''
	};
	d_log2FC: string;
	d_Qvalue: string;

	de_show: boolean; //设置里面的DESeq2
	DESeq2: object = {
		log2FC: '',
		Qvalue: ''
	};
	de_log2FC: string;
	de_Qvalue: string;

	e_show: boolean; //设置里面的EBSeq
	EBSeq: object = {
		log2FC: '',
		PPEE: ''
	}
	e_log2FC: string;
	e_PPEE: string;

	activedCompareGroup: any[] = [];
	singleMultiSelect: object = {
		bar_name: '',
		total_name: '',
		venn_name: ''
	};

	//多选
	doubleMultiSelect: object = {
		bar_name: [],
		total_name: []
	};
	pageEntity: object = {
		pageSize: 20
	};

	chart: any;
	chartS: any;
	//isMultiSelect: boolean;
	selectedData: object[] = [];

	tableHeight = 0;
	first = true;

	venn: any; // 韦恩图对象实例

	leftSelect: any[] = [];
	upSelect: any[] = [];

	addColumnShow: boolean = false;
	showBackButton: boolean = false;

	selectGeneCount: number = 0;
	computedScrollHeight: boolean = false;


	compareTableGroupList: any[] = [];   //表的参数
	compareMapGroupList: any[] = []; //图的参数
	compareNewGroupList: any[] = [];
	compareGroup: any = '';

	isExceed: any = null;
	selectedVal: string = '';
	selectData: any = [];

	allChartData: any[] = [];

	m_type: string = null;

	m_name1:string; //比较组
	m_name2:string; //类型

	mfirst: boolean = true;

	constructor(
		private message: MessageService,
		private globalService: GlobalService,
		public storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private promptService: PromptService,
		private addColumnService: AddColumnService,
		private router: Router
	) {
		// 订阅windowResize 重新计算表格滚动高度
		this.message.getResize().subscribe((res) => {
			if (res['message'] === 'resize') this.computedTableHeight();
		});

		// 每次切换路由计算表格高度
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) this.computedTableHeight();
		});
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	ngOnInit() {
		//this.isMultiSelect = false;
		this.first = true;
		this.selectedData = [];
		this.tableUrl = `${config['javaPath']}/SampleDiff/graph`;

		this.compareMapGroupList = this.storeService.getStore('diff_plan');

		this.compareNewGroupList = ["ALL"].concat(this.storeService.getStore('diff_plan'));
		this.compareGroup = this.compareNewGroupList[0];
		this.m_name1 = this.compareNewGroupList[1];
		this.compareTableGroupList.push(this.compareNewGroupList[1]);

		this.selectData = ["Up+Down","Total"];
		this.selectedVal = this.selectData[1];
		this.m_name2 = this.selectedVal;

		//this.tempThreshold = this.storeService.getStore('diff_threshold');
		this.tempThreshold =JSON.parse(JSON.stringify(this.storeService.getStore('diff_threshold')));
		for (const key in this.tempThreshold) {
			this.thresholdName.push(key)
		}

		for(let i = 0;i<this.thresholdName.length;i++){
			const tempN = this.thresholdName[i];
			if(tempN=="PossionDis"){
				this.PossionDis = this.tempThreshold["PossionDis"];
				this.p_log2FC = this.tempThreshold["PossionDis"].log2FC;
				this.p_FDR = this.tempThreshold["PossionDis"].FDR;
			}else if(tempN=="NOIseq"){
				this.NOIseq = this.tempThreshold["NOIseq"];
				this.n_log2FC = this.tempThreshold["NOIseq"].log2FC;
				this.n_probability = this.tempThreshold["NOIseq"].probability;
			}else if(tempN=="DEGseq"){
				this.DEGseq = this.tempThreshold["DEGseq"];
				this.d_log2FC = this.tempThreshold["DEGseq"].log2FC;
				this.d_Qvalue = this.tempThreshold["DEGseq"].Qvalue;
			}else if(tempN=="DESeq2"){
				this.DESeq2 = this.tempThreshold["DESeq2"];
				this.de_log2FC = this.tempThreshold["DESeq2"].log2FC;
				this.de_Qvalue = this.tempThreshold["DESeq2"].Qvalue;
			}else if(tempN=="EBSeq"){
				this.EBSeq = this.tempThreshold["EBSeq"];
				this.e_log2FC = this.tempThreshold["EBSeq"].log2FC;
				this.e_PPEE = this.tempThreshold["EBSeq"].PPEE;
			}
		}

		this.selectPanelData = [
			//差异面板的数据
			{
				type: '比较组',
				data: this.storeService.getStore('diff_plan')
			}
		];

		//console.log(this.compareGroupTop3);

		this.tableEntity = {
			//查询参数
			LCID: this.storeService.getStore('LCID'),
			compareGroup: this.compareMapGroupList,
			geneType: this.defaultGeneType,
			species: this.storeService.getStore('genome'),
			diffThreshold: this.tempThreshold
		};

		this.applyOnceSearchParams = true;
		this.defaultUrl = `${config['javaPath']}/SampleDiff/table`;  // `${config['url']}/theadFilter`
		this.defaultEntity = {
			pageIndex: 1, //分页
			pageSize: 20,
			LCID: sessionStorage.getItem('LCID'),
			leftChooseList: this.leftSelect, //upsetR参数
			upChooseList: this.upSelect, //胜利n图选中部分参数
			compareGroup: this.compareTableGroupList, //比较组
			addThead: [], //扩展列
			transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
			sortValue: null,
			//matchAll: false,
			reAnaly: false,
			matrix: false, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.defaultGeneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			diffThreshold: this.tempThreshold,
			version: this.storeService.getStore('version'),
			searchList: [],
			sortThead: this.addColumn['sortThead'],
			type:this.m_type
		};
		this.defaultTableId = 'diff_venn_number_default_gene';
		this.defaultDefaultChecked = true;
		this.defaultEmitBaseThead = true;
		this.defaultCheckStatusInParams = true;

		this.extendUrl = `${config['javaPath']}/Venn/diffGeneTable`;
		this.extendEntity = {
			pageIndex: 1, //分页
			pageSize: 20,
			reAnaly: false,
			LCID: sessionStorage.getItem('LCID'), //流程id
			leftChooseList: [], //upsetR参数
			upChooseList: [], //胜利n图选中部分参数
			compareGroup: this.compareTableGroupList, //比较组
			addThead: [], //扩展列
			transform: true, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
			sortValue: null,
			//matchAll: false,
			matrix: true, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.defaultGeneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			diffThreshold: this.tempThreshold,
			version: this.storeService.getStore('version'),
			searchList: [],
			sortThead: this.addColumn['sortThead'],
			type:this.m_type
		};
		this.extendTableId = 'diff_venn_number_extend_gene';
		this.extendDefaultChecked = true;
		this.extendEmitBaseThead = true;
		this.extendCheckStatusInParams = false;
	}

	handleSelectGeneCountChange(selectGeneCount) {
		this.selectGeneCount = selectGeneCount;
	}

	moduleDescChange() {
		this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		setTimeout(() => {
			this.diffVennNumberChart.scrollHeight();
		}, 30);
	}

	toggle(status) {
		this.addColumnShow = status;
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	

	// 重置图 应用图转换前的设置
	chartBackStatus() {
		this.defaultEmitBaseThead = true;
		this.showBackButton = false;
		// 初始化表的选中状态
		this.transformTable._initCheckStatus();
		// 清空表的筛选
		this.transformTable._clearFilterWithoutRequest();
		if (!this.first) {
			this.defaultEntity['addThead'] = [];
			this.defaultEntity['removeColumns'] = [];
			this.defaultEntity['compareGroup'] = this.selectConfirmData;
			this.defaultEntity['type'] = this.m_type;
			this.defaultEntity['searchList'] = [];
			this.defaultEntity['pageIndex'] = 1;
			this.defaultEntity['rootSearchContentList'] = [];
			setTimeout(() => {
				this.first = true;
			}, 30);
		} else {
			this.transformTable._setParamsNoRequest('compareGroup', this.selectConfirmData);
			this.transformTable._setParamsNoRequest('type', this.m_type);
			this.transformTable._setParamsNoRequest('pageIndex', 1);
			this.transformTable._getData();
		}
	}

	// {add:[],remove:[{}]}
	addThead(thead) {
		this.transformTable._initCheckStatus();

		this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
		this.transformTable._setParamsNoRequest('pageIndex', 1);

		this.transformTable._addThead(thead['add']);
	}

	// 表格转换 确定
	confirm(relations) {
		this.showBackButton = true;
		let checkParams = this.transformTable._getInnerParams();
		// 每次确定把之前的筛选参数放在下一次查询的请求参数里 请求完成自动清空上一次的请求参数，恢复默认；
		this.applyOnceSearchParams = true;
		this.extendEmitBaseThead = true;
		this.addColumn._clearThead();
		if (this.first) {
			this.extendCheckStatusInParams = false;
			this.extendEntity['checkStatus'] = checkParams['others']['checkStatus'];
			this.extendEntity['unChecked'] = checkParams['others']['excludeGeneList']['unChecked'];
			this.extendEntity['checked'] = checkParams['others']['excludeGeneList']['checked'];
			this.extendEntity['mongoId'] = checkParams['mongoId'];
			this.extendEntity['searchList'] = checkParams['tableEntity']['searchList'];
			this.extendEntity['rootSearchContentList'] = checkParams['tableEntity']['rootSearchContentList'];
			this.extendEntity['compareGroup'] = this.selectConfirmData;
			this.extendEntity['type'] = this.m_type;
			this.extendEntity['leftChooseList'] = checkParams['tableEntity']['leftChooseList'];
			this.extendEntity['upChooseList'] = checkParams['tableEntity']['upChooseList'];
			this.extendEntity['diffThreshold'] = checkParams['tableEntity']['diffThreshold'];
			this.extendEntity['relations'] = relations;
			this.extendEntity['addThead'] = [];
			this.first = false;
		} else {
			this.transformTable._initTableStatus();
			this.extendCheckStatusInParams = false;
			this.transformTable._setExtendParamsWithoutRequest('checkStatus', checkParams['others']['checkStatus']);
			this.transformTable._setExtendParamsWithoutRequest(
				'checked',
				checkParams['others']['excludeGeneList']['checked'].concat()
			);
			this.transformTable._setExtendParamsWithoutRequest(
				'unChecked',
				checkParams['others']['excludeGeneList']['unChecked'].concat()
			);
			this.transformTable._setExtendParamsWithoutRequest('searchList', checkParams['tableEntity']['searchList']);
			this.transformTable._setExtendParamsWithoutRequest(
				'rootSearchContentList',
				checkParams['tableEntity']['rootSearchContentList']
			);
			this.transformTable._setExtendParamsWithoutRequest('compareGroup', this.selectConfirmData);
			this.transformTable._setExtendParamsWithoutRequest('type', this.m_type);
			this.transformTable._setExtendParamsWithoutRequest('relations', relations);
			// 每次checkStatusInParams状态变完  再去获取数据
			this.transformTable._setExtendParamsWithoutRequest('addThead', []);
			setTimeout(() => {
				this.transformTable._getData();
			}, 30);
		}
		setTimeout(() => {
			this.extendCheckStatusInParams = true;
		}, 30);
	}

	// 表格转换返回
	back() {
		this.chartBackStatus();
	}

	// 在认为是基础头的时候发出基础头 双向绑定到增删列
	baseTheadChange(thead) {
        this.baseThead = thead['baseThead'].map((v) => v['true_key']);
	}

	resize(event) {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	drawVenn(data) {
		// console.log(this.compareGroup);
		// console.log(this.selectedVal);
		this.allChartData = data;
		this.drawTotal(data["rows"]);
		// if(this.mfirst){
		// 	this.allChartData = data;
		// 	this.doWithSelectChange();
		// 	this.mfirst = false;
		// }else{
		// 	(async () => {
		// 		console.log(data);
		// 		console.log(this.compareGroup);
		// 		console.log(this.selectedVal);
		// 	})()
		// }
		
		
	}

	drawTotal(data){
		let that = this;
		let config: object={
			chart: {
			  title: "差异基因数量统计",
			  dblclick: function(event) {
				var name = prompt("请输入需要修改的标题", "");
				if (name) {
				this.setChartTitle(name);
				this.updateTitle();
				}
			  },
			  width:600,
			  custom: ["compareGroup", "diffexp_updown_total"],
			  el: "#diffVennNumberId",
			  type: "bar",
			  data: data,
			  selectedModule: "single",
			  enableChartSelect: true,
			  onselect: data => {
				that.defaultTheSelectList(data,1);
					console.log(data);
				}
			},
			axis: {
			  x: {
				title: "",
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
				title: "Number of Genes",
				dblclick: function(event) {
				  var name = prompt("请输入需要修改的标题", "");
				  if (name) {
					this.setYTitle(name);
					this.updateTitle();
				  }
				}
			  },
			},
			legend: {
			show: true,
			position: "right",
			click:function(d,index){
					that.color = d3.select(d).attr('fill');
					that.legendIndex = index;
					that.isShowColorPanel = true;
				}
			},
			tooltip: function(d) {
				//return "<span>Compare Group:"+d.compareGroup+"</span><br><span>Number of Genes:"+d.diffexp_updown_total+"</span><br><span>category：total</span>"
				//"+d.diffexp_updown_total+"
				return "<span>Category：total</span><br><span>Compare Group:"+d.compareGroup+"</span><br><span>Number of Genes:"+d.diffexp_updown_total+"</span>"
			}
		}
		this.chart = new d4().init(config);
	}

	drawSingal(name) {
		var baseThead = this.allChartData["baseThead"];
		var rows = this.allChartData["rows"];
		var chartData = [];
		
		for (var i = 0; i < baseThead.length; i++) {
			for (var j = 0; j < rows.length; j++) {

			}
		}
		if(name == "ALL"){
			rows.forEach((d) => {
				chartData.push({
					key: d["compareGroup"],
					value: d["diffexp_up"],
					category: "up"
				});
				chartData.push({
					key: d["compareGroup"],
					value: d["diffexp_down"],
					category: "down"
				});
			})
		}else{
			rows.forEach((d) => {
				if(d["compareGroup"] == name){
					chartData.push({
						key: d["compareGroup"],
						value: d["diffexp_up"],
						category: "up"
					});
					chartData.push({
						key: d["compareGroup"],
						value: d["diffexp_down"],
						category: "down"
					});
				}
			});
		}

		let that = this;

		let config: object = {
			chart: {
				title: '差异基因数量统计',
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#diffVennNumberId',
				type: 'groupBar',
				innerPadding: 0.01,
				width: 800,
				custom: [ 'key', 'value', 'category' ],
				data: chartData,
				enableChartSelect: true,
				onselect: function(data) {
					that.defaultTheSelectList(data,2);
					///console.log(data);
				}
			},
			axis: {
				x: {
					title: '',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
					//rotate: 60
				},
				y: {
					title: 'Number of Genes',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
					}
					//formatter: (val) => val + '%'
				}
			},
			legend: {
				show: true,
				position: 'right',
				click: function(d, index) {
					that.colorL = d3.select(d).attr('fill');
					that.legendIndexL = index;
					that.isShowColorPanelL = true;
				}
			},
			tooltip: function(d) {
				return (
					'<span>Compare Group：' +
					d.key +
					'</span><br><span>Number of Genes：' +
					d.value +
					'</span><br><span>Category：' +
					d.category +
					'</span>'
				);
			}
		}

		this.chartS = new d4().init(config);

	}

	// 切换左右布局 计算左右表格的滚动高度
	switchChange(status) {
		this.switch = status;
		setTimeout(() => {
			this.diffVennNumberChart.scrollHeight();
			this.computedTableHeight();
		}, 320);
	}

	computedTableHeight() {
		try {
			let h = this.tableHeight;
			this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2 -60;
			if (this.tableHeight === h) this.computedScrollHeight = true;
		} catch (error) {}
	}

	OnChange(value,type) {
		if(parseInt(value)<0){
			if(type=="PossionDis"){
				this.isShowSpan_PossionDis = true;
			}else if(type=="NOIseq"){
				this.isShowSpan_NOIseq = true;
			}else if(type=="DEGseq"){
				this.isShowSpan_DEGseq = true;
			}else if(type=="DESeq2"){
				this.isShowSpan_DESeq2 = true;
			}else if(type=="EBSeq"){
				this.isShowSpan_EBSeq = true;
			}
			
			return;
		}else{
			this.isShowSpan_PossionDis = false;
			this.isShowSpan_NOIseq = false;
			this.isShowSpan_DEGseq = false;
			this.isShowSpan_DESeq2 = false;
			this.isShowSpan_EBSeq = false;
			if(type=="PossionDis"){
				this.PossionDis['log2FC'] = value;
			}else if(type=="NOIseq"){
				this.NOIseq['log2FC'] = value;
			}else if(type=="DEGseq"){
				this.DEGseq['log2FC'] = value;
			}else if(type=="DESeq2"){
				this.DESeq2['log2FC'] = value;
			}else if(type=="EBSeq"){
				this.EBSeq['log2FC'] = value;
			}
		}

	}

	OnChange2(value,type){
		//this.PossionDis['FDR'] = value;
		if(type=="PossionDis"){
			this.PossionDis['FDR'] = value;
		}else if(type=="NOIseq"){
			this.NOIseq['probability'] = value;
		}else if(type=="DEGseq"){
			this.DEGseq['Qvalue'] = value;
		}else if(type=="DESeq2"){
			this.DESeq2['Qvalue'] = value;
		}else if(type=="EBSeq"){
			this.EBSeq['PPEE'] = value;
		}
	}

	panelChange() {
		this.panelShow = !this.panelShow;
	}
	setCancle() {
		for(let i = 0;i<this.thresholdName.length;i++){
			const tempN = this.thresholdName[i];
			if(tempN=="PossionDis"){
				if (this.p_log2FC != this.PossionDis['log2FC'] || this.p_FDR != this.PossionDis['FDR']) {
					this.PossionDis = {
						log2FC: this.p_log2FC,
						FDR: this.p_FDR
					};

					this.tempThreshold["PossionDis"] = this.PossionDis;
				}
			}else if(tempN=="NOIseq"){
				if (this.n_log2FC != this.NOIseq['log2FC'] || this.n_probability != this.NOIseq['probability']) {
					this.NOIseq = {
						log2FC: this.n_log2FC,
						probability: this.n_probability
					};
					this.tempThreshold["NOIseq"] = this.NOIseq;
				}
			}else if(tempN=="DEGseq"){
				if (this.d_log2FC != this.DEGseq['log2FC'] || this.d_Qvalue != this.DEGseq['Qvalue']) {
					this.DEGseq = {
						log2FC: this.d_log2FC,
						Qvalue: this.d_Qvalue
					};
					this.tempThreshold["DEGseq"] = this.DEGseq;
				}
			}else if(tempN=="DESeq2"){
				if (this.de_log2FC != this.DESeq2['log2FC'] || this.de_Qvalue != this.DESeq2['Qvalue']) {
					this.DESeq2 = {
						log2FC: this.de_log2FC,
						Qvalue: this.de_Qvalue
					};
					this.tempThreshold["DESeq2"] = this.DESeq2;
				}
			}else if(tempN=="EBSeq"){
				if (this.e_log2FC != this.EBSeq['log2FC'] || this.e_PPEE != this.EBSeq['probability']) {
					this.EBSeq = {
						log2FC: this.e_log2FC,
						PPEE: this.e_PPEE
					};
					this.tempThreshold["EBSeq"] = this.EBSeq;
				}
			}

		}
		this.panelShow = false;
	}
	setConfirm() {
		//设置下拉面板点击确定时候的两个参数
		for (let index = 0; index < this.thresholdName.length; index++) {
			const element = this.thresholdName[index];
			if(element=="PossionDis"){
				//this.tableEntity['diffThreshold']['PossionDis'] = this.PossionDis;
				this.tempThreshold['PossionDis'] = this.PossionDis;
				this.p_log2FC = this.PossionDis['log2FC'];
				this.p_FDR = this.PossionDis['FDR']
			}else if(element=="NOIseq"){
				//this.tableEntity['diffThreshold']['NOIseq'] = this.NOIseq;
				this.tempThreshold['NOIseq'] = this.NOIseq;
				this.n_log2FC = this.NOIseq['log2FC'];
				this.n_probability = this.NOIseq['probability']
			}else if(element=="DEGseq"){
				//this.tableEntity['diffThreshold']['DEGseq'] = this.DEGseq;
				this.tempThreshold['DEGseq'] = this.DEGseq;
				this.d_log2FC = this.DEGseq['log2FC'];
				this.d_Qvalue = this.DEGseq['Qvalue']
			}else if(element=="DESeq2"){
				//this.tableEntity['diffThreshold']['DESeq2'] = this.DESeq2;
				this.tempThreshold['DESeq2'] = this.DESeq2;
				this.de_log2FC = this.DESeq2['log2FC'];
				this.de_Qvalue = this.DESeq2['Qvalue']
			}else if(element=="EBSeq"){
				//this.tableEntity['diffThreshold']['EBSeq'] = this.EBSeq;
				this.tempThreshold['diffThreshold'] = this.EBSeq;
				this.e_log2FC = this.EBSeq['log2FC'];
				this.e_PPEE = this.EBSeq['probability']
			}
		}

		// this.singleMultiSelect = {
		// 	bar_name: '',
		// 	total_name: '',
		// 	venn_name: ''
		// };

		// this.doubleMultiSelect = {
		// 	bar_name: [],
		// 	total_name: []
		// };

		//this.tableEntity["compareGroup"] = this.selectConfirmData;

		this.panelShow = false;
		// this.upSelect.length = 0;
		// this.leftSelect.length = 0;
		this.defaultShowFilterStatus = false;
		this.diffVennNumberChart.reGetData();

		this.chartBackStatus();
	}
	
	defaultTheSelectList(data,num) {
		if(num == 1){
			let tempJ = [];
			tempJ.push(data[0]["compareGroup"]);
			this.selectConfirmData = tempJ;
			
			this.m_name1 = data[0]["compareGroup"];

			this.m_name2 = "Total";
			this.m_type = null;
		}else{
			let tempP = [];
			tempP.push(data[0]["key"]);
			this.selectConfirmData = tempP;
			this.m_type = data[0]["category"];
			this.m_name1 = data[0]["key"];
			this.m_name2 = data[0]["category"];
		}
		this.chartBackStatus();
		//this.selectConfirmData = data;
	}

	//选择面板 确定筛选的数据
	selectConfirm(data) {
		this.selectConfirmData = data;
		this.upSelect.length = 0;
		this.leftSelect.length = 0;

		// this.transformTable._setParamsNoRequest('compareGroup',this.selectConfirmData);
		// this.first ? this.transformTable._getData() : (this.first = true);
		// 更新当前回来的表头为基础头
		this.chartBackStatus();
		//this.updateVenn();
		this.defaultShowFilterStatus = false;
	}

	redrawChart(width, height?) {
		//this.isMultiSelect = false;
	}

	// 图表切换刷新
	handlerRefresh() {
		// 清空选择的数据
		// this.compareTableGroupList = this.storeService.getStore('diff_plan');
		// this.compareNewGroupList = ["ALL"].concat(this.compareTableGroupList);
		// this.compareGroup = this.compareNewGroupList[0];

		// this.selectData = ["Up+Down","Total"];
		// this.selectedVal = this.selectData[1];

		//this.tableEntity["compareGroup"] = this.selectConfirmData;
		//this.defaultShowFilterStatus = false;
		//this.chartBackStatus();
	}

	handleCompareGroupChange() {
		//console.log(this.compareGroup);
		if(this.compareGroup == "ALL"){
			this.selectConfirmData = this.compareTableGroupList;
			this.m_name1 = this.compareNewGroupList[1];
		}else{
			let tempS = [];
			tempS.push(this.compareGroup);
			this.selectConfirmData = tempS;
			this.m_name1 = this.compareGroup;
		}

		this.doWithSelectChange();
		this.chartBackStatus();
	}

	handleSelectChange() {
		//console.log(this.selectedVal);

		if(this.selectedVal == "Total"){
			this.m_type = null;
			this.m_name2 = "Total";
		}else{
			this.m_type = 'up';
			this.m_name2 = "up"
		}

		this.doWithSelectChange();
		this.chartBackStatus();
	}

	doWithSelectChange(){
		let tempData = [];
		if(this.selectedVal == "Total"){
			if(this.compareGroup=="ALL"){
				tempData=this.allChartData["rows"];
			}else{
				this.allChartData["rows"].forEach((d) => {
					if(d["compareGroup"] == this.compareGroup){
						tempData.push(d);
					}
				});
			}
			this.drawTotal(tempData);
		}else{
			if(this.compareGroup=="ALL"){
				this.drawSingal("ALL");
			}else{
				this.drawSingal(this.compareGroup);
				this.m_name1 = this.compareGroup;
			}

		}
	}

	handlerColorChange(curColor) {
		this.chart.setColor(curColor, this.legendIndex);
    	this.chart.redraw();
	}

	colorLChange(curColor) {
		this.chartS.setColor(curColor, this.legendIndexL);
		this.chartS.redraw();
	}
}
