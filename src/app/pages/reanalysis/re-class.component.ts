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

declare const d3: any;
declare const d4:any;
declare const $: any;

@Component({
  selector: 'app-re-class',
  templateUrl: './re-class.component.html',
  styles: []
})
export class ReClassComponent implements OnInit {

    @ViewChild('switchChart') switchChart;
    @ViewChild('left') left;
    @ViewChild('leftBottom') leftBottom;
    @ViewChild('bigTable') bigTable;
	@ViewChild('right') right;
	@ViewChild('func') func;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    chartUrl: string;
    chartEntity: object;

    chart:any;

    show: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    gaugeColors:string[]=[];
    oLegendIndex:number=0;
    oColor:string;

    defaultSetUrl:string;
    defaultSetEntity:object;
    defaultSetData:any = null;

    // table
    setAddedThead :any= [];
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

    addColumnShow:boolean = false;
    showBackButton:boolean = false;
    selectGeneList:string[]=[]; // 图上选择的基因集字符串

    // 路由参数
    tid:string = null;
    geneType:string = '';
    version:string = null;

    selectGeneCount:number = 0;
    computedScrollHeight:boolean = false;
    leftComputedScrollHeight:boolean = false;

    isExceed:any = null;
    selectedVal:string = '';
    annotation:string = '';
    selectData:any = [];

