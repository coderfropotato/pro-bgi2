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
  selector: 'app-re-rich',
  templateUrl: './re-rich.component.html',
  styles: []
})
export class ReRichComponent implements OnInit {

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

    //column
    show: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color

    //bubble
    bshow:boolean=false;
    blegendIndex:number=0;
    bcolor:string;

    chartTypeData:any=[];

    isShowTable:boolean;

    visible:boolean=false;

    checkedData:any=[];
    checkedDrawGeneList:any=[];

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
            this.chartTypeData=[
                {
                    key:"bubble",
                    value:"气泡图"
                },
                {
                key:"column",
                value:"柱状图"
            }];

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

            this.chartUrl=`${config['javaPath']}/classification/graph`;
            this.chartEntity = {
                LCID: this.storeService.getStore('LCID'),
                annotation:this.annotation,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'), 
                checkedClassifyType:this.selectedVal,
                checkedClassifyList:[],
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

    showTableChange(isshowtable){
        this.isShowTable=isshowtable;
    }

    checkedChange(data){
        this.checkedData=[...data[1]];
        this._sortArr('num',this.checkedData);

        this.checkedDrawGeneList.length=0;

        this.checkedData.forEach(d=>{
            this.checkedDrawGeneList.push(d[this.annotation+"_term"]);
        })

    }

    
    deleteGene(i){
        this.checkedData.splice(i,1);
        this.checkedDrawGeneList.splice(i,1);
    }

    clearGene(){
        this.visible=false;
        this.checkedData.length=0;
        this.checkedDrawGeneList.length=0;
        this.reDraw();
    }

    // 点击“重画”
    reDraw(){
        this.chartEntity['checkedClassifyList']=this.checkedDrawGeneList;
        this.switchChart.reGetData();
    }

    //排序
    _sortArr(key, arr) {
        arr.sort(function(a, b) {
            return a[key] - b[key];
        })
    }


    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
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
        this.chartEntity['checkedClassifyType'] = this.selectedVal;
        this.switchChart.reGetData(); 
        this.bigTable._getData();
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
    drawChart(obj) {
        let data=obj.data;
        let type=obj.type;

        let _self = this;
        
        if(type==='column'){
            let x,y,category;
            x = data['baseThead'][data['baseThead'].length-1]['true_key'];
            y = data['baseThead'][0]['true_key'];
            if(data['baseThead'].length>2) category = data['baseThead'][1]['true_key'];

            let config = {
                chart: {
                    title: `${this.annotation}富集柱状图`,
                    dblclick: function(event) {
                        _self.promptService.open(event.target.innerHTML,newval=>{
                            this.setChartTitle(newval);
                            this.updateTitle();
                        });
                    },
                    width: _self.leftBottom.nativeElement.offsetWidth * 0.8,
                    height: data['rows'].length * 20,
                    custom: [x, y, category],
                    el: "#geneRichChartDiv",
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
        }else if(type==='bubble'){
            var realData = [];
            var legendData = [];
            data.rows.forEach(function(d, i) {
                realData.push({
                    x: d.num,
                    y: d[_self.annotation+"_term"],
                    r: d.num,
                    color: d.num
                });
                legendData.push(d.num);
            });

            let config1={
                chart: {
                    title: `${this.annotation}富集气泡图`,
                    dblclick: function(event) {
                        _self.promptService.open(event.target.innerHTML,newval=>{
                            this.setChartTitle(newval);
                            this.updateTitle();
                        });
                    },
                    mouseover: function(event, titleObj) {
                      titleObj
                        .attr("fill", "blue")
                        .append("title")
                        .text("双击修改标题");
                    },
                    mouseout: function(event, titleObj) {
                      titleObj.attr("fill", "#333");
                      titleObj.select("title").remove();
                    },
                    el: "#geneRichChartDiv",
                    type: "bubble",
                    width: _self.leftBottom.nativeElement.offsetWidth * 0.8,
                    height: data['rows'].length * 20,
                    enableChartSelect:true,
                    selectedModule: _self.isMultipleSelect?'multiple':'single',
                    onselect: data => {
                      console.log(data);
                    },
                    data: realData,
                    colors: ["#00008B", "#87CEFA"],
                    radius: {
                      min: 5,
                      max: 10
                    }
                  },
                  axis: {
                    x: {
                      title: "Rich Ratio",
                      rotate: 20,
                      min: 0,
                      // max:1,
                      dblclick: function(event) {
                        _self.promptService.open(event.target.innerHTML,newval=>{
                            this.setXTitle(newval);
                            this.updateTitle();
                        });
                      }
                    },
                    y: {}
                  },
                  legend: {
                    show: true,
                    data: legendData,
                    type: "gradient",
                    title: "Qvalue",
                    // min: -1,
                    // max: 1,
                    click:(d,index)=>{
                        this.bcolor = d;
                        this.bshow = true;
                        this.blegendIndex = index;
                    },
                    rLegend: {
                      show: true,
                      title: "Gene Number"
                    }
                  },
                  tooltip: function(d) {
                    return `<span>x：${d.x}</span><br><span>y：${
                      d.y
                    }</span><br><span>r：${d.r}</span><br><span>color：${d.color}</span>`;
                  }
            }

            this.chart=new d4().init(config1,{minWidth:240});
        }
    }

    //color change 回调函数
    colorChange(curColor) {
        this.chart.setColor(curColor, this.legendIndex);
        this.chart.redraw();
    }

    bcolorChange(curColor) {
        this.chart.setColor(curColor, this.blegendIndex);
        this.chart.redraw();
    }

    setGeneList(geneList) {
        this.selectGeneList = geneList;
        this.chartBackStatus();
    }

    chartSelectModelChange(model){
        console.log(this.chart);
        this.chart.setChartSelectModule(this.isMultipleSelect?'multiple':'single');
    }

    multipleSelectConfirm(){
        this.chartBackStatus();
    }
}
