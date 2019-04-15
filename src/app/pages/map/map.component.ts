import { DomSanitizer } from '@angular/platform-browser';
import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import {
	Component,
	OnInit,
	ViewChild,
	AfterViewInit,
	Input,
	Output,
	EventEmitter,
    ChangeDetectorRef,
    NgZone
} from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from './../../super/service/promptService';
import { GeneService } from './../../super/service/geneService';
import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';
import { Observable, fromEvent } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import config from '../../../config';
import { routeAnimation } from '../../super/animation/animation';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

declare const d3: any;
declare const d4: any;
declare const Venn: any;
declare const $: any;

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styles: []
})
export class MapComponent implements OnInit {
	@ViewChild('switchChart') switchChart;
	@ViewChild('left') left;
	@ViewChild('leftBottom') leftBottom;
	@ViewChild('bigTable') bigTable;
	@ViewChild('right') right;
	@ViewChild('func') func;
	@ViewChild('transformTable') transformTable;
	@ViewChild('addColumn') addColumn;
	@ViewChild('iframe') oif;

	defaultGeneType: string;
	chartUrl: string;
	chartEntity: object;

	expandModuleDesc: boolean = false;

	chart: any;

	show: boolean = false;
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color
	colors: string[];

	gaugeColors: string[] = [];
	oLegendIndex: number = 0;
	oColor: string;

	defaultSetUrl: string;
	defaultSetEntity: object;
	defaultSetData: any = null;

	// table
	setAddedThead: any = [];
	defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;
	defaultDefaultChecked: boolean;
	defaultCheckStatusInParams: boolean;
	defaultEmitBaseThead: boolean;

	extendEntity: object;
	extendUrl: string;
	extendTableId: string;
	extendDefaultChecked: boolean;
	extendCheckStatusInParams: boolean;
	extendEmitBaseThead: boolean;
	baseThead: any[] = [];
	applyOnceSearchParams: boolean;

	tableHeight = 0;
	leftTableHeight = 0;
	first = true;
	switch = 'right';

	addColumnShow: boolean = false;
	showBackButton: boolean = false;
	selectGeneList: string[] = []; // 图上选择的基因集字符串

	// 路由参数
	geneType: string = '';
	version: string = null;

	selectGeneCount: number = 0;
	computedScrollHeight: boolean = false;
	leftComputedScrollHeight: boolean = false;

	isExceed: any = null;
	selectedVal: string = '';
	annotation: string = 'go_c';
	selectData: any = [];

	isMultipleSelect: boolean = false;

	chartData: any;
	// 图表选择的数据
	checkedList: any[] = [];

	// level标志key
	level1Key: string = 'level_1';
	level2Key: string = 'level_2';
	termKey: string = 'term';
	idKey: string = 'id';
	descKey: string = 'desc';

	// 设置
	set: object = { width: 600, len: 40 };
	beforeSet: object = { width: 600, len: 40 };
	setVisible: boolean = false;

	mapid: string = '';
	tid: any = null;
	date: any = null;
	lcid: string = '';
	compareGroup: string = '';
	dirtyPathWayIframeUrl: string;
	pathWayIframeUrl: any;
	params: object = {};
	menuList: any[] = [];
	getUnReadAnalysisCountTimer: any = null;
	ready: boolean = false;
	selectList: string = '';

