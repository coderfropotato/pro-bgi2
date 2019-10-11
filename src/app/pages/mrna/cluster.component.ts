import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import { StoreService } from 'src/app/super/service/storeService';
import { PageModuleService } from 'src/app/super/service/pageModuleService';
import { MessageService } from 'src/app/super/service/messageService';
import { Router, NavigationEnd } from '@angular/router';
import { geneInfo } from 'src/rule';
import { PromptService } from 'src/app/super/service/promptService';

declare const d3: any;
declare const gooalD3: any;
declare const $: any;

@Component({
    selector: 'app-cluster',
    templateUrl: './cluster.component.html'
})

export class ClusterComponent implements OnInit {
    @ViewChild('left') left;
    @ViewChild('right') right;
    @ViewChild('func') func;
    @ViewChild('addColumn') addColumn;
    @ViewChild('clusterChart') clusterChart;
    @ViewChild('transformTable') transformTable;
    @ViewChild('setTemplate') setTemplate;
    @ViewChild('clusterSet') clusterSet;
    // 默认收起模块描述
	expandModuleDesc: boolean = false;

    //图
    chart:any;
    chartUrl: string;
    chartEntity: object;

    width: number = 0;
    height: number = 0;
    domainRange:number[]=[];
    yName:string;
    isCluster:boolean;
    verticalList:object[]=[];
    horizontalList:string[]=[];

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    isoShowColorPanel:boolean=false;
    oColor:string;
    gaugeColors:string[]=[];
    oLegendIndex:number=0;

    defaultSetUrl:string;
    defaultSetEntity:object;
    defaultSetData:any;

    setDataUrl:string;
    setDataEntity:object;
    setData:any;

    //表
    tableHeight = 0;
    first = true;
    switch = 'right';
    selectGeneCount:number = 0;
    computedScrollHeight:boolean = false;

    defaultShowFilterStatus:boolean = false;

    addColumnShow:boolean = false;
    showBackButton:boolean = false;
    verticalClass:any[] = []; // 图上设置面板选择的纵向分类
    selectGeneList:string[]=[]; // 图上选择的基因集字符串

    extendEntity: object;
	extendUrl: string;
	extendTableId: string;
	extendDefaultChecked: boolean;
	extendCheckStatusInParams: boolean;
	extendEmitBaseThead: boolean;
	baseThead: any[] = [];
    applyOnceSearchParams: boolean;

    defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;
	defaultDefaultChecked: boolean;
	defaultCheckStatusInParams: boolean;
    defaultEmitBaseThead: boolean; //发送表头

    geneType:string = '';
    version:string = '';
    genome:string = '';
    tableReady:boolean = false;

    //参数
	compareGroupList: any[] = [];
    compareGroup: any = '';

    constructor(
        private ajaxService: AjaxService,
        private router: Router,
        private message: MessageService,
        private globalService: GlobalService,
        private promptService:PromptService,
        private pageModuleService: PageModuleService,
        public storeService:StoreService
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
     }

    ngOnInit() {
        this.colors = [ "#ff0000", "#ffffff","#0070c0"];
        this.gaugeColors=this.storeService.getColors();
        this.defaultDefaultChecked = true;
        this.geneType = this.pageModuleService['defaultModule'];
        this.version =  this.storeService.getStore('version');
        this.genome =  this.storeService.getStore('genome');
        this.compareGroupList = this.storeService.getStore('diff_plan');
        this.compareGroup = this.compareGroupList[0];

        //参数
        this.defaultSetUrl=`${config['javaPath']}/cluster/defaultSet`;
        this.defaultSetEntity={
            //分析
            // "tid": "0da9b577c6fd4c09ad7dded3137ef82d",
            //模块
            "geneType": this.geneType,
            "LCID": this.storeService.getStore('LCID'),
            "compareGroup": this.compareGroup
        }
        //设置参数
        this.setDataUrl=`${config['javaPath']}/cluster/classification`;
        this.setDataEntity={
            "geneType": this.geneType,
            "LCID": this.storeService.getStore('LCID'),
            "version": this.version,
            "genome": this.genome
        }

        //图
        this.chartUrl=`${config['javaPath']}/cluster/heatmapGraph`;
        this.chartEntity = {
            //分析
            // "tid": "0da9b577c6fd4c09ad7dded3137ef82d",
            //模块
            "LCID": this.storeService.getStore('LCID'),
            "version": this.version,
            "species": this.genome,
            "geneType": this.geneType,
            "isHorizontal": true,
            "verticalClassification": [],
            "horizontalClassification": [],
            "compareGroup": this.compareGroup
        };

        //表
        this.first = true;
        this.applyOnceSearchParams = true;
        this.defaultUrl = `${config['javaPath']}/cluster/heatmapGeneTable`;
        this.defaultEntity = {
            //分析
            // tid: "0da9b577c6fd4c09ad7dded3137ef82d",
            //模块
            LCID: sessionStorage.getItem('LCID'),
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            // matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            verticalClassification:this.verticalClass,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.genome, //物种
            version: this.version,
            searchList: [],
            sortThead:this.addColumn['sortThead'],
            compareGroup: this.compareGroup
        };
        this.defaultTableId = 'default_heatmap';
        this.defaultDefaultChecked = true;
        this.defaultEmitBaseThead = true;
        this.defaultCheckStatusInParams = true;

        this.extendUrl = `${config['javaPath']}/cluster/heatmapGeneTable`;
        this.extendEntity = {
            //分析
            // tid: "0da9b577c6fd4c09ad7dded3137ef82d",
            //模块
            LCID: sessionStorage.getItem('LCID'),
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            // matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            verticalClassification:this.verticalClass,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.genome, //物种
            version: this.version,
            searchList: [],
            sortThead:this.addColumn['sortThead'],
            compareGroup: this.compareGroup
        };
        this.extendTableId = 'extend_heatmap';
        this.extendDefaultChecked = true;
        this.extendEmitBaseThead = true;
        this.extendCheckStatusInParams = false;

        this.tableReady = true;

    }

