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
	selector: 'app-gene-page',
	template: `
                    <div class="content row gene">
                        <div class="left-layout column gene_margin_right">
                            <div class="left-top-layout"><!-- 上部份 -->
                                <span (click)="moduleDescChange()" class="zhankai-shouqi pointer" nz-tooltip>
                                    <i class="iconfont expand-icon" [class.icon-zhankai]="!expandModuleDesc"></i>
                                    <i class="iconfont expand-icon" [class.icon-shouqi]="expandModuleDesc"></i>
                                </span>
                                <div [hidden]="!expandModuleDesc" class="gene_top_content" (click)="expandModuleDescClick()"><!-- 切换隐藏的内容 -->
                                <div class="gene_search gene_center"><!-- 上部搜索 -->
                                    <div nz-row class="gene_row">
                                    <div nz-col nzSpan="22" class="gene_col">
                                        <nz-input-group [nzAddOnBefore]="addOnBeforeTemplate" [nzAddOnAfter]="addOnAfterTemplate"><!-- 搜索框 -->
                                        <input type="text" nz-input [(ngModel)]="inputValue" (ngModelChange)="inputChange()">
                                        </nz-input-group>
                                        <ng-template #addOnBeforeTemplate>
                                        <nz-select [(ngModel)]="selectTargetName" (ngModelChange)="selectTypeChange()">
                                            <nz-option  *ngFor="let item of selectTarget" [nzLabel]="item.label" [nzValue]="item.value" [nzDisabled]="item.isChecked"></nz-option>
                                        </nz-select>
                                        </ng-template>
                                        <ng-template #addOnAfterTemplate><!-- 设置按钮 -->
                                        <i class="iconfont icon-shezhi icon_pointer" [style.color]="icon_color" (click)="moduleSetChange()"></i>
                                        </ng-template>
                                        <div class="gene_col_div" [hidden]="!expandSearchList"><!-- 输入框返回结果面板 -->
                                        <div class="gene_col_content" *ngFor="let item of searchBackList" (click)="searchBackSelect(item)" >
                                            <!-- <div class="content_top">
                                                {{item.key}}
                                            </div> -->
                                            {{item}}
                                            <!-- <div class="content_bottom">
                                                {{item.value}}
                                            </div> -->
                                        </div>
                                        </div>
                                    </div>
                                    <div nz-col nzSpan="2" class="gene_col"><!-- 搜索按钮 -->
                                        <button nz-button nzType="primary" (click)="goSearch()" [disabled]="searchPanelFlag">搜素</button>
                                    </div>
                                    </div>
                                </div>
                                <div class="gene_fast gene_center"><!-- 快捷操作 -->
                                    <span>快捷操作：</span>
                                    <span class="gene_fast_set" *ngFor="let item of fastSearchList">{{item.value}}</span>
                                </div>
                                </div>
                            </div>
                            <app-gene-component #geneTable *ngIf="showModule && initializationFlag" [defaultGeneType]="defaultGeneType"></app-gene-component>
                        </div>
                        <div class="gene_pop" [hidden]="!expandModuleSetting">
                        <div class="gene_pop_top gene_center">
                            自定义
                        </div>
                        <div class="gene_pop_content">
                            <div class="mselect gene_center">
                            多个关键词之间关系:
                            <div>
                                <nz-radio-group [(ngModel)]="radioValue" (ngModelChange)="radioChange()">
                                <label nz-radio nzValue="or">或</label>
                                <label nz-radio nzValue="and">且</label>
                                </nz-radio-group>
                            </div>
                            </div>
                            <div class="mselect2 gene_center">
                            <!-- <div>搜索范围:</div> -->
                            <div>
                                <span>搜索范围:</span>&nbsp;
                                <button nz-button nzType="default" *ngFor="let item of selectPanelList" [nzSize]="'small'" [class.btnActive]="item.isChecked" (click)="selectClick(item)">{{item.key}}</button>
                            </div>
                            </div>
                        </div>
                        <div class="gene_pop_bottom">
                            <button nz-button [nzSize]="'small'" nzType="primary" (click)="btnCancle()">取消</button>
                            <button nz-button [nzSize]="'small'" nzType="primary" (click)="btnConfirm()">确定</button>
                        </div>
                        </div>
                    </div>
                `,
	styles: []
})
export class GenePage {
    @ViewChild('geneTable') geneTable;

	private moduleRouteName: string = 'gene'; // 模块默认路由 通过路由名称查找菜单配置项（geneType）；
	config: object = config;
	rootGeneType: string = this.storeService.getStore('menuRouteMap')[this.moduleRouteName]['geneType']; // 来自菜单 可配置  all gene transcript
	defaultGeneType: string = this.rootGeneType === this.config['geneTypeAll']
		? this.config['geneTypeOfGene']
		: this.rootGeneType;
	showModule: boolean = true;