	constructor(
		private message: MessageService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		public storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private promptService: PromptService,
		private router: Router,
		private routes: ActivatedRoute,
		private geneService: GeneService,
        private sanitizer: DomSanitizer,
        private zone:NgZone,
		private ngxSpinnerService: NgxSpinnerService,
		private addColumnService: AddColumnService,
		private changeDetector: ChangeDetectorRef,
		private modalService: NzModalService // private outerDataBaseService:OuterDataBaseService
	) {
		let langs = [ 'zh', 'en' ];
		this.translate.addLangs(langs);
		this.translate.setDefaultLang('zh');
		let curLang = localStorage.getItem('lang');
		if (langs.includes(curLang)) {
			this.translate.use(curLang);
		} else {
			this.translate.use('zh');
		}

		this.routes.paramMap.subscribe((params) => {
			// {"lcid":"develop" ,"mapid": "04020", "compareGroup": "undefined", "tid": "c52f2af6134e431e88d75b72053554de", "geneType": "gene" }
			this.params = params['params'];
			// console.log("params:",params)
			this.lcid = this.params['lcid'];
			this.mapid = this.params['mapid'];
			this.defaultGeneType = this.params['geneType'];
			this.tid = this.params['tid'] == 'undefined' ? undefined : this.params['tid'];//重分析
			this.date = this.params['date'] == 'undefined' ? undefined : this.params['date'];//重分析
			this.compareGroup = this.params['compareGroup'];//模块

			if (this.tid) {
				// 重分析内的map跳转
				let pathwayURL = `${config['pathwayURL']}`;
				//http://biosys.bgi.com/re_analyze_result/test/{date}/{LCID}_{tid}/pathway_map/map03010.html
				this.dirtyPathWayIframeUrl = `http://biosys.bgi.com/re_analyze_result/${pathwayURL}/${this.date}/${this
					.lcid}_${this.tid}/pathway_map/map${this.mapid}.html`;
			} else {
				// 非重分析的map跳转   production test
				this.dirtyPathWayIframeUrl = `http://biosys.bgi.com/project/test/BGI_${this
					.lcid}/KEGG_PATHWAY/Pathway_enrichment/${this.compareGroup}/${this.compareGroup}_${this
					.defaultGeneType}_kegg_pathway_map/map${this.mapid}.html`;
				// this.dirtyPathWayIframeUrl = 'http://localhost:4200/#/report/map/test';
			}
		});

		// 订阅windowResize 重新计算表格滚动高度
		this.message.getResize().subscribe((res) => {
			if (res['message'] === 'resize') this.computedTableHeight();
		});

		// 每次切换路由计算表格高度
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.computedTableHeight();
			}
		});
	}

	ngOnInit() {
		this.ngxSpinnerService.show();
		(async () => {
			this.pathWayIframeUrl = this.cleanUrl(this.dirtyPathWayIframeUrl);

			try {
				await this.getLcInfo();
				this.getUnReadAnalysisCount();

				this.first = true;
				this.applyOnceSearchParams = true;
				this.defaultUrl = `${config['javaPath']}/enrichment/keggPathTable`;
				this.defaultEntity = {
					tid: this.tid,
					LCID: sessionStorage.getItem('LCID'),
					pageIndex: 1,
					pageSize: 20,
					mongoId: null,
					addThead: [],
					transform: false,
					matrix: false,
					relations: [],
					sortValue: null,
					sortKey: null,
					reAnaly: false,
					enrichmentType: 'kegg_pathway',
					compareGroup: this.compareGroup,
					kegg_pathway_term_id: this.mapid,
					geneType: this.defaultGeneType,
					species: this.storeService.getStore('genome'),
					version: this.storeService.getStore('version'),
					searchList: [],
					sortThead: this.addColumn['sortThead'],
					removeColumns: []
				};
				this.defaultTableId = 'default_map';
				this.defaultDefaultChecked = true;
				this.defaultEmitBaseThead = true;
				this.defaultCheckStatusInParams = true;

				this.extendUrl = `${config['javaPath']}/enrichment/keggPathTable`;
				this.extendEntity = {
					tid: this.tid,
					LCID: sessionStorage.getItem('LCID'),
					pageIndex: 1,
					pageSize: 20,
					mongoId: null,
					addThead: [],
					transform: false,
					matchAll: false,
					matrix: false,
					relations: [],
					sortValue: null,
					sortKey: null,
					reAnaly: false,
					enrichmentType: 'kegg_pathway',
					compareGroup: this.compareGroup,
					kegg_pathway_term_id: this.mapid,
					geneType: this.defaultGeneType,
					species: this.storeService.getStore('genome'),
					version: this.storeService.getStore('version'),
					searchList: [],
					sortThead: this.addColumn['sortThead'],
					removeColumns: []
				};
				this.extendTableId = 'extend_map';
				this.extendDefaultChecked = true;
				this.extendEmitBaseThead = true;
				this.extendCheckStatusInParams = false;

				this.ready = true;
				setTimeout(() => {
					this.ngxSpinnerService.hide();
				}, 300);
			} catch (error) {
				console.log(error);
				this.ngxSpinnerService.hide();
				let tpl = this.modalService.error({
					nzTitle: '系统错误',
					nzContent: '缺少必要信息，请重新登录',
					nzClosable: false,
					nzOnCancel: () => {
						tpl.destroy();
					},
					nzOnOk: () => {
						this.router.navigate([ `/report/login` ]);
					}
				});
			}
		})();
	}

	iframeLoaded() {
		this.initIframe();
	}

	initIframe() {
		let _self = this;
		let areas = $('iframe').contents().find('map').children('area[target_gene]');
		areas.on('click', function() {
			let select = $(this).attr('target_gene');
			_self.selectList = select || '';
            _self.zone.run(()=>{
                _self.chartBackStatus();
            })
		});
	}

	cleanUrl(url: string): SafeUrl {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

	getUnReadAnalysisCount() {
		if (this.getUnReadAnalysisCountTimer) clearInterval(this.getUnReadAnalysisCountTimer);

		let getCount = () => {
			this.ajaxService
				.getDeferData({
					data: {
						LCID: sessionStorage.getItem('LCID')
					},
					url: `${config['javaPath']}/reAnalysis/count`
				})
				.subscribe(
					(data) => {
						if (data['status'] == 0) this.storeService.setStore('analysisCount', data['data'][0]);
					},
					(error) => {
						clearInterval(this.getUnReadAnalysisCountTimer);
					}
				);
		};

		getCount();

		this.getUnReadAnalysisCountTimer = setInterval(() => {
			getCount();
		}, config['getAnalysisCountInterval']);
	}

	async getLcInfo() {
		return new Promise((resolve, reject) => {
			this.ajaxService
				.getDeferData({
					url: `${config['javaPath']}/LCINFO/${sessionStorage.getItem('LCID')}`
				})
				.subscribe(
					(data) => {
						if (data['status'] === '0') {
							for (let key in data['data']) {
								this.storeService.setStore(key, data['data'][key]);
								if (typeof data['data'][key] !== 'object') {
									sessionStorage.setItem(key, data['data'][key]);
								} else {
									sessionStorage.setItem(key, JSON.stringify(data['data'][key]));
								}
							}
							resolve('success');
						} else {
							reject('error');
						}
					},
					(err) => reject(err)
				);
		});
	}

	moduleDescChange() {
		this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	handleCheckChange(checked) {
		this.checkedList.length = 0;
		this.checkedList.push(...checked[1]);
		this.chartBackStatus();
	}

	handleSelectGeneCountChange(selectGeneCount) {
		this.selectGeneCount = selectGeneCount;
	}

	toggle(status) {
		this.addColumnShow = status;
	}

	// 表
	addThead(thead) {
		this.transformTable._initCheckStatus();
		this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
		this.transformTable._setParamsNoRequest('pageIndex', 1);
		this.transformTable._addThead(thead['add']);
	}

	// 表格转换 确定
	// 转换之前需要把图的 参数保存下来  返回的时候应用
	confirm(relations) {
		this.showBackButton = true;
		this.extendEmitBaseThead = true;
		let checkParams = this.transformTable._getInnerParams();
		this.applyOnceSearchParams = true;
		if (this.first) {
			this.extendCheckStatusInParams = false;
			this.extendEntity['checkStatus'] = checkParams['others']['checkStatus'];
			this.extendEntity['unChecked'] = checkParams['others']['excludeGeneList']['unChecked'];
			this.extendEntity['checked'] = checkParams['others']['excludeGeneList']['checked'];
			this.extendEntity['mongoId'] = checkParams['mongoId'];
			this.extendEntity['searchList'] = checkParams['tableEntity']['searchList'];
			this.extendEntity['rootSearchContentList'] = checkParams['tableEntity']['rootSearchContentList'];
			this.extendEntity['transform'] = true;
			this.extendEntity['matrix'] = true;
			this.addColumn._clearThead();
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
			this.transformTable._setExtendParamsWithoutRequest('transform', true);
			this.transformTable._setExtendParamsWithoutRequest('matrix', true);
			this.transformTable._setExtendParamsWithoutRequest('addThead', []);
			this.addColumn._clearThead();
			setTimeout(() => {
				this.transformTable._getData();
			}, 30);
		}
		setTimeout(() => {
			this.extendCheckStatusInParams = true;
		}, 30);
	}

	back() {
		this.showBackButton = false;
		this.chartBackStatus();
	}

	handlerRefresh() {
		this.selectGeneList.length = 0;
	}

	chartBackStatus() {
		this.showBackButton = false;
		this.defaultEmitBaseThead = true;
		this.transformTable._initCheckStatus();
		this.transformTable._clearFilterWithoutRequest();
		if (!this.first) {
			this.defaultEntity['addThead'] = [];
			this.defaultEntity['removeColumns'] = [];
			this.defaultEntity['rootSearchContentList'] = [];
			this.defaultEntity['pageIndex'] = 1;
			this.defaultEntity['compareGroup'] = this.compareGroup;
			if (this.selectList) {
				this.defaultEntity['searchList'] = [
					{
						filterName: `${this.defaultGeneType}_id`,
						filterNamezh: config[this.defaultGeneType],
						searchType: 'string',
						filterType: '$in',
						valueOne: this.selectList,
						valueTwo: null
					}
				];
			} else {
				this.defaultEntity['searchList'] = [];
			}
			this.first = true;
		} else {
			this.transformTable._setParamsNoRequest('pageIndex', 1);
			this.transformTable._setParamsNoRequest('compareGroup', this.compareGroup);

			if (this.selectList) {
				this.transformTable._filter( `${this.defaultGeneType}_id`, config[this.defaultGeneType], 'string', '$in', this.selectList, null );
			} else {
				this.transformTable._deleteFilterWithoutRequest( `${this.defaultGeneType}_id`, config[this.defaultGeneType], '$in' );
				this.transformTable._getData();
			}
		}
		this.selectList = '';
	}

	// 表格基础头改变  设置emitBaseThead为true的时候 表格下一次请求回来会把表头发出来 作为表格的基础表头传入增删列
	baseTheadChange(thead) {
		this.baseThead = thead['baseThead'].map((v) => v['true_key']);
	}

	// 表格上方功能区 resize重新计算表格高度
	resize(event) {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	// 切换左右布局 计算左右表格的滚动高度
	switchChange(status) {
		this.switch = status;
		setTimeout(() => {
			try {
				this.switchChart.scrollHeight();
			} catch (e) {}
			this.computedTableHeight();
		}, 320);
	}

	computedTableHeight() {
		try {
			let h = this.tableHeight;
			this.tableHeight =
				this.right.nativeElement.offsetHeight -
				this.func.nativeElement.offsetHeight -
				config['layoutContentPadding'] * 2;
			if (this.tableHeight === h) this.computedScrollHeight = true;

			let l = this.leftTableHeight;
			this.leftTableHeight = this.leftBottom.nativeElement.offsetHeight;
			if (this.leftTableHeight === l) this.leftComputedScrollHeight = true;
		} catch (error) {}
	}

	setGeneList(geneList) {
		this.selectGeneList = geneList;
		this.chartBackStatus();
	}

	copyVal(obj, target) {
		for (let name in obj) {
			target[name] = obj[name];
		}
	}
}
