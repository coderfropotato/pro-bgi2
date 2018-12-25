import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import {PromptService} from './../../super/service/promptService';
import { ToolsService } from './../../super/service/toolsService';

declare const d3: any;
declare const d4:any;
declare const $: any;

@Component({
  selector: 'app-re-relativeSplice',
  templateUrl: './re-relativeSplice.component.html',
  styles: []
})

export class RelativeSpliceComponent implements OnInit {
    @ViewChild('relativeSpliceChart') relativeSpliceChart;
    @ViewChild('left') left;
	@ViewChild('right') right;
	@ViewChild('func') func;
	@ViewChild('tableSwitchChart') tableSwitchChart;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    chartUrl: string;
    chartEntity: object;
    chart:any;

    // table
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
    first = true;
    switch = false;
    onlyTable:boolean = false;

    addColumnShow:boolean = false;
    showBackButton:boolean = false;

    // 路由参数
    tid:string = null;
    geneType:string = '';
    version:string = null;

    //参数
    k_degree:number;
    k_explain:string;
    k_pvalue:number;
    k_stat:number;

    
    singleMultiSelect: object = {};//单选
	doubleMultiSelect: any[] = [];//多选

    colors: string[] = [];
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    isShowColorPanel: boolean = false;
    textContent:string="可变剪切图";
    geneNum:number;

    selectPanelData: object[] = [];

    AS_type_list: string[] = [];
    diff_list: string[] = [];
    group_list: string[] = [];
    sample: string[] = [];

    constructor(
        private message: MessageService,
		private store: StoreService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
        private router: Router,
        private routes:ActivatedRoute,
        private promptService:PromptService,
        public toolsService: ToolsService,
        private addColumnService:AddColumnService
    ) {
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

        this.routes.paramMap.subscribe((params)=>{
            this.tid = params['params']['tid'];
            this.version = params['params']['version'];
            this.geneType = params['params']['geneType'];
            this.storeService.setTid(this.tid);
        })
        this.getRelativeSpliceParams();
    }

    ngOnInit() {
        this.selectPanelData = [
            {
                type: '可变剪切类型',
                data: ["SE", "RI", "A3SS", "A5SS", "MXE"]
            },
            {
                type: '选择组',
                data: ["A1-vs-B1", "A1-vs-C1", "B1-vs-C1", "B2-vs-A2", "C2-vs-A2", "C2-vs-B2"]
            },
            {
                type: 'group',
                data: ["A", "B", "C"]
            },
            {
                type: 'sample',
                data: ["A1", "B1", "C1", "A2", "B2", "C2"]
            }
        ];

        this.chartUrl=`${config['javaPath']}/alternativeSplice/graph`;
        this.chartEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            version: this.version,
			geneType: this.geneType,
			species: this.storeService.getStore('genome'),
            AS_type: ["SE",
            "RI",
            "A3SS",
            "A5SS",
            "MXE"],
            Group: [
                "siRNY1_1-VS-siRNY1_1"
            ]
        };

        this.colors = ["#4575B4", "#FEF6B2", "#D9352A"];

        // this.chartEntity = {
        //     LCID: sessionStorage.getItem('LCID'),
        //     tid:this.tid,
        //     pageIndex: 1,
        //     pageSize: 100000,
        //     mongoId: null,
        //     addThead: [],
        //     transform: false,
        //     matchAll: false,
        //     matrix: false,
        //     sortValue: null,
        //     sortKey: null,
        //     reAnaly: false,
        //     rootSearchContentList:[],
        //     geneType: this.geneType,
        //     species: this.storeService.getStore('genome'),
        //     version: this.version,
        //     searchList: []
        // };