	inputValue: string; //搜索框输入值

	switch: string = 'left';
	tableHeight = 0;
	computedScrollHeight: boolean = false;

	icon_color: string = 'gray'; //默认是灰色
	radioValue: string = 'or'; //默认选择or

	selectPanelList: object[]; //搜索范围数据
	selectedList: object[]; //选中的数据

	selectTarget: object[]; //基因或者转录本
	selectTargetName: string; //初始化为基因

	fastSearchList: object[]; //快捷操作选项

	searchBackList: string[] = []; //输入框返回结果

	// 默认收起模块描述
	expandModuleDesc: boolean = false;
	// 默认收起自定义面板
	expandModuleSetting: boolean = false;
	// 默认收起搜索结果面板
	expandSearchList: boolean = false;

	initializationFlag: boolean = false;

	searchPanelFlag: boolean = true;

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
		this.getDefaultData();

		//基因表或者转录本表
		this.selectTarget = [
			{
				label: '基因',
				value: '基因',
				isChecked: false
			},
			{
				label: '转录本',
				value: '转录本',
				isChecked: false
			}
		];
		this.selectTargetName = this.selectTarget[0]['value'];

		//快速查询
		this.fastSearchList = [
			{
				name: 'mrna',
				value: 'mrna'
			},
			{
				name: 'mrna',
				value: 'mrna'
			}
		];

		this.geneService.set("andOr",this.radioValue);
	}

	//是否折叠显示框
	moduleDescChange() {
		this.expandModuleDesc = !this.expandModuleDesc;
		// 收起自定义面板
		this.expandModuleSetting = false;
		// 收起搜索结果面板
		this.expandSearchList = false;

		// 重新计算表格切换组件表格的滚动高度
        setTimeout(()=>{
            this.geneTable['computedTableHeight']();
        },30)
	}

	moduleSetChange() {
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//选择面板 选择
	selectClick(item) {
		item['isChecked'] = !item['isChecked'];
		this.selectedList = [];
		this.selectPanelList.forEach((d) => {
			if (d['isChecked']) {
				this.selectedList.push(d);
			}
		});

		//console.log(this.selectedList)
		if (this.selectPanelList.length == this.selectedList.length) {
			this.icon_color = 'blue';
			//this.geneService.set("checkedAddThead",this.selectedList);
		} else {
			this.icon_color = 'gray';
			this.geneService.set("checkedAddThead",this.selectedList);
		}
	}

	//搜索按钮
	goSearch() {
		// 收起自定义面板
		this.expandModuleSetting = false;
		// 收起搜索结果面板
		this.expandSearchList = false;

		if (this.selectPanelList.length == this.selectedList.length) {
			this.geneTable['reGetData']();
		}else{
			this.geneTable['selectRange'](this.selectedList);
		}

	}

	//输入数据，弹出面板
	inputChange() {
		if (this.inputValue) {
			this.searchPanelFlag = false;
			this.geneService.set("content",this.inputValue);
			this.getSearchback();
		} else {
			this.expandSearchList = false;
		}
	}

	selectTypeChange() {
		this.defaultGeneType =
			this.defaultGeneType === config['geneTypeOfGene']
				? config['geneTypeOfTranscript']
				: config['geneTypeOfGene'];
		this.showModule = false;
		this.expandModuleSetting = false;
		this.expandSearchList = false;
		setTimeout(() => {
			this.showModule = true;
		}, 30);
	}

	getSearchback() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/home/searchWord`,
				data: {
					content: this.inputValue
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
					this.searchBackList = data['data'].data;
					this.expandModuleSetting = false;
					this.expandSearchList = true;
				}
			});
	}
	//或且切换
	radioChange() {
		//
		this.icon_color = 'blue';
		this.geneService.set("andOr",this.radioValue);
	}

	//下方取消按钮
	btnCancle() {
		this.icon_color = 'gray';
		this.radioValue = 'or';
		this.selectPanelList.forEach((d) => {
			if (d['isChecked']) {
				d['isChecked'] = false;
			}
		});
		this.geneService.set("checkedAddThead",this.selectPanelList);
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//下方确定
	btnConfirm() {
		this.icon_color = 'gray';
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//点击搜索返回面板其中一项
	searchBackSelect(item) {
		let tempArray = this.inputValue.split(" ");
		if(tempArray.length==1){
			this.inputValue = item;
		}else{
			this.inputValue = tempArray.slice(0,-1).toString().replace(/,/g," ")+" "+item;
		}

		this.geneService.set("content",this.inputValue);
		this.expandSearchList = false;
	}

	//最外层点击事件关闭弹出面板
	expandModuleDescClick() {
		var e = e || window.event; //如果提供了事件对象，则这是一个非IE浏览器
		if (e.target.className == 'gene_top_content') {
			e.preventDefault();
			// 收起自定义面板
			this.expandModuleSetting = false;
			// 收起搜索结果面板
			this.expandSearchList = false;
		}
	}

	getDefaultData() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/home/searchHead`,
				data: {
					geneType: this.defaultGeneType,
					species: this.storeService.getStore('genome') //物种
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
					//console.log(data);
					for (var i = 0; i < data['data'].length; i++) {
						data['data'][i]['isChecked'] = false;
					}
					this.selectPanelList = data['data'];
					this.selectedList = data['data'];
					this.geneService.set("checkedAddThead",this.selectPanelList);
					this.initializationFlag = true;
				}
			});
	}
}

