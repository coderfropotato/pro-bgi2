import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';

declare const d3: any;
declare const $: any;

/**
 * @description
 * 选择柱子 更新表
 * 选择定量信息确定 - 清空图选择的数据 表变成初始表/增删列激活定量信息的头
 *
 *
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-30
 * @export
 * @class ReMultiOmicsComponent
 * @implements {OnInit}
 */
@Component({
	selector: 'app-multiOmics',
	templateUrl: './re-multiOmics.component.html'
})
export class ReMultiOmicsComponent implements OnInit {
	@ViewChild('left') left;
	@ViewChild('right') right;
	@ViewChild('func') func;
	@ViewChild('transformTable') transformTable;
	@ViewChild('addColumn') addColumn;
	@ViewChild('multiOmicsChart') multiOmicsChart;

	isMultiSelect: boolean = false;

	columnNum:number=0; //柱子总数量

	selectedColumn: object[] = []; //选中的柱状图柱子
	selectedBox: object[] = []; //选中的箱线图箱体
	setAddedThead: any[] = []; // 通过定量设置增加的头
	allSetThead: any[] = []; // 所有通过定量设置增加的头

	colors: string[] = [];
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color
	isShowColorPanel: boolean = false;

	chartEntity: object;
	chartUrl: string;
	chartSelect: any[] = []; // 图上选择的数据  把selectedColumn和selectedBox合并

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
	resetCheckGraph:boolean;

	tableHeight = 0;
	first = true;
	switch: string = 'right';

	geneType: string = '';
	addColumnShow: boolean = false;
	graphRelations: any[] = [];
	showBackButton: boolean = false; // 是否图触发的表更新

	// 路由参数
	tid: string = null;
	version: string = null;

	selectGeneCount: number = 0;
	computedScrollHeight:boolean = false;

	// 图的设置
	constructor(
		private message: MessageService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		public storeService: StoreService,
		public pageModuleService: PageModuleService,
		private router: Router,
		private routes: ActivatedRoute,
		private addColumnService: AddColumnService
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

		this.routes.paramMap.subscribe((params) => {
			this.tid = params['params']['tid'];
			this.geneType = params['params']['geneType'];
			this.version = params['params']['version'];
			// 存起来供页面显示
			this.storeService.setTid(this.tid);
		});
	}