        // table
        this.first = true;
        this.applyOnceSearchParams = true;
        this.defaultUrl = `${config['javaPath']}/chiSquare/table`;
        this.defaultEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            rootSearchContentList:[],
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            searchList: [],
            sortThead:this.addColumnService['sortThead']
        };
        this.defaultTableId = 'default_kafun';
        this.defaultDefaultChecked = true;
        this.defaultEmitBaseThead = true;
        this.defaultCheckStatusInParams = true;

        this.extendUrl = `${config['javaPath']}/chiSquare/table`;
        this.extendEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            rootSearchContentList:[],
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            searchList: [],
            sortThead:this.addColumnService['sortThead']
        };
        this.extendTableId = 'extend_kafun';
        this.extendDefaultChecked = true;
        this.extendEmitBaseThead = true;
        this.extendCheckStatusInParams = false;
    }

    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
    }

    toggle(status){
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
        // this.defaultEmitBaseThead = true;
        this.extendEmitBaseThead = true;
		let checkParams = this.transformTable._getInnerParams();
		// 每次确定把之前的筛选参数放在下一次查询的请求参数里 请求完成自动清空上一次的请求参数，恢复默认；
		this.applyOnceSearchParams = true;
		if (this.first) {
            this.extendCheckStatusInParams = false;
			this.extendEntity['checkStatus'] = checkParams['others']['checkStatus'];
			this.extendEntity['unChecked'] = checkParams['others']['excludeGeneList']['unChecked'];
			this.extendEntity['checked'] = checkParams['others']['excludeGeneList']['checked'];
			this.extendEntity['mongoId'] = checkParams['mongoId'];
			this.extendEntity['searchList'] = checkParams['tableEntity']['searchList'];
            this.extendEntity['rootSearchContentList'] = checkParams['tableEntity']['rootSearchContentList'];
            this.extendEntity['relations'] = relations;
            this.extendEntity['transform'] = true;
            this.extendEntity['matrix'] = true;
            this.addColumn._clearThead();
			this.extendEntity['addThead'] = [];
			this.first = false;
		} else {
			this.transformTable._initTableStatus();
			this.extendCheckStatusInParams = false;
			this.transformTable._setExtendParamsWithoutRequest('checkStatus', checkParams['others']['checkStatus']);
			this.transformTable._setExtendParamsWithoutRequest( 'checked', checkParams['others']['excludeGeneList']['checked'].concat() );
			this.transformTable._setExtendParamsWithoutRequest( 'unChecked', checkParams['others']['excludeGeneList']['unChecked'].concat() );
			this.transformTable._setExtendParamsWithoutRequest('searchList', checkParams['tableEntity']['searchList']);
			this.transformTable._setExtendParamsWithoutRequest( 'rootSearchContentList', checkParams['tableEntity']['rootSearchContentList'] );
			this.transformTable._setExtendParamsWithoutRequest( 'relations',relations);
			this.transformTable._setExtendParamsWithoutRequest( 'transform',true);
			this.transformTable._setExtendParamsWithoutRequest( 'matrix',true);
            this.transformTable._setExtendParamsWithoutRequest( 'addThead', []);
            this.addColumn._clearThead();
			// 每次checkStatusInParams状态变完  再去获取数据
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

    handlerRefresh(){
        this.chartBackStatus();
    }

    chartBackStatus(){
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        this.transformTable._initCheckStatus();
        // 清空表的筛选
		this.transformTable._clearFilterWithoutRequest();
        if(!this.first){
            this.defaultEntity['pageIndex'] = 1;
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            this.defaultEntity['searchList']= [] ;
            this.first = true;
        }else{
            this.transformTable._setParamsNoRequest('pageIndex',1);
            this.transformTable._getData();
        }
    }

	// 表格基础头改变  设置emitBaseThead为true的时候 表格下一次请求回来会把表头发出来 作为表格的基础表头传入增删列
	baseTheadChange(thead) {
		this.baseThead = thead['baseThead'].map((v) => v['true_key']);
    }

	// 表格上方功能区 resize重新计算表格高度
	resize(event) {
        setTimeout(()=>{
            this.computedTableHeight();
        },30)
    }

    // 切换左右布局 计算左右表格的滚动高度
	switchChange(status) {
        this.switch = status;
        setTimeout(()=>{
            this.relativeSpliceChart.scrollHeight();
            this.computedTableHeight();
        },320)
    }

	// 展开表icon 点击事件
    handleOnlyTable(){
        this.onlyTable = !this.onlyTable;
	}

	// 从布局切换发出的事件
	handlOnlyTableChange(status){
		this.onlyTable = status;
	}

    computedTableHeight() {
		try {
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - 24;
		} catch (error) {}
    }

    getRelativeSpliceParams(){
        let self = this;
        this.ajaxService
            .getDeferData(
                {
                    url: `${config['javaPath']}/alternativeSplice/config`,
                    data: {
                        "LCID": this.storeService.getStore('LCID'),
                        "geneType": this.geneType,
                        "species": this.storeService.getStore('genome'),
                        "version": "3.0",
                    }
                }
            )
            .subscribe(
                (data: any) => {
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        console.log("nodata")
                    } else if (data.status === "-1") {
                        console.log("error")
                    } else if (data.status === "-2") {
                        console.log("dataOver")
                    } else {
                        //data.data
                        // AS_type: ["SE", "RI", "A3SS", "A5SS", "MXE"]
                        // diff: ["A1-vs-B1", "A1-vs-C1", "B1-vs-C1", "B2-vs-A2", "C2-vs-A2", "C2-vs-B2"]
                        // group: ["A", "B", "C"]
                        // sample: ["A1", "B1", "C1", "A2", "B2", "C2"]
                        self.AS_type_list=data["data"].AS_type;
                        self.diff_list=data["data"].diff;
                        self.group_list=data["data"].group;
                        self.sample=data["data"].sample;

                       

                        self.selectPanelData = [
                            {
                                type: '可变剪切类型',
                                data: ["SE", "RI", "A3SS", "A5SS", "MXE"]
                            },
                            {
                                type: '选择组',
                                data: ["A1-vs-B1", "A1-vs-C1", "B1-vs-C1", "B2-vs-A2", "C2-vs-A2", "C2-vs-B2"]
                            },
                            {
                                type: '123',
                                data: this.group_list
                            },
                            {
                                type: '3123',
                                data: ["A", "B", "C","A1", "B1", "C1", "A2", "B2", "C2"]
                            }
                        ];
                        console.log(self.selectPanelData)
                    }
                   
                },
                error => {
                    
                }
            )
    }

    //kaFun图二次更新
	updateRelativeSplice() {

        this.doubleMultiSelect.length = 0;
        this.singleMultiSelect = {};

        this.relativeSpliceChart.reGetData();
    }

    //单选
    doSingleData() {
        console.log(this.singleMultiSelect)
    }

    //多选确定时候,提交的数据
	multipleConfirm() {

	}

    //画图
    drawChart(data){

    }

    //选择面板 确定筛选的数据
	selectConfirm(data) {
        console.log(data)
    }
    
    //选择面板，默认选中数据
	defaultSelectList(data) {
        console.log(data)
		//this.selectConfirmData = data;
	}

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.relativeSpliceChart.redraw();
    }

}