    isMultipleSelect:boolean = false;

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
            this.annotation = params['params']['annotation'];
            this.storeService.setTid(this.tid);
        })
    }

    ngOnInit() {
        (async ()=>{
            this.first = true;
            this.applyOnceSearchParams = true;
            this.defaultUrl = `${config['javaPath']}/cluster/heatmapGeneTable`;
            this.defaultEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid:this.tid,
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
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.version,
                searchList: [],
                sortThead:this.addColumnService['sortThead']
            };
            this.defaultTableId = 'default_heatmap';
            this.defaultDefaultChecked = true;
            this.defaultEmitBaseThead = true;
            this.defaultCheckStatusInParams = true;

            this.extendUrl = `${config['javaPath']}/cluster/heatmapGeneTable`;
            this.extendEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid:this.tid,
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
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.version,
                searchList: [],
                sortThead:this.addColumnService['sortThead']
            };
            this.extendTableId = 'extend_heatmap';
            this.extendDefaultChecked = true;
            this.extendEmitBaseThead = true;
            this.extendCheckStatusInParams = false;


            this.selectData = JSON.parse(sessionStorage.getItem('annotation_choice'))[this.annotation];
            this.selectedVal = this.selectData[0];
            this.isExceed = await this.getGeneCount();

            this.chartUrl=`${config['javaPath']}/classification/graph`;
            this.chartEntity = {
                LCID: this.storeService.getStore('LCID'),
                annotation:this.annotation,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                checkedClassifyType:this.selectedVal,
                searchList:[],
                pageIndex:1,
                pageSize:20,
                sortKey:null,
                sortValue:null,
                tid: this.tid,
                version:this.storeService.getStore('version')
            };
        })()
    }

    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
    }

    async getGeneCount(){
        return new Promise((resolve,reject)=>{
            this.ajaxService.getDeferData({
                url:`${config['javaPath']}/classification/graphIsExceed`,
                data:{
                    LCID:sessionStorage.getItem('LCID'),
                    annotation:this.annotation,
                    geneType: this.geneType,
                    species: this.storeService.getStore('genome'),
                    checkedClassifyType:this.selectedVal,
                    tid:this.tid
                }
            }).subscribe(res=>{
                if(res['data'] && !$.isEmptyObject(res['data'])){
                    resolve(res['data']['isExceed']);
                }else{
                    resolve(true);
                }
            },
            error=>{
                resolve(true);
            })
        })
    }

    handleCheckChange(checked){
        console.log(checked);
    }

    handleSelectGeneCountChange(selectGeneCount){
        this.selectGeneCount = selectGeneCount;
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
        this.selectGeneList.length = 0;
        // this.chartBackStatus();
    }

    handleSelectChange(){
        (async()=>{
            let curExceed = await this.getGeneCount();
            if(this.isExceed != curExceed){
                this.chartEntity['checkedClassifyType'] = this.selectedVal;
            }else{
                if(curExceed){
                    this.bigTable._initCheckStatus();
                    this.bigTable._setParamsOfEntityWithoutRequest('checkedClassifyType',this.selectedVal)
                    this.bigTable._getData(true);
                }else{
                    this.chartEntity['checkedClassifyType'] = this.selectedVal;
                    this.switchChart.reGetData();
                }
            }
            this.isExceed = curExceed;
        })()
    }

    chartBackStatus(){
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        this.transformTable._initCheckStatus();
		this.transformTable._clearFilterWithoutRequest();
        if(!this.first){
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            this.defaultEntity['pageIndex'] = 1;
            if(this.selectGeneList.length){
                this.defaultEntity['searchList'] = [
                    {"filterName":"gene_id","filterNamezh":"gene_id","searchType":"string","filterType":"$in","valueOne":this.selectGeneList.join(','),"valueTwo":null}
                ];
            }else{
                this.defaultEntity['searchList']= [] ;
            }
            this.first = true;
        }else{
            this.transformTable._setParamsNoRequest('pageIndex',1);
            if(this.selectGeneList.length) {
                this.transformTable._filter("gene_id","gene_id","string","$in",this.selectGeneList.join(','),null);
            }else{
                this.transformTable._deleteFilterWithoutRequest("gene_id","gene_id","$in");
                this.transformTable._getData();
            }
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
            try{
                this.switchChart.scrollHeight();
            }catch(e){}
            this.computedTableHeight();
        },320)
    }

    computedTableHeight() {
		try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - 24;
            if(this.tableHeight===h) this.computedScrollHeight = true;

            let l = this.leftTableHeight;
            this.leftTableHeight = this.leftBottom.nativeElement.offsetHeight -24;
            if(this.leftTableHeight===l) this.leftComputedScrollHeight = true;
        } catch (error) {}
    }

    //画图
    drawChart(data) {
        let x,y,category;
        let _self = this;
        x = data['baseThead'][data['baseThead'].length-1]['true_key'];
        y = data['baseThead'][0]['true_key'];
        if(data['baseThead'].length>2) category = data['baseThead'][1]['true_key'];

        let config = {
            chart: {
                title: `${this.annotation}分类`,
                dblclick: function(event) {
                    _self.promptService.open(event.target.innerHTML,newval=>{
                        this.setChartTitle(newval);
                        this.updateTitle();
                    });
                },
                width: _self.leftBottom.nativeElement.offsetWidth * 0.8,
                height: _self.leftBottom.nativeElement.offsetHeight * 0.8,
                custom: [x, y, category],
                el: "#geneClassChartDiv",
                type: "bar",
                enableChartSelect:true,
                selectedModule: _self.isMultipleSelect?'multiple':'single',
                direction:"horizontal",
                data: data['rows'],
                onselect:data=>{
                    console.log(data);
                }
            },
            axis: {
                x: {
                    title: "Number",
                    dblclick: function(event) {
                        _self.promptService.open(event.target.innerHTML,newval=>{
                            this.setXTitle(newval);
                            this.updateTitle();
                        });
                    },
                    rotate:60
                },
                y: {
                    title: "Level2",
                    dblclick: function(event) {
                        _self.promptService.open(event.target.innerHTML,newval=>{
                            this.setYTitle(newval);
                            this.updateTitle();
                        });
                    }
                }
            },
            legend: {
                show: true,
                position: "right",
                click:(d,index)=>{
                    this.color = d3.select(d).attr('fill');
                    this.show = true;
                    this.legendIndex = index;
                }
            },
            tooltip: function(d) {
                if(category)  return "<span>Number："+d[x]+"</span><br><span>Level1："+d[category]+"</span><br><span>Level2："+d[y]+"</span>"
                return "<span>Number："+d[x]+"</span><br><span>Level2："+d[y]+"</span>";
            }
        }

        this.chart=new d4().init(config,{minWidth:240});
    }

    //color change 回调函数
    colorChange(curColor) {
        this.chart.setColor(curColor, this.legendIndex);
        this.chart.redraw();

    }

    setGeneList(geneList) {
        this.selectGeneList = geneList;
        this.chartBackStatus();
    }

    chartSelectModelChange(model){
        console.log(this.chart);
        this.chart.setChartSelectModule(this.isMultipleSelect?'multiple':'single');
        // this.chart.set
    }
}
