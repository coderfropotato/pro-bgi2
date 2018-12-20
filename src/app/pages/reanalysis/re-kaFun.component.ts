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

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color

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

    constructor(
        private message: MessageService,
		private store: StoreService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
        private router: Router,
        private routes:ActivatedRoute,
        private promptService:PromptService
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
        // chart
        this.chartUrl=`${config['javaPath']}/chiSquare/switchTable`;
        this.chartEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid
        };
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
            searchList: []
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
            searchList: []
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

    //画图
    drawChart(data) {
        document.getElementById('kaFunChartDiv').innerHTML = '';

        let that = this;
        let k_baseThead = data.baseThead;//["high", "middle", "low", "sum"]
        let k_dataRow = data.row;
        let k_dataName = [];
        k_dataRow.forEach(val => {
            k_dataName.push(val.name);
        });
        // data:
        //     high: 825
        //     low: 856
        //     middle: 294
        //     sum: 1975
        //     __proto__: Object
        // name: "Eye||male"

        //计算左侧最大的名字长度
        let k_name_max = [];
		for (let i = 0; i < k_dataName.length; i++) {
			k_name_max.push(getBLen(k_dataName[i]));
		}

		let max_name = Math.max.apply(null, k_name_max);
		let target_name = '';
		for (let i = 0; i < k_name_max.length; i++) {
			if (max_name == k_name_max[i]) {
				target_name = k_dataName[i];
				break;
			}
        }

        let oSvg = d3.select('#kaFunChartDiv').append('svg');
		let mText = oSvg.append('text').text(target_name).attr('class', 'mText');
		let left_name_length = mText.nodes()[0].getBBox().width;
		oSvg.remove();

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

            </style>
        </svg>`;
		t_chartID.innerHTML = str;

        let s_width = 80;  //正方体宽高
        let r_width = 60;  //右侧图例宽度
        let t_height = 20;  //上图例宽度

        let x_length = k_baseThead.length*s_width;
        let y_length = k_dataRow.length*s_width;

        let svg_width = left_name_length+x_length+r_width; //计算最外层svg宽度
        let svg_height = y_length+t_height; //计算最外层svg高度

        let svg = d3.select('#svg') //最外层svg
                .attr('width', svg_width)
                .attr('height', svg_height)
                .on('click', function(d) {

                },false);

        drawSvg();  //画中间主题
        drawLeftName();//左侧名字
        drawTopName();//左侧名字

        function drawSvg(){
            let width = x_length;
            let height = y_length;

            let svg1 = svg
                .append('g')
                .attr('transform', 'translate(' + left_name_length + ',' + t_height + ')')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'svg1');
            let xScale = d3.scaleBand().domain(k_baseThead).range([ 0, width ]);
            let yScale = d3.scaleBand().domain(k_dataName).range([ 0, height ]);

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

        function drawLeftName(){
            let width = left_name_length;
            let height = y_length;

            let svg2 = svg
                .append('g')
                .attr('transform', 'translate(' + 0 + ',' + t_height + ')')
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

        function drawTopName(){
            let width = x_length;
            let height = t_height;

            let svg3 = svg
                .append('g')
                .attr('transform', 'translate(' + left_name_length + ',' + 0 + ')')
                .append('svg')
                .attr('width', width)
                .attr('height', height+0.5)
                .attr('class', 'svg3');

            let xtScale = d3.scaleBand().domain(k_baseThead).range([ 0, width ]);
            let xtAxis = d3.axisTop(xtScale);

            svg3.append('g').attr('class', 'axis_topname').attr('transform', 'translate(' + 0 + ',' + height + ')').call(xtAxis);
        }

        function drawMiddleLine(tempThatone){

            // left_name_length
            // let t_height = 20;  //上图例宽度
            // let s_width = 80;  //正方体宽高
            // let y_length = k_dataRow.length*s_width;

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
                    .attr('stroke-width', 1);
            }

            let tempGroup2 = sortArr(columGroup,'y_axis');
            for (let i = 0; i < tempGroup2.length; i++) {
                let path = tempThatone
                    .append('path')
                    .attr('class', 'line')
                    .attr('d', line(tempGroup2[i]))
                    .attr('stroke', '#333')
                    .attr('stroke-width', 1);
            }
        }
        function getBLen(str) {
            if (str == null) return 0;
            if (typeof str != 'string') {
                str += '';
            }
            return str.replace(/[^\x00-\xff]/g, '01').length;
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

    }

    colorChange(curColor) {
		this.chart.setColor(curColor, this.legendIndex);
        this.chart.redraw();
    }



}