    //选中参数之后，重新访问接口
    handleCompareGroupChange() {
        (async () => {
            this.defaultSetEntity['compareGroup'] = this.compareGroup;
            this.chartEntity['compareGroup'] = this.compareGroup;
            this.clusterChart.getDefaultSet();

            this.chartBackStatus();
		})();
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
			this.extendEntity['addThead'] = checkParams['tableEntity']['addThead'];
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
            this.transformTable._setExtendParamsWithoutRequest( 'addThead', checkParams['tableEntity']['addThead']);
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
        this.selectGeneList.length = 0;
        this.chartBackStatus();
    }

    chartBackStatus(){
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        this.transformTable._initCheckStatus();
		// 清空表的筛选
		this.transformTable._clearFilterWithoutRequest();
        if(!this.first){
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            this.defaultEntity['pageIndex'] = 1;
            this.defaultEntity['compareGroup'] = this.compareGroup;
            if(this.selectGeneList.length){
                this.defaultEntity['searchList'] = [
                    {"filterName":`${this.geneType}_id`,"filterNamezh":config[this.geneType],"searchType":"string","filterType":"$in","valueOne":this.selectGeneList.join(','),"valueTwo":null}
                ];
            }else{
                this.defaultEntity['searchList']= [] ;
            }
            this.first = true;
        }else{
            this.transformTable._setParamsNoRequest('pageIndex',1);
            this.transformTable._setParamsNoRequest('compareGroup', this.compareGroup);
            /*filterName, filterNamezh, filterType, filterValueOne, filterValueTwo*/
            if(this.selectGeneList.length) {
                this.transformTable._filter(`${this.geneType}_id`,config[this.geneType],"string","$in",this.selectGeneList.join(','),null);
            }else{
                // this.transformTable._setParamsNoRequest('searchList',[]);
                this.transformTable._deleteFilterWithoutRequest(`${this.geneType}_id`,config[this.geneType],"$in");
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
            this.clusterChart.scrollHeight();
            this.computedTableHeight();
        },320)
    }

