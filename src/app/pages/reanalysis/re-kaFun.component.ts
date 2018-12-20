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
        
        let tempSvg = null;
        let tempSvg_xScale = null;
        let tempSvg_yScale = null;

        let top_name = 50; //上侧标题高度
        let left_name = 20;//左侧标题
        let s_width = 80;  //正方体宽高
        let r_width = 80;  //右侧图例宽度
        let t_height = 20;  //上图例宽度

        let x_length = k_baseThead.length*s_width;
        let y_length = k_dataRow.length*s_width;

        let svg_width = left_name_length+x_length+r_width; //计算最外层svg宽度
        let svg_height = y_length+t_height+top_name; //计算最外层svg高度

        let svg = d3.select('#svg') //最外层svg
                .attr('width', svg_width)
                .attr('height', svg_height)
                .on('click', function(d) {

                },false);

        for (let index = 0; index < k_dataRow.length; index++) {
            const element = k_dataRow[index];
            let tempData = element.data;
            k_dataCircle.push(
                {
                    x:s_width/2,
                    y:s_width*(2*index+1)/2,
                    r:5,
                    color:'red',
                    value:tempData.high,
                    name:element.name,
                    type:"high"
                },
                {
                    x:s_width*3/2,
                    y:s_width*(2*index+1)/2,
                    r:5,
                    color:'red',
                    value:tempData.middle,
                    name:element.name,
                    type:"middle"
                },
                {
                    x:s_width*5/2,
                    y:s_width*(2*index+1)/2,
                    r:5,
                    color:'red',
                    value:tempData.low,
                    name:element.name,
                    type:"low"
                },
                {
                    x:s_width*7/2,
                    y:s_width*(2*index+1)/2,
                    r:5,
                    color:'red',
                    value:tempData.sum,
                    name:element.name,
                    type:"sum"
                }
            )

        }
        //console.log(k_dataCircle);
        drawTopTitle();//上侧标题
        drawSvg();  //画中间主题
        drawYaxisName();//y轴名字
        drawXaxisName();//x轴名字
        drawRightTopLegend();//画右上方图例
        drawRightBottomLegend();//画右下方图例

        function drawTopTitle(){
            let width = x_length/2;
            let height = y_length;
            let svgTitle = svg
                .append('g')
                .attr('transform', 'translate(' + left_name_length + ',' + 0 + ')')
                .append('text')
                .attr("class","titleText")
                .attr('width', width)
                .attr('height', top_name)
                .attr('dx', '60')
				.attr('dy', '30')
				.text(function(d, i) {
					return "气泡统计图";
				})
				.on('click', function(d, i) {
                    let event = d3.event;
                    event.stopPropagation();
					console.log(1111)
				});
        }

        //画中间主体框架
        function drawSvg(){
            let width = x_length;
            let height = y_length;

            let top_length = top_name+t_height;
    
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
            
            let top_length = top_name+t_height;

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

        function drawRightTopLegend(){
            // t_height
            // y_length  //高度
            // left_name_length+x_length //偏移位置
            // let r_width = 60;  //右侧图例宽度

            // let width = x_length/2;
            // let height = y_length;

            let leftLength = left_name_length+x_length;
            let topLength = top_name + t_height;
            let rectWidth = 40;     //y轴偏移距离
            let legendHeight = 100; //上侧图例高度
            let legend_g = svg
                .append('g')
                .attr('transform', 'translate(' + leftLength + ',' + top_name + ')');

            legend_g.append('text').attr("class","titleText").attr('dx', '15').attr('dy', '10').text("num");

            let legendScale = d3.scaleLinear().range([0, legendHeight]) //定义图例比例尺
            .domain([0, 1]).nice().clamp(true);
            let yAxis = d3.axisRight(legendScale).tickSizeOuter(0).ticks(5); //设置Y轴
            legend_g.append("g").attr("class", "gradient_legendAxis")
                .attr("transform", 'translate(' + rectWidth + ',' + t_height + ')')
                .call(yAxis);
        }

        function drawRightBottomLegend(){
            let leftLength = left_name_length+x_length;
            let legendHeight = 100; //上侧图例高度
            let topLength = top_name + t_height+legendHeight+20;//20为上侧图例的title高度

            let r_legend = svg
                .append('g')
                .attr('transform', 'translate(' + leftLength + ',' + topLength + ')');
            
            r_legend.append('text').attr("class","titleText").attr('dx', '15').attr('dy', '10').text("radius");

            setBubble(k_dataCircle,r_legend);

        }

        function setBubble(data,r_legend){ 
            let r_min = d3.min(data, function(d) {
                return d.value;
            });
            let r_max = d3.max(data, function(d) {
                return d.value;
            });

            let Rmin=4,Rmax=8;
            let Rsize_arr = [Rmin, Rmax];
            let rScale = d3.scaleLinear().domain([r_min, r_max]).range(Rsize_arr).clamp(true);

            let rData = [];
            let rLen = 5;
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
                    .attr("r", rScale(d))
                    .attr("cy", r_sum + i * space);
                circle_legend.append("text")
                    .attr("dx", rScale(resultarr[resultarr.length - 1]) + 10)
                    .attr("dy", r_sum + i * space)
                    .style("font-size", "12")
                    .attr("text-anchor", "start")
                    .attr("dominant-baseline", "middle")
                    .text(d)
            })

            tempSvg.selectAll('.MyCircle')
            .data(data)
            .enter()
            .append("circle")
            .attr("r", function(d, i) {
                return rScale(d['r']);
            })
            .attr("cx", function(d, i) {
                return d['x'];
            })
            .attr("cy", function(d, i) {
                return d['y'];
            })
            // .attr("fill", d => colorScale(d.color))
            // .attr("fill-opacity", 0.3)
            // .attr("stroke", d => colorScale(d.color))
            // .attr("stroke-opacity", 0.7)
            .on("mouseover", function(d) {
                // d3.select(this).transition().attr("r", rScale(d.r) + 2);
                // if ("tooltip" in that && that.tooltip) {
                //     var html = that.tooltip(d);
                // }
                // tooltip.show(d3.event.pageX, d3.event.pageY, html ? html : `x：${d.x}<br>y：${d.y}`);
            })
            .on("mousemove", function() {
                //tooltip.update(d3.event.pageX, d3.event.pageY);
            })
            .on("mouseout", function(d) {
                // d3.select(this).transition().attr("r", rScale(d.r));
                // tooltip.hide();
            })
            .on('click', function(d) {
                // if (that.selectedModule) {
                //     that._applyChartSelect(d, d3.select(this), colorScale(d.color));
                //     d3.event.stopPropagation();
                // } else {
                //     return false;
                // }
            })
            // .transition()
            // .duration(800)
            // .attr("r", d => rScale(d.r));

        }
        
        function uniq(array){
            var temp = [];
            var index = [];
            var l = array.length;
            for(var i = 0; i < l; i++) {
                for(var j = i + 1; j < l; j++){
                    if (array[i] === array[j]){
                        i++;
                        j = i;
                    }
                }
                temp.push(array[i]);
                index.push(i);
            }
            console.log(index);
            return temp;
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
        
        function getNameLength(k_dataName){
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
            let name_length = mText.nodes()[0].getBBox().width;
            oSvg.remove();

            return name_length;
        }

    }

    colorChange(curColor) {
		this.chart.setColor(curColor, this.legendIndex);
        this.chart.redraw();
    }



}