	ngOnInit() {
		this.colors = [
			'#3195BC',
			'#FF6666',
			'#009e71',
			'#FF9896',
			'#F4CA60',
			'#6F74A5',
			'#C49C94',
			'#3b9b99',
			'#FACA0C',
			'#F3C9DD'
		];
		this.chartEntity = {
			id: this.tid,
			quantity: []
		};
		this.chartUrl = `${config['javaPath']}/multiOmics/graph`;
		// this.chartUrl = `http://localhost:8086/multiOmicsY`;

		// table
		this.first = true;
		this.resetCheckGraph = true;
		this.applyOnceSearchParams = true;
		this.defaultUrl = `${config['javaPath']}/multiOmics/table`;
		this.defaultEntity = {
			tid: this.tid,
			pageIndex: 1, //分页
			pageSize: 20,
			quantity: this.chartSelect,
			rationAddThead: this.setAddedThead,
			LCID: sessionStorage.getItem('LCID'),
			addThead: [], //扩展列
			transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
			sortValue: null,
			// matchAll: false,
			reAnaly: false,
			graphRelations: this.graphRelations,
			checkGraph: true,
			matrix: false, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.geneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			version: this.version,
			searchList: [],
			sortThead: this.addColumn['sortThead']
		};
		this.defaultTableId = 'default-multi-omics';
		this.defaultDefaultChecked = true;
		this.defaultEmitBaseThead = true;
		this.defaultCheckStatusInParams = true;

		this.extendUrl = `${config['javaPath']}/multiOmics/table`;
		this.extendEntity = {
			tid: this.tid,
			pageIndex: 1, //分页
			pageSize: 20,
			quantity: this.chartSelect,
			rationAddThead: this.setAddedThead,
			LCID: sessionStorage.getItem('LCID'), //流程id
			addThead: [], //扩展列
			transform: true, //是否转化（矩阵变化完成后，如果只筛选，就为false）
			mongoId: null,
			sortKey: null, //排序
			sortValue: null,
			// matchAll: false,
			reAnaly: false,
			checkGraph: true,
			matrix: true, //是否转化。矩阵为matrix
			relations: [], //关系组（简写，索引最后一个字段）
			geneType: this.geneType, //基因类型gene和transcript
			species: this.storeService.getStore('genome'), //物种
			version: this.version,
			searchList: [],
			sortThead: this.addColumn['sortThead']
		};
		this.extendTableId = 'extend-multi-omics';
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
			this.extendEntity['checkGraph'] = false;
			// 每次转换 清除增删列
			this.addColumn._clearThead();
			this.extendEntity['addThead'] = checkParams['tableEntity']['addThead'];
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
			this.transformTable._setExtendParamsWithoutRequest('checkGraph', false);
			this.transformTable._setExtendParamsWithoutRequest('relations', relations);
			// 每次转换清除增删列
			this.transformTable._setExtendParamsWithoutRequest('addThead', checkParams['tableEntity']['addThead']);
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

	// 表格转换返回
	back() {
		this.classifyChartSelect();
		this.showBackButton = false;
		this.defaultEntity['checkGraph'] = !!this.chartSelect.length || !!this.graphRelations.length;
		this.chartBackStatus();
	}

	handlerRefresh() {
		this.chartSelect.length = 0;
		this.defaultEntity['checkGraph'] = !!this.chartSelect.length || !!this.graphRelations.length;
		this.showBackButton = false;
		this.chartBackStatus();
	}

	chartBackStatus() {
		this.defaultEmitBaseThead = true;
		this.resetCheckGraph = true;
		this.transformTable._initCheckStatus();
		// 清空表的筛选
		this.transformTable._clearFilterWithoutRequest();
		if (!this.first) {
			if (!this.showBackButton) {
				// 如果是通过定量信息转的矩阵 那就需要保存增删列的激活状态
				let { add, remove } = this.addColumn._confirmWithoutEvent();
				this.defaultEntity['addThead'] = add;
				this.defaultEntity['removeColumns'] = remove;
			} else {
				this.defaultEntity['addThead'] = [];
				this.defaultEntity['removeColumns'] = [];
			}
			this.defaultEntity['pageIndex'] = 1;
			this.defaultEntity['rootSearchContentList'] = [];
			this.defaultEntity['searchList'] = [];
			this.defaultEntity['matrix'] = !!this.graphRelations.length;
			this.first = true;
		} else {
			this.transformTable._setParamsNoRequest('pageIndex', 1);
			this.transformTable._setParamsNoRequest('matrix', !!this.graphRelations.length);
			this.transformTable._getData();
		}
	}

	// 在认为是基础头的时候发出基础头 双向绑定到增删列
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
			this.multiOmicsChart.scrollHeight();
			this.computedTableHeight();
		}, 320);
	}

	computedTableHeight() {
		try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2;
            if(this.tableHeight===h) this.computedScrollHeight = true;
		} catch (error) {}
    }

	// 把选中的柱子和箱线图中的柱子 数据合并成选中的数据
	classifyChartSelect() {
		this.chartSelect.length = 0;
		if (this.selectedColumn.length) this.chartSelect.push(...this.selectedColumn);
        if (this.selectedBox.length) this.chartSelect.push(...this.selectedBox);
	}

	// 图
	drawChart(data) {
		d3.select('#multiOmicsChartDiv svg').remove();
		let that = this;

		this.columnNum=0;

		//data
		let column = data.column;
		let columnLength = column.length;
		let boxplot = [];
		if (data.boxplot && data.boxplot.length) {
			boxplot = data.boxplot;
		}
		let boxplotLength = boxplot.length;

		// x title
		let columnXtitle='Origin';
		let columnXtitleLen=columnXtitle.length*7;
		let boxXtitleLen_max=0;
		if(boxplotLength){
			boxXtitleLen_max=d3.max(boxplot,d=>d.relation.length*7);
		}
		
		let xTitleLen=boxXtitleLen_max && boxXtitleLen_max>columnXtitleLen ? boxXtitleLen_max : columnXtitleLen;

		// set width height space
		let eachChartHeight = 0; //每种图主体的height
		const chartSpace = 10; // 每种图之间的间距
		let height = 0; //总图主体的总高度
		let width = 0; //总图主体的总宽度

		let eachTypeWidth = 0; //每个图中每种类型的width
		// const typeSpace = 0;  //图中每种类型的间距
		let rectWidth = 0; //每个矩形width
		let rectSpace = 0; // 每个矩形的间距

		// 图例
		let legendRectW = 16, // 小矩形宽
			legendRectH = 16; // 小矩形高
		let legend_chart_Space = 24, //图例与图距离
			legendBottom = 6, //图例上下之间的距离
			legend_text_space = 4; //图例矩形与文字之间的距离

		//domain 柱子数量；range 宽、距离
		let widthScale = d3.scaleLinear().domain([ 1, 100 ]).range([ 30, 8 ]).clamp(true).nice(); //根据柱子数量决定当前组每根柱子宽度
		let spaceScale = d3.scaleLinear().domain([ 1, 100 ]).range([ 12, 1 ]).clamp(true).nice(); //根据柱子数量决定当前组每根柱子之间的距离

		//domain：箱线图数量
		let heightScale = d3.scaleOrdinal().domain([ 1, 2, 3, 4, 5 ]).range([ 260, 230, 200, 170, 140 ]);

		//calculate min max
		let allXTexts = [];
		let allYColumn = [];
		let colors = [];

		let spaceNum = 0; //柱子之间距离的总个数
		let allRectWidth = 0; //所有柱子宽度

		column.forEach((d, i) => {
			colors.push(this.colors[i]);

			let rectsLen = d.data.length;
			this.columnNum+=rectsLen;
			rectWidth = widthScale(rectsLen);

			let eachSpaceNum = rectsLen + 1;
			spaceNum += eachSpaceNum;
			allRectWidth += rectWidth * rectsLen;

			d.w = rectWidth;
			d.data.forEach((m) => {
				m.w = rectWidth;
				m.relation = 'false';
				m.key = d.key;
				m.type = d.type;
				m.category = d.category;
				m.value = m.x;
				m['checked'] = false;
				allXTexts.push(m.x);
				allYColumn.push(m.y);
			});
		});

		let temp = 0;
		if (boxplotLength) {
			eachChartHeight = heightScale(boxplotLength);
			height = eachChartHeight * (boxplotLength + 1) + boxplotLength * chartSpace;
			width = height;
			rectSpace = (width - allRectWidth) / spaceNum;
			if(rectSpace<1){
				rectSpace=1;
				width=rectSpace*spaceNum+allRectWidth;
			}

			column.forEach((d) => {
				let rectsLength = d.data.length;
				eachTypeWidth = rectsLength * d.w + (rectsLength + 1) * rectSpace;
				temp += eachTypeWidth;
				d.transX = temp - eachTypeWidth;

				d.space = rectSpace;
				d.data.forEach((m) => {
					m.space = rectSpace;
				});
			});

		} else {
			column.forEach((d) => {
				let rectsLength = d.data.length;
				rectSpace = spaceScale(rectsLength);
				eachTypeWidth = rectsLength * d.w + (rectsLength + 1) * rectSpace;
				temp += eachTypeWidth;
				// width = temp + typeSpace * (columnLength - 1);
				// d.transX = (temp - eachTypeWidth) + i * typeSpace;
				d.transX = temp - eachTypeWidth;

				d.space = rectSpace;
				d.data.forEach((m) => {
					m.space = rectSpace;
				});
			});

			width = temp;
			height = width;

			//判断极值
			if (height >= 400) {
				height = 400;
			}else{
				let temps=0;
				height=400;
				width=height;
				rectSpace = (width - allRectWidth) / spaceNum;

				column.forEach((d) => {
					let rectsLength = d.data.length;
					eachTypeWidth = rectsLength * d.w + (rectsLength + 1) * rectSpace;
					temps += eachTypeWidth;
					d.transX = temps - eachTypeWidth;

					d.space = rectSpace;
					d.data.forEach((m) => {
						m.space = rectSpace;
					});
				});
			}

			eachChartHeight = height;

		}

		//计算max
		let typeTextMax = d3.max(column, (d) => d.type.length);

		let xmaxLength = d3.max(allXTexts, (d) => d.length);

		let yColumnMax = d3.max(allYColumn, (d) => Math.ceil(d));

		let margin = {
			left: 100,
			right: 50,
			top: 50,
			bottom: xmaxLength * 4 + 20
		};

		let legendWidth = legendRectW + legend_text_space + typeTextMax * 7;

		// svg width height
		let totalWidth = margin.left + width + xTitleLen + chartSpace + legend_chart_Space + legendWidth + margin.right,
			totalHeight = height + margin.top + margin.bottom;

		// 比例尺
		let yColumnScale = d3.scaleLinear().range([ eachChartHeight, 0 ]).domain([ 0, yColumnMax ]).nice();

		let yColumnAxis = d3.axisLeft(yColumnScale).ticks(5).tickFormat(d3.format('1'));

		let colorScale = d3
			.scaleOrdinal()
			.range(
				colors.map(function(d) {
					return d;
				})
			)
			.domain(
				column.map(function(d) {
					return d.type;
				})
			);

		// svg
		let svg = d3.select('#multiOmicsChartDiv').append('svg').attr('width', totalWidth).attr('height', totalHeight);

		// column
		let column_g = svg
			.append('g')
			.attr('class', 'column')
			.attr(
				'transform',
				`translate(${margin.left},${margin.top + (eachChartHeight + chartSpace) * boxplotLength})`
			);

		// column x
		let xAxisColumn = column_g
			.append('g')
			.attr('class', 'xAxis-column')
			.attr('transform', `translate(0,${eachChartHeight})`);

		xAxisColumn
			.append('line')
			.attr('x1', 0)
			.attr('y1', 0.5)
			.attr('x2', width)
			.attr('y2', 0.5)
			.style('stroke', '#000000');

		// xAxisColumn.append("line")
		// .attr("x1", width - 1)
		// .attr("y1", 0)
		// .attr("x2", width - 1)
		// .attr("y2", 6)
		// .style("stroke", "#000000");

		//column x title
		xAxisColumn.append('text')
					.attr('dominant-baseline','middle')
					.attr('x',width+chartSpace)
					.text(columnXtitle)

		// column y
		column_g.append('g').attr('class', 'yAxis-column').call(yColumnAxis);

		// column y title
		column_g
			.append('g')
			.attr('class', 'yText-column')
			.attr('transform', `translate(${-(margin.left - 10)},${eachChartHeight / 2})`)
			.append('text')
			.attr('font-size', '14px')
			.attr('font-family','Arial')
			.attr('text-anchor', 'middle')
			.attr('dominant-baseline', 'middle')
			.attr('transform', `rotate(-90)`)
			.text('Number');

		// column rect
		let columns = column_g
			.selectAll('.columns')
			.data(column)
			.enter()
			.append('g')
			.attr('class', 'columns')
			.attr('transform', (m) => `translate(${m.transX},0)`);

		columns
			.selectAll('.columnRect')
			.data((d) => d.data)
			.enter()
			.append('rect')
			.attr('class', 'columnRect')
			.attr('transform', (d, i) => `translate(${(i + 1) * d.space + i * d.w},${yColumnScale(d.y)})`)
			.attr('width', (d) => d.w)
			.attr('height', (d) => yColumnScale(0) - yColumnScale(d.y))
			.attr('fill', (d) => colorScale(d.type))
			.style('cursor', 'pointer')
			.on('mouseover', (d) => {
				this.globalService.showPopOver(d3.event, d.y);
			})
			.on('mouseout', () => {
				this.globalService.hidePopOver();
			})
			.on('click', function(d) {
				that.clearEventBubble(d3.event);
				if (that.isMultiSelect) {
					//多选
					d['checked'] = !d['checked'];
					if (d['checked']) {
						d3.select(this).style('fill', '#FF4C06');
						that.selectedColumn.push(d);
					} else {
						d3.select(this).style('fill', colorScale(d.type));
					}

					that.selectedColumn.forEach((m, i) => {
						if (!m['checked']) {
							that.selectedColumn.splice(i, 1);
						}
					});
				} else {
					//单选
                    that.selectedColumn.length = 0;
                    that.selectedBox.length = 0;

					d3.select('#multiOmicsChartDiv svg').selectAll('.columnRect').nodes().forEach((v) => {
						$(v).css('fill', $(v).attr('fill'));
					});
					d3.select('#multiOmicsChartDiv svg').selectAll('.boxplotRect').nodes().forEach((v) => {
						$(v).css('fill', $(v).attr('fill'));
					});
					d3.select(this).style('fill', '#FF4C06');

					column.forEach((m) => {
						m.data.forEach((n) => {
							n['checked'] = false;
						});
					});

					boxplot.forEach((a) => {
						a.data.forEach((b) => {
							b.boxList.forEach((c) => {
								c['checked'] = false;
							});
						});
					});

					d['checked'] = true;
					that.selectedColumn.push(d);
					that.first
						? that.transformTable._setParamsNoRequest('checkGraph', true)
						: (that.defaultEntity['checkGraph'] = true);
					that.classifyChartSelect();
					that.chartBackStatus();
					that.showBackButton = false;
                }

			});

		// column x text
		columns
			.selectAll('.xAxisText')
			.data((d) => d.data)
			.enter()
			.append('text')
			.attr('class', 'xAxisText')
			.style('font-size', '10px')
			.attr('font-family','Arial')
			.attr('text-anchor', 'end')
			.attr('dominant-baseline', 'middle')
			.attr(
				'transform',
				(d, i) => `translate(${(i + 1) * d.space + i * d.w + d.w / 2},${eachChartHeight + 6}) rotate(-45)`
			)
			.text((d) => d.x);

		// boxplot
		if (boxplotLength) {
			boxplot.forEach((d, i) => {
				d.data.forEach((m) => {
					column.forEach((a) => {
						if (m.type === a.type) {
							m.transX = a.transX;
						}
					});

					m.boxList.forEach((t) => {
						t.relation = d.relation;
						t.key = d.key;
						t.type = m.type;
						t.typeKey = m.key;
						t.category = m.category;
						t.value = t.x;
						t['checked'] = false;
						column.forEach((b) => {
							if (t.type === b.type) {
								t.w = b.w;
								t.space = b.space;
							}
						});
					});
				});

				let boxplot_g = svg
					.append('g')
					.attr('class', 'boxplot')
					.attr(
						'transform',
						`translate(${margin.left},${margin.top +
							(boxplotLength - 1 - i) * (eachChartHeight + chartSpace)})`
					);

				let yScaleBox;
				if (d.yMin === d.yMax) {
					yScaleBox = d3.scaleLinear().domain([ 0, d.yMax ]).range([ eachChartHeight, 0 ]).nice();
				} else {
					yScaleBox = d3.scaleLinear().domain([ d.yMin, d.yMax ]).range([ eachChartHeight, 0 ]).nice();
				}

				let yAxisBox = d3.axisLeft(yScaleBox).ticks(5).tickFormat(d3.format('1'));

				// boxplot y
				boxplot_g.append('g').attr('class', 'yAxis-boxplot').call(yAxisBox);

				// boxplot y title
				let boxYtitle = boxplot_g
					.append('g')
					.attr('class', 'yText-boxplot')
					.attr('transform', `translate(${-(margin.left - 10)},${eachChartHeight / 2})`)
					.append('text')
					.attr('font-size', '14px')
					.attr('font-family','Arial')
					.attr('text-anchor', 'middle')
					.attr('dominant-baseline', 'middle')
					.attr('transform', `rotate(-90)`)
					.text(d.name.length*7>eachChartHeight ? d.name.slice(0,Math.floor(eachChartHeight/7))+"..." : d.name)
					.append('title').text(d.name);

				// boxYtitle.append('tspan').text(
				// 	d.relation.length*7>eachChartHeight ? d.relation.slice(0,Math.floor(eachChartHeight/7))+"..." : d.relation
				// ).append('title').text(d.relation);

				// boxYtitle.append('tspan').attr("x",0).attr('dy',15).text(
				// 	d.name.length*7>eachChartHeight ? d.name.slice(0,Math.floor(eachChartHeight/7))+"..." : d.name
				// ).append('title').text(d.name);

				// boxplot x
				let xAxisBox = boxplot_g
					.append('g')
					.attr('class', 'xAxis-boxplot')
					.attr('transform', `translate(0,${eachChartHeight})`);

				xAxisBox
					.append('line')
					.attr('x1', 0)
					.attr('y1', 0.5)
					.attr('x2', width)
					.attr('y2', 0.5)
					.style('stroke', '#000000');

				// boxplot x title
				xAxisBox.append('text')
					.attr('dominant-baseline','middle')
					.attr('x',width+chartSpace)
					.text(d.relation)

				//boxplots g
				let boxplots = boxplot_g
					.append('g')
					.attr('class', 'boxplots')
					.selectAll('.typeBoxs')
					.data(d.data)
					.enter()
					.append('g')
					.attr('class', 'typeBoxs')
					.attr('transform', (m) => `translate(${m.transX},0)`)
					.selectAll('.boxs')
					.data((m) => m.boxList)
					.enter();

				// scatter
				const radius = 2;
				boxplots
					.append('g')
					.attr('class', 'boxPoints')
					.attr('transform', (k, i) => `translate(${(i + 1) * k.space + i * k.w},0)`)
					.selectAll('.allPoints')
					.data((k) =>{
						var scatters=[];
						k.scatters.forEach(d=>{
							scatters.push({
								x:Math.random(),
								y:d.value,
								w:k.w,
								gene:d.gene,
								realValue:d.realValue
							})
						})

						// var domains=d3.extent(scatters,d=>d.x);
						scatters.forEach(d=>{
							d.xscale=d3.scaleLinear().domain([0,1]).range([0,d.w]).clamp(true).nice();
						})

						return scatters;
					})
					.enter()
					.append('circle')
					.attr('r', radius)
					.attr('fill', '#faca0c')
					// .attr('fill-opacity',0.6)
					.attr('cx', m=>m.xscale(m.x))
					.attr('cy', (m) => yScaleBox(m.y))
					.on('mouseover', (m) => {
						let text=`基因ID：<a>${m.gene}</a><br>值：${m.realValue}`;
						this.globalService.showPopOver(d3.event, text);
					})
					.on('mouseout', () => {
						this.globalService.hidePopOver();
					});

				// vertical line
				this._drawLline(
					boxplots,
					(k, i) => (i + 1) * k.space + i * k.w + k.w / 2,
					(k) => yScaleBox(k.box.high),
					(k, i) => (i + 1) * k.space + i * k.w + k.w / 2,
					(k) => yScaleBox(k.box.low)
				);

				// high line
				this._drawLline(
					boxplots,
					(k, i) => (i + 1) * k.space + i * k.w + k.w / 4,
					(k) => yScaleBox(k.box.high),
					(k, i) => (i + 1) * k.space + i * k.w + 3 * k.w / 4,
					(k) => yScaleBox(k.box.high)
				);

				// low line
				this._drawLline(
					boxplots,
					(k, i) => (i + 1) * k.space + i * k.w + k.w / 4,
					(k) => yScaleBox(k.box.low),
					(k, i) => (i + 1) * k.space + i * k.w + 3 * k.w / 4,
					(k) => yScaleBox(k.box.low)
				);

				//median line
				this._drawLline(
					boxplots,
					(k, i) => (i + 1) * k.space + i * k.w,
					(k) => yScaleBox(k.box.median),
					(k, i) => (i + 1) * k.space + i * k.w + k.w,
					(k) => yScaleBox(k.box.median)
				);

				// rect
				boxplots
					.append('rect')
					.attr('class', 'boxplotRect')
					.attr('transform', (k, i) => `translate(${(i + 1) * k.space + i * k.w},${yScaleBox(k.box.y2)})`)
					.attr('width', (k) => k.w)
					.attr('height', (k) => Math.abs(yScaleBox(k.box.y2) - yScaleBox(k.box.y1)))
					.attr('fill', (k) => colorScale(k.type))
					.attr('fill-opacity',0.8)
					.attr('stroke','#000000')
					.attr('stroke-opacity',0.8)
					.style('cursor', 'pointer')
					.on('mouseover', (m) => {
						let text = `上限：${m.box.high}<br>上四分位数：${m.box.y2}<br>中位数：${m.box.median}<br>下四分位数：${m.box
							.y1}<br>下限：${m.box.low}`;
						this.globalService.showPopOver(d3.event, text);
					})
					.on('mouseout', () => {
						this.globalService.hidePopOver();
					})
					.on('click', function(m) {
						that.clearEventBubble(d3.event);
						if (that.isMultiSelect) {
							//多选
							m['checked'] = !m['checked'];
							if (m['checked']) {
								d3.select(this).style('fill', '#FF4C06');
								that.selectedBox.push(m);
							} else {
								d3.select(this).style('fill', colorScale(m.type));
							}

							that.selectedBox.forEach((n, k) => {
								if (!n['checked']) {
									that.selectedBox.splice(k, 1);
								}
							});
						} else {
							//单选
                            that.selectedBox.length = 0;
                            that.selectedColumn.length = 0;

							d3.select('#multiOmicsChartDiv svg').selectAll('.columnRect').nodes().forEach((v) => {
								$(v).css('fill', $(v).attr('fill'));
							});
							d3.select('#multiOmicsChartDiv svg').selectAll('.boxplotRect').nodes().forEach((v) => {
								$(v).css('fill', $(v).attr('fill'));
							});
							d3.select(this).style('fill', '#FF4C06');

							column.forEach((k) => {
								k.data.forEach((n) => {
									n['checked'] = false;
								});
							});
							boxplot.forEach((a) => {
								a.data.forEach((b) => {
									b.boxList.forEach((c) => {
										c['checked'] = false;
									});
								});
							});
							m['checked'] = true;
							that.selectedBox.push(m);

							that.first
								? that.transformTable._setParamsNoRequest('checkGraph', true)
								: (that.defaultEntity['checkGraph'] = true);
							that.classifyChartSelect();
							that.chartBackStatus();
							that.showBackButton = false;
						}
					});

			});
		}

		//图例
		let legend_g = svg
			.append('g')
			.attr('class', 'legend')
			.attr('transform', `translate(${margin.left + width + xTitleLen + chartSpace + legend_chart_Space},${margin.top + height / 2})`);

		// legend rect
		legend_g
			.selectAll('.legendRects')
			.data(column)
			.enter()
			.append('rect')
			.attr('y', (d, i) => i * (legendBottom + legendRectH))
			.attr('width', legendRectW)
			.attr('height', legendRectH)
			.attr('fill', (d) => colorScale(d.type))
			.style('cursor', 'pointer')
			.on('click', (d, i) => {
				that.clearEventBubble(d3.event);
				this.color = colorScale(d.type);
				this.isShowColorPanel = true;
				this.legendIndex = i;
			});

		// legend text
		legend_g
			.selectAll('.legendTexts')
			.data(column)
			.enter()
			.append('text')
			.style('text-anchor', 'start')
			.style('dominant-baseline', 'middle')
			.style('font-size', '12px')
			.attr('font-family','Arial')
			.attr('x', legend_text_space + legendRectW)
			.attr('y', (d, i) => i * (legendBottom + legendRectH) + legendRectH / 2)
			.text((d) => d.type);

		d3.select('#multiOmicsChartDiv svg').on('click', function() {
			that.selectedColumn.length = 0;
			that.selectedBox.length = 0;
			d3.select('#multiOmicsChartDiv svg').selectAll('.columnRect').nodes().forEach((v) => {
				$(v).css('fill', $(v).attr('fill'));
			});
			d3.select('#multiOmicsChartDiv svg').selectAll('.boxplotRect').nodes().forEach((v) => {
				$(v).css('fill', $(v).attr('fill'));
			});

			that.first
				? that.transformTable._setParamsNoRequest(
						'checkGraph',
						!!that.graphRelations.length || !!that.selectedColumn.length
					)
				: (that.defaultEntity['checkGraph'] = !!that.graphRelations.length || !!that.selectedColumn.length);
			that.classifyChartSelect();
			that.showBackButton = false;
			that.chartBackStatus();
		});
	}

	//画线
	_drawLline(g, x1, y1, x2, y2) {
		g
			.append('line')
			.attr('stroke-width', 1)
			.attr('stroke', '#000000')
			.attr('x1', x1)
			.attr('y1', y1)
			.attr('x2', x2)
			.attr('y2', y2);
	}

	// single() {
	//     this.isMultiSelect = false;
	//     this.selectedColumn.length = 0;
	//     this.selectedBox.length = 0;
	//     this.drawChart(this.chartData);
	// }

	// multiple() {
	//     this.isMultiSelect = true;
	//     this.selectedColumn.length = 0;
	//     this.selectedBox.length = 0;
	//     this.drawChart(this.chartData);
	// }

	//单、多选change
	multiSelectChange() {
		this.selectedColumn.length = 0;
		this.selectedBox.length = 0;
		this.chartSelect.length = 0;
		this.showBackButton = false;

		this.multiOmicsChart.redraw();
		this.transformTable._getData();
	}

	multipleConfirm() {
		this.classifyChartSelect();
		this.first
			? this.transformTable._setParamsNoRequest('checkGraph', true)
			: (this.defaultEntity['checkGraph'] = true);
			
		this.chartBackStatus();
		this.showBackButton = false;
	}

	colorChange(color) {
		this.color = color;
		this.colors.splice(this.legendIndex, 1, color);
		this.multiOmicsChart.redraw();
	}

	//设置 确定
	setConfirm(setArr) {
		this.chartEntity['quantity'] = setArr;
		this.multiOmicsChart.reGetData();
		// 获取图关系
		if (setArr.length) {
			this.graphRelations.length = 0;
			// this.graphRelations.push(...setArr);
			setArr.forEach((v) => {
				if (v['relation'] != 'false') this.graphRelations.push(v);
			});
		} else {
			this.graphRelations.length = 0;
		}

		this.setAddedThead.length = 0;
		this.setAddedThead.push(...setArr);
		// 图会重画 把选中的数据清空
		this.selectedColumn.length = 0;
		this.selectedBox.length = 0;

		this.classifyChartSelect();
		this.transformTable._setParamsNoRequest('checkGraph', !!this.graphRelations.length);
		this.chartBackStatus();
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
}
