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
  selector: 'app-re-kaFun',
  templateUrl: './re-kaFun.component.html',
  styles: []
})

export class KaFunComponent implements OnInit {
    @ViewChild('kaFunChart') kaFunChart;
    @ViewChild('left') left;
	@ViewChild('right') right;
	@ViewChild('func') func;
	@ViewChild('tableSwitchChart') tableSwitchChart;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    chartUrl: string;
    chartEntity: object;
    chart:any;

    // 默认收起模块描述
	expandModuleDesc:boolean = false;

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
    k_statistic:object={
        degree:"",
        explain:"",
        pvalue:"",
        stat:""
    };

    //单选
    singleMultiSelect: object = {};
	//多选
	doubleMultiSelect: any[] = [];

    tableUrl: string;
    tableEntity: object = {};

    colors: string[] = [];
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    isShowColorPanel: boolean = false;

    textContent:string="气泡统计图";
    geneNum:number;

    isHasMultiSelectFlag:boolean;   //是否有多选和单选

    isMultiSelect: boolean;

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
    }

    ngOnInit() {
        this.isMultiSelect = false;

        this.tableUrl=`${config['javaPath']}/chiSquare/switchTable`;
        this.tableEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid
        };

        this.colors = ["#4575B4", "#FEF6B2", "#D9352A"];

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
            this.kaFunChart.scrollHeight();
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

    moduleDescChange(){
		this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		setTimeout(()=>{this.kaFunChart.scrollHeight()},30)
	}

    //kaFun图二次更新
	updateKaFun() {

        this.doubleMultiSelect.length = 0;
        this.singleMultiSelect = {};

        this.kaFunChart.reGetData();

        // this.tableEntity['compareGroup'] = this.selectConfirmData;
		// this.tableSwitchChart.reGetData();

		// this.singleMultiSelect={
		// 	bar_name: '',
		// 	total_name: '',
		// 	venn_name: ''
		// };

		// this.doubleMultiSelect= {
		// 	bar_name: [],
		// 	total_name: []
        // };
        // console.log(this.singleMultiSelect)
        // console.log(this.doubleMultiSelect)
    }
    
    
    
    //切换单、多选change
	multiSelectChange() {
        this.doubleMultiSelect.length = 0;
        this.singleMultiSelect = {};

        this.chartBackStatus()
        this.updateKaFun();
	}

    //单选
    doSingleData() {
        if(this.singleMultiSelect['bucket'].length){
            this.transformTable._filter('gene_id','gene_id','string','$in',this.singleMultiSelect['bucket'].join(','),null);
        }
    }

    //多选确定时候,提交的数据
	multipleConfirm() {
        let tempArray = [];
        for (let index = 0; index < this.doubleMultiSelect.length; index++) {
            const element = this.doubleMultiSelect[index];
            tempArray.push(...element.bucket);
        }
        let genelist  = Array.from(new Set(tempArray));
        if(genelist.length){
            this.transformTable._filter('gene_id','gene_id','string','$in',genelist.join(','),null);
        }
	}

    //画图
    drawChart(data) {
        document.getElementById('kaFunChartDiv').innerHTML = '';

        let that = this;

        that.geneNum = data.geneCount; //选择基因数量

        that.isHasMultiSelectFlag = this.geneNum == 1?false:true;
        
        if(data.statistic){
            that.k_statistic = {
                degree:data.statistic.degree,
                explain:data.statistic.explain,
                pvalue:data.statistic.pvalue,
                stat:data.statistic.stat
            }
        }

        let k_baseThead = [];

        data.baseThead.forEach((d) => {
            if(d.name != "name"){
                k_baseThead.push(d.name)
            }
        });
        

        //let k_baseThead = data.mThead;//["high", "middle", "low", "sum"]
        let k_dataRow = data.rows;
        let k_dataName = [];
        k_dataRow.forEach(val => {
            k_dataName.push(val.name);
        });
        let k_dataCircle = [];

        let left_name_length = getNameLength(k_dataName);//获取左侧名字最大长度

        let t_chartID = document.getElementById('kaFunChartDiv');
		let str = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
            <style>
                .mText{
                    font-size:12px;
                }

                .axis_x1{
                   display:none;
                }
                .axis_y1{
                   display:none;
                }

                .axis_yname{

                }

                .nameText{
                    font-size:12px;
                    text-align:right;
                }

                .MyTopText{
                    font-size:12px;
                }

                .titleText{
                    font-size:16px;
                    cursor: pointer;
                }

            </style>
        </svg>`;
        t_chartID.innerHTML = str;
        
        let sName = {};
        
        let tempSvg = null;         //中间网格svg
        let tempSvg_xScale = null;  //中间网格X轴比例尺
        let tempSvg_yScale = null;  //中间网格y轴比例尺
        let colorScale = null;      //颜色比例尺

        let top_name = 50; //上侧标题高度
        let left_name = 20;//左侧标题
        let r_width = 80;  //右侧图例宽度
        let t_height = 20;  //上图例宽度

        //let s_width = k_dataRow.length>3?50:120;  //正方体宽高
        
        let s_width = getWidth(k_dataRow.length);


        let x_length = k_baseThead.length*s_width;
        let y_length = k_dataRow.length*s_width;

        let top_length = top_name+t_height; //x轴偏移上方距离
        let leftLength = left_name_length+x_length; //左方图例偏移位置

        let svg_width = left_name_length+x_length+r_width; //计算最外层svg宽度
        let svg_height = y_length+t_height+top_name; //计算最外层svg高度

        let svg = d3.select('#svg') //最外层svg
                .attr('width', svg_width)
                .attr('height', svg_height)
                .on('click', function(d) {
                    
                    that.updateKaFun();
                    // _self.leftSelect.length = 0;
                    // _self.upSelect.length = 0;
                    // _self.first ? _self.transformTable._getData() : (_self.first = true);
                    that.chartBackStatus();


                },false);

        for (let index = 0; index < k_dataRow.length; index++) {
            const element = k_dataRow[index];
            if(that.geneNum == 1){
                k_dataCircle.push(
                    {
                        x:s_width/2,
                        y:s_width*(2*index+1)/2,
                        value:element.high,
                        name:element.name,
                        type:"high",
                        bucket:element.high_bucket
                    },
                    {
                        x:s_width*3/2,
                        y:s_width*(2*index+1)/2,
                        value:element.middle,
                        name:element.name,
                        type:"middle",
                        bucket:element.middle_bucket
                    },
                    {
                        x:s_width*5/2,
                        y:s_width*(2*index+1)/2,
                        value:element.low,
                        name:element.name,
                        type:"low",
                        bucket:element.low_bucket
                    },
                    {
                        x:s_width*7/2,
                        y:s_width*(2*index+1)/2,
                        value:element.sum,
                        name:element.name,
                        type:"sum",
                        bucket:element.sum_bucket
                    }
                )
            }else{
                k_dataCircle.push(
                    {
                        x:s_width/2,
                        y:s_width*(2*index+1)/2,
                        value:element.high,
                        name:element.name,
                        type:"high",
                        bucket:element.high_bucket
                    },
                    {
                        x:s_width*3/2,
                        y:s_width*(2*index+1)/2,
                        value:element.middle,
                        name:element.name,
                        type:"middle",
                        bucket:element.middle_bucket
                    },
                    {
                        x:s_width*5/2,
                        y:s_width*(2*index+1)/2,
                        value:element.low,
                        name:element.name,
                        type:"low",
                        bucket:element.low_bucket
                    }
                )
            }
            

        }
        drawTopTitle();//上侧标题
        drawSvg();  //画中间主题
        drawYaxisName();//y轴名字
        drawXaxisName();//x轴名字
        drawRightTopLegend();//画右上方图例
        drawRightBottomLegend();//画右下方图例

        function drawTopTitle(){
            let width = x_length/2;
            let height = y_length;
            let padding_left = leftLength/2-30;

            let svgTitle = svg
                .append('g')
                .attr('transform', 'translate(' + padding_left + ',' + 0 + ')');
            svgTitle
                .append('text')
                .attr("class","titleText")
                .attr('width', width)
                .attr('height', top_name)
                .attr('dx', '60')
				.attr('dy', '30')
				.text(function(d, i) {
					return that.textContent;
				})
				.on('click', function(d, i) {
                    let self = that;
                    that.promptService.open(d,(data)=>{
                        if(data!=""){
                            self.textContent = data;
                            svgTitle.remove();
                            drawTopTitle();
                        }
                        
                    })
				});
        }

        //画中间主体框架
        function drawSvg(){
            let width = x_length;
            let height = y_length;
    
            let svg1 = svg
                .append('g')
                .attr('transform', 'translate(' + left_name_length + ',' + top_length + ')')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'svg1');
            
            let xScale = d3.scaleBand().domain(k_baseThead).range([ 0, width ]);
            let yScale = d3.scaleBand().domain(k_dataName).range([ 0, height ]);

            tempSvg = svg1;
            tempSvg_xScale = xScale;
            tempSvg_yScale = yScale;

            let xAxis = d3.axisBottom(xScale);
            let yAxis = d3.axisRight(yScale);

            drawMiddleLine(svg1);

            svg1.append('g')
                .attr('class', 'axis_x1')
                .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
                .call(xAxis);
            svg1.append('g')
                .attr('class', 'axis_y1')
                .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
                .call(yAxis);
        }

        //画y轴
        function drawYaxisName(){
            let width = left_name_length;
            let height = y_length;

            let svg2 = svg
                .append('g')
                .attr('transform', 'translate(' + 0 + ',' + top_length + ')')
                .append('svg')
                .attr('x', '0')
				.attr('y', '0')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'svg2');

            let ynScale = d3.scaleBand().domain(k_dataName).range([ 0, height ]);
            let ynAxis = d3.axisLeft(ynScale);

            svg2.append('g').attr('class', 'axis_yname').attr('transform', 'translate(' + width + ',' + 0 + ')').call(ynAxis);
        }

        //画X轴
        function drawXaxisName(){
            let width = x_length;
            let height = t_height;

            let svg3 = svg
                .append('g')
                .attr('transform', 'translate(' + left_name_length + ',' + top_name + ')')
                .append('svg')
                .attr('width', width)
                .attr('height', height+0.5)
                .attr('class', 'svg3');

            let xtScale = d3.scaleBand().domain(k_baseThead).range([ 0, width ]);
            let xtAxis = d3.axisTop(xtScale);

            svg3.append('g').attr('class', 'axis_topname').attr('transform', 'translate(' + 0 + ',' + height + ')').call(xtAxis);
        }

        //画中间网格线
        function drawMiddleLine(tempThatone){
            let rowGroup = [];
            let columGroup = [];
            for (let index = 0; index <= k_baseThead.length; index++) {
                let temp1 = {
                    x_axis:index*s_width,
                    y_axis:0
                }
                let temp2 = {
                    x_axis:index*s_width,
                    y_axis:y_length
                }
                rowGroup.push(temp1);
                rowGroup.push(temp2);
            }

            for (let index = 0; index <= k_dataRow.length; index++) {
                let temp1 = {
                    x_axis:0,
                    y_axis:index*s_width
                }
                let temp2 = {
                    x_axis:x_length,
                    y_axis:index*s_width
                }
                columGroup.push(temp1);
                columGroup.push(temp2);
            }

            let line = d3
				.line()
				.x(function(d) {
					return d.x_axis;
				})
				.y(function(d) {
					return d.y_axis;
                });

            let tempGroup1 = sortArr(rowGroup,'x_axis');
            for (let i = 0; i < tempGroup1.length; i++) {
                let path = tempThatone
                    .append('path')
                    .attr('class', 'line')
                    .attr('d', line(tempGroup1[i]))
                    .attr('stroke', '#333')
                    .attr('stroke-width', 0.5);
            }

            let tempGroup2 = sortArr(columGroup,'y_axis');
            for (let i = 0; i < tempGroup2.length; i++) {
                let path = tempThatone
                    .append('path')
                    .attr('class', 'line')
                    .attr('d', line(tempGroup2[i]))
                    .attr('stroke', '#333')
                    .attr('stroke-width', 0.5);
            }
        }

        function drawRightTopLegend(){ //画右侧上方图例

            let data = k_dataCircle;
            let rectWidth = 30;     //y轴偏移距离
            let legendHeight = 120; //上侧图例高度
            //color
            let valuemin = d3.min(data, function(d) {
                return d.value;
            });
            let valuemax = d3.max(data, function(d) {
                return d.value;
            });

            let colorDomainArr = [];
            for (let i = 0; i < that.colors.length; i++) {
                let obj = valuemin + i * ((valuemax - valuemin) / (that.colors.length - 1));
                colorDomainArr.push(obj);
            }

            let legend_g = svg.append('g').attr('transform', 'translate(' + leftLength + ',' + top_name + ')');
            legend_g.append('text').attr("class","titleText").attr('dx', '15').attr('dy', '10').text("num");

            //气泡颜色比例尺
            colorScale = d3.scaleLinear().domain(colorDomainArr).range(that.colors).interpolate(d3.interpolateRgb);
            legend_g.append('g').attr('class', 'gradient-legend').attr('transform', "translate(" + 0 + "," + t_height + ")");

            let linearGradient = legend_g.append("defs")
                .append("linearGradient")
                .attr("id", "gradientLinear_Color")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%");

            let colorsLen = that.colors.length;

            for (let i = 0; i < colorsLen; i++) {
                linearGradient.append("stop")
                    .attr("offset", i * (100 / (colorsLen - 1)) + "%")
                    .style("stop-color", that.colors[i]);
            }

            //画图例矩形
            legend_g.append("rect").attr("width", (rectWidth-10)).attr("height", legendHeight)
                .attr("fill", "url(#" + linearGradient.attr("id") + ")")
                .attr("x", 10)
                .attr("y",t_height);

            //图例交互
            let legendClickRect_h = legendHeight / colorsLen;
            let legendClick_g = legend_g.append("g").attr("class", "click-gradient-legend")
                .attr('transform', "translate(" + 10 + "," + t_height + ")")
                .style("cursor", "pointer")

            legendClick_g.append('title')
                .text('双击修改颜色')

            legendClick_g.selectAll(".legendClick_Rect")
                .data(that.colors)
                .enter()
                .append("rect")
                .attr("width", (rectWidth-10))
                .attr("height", legendClickRect_h)
                .attr("y", function (d, i) {
                    return i * legendClickRect_h;
                })
                .attr("fill", "transparent")
                .on("dblclick", function (d, i) {
                    that.clearEventBubble(d3.event);
                    that.color = colorScale(d);
                    that.isShowColorPanel = true;
                    that.legendIndex = i;
                    console.log(that.isShowColorPanel);
                });

            let legendScale = d3.scaleLinear().range([0, legendHeight]) //定义图例比例尺
            .domain([valuemin, valuemax]).nice().clamp(true);
            let yAxis = d3.axisRight(legendScale).tickSizeOuter(0).ticks(3); //设置Y轴
            legend_g.append("g").attr("class", "gradient_legendAxis")
                .attr("transform", 'translate(' + rectWidth + ',' + t_height + ')')
                .call(yAxis);
        }


        function drawRightBottomLegend(){
            
            let legendHeight = 120; //上侧图例高度
            let topLength = top_name + t_height+legendHeight+20;//20为上侧图例的title高度

            let r_legend = svg
                .append('g')
                .attr('transform', 'translate(' + leftLength + ',' + topLength + ')');

            r_legend.append('text').attr("class","titleText").attr('dx', '15').attr('dy', '10').text("radius");

            setBubble(r_legend);

        }

        function setBubble(r_legend){ 
            let data = k_dataCircle;
            let r_min = d3.min(data, function(d) {
                return d.value;
            });
            let r_max = d3.max(data, function(d) {
                return d.value;
            });

            let Rmin=10,Rmax=s_width/2;
            let Rsize_arr = [Rmin, Rmax];
            let rScale = d3.scaleLinear().domain([r_min, r_max]).range(Rsize_arr).clamp(true);

            let rData = [];
            let rLen = 3;
            for (let i = 0; i < rLen; i++) {
                let r = r_min + i * ((r_max - r_min) / (rLen - 1));
                rData.push(Math.round(r));
            }
            let resultarr = uniq(rData); //去重
            let circle_legend = r_legend.append("g").attr('transform', 'translate(' + 20 + ',' + 20 + ')');
            let r_sum = 0;
            let space = 10;
            resultarr.forEach(function(d, i) {
                let r_size = 2 * rScale(d);
                r_sum += r_size;
                circle_legend.append("circle")
                    .attr("r", rScale(d)/4)
                    .attr("cy", r_sum/5 + i * space);
                circle_legend.append("text")
                    .attr("dx", rScale(resultarr[resultarr.length - 1])/4 + 10)
                    .attr("dy", r_sum/5 + i * space)
                    .style("font-size", "12")
                    .attr("text-anchor", "start")
                    .attr("dominant-baseline", "middle")
                    .text(d);
            })

            tempSvg.selectAll('.MyCircle')
            .data(data)
            .enter()
            .append("circle")
            .attr("class","MyCircle")
            .attr("r", function(d, i) {
                return rScale(d['value'])>13?rScale(d['value'])-5:8;
            })
            .attr("cx", function(d, i) {
                return d['x'];
            })
            .attr("cy", function(d, i) {
                return d['y'];
            })
            .attr("fill", function(d, i) {
                return colorScale(d['value']);
            })
            .on("mouseover", function(d) {
                let tipText = `x: ${d.x}<br> y:  ${d.y}<br> value:  ${d.value}<br> type:  ${d.type}<br> bucket:  ${d.bucket.toString()}`;
                that.globalService.showPopOver(d3.event, tipText);
            })
            .on("mouseout", function(d) {
                that.globalService.hidePopOver();
            })
            .on('click', function(d) {
                var event = d3.event;
                    event.stopPropagation();
                //如果长度不是1的话，可以单选或者多选
                if(that.isHasMultiSelectFlag){
                    if(that.isMultiSelect){//
                        if(d3.select(this).attr("stroke-opacity")==0.6){
                            d3.select(this).attr("stroke","black").attr("stroke-width", 1.5).attr("stroke-opacity", 0.1);
                        }else{
                            d3.select(this).attr("stroke","black").attr("stroke-width", 1.5).attr("stroke-opacity", 0.6);
                        }
                        
                        selectName(that.doubleMultiSelect,d)
                    }else{//单选
                        //console.log(d)

                        d3.selectAll('.MyCircle').attr('stroke', "black").attr("stroke-width", 1.5).attr("stroke-opacity", 0.1);
                        d3.select(this).attr("stroke","black").attr("stroke-width", 1.5).attr("stroke-opacity", 0.6);

                        that.singleMultiSelect = d;
                        that.doSingleData();
                    }
                }
            })

        }

        function selectName(sList,d) {
            let mkey = d.name+d.type;
			if (sList.length == 0) {
                sList.push(d);
				sName[mkey] = true;
			} else {
				if (sName[mkey]) {
					for (let i = 0; i < sList.length; i++) {
                        let temp = sList[i].name+sList[i].type;
						if (temp == mkey) {
							sList.splice(i, 1);
							sName[mkey] = false;
						}
					}
				} else {
					sList.push(d);
					sName[mkey] = true;
				}
			}
			return sList;
		}

        function uniq(array){
            let temp = [];
            let index = [];
            let l = array.length;
            for(let i = 0; i < l; i++) {
                for(let j = i + 1; j < l; j++){
                    if (array[i] === array[j]){
                        i++;
                        j = i;
                    }
                }
                temp.push(array[i]);
                index.push(i);
            }
            return temp;
        }

        function getBLen(str) {
            if (str == null) return 0;
            if (typeof str != 'string') {
                str += '';
            }
            return str.replace(/[^\x00-\xff]/g, '01').length;
        }

        function getWidth(num){
            let tempNum = 0;
            if(num<3){
                tempNum = 120;
            }else if(num>=3&&num<7){
                tempNum = 70;
            }else if(num>=7&&num<11){
                tempNum = 55
            }else if(num>=11){
                tempNum = 40;
            }
            return tempNum;
        }

        //把x轴相同的分在一起
		function sortArr(arr, str) {
			let _arr = [],
				_t = [],
				// 临时的变量
				_tmp;

			// 按照特定的参数将数组排序将具有相同值得排在一起
			arr = arr.sort(function(a, b) {
				let s = a[str],
					t = b[str];
				return s < t ? -1 : 1;
			});

			if (arr.length) {
				_tmp = arr[0][str];
			}
			// console.log( arr );
			// 将相同类别的对象添加到统一个数组
			for (let i in arr) {
				//console.log( _tmp);
				if (arr[i][str] === _tmp) {
					//console.log(_tmp)
					_t.push(arr[i]);
				} else {
					_tmp = arr[i][str];
					_arr.push(_t);
					_t = [ arr[i] ];
				}
			}
			// 将最后的内容推出新数组
			_arr.push(_t);
			return _arr;
        }

        // 把每组中要画的点提取到一起
		function secondArr(arr) {
			let tempArr = [];
			for (let i = 0; i < arr.length; i++) {
                tempArr.push(arr[i]);
			}
			return tempArr;
        }

        function getNameLength(k_dataName){
            let oSvg = d3.select('#kaFunChartDiv').append('svg');
			let mText = oSvg.selectAll('MyAlltext')
			.data(k_dataName)
			.enter()
			.append('text')
			.text(function(d,i){
				return d;
			})
			.attr('class', 'aText');

			let max_length = [];

			mText.nodes().forEach((d) => {
				max_length.push(d.getBBox().width);
			});
			//console.log(max_length)

			max_length.sort(function(a,b){
				return b-a;
			});

			oSvg.remove();

			return max_length[0];
        }

    }

    //阻止冒泡
    clearEventBubble(evt) {
        if (evt.stopPropagation) {
            evt.stopPropagation();
        } else {
            evt.cancelBubble = true;
        }

        if (evt.preventDefault) {
            evt.preventDefault();
        } else {
            evt.returnValue = false;
        }

    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.kaFunChart.redraw();
    }

}