// 表
@Component({
	selector: 'app-gene-component',
	templateUrl: './gene.component.html',
	styles: []
})
export class GeneComponent implements OnInit {
	@Input('defaultGeneType') defaultGeneType;

	// 表格高度相关
	@ViewChild('func') func;
	@ViewChild('addColumn') addColumn;
	@ViewChild('transformTable') transformTable;

	tableUrl: string;
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

	tableHeight = 0;
	first = true;

	addColumnShow: boolean = false;
	showBackButton: boolean = false;

	selectGeneCount: number = 0;
	computedScrollHeight: boolean = false;

	constructor(
		private message: MessageService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private router: Router,
		private geneService: GeneService
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
		this.applyOnceSearchParams = true;
		this.defaultUrl = `${config['javaPath']}/home/table`; // `${config['url']}/theadFilter`
		this.defaultEntity = {
			pageIndex: 1, //分页
			pageSize: 20,
			LCID: sessionStorage.getItem('LCID'),
			addThead: [], //扩展列
			transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
			sortValue: null,
			reAnaly: false,
			searchParams:this.geneService["geneOptions"],
			matrix: false, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.defaultGeneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			version: this.storeService.getStore('version'),
			searchList: [],
			sortThead: this.addColumn['sortThead']
		};
		this.defaultTableId = 'default_gene';
		this.defaultDefaultChecked = true;
		this.defaultEmitBaseThead = true;
		this.defaultCheckStatusInParams = true;

		this.extendUrl = `${config['javaPath']}/home/table`;
		this.extendEntity = {
			pageIndex: 1, //分页
			pageSize: 20,
			reAnaly: false,
			LCID: sessionStorage.getItem('LCID'), //流程id
			addThead: [], //扩展列
			transform: true, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
            sortValue: null,
            searchParams:this.geneService["geneOptions"],
			matrix: true, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.defaultGeneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			version: this.storeService.getStore('version'),
			searchList: [],
			sortThead: this.addColumn['sortThead']
		};
		this.extendTableId = 'extend_gene';
		this.extendDefaultChecked = true;
		this.extendEmitBaseThead = true;
		this.extendCheckStatusInParams = false;
    }

    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	handleSelectGeneCountChange(selectGeneCount) {
		this.selectGeneCount = selectGeneCount;
	}

	computedTableHeight() {
		try {
			let h = this.tableHeight;
			this.tableHeight =
				document.querySelector('.gene')['offsetHeight'] -
				document.querySelector('.left-top-layout')['offsetHeight'] -
				config['layoutContentPadding'] * 2 -
				this.func.nativeElement.offsetHeight -
				12;
			if (this.tableHeight === h) this.computedScrollHeight = true;
		} catch (error) {}
	}

	toggle(status) {
		this.addColumnShow = status;
	}

	addThead(thead) {
		this.transformTable._initCheckStatus();
		this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
		this.transformTable._setParamsNoRequest('pageIndex', 1);
		this.transformTable._addThead(thead['add']);
	}

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
			this.defaultEntity['searchList'] = [];
			this.defaultEntity['pageIndex'] = 1;
			this.defaultEntity['rootSearchContentList'] = [];
			setTimeout(() => {
				this.first = true;
			}, 30);
		} else {
			this.transformTable._setParamsNoRequest('pageIndex', 1);
			this.transformTable._getData();
		}
    }

    // 重新获取数据
    reGetData(){
        this.transformTable._getData();
    }

    // 选择范围的时候调用  不需要调用reGetData重新获取数据
    // head {} | Object[]    {key:'123',category:'xxx'}
    selectRange(head){
		this.addColumn._addThead(head);
		this.addColumn._confirm();
    }

}