    computedTableHeight() {
		try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2;
            if(this.tableHeight===h) this.computedScrollHeight = true;
		} catch (error) {}
    }


    //模块描述信息
    moduleDescChange() {
		this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		setTimeout(() => {
			this.clusterChart.scrollHeight();
		}, 30);
	}

    //图
    // 设置 所需数据
    getSetData(data){
        this.setData=data;
    }
    //设置 默认
    apiEntityChange(data){
        let xNum=data.xNum;
        if (xNum <= 20) {
            this.width = 400;
        } else {
            let single_width = 20;
            this.width = single_width * xNum;
        }
        this.height=400;
        this.domainRange=[data.min,data.max];
        this.yName='hidden';
        this.isCluster=true;

        this.chartEntity['isHorizontal']=this.isCluster;

        data['verticalDefault'].forEach(d=>{
            this.chartEntity['verticalClassification'][d.key]=d['category'];
        })

        this.defaultSetData=data;

        if (this.clusterSet) {
            this.clusterSet.setDefaultSet(data);
        }
    }

    //设置 确定
    setConfirm(data){
        this.setChartSetEntity(data);
        this.clusterChart.reGetData();

        this.chartBackStatus();
    }

    setChartSetEntity(data){
        //图
        this.width=data.width;
        this.height=data.height;
        this.domainRange=data.domainRange;
        this.yName=data.yName;
        this.isCluster=data.isCluster;

        //请求参数
        this.chartEntity['isHorizontal']=data.isCluster;
        this.chartEntity['horizontalClassification']=data.horizontalList;
        this.chartEntity['verticalClassification']=data['verticalList'];

        // 表纵向分类
        this.verticalClass.length = 0;
        // 确定会重画图 清空选中的gene
        this.selectGeneList.length = 0;
        this.verticalClass.push(...data['verticalList']);
    }

    //画图
    drawChart(data) {
        let that =this;

        let legendData = [];
        let heatmapData = data.heatmaps;
        let dataLength = heatmapData.length;

        for (let i = 0; i < dataLength; i++) {
            let heatmapLength = heatmapData[i].heatmap.length;
            for (let j = 0; j < heatmapLength; j++) {
                legendData.push(heatmapData[i].heatmap[j].y);
            }
        }

        let config:object={
            chart: {
                title: "差异基因聚类热图",
                dblclick: function(event,title) {
                    let text = title.firstChild.nodeValue;
                    that.promptService.open(text,(data)=>{
                        title.textContent = data;
                    })
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
                el: "#clusterChartDiv",
                type: "complexCluster",
                data: data,
                colors: that.colors,
                otherColors:that.gaugeColors,
                heatmap: {
                    width: that.width,
                    height: that.height
                },
                left: {
                    show: true, //控制折线是否显示
                    isBlockClick:true
                    // simple:{
                    //     tooltip:function(d){
                    //         return `left name:${d.name}`;
                    //     }
                    // },
                    // complex:{
                    //     tooltip:function(d){
                    //         return `left type:${d.type}`
                    //     }
                    // }
                },
                top: {
                    show: that.isCluster,
                    // simple:{
                    //     tooltip:function(d){
                    //         return `top name:${d.name}`;
                    //     }
                    // },
                    // complex:{
                    //     tooltip:function(d){
                    //         return `top type:${d.type}`
                    //     }
                    // }
                },
                onselect: data => {
                    that.setGeneList(data);
                }
            },
            axis: {
                x: {
                    // rotate: 30,
                    dblclick: function(event,title) {
                        let text = title.firstChild.nodeValue;
                        that.promptService.open(text,(data)=>{
                            title.textContent = data;
                        })
                    },
                    mouseover: function(event, title) {
                        title
                        .attr("fill", "blue")
                        .append("title")
                        .text("双击修改");
                    },
                    mouseout: function(event, title) {
                        title.attr("fill", "#333");
                        title.select("title").remove();
                    }
                },
                y: {
                    type:that.yName  //hidden,id,symbol
                }
            },
            legend: {
                show: true,
                reverse:true,
                type: "gradient",
                min: that.domainRange[0],
                max: that.domainRange[1],
                ticks:5,
                data: legendData,
                position: "right",
                click: (d, i) => {
                    this.color=d;
                    this.legendIndex = i;
                    this.isShowColorPanel = true;
                },
                mouseover: function (event,node) {
                    node.attr("fill", "#5378f8");
                    node.append("title").text("双击修改");
                },
                mouseout: function (event,node) {
                    node.attr("fill", "#000");
                    node.select("title").remove();
                },
                oLegend:{
                    show:true,
                    data:data.gauge,
                    click: (el, i) => {
                       this.oColor=d3.select(el).attr('fill');
                       this.oLegendIndex=i;
                       this.isoShowColorPanel=true;
                    },
                    mouseover: function(event, legendObj) {
                        legendObj.append("title").text("单击修改颜色");
                    },
                    mouseout: function(event, legendObj) {
                        legendObj.select("title").remove();
                    }
                }
            },
            tooltip: function(d) {
                // return `<span>基因：${d.x}</span><br><span>y：${d.y}</span>`;
            }
        }

        this.chart=new gooalD3().init(config);
    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.clusterChart.redraw();
    }

    ocolorChange(curColor) {
        this.oColor = curColor;
        this.gaugeColors.splice(this.oLegendIndex, 1, curColor);
        this.clusterChart.redraw();
    }

    setGeneList(geneList) {
        this.selectGeneList = geneList;
        this.chartBackStatus();
    }

}
