import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import { PromptService } from './../../super/service/promptService';

declare const d3: any;
declare const d4: any;
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
	tid: string = null;
	geneType: string = '';
	version: string = null;

	selectGeneCount: number = 0;
	computedScrollHeight: boolean = false;
	leftComputedScrollHeight: boolean = false;
	resetCheckGraph: boolean;

	isExceed: any = null;
	selectedVal: string = '';
	annotation: string = '';
	selectData: any = [];

	isMultipleSelect: boolean = false;

	chartData: any;
	// 图表选择的数据
	checkedList: any[] = [];

	// level标志key
	level1Key: string = 'level_1';
	level2Key: string = 'level_2';
	termKey: string = 'term';

	// 设置
	set: object = { width: 600, len: 40 };
	beforeSet: object = { width: 600, len: 40 };
	setVisible: boolean = false;

	constructor(
		private message: MessageService,
		private store: StoreService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
		private router: Router,
		private routes: ActivatedRoute,
		private promptService: PromptService,
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
			this.version = params['params']['version'];
			this.geneType = params['params']['geneType'];
			this.annotation = params['params']['annotation'];
			this.storeService.setTid(this.tid);
		});
	}

	ngOnInit() {
		(async () => {
			this.selectData = JSON.parse(sessionStorage.getItem('annotation_choice'))[this.annotation];
			this.selectedVal = this.selectData[0];

			this.first = true;
			this.resetCheckGraph = true;
			this.applyOnceSearchParams = true;
			this.defaultUrl = `${config['javaPath']}/classification/table`;
			this.defaultEntity = {
				LCID: sessionStorage.getItem('LCID'),
				tid: this.tid,
				annotation: this.annotation,
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
				checkedClassifyType: this.selectedVal,
				checkedClassifyList: this.checkedList,
				checkGraph: true,
				sortThead: this.addColumnService['sortThead'],
				removeColumns: []
			};
			this.defaultTableId = 'default_class';
			this.defaultDefaultChecked = true;
			this.defaultEmitBaseThead = true;
			this.defaultCheckStatusInParams = true;

			this.extendUrl = `${config['javaPath']}/classification/table`;
			this.extendEntity = {
				LCID: sessionStorage.getItem('LCID'),
				tid: this.tid,
				annotation: this.annotation,
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
				checkedClassifyType: this.selectedVal,
				checkedClassifyList: this.checkedList,
				checkGraph: true,
				sortThead: this.addColumnService['sortThead'],
				removeColumns: []
			};
			this.extendTableId = 'extend_class';
			this.extendDefaultChecked = true;
			this.extendEmitBaseThead = true;
			this.extendCheckStatusInParams = false;

			this.isExceed = await this.getGeneCount();
			this.chartUrl = `${config['javaPath']}/classification/graph`;
			this.chartEntity = {
				LCID: this.storeService.getStore('LCID'),
				annotation: this.annotation,
				geneType: this.geneType,
				species: this.storeService.getStore('genome'),
				checkedClassifyType: this.selectedVal,
				searchList: [],
				pageIndex: 1,
				pageSize: 20,
				sortKey: null,
				sortValue: null,
				tid: this.tid,
				version: this.storeService.getStore('version')
			};
		})();
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
	}

	async getGeneCount() {
		return new Promise((resolve, reject) => {
			this.ajaxService
				.getDeferData({
					url: `${config['javaPath']}/classification/graphIsExceed`,
					data: {
						LCID: sessionStorage.getItem('LCID'),
						annotation: this.annotation,
						geneType: this.geneType,
						species: this.storeService.getStore('genome'),
						checkedClassifyType: this.selectedVal,
						tid: this.tid
					}
				})
				.subscribe(
					(res) => {
						if (res['data'] && !$.isEmptyObject(res['data'])) {
							resolve(res['data']['isExceed']);
						} else {
							resolve(true);
						}
					},
					(error) => {
						resolve(true);
					}
				);
		});
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
			this.extendEntity['relations'] = relations;
			this.extendEntity['transform'] = true;
			this.extendEntity['matrix'] = true;
			this.extendEntity['checkGraph'] = false;
			this.extendEntity['checkedClassifyType'] = checkParams['tableEntity']['checkedClassifyType'];
			this.extendEntity['checkedClassifyList'] = checkParams['tableEntity']['checkedClassifyList'];
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
			this.transformTable._setExtendParamsWithoutRequest(
				'checkedClassifyType',
				checkParams['tableEntity']['checkedClassifyType']
			);
			this.transformTable._setExtendParamsWithoutRequest(
				'checkedClassifyList',
				checkParams['tableEntity']['checkedClassifyList']
			);
			this.transformTable._setExtendParamsWithoutRequest('relations', relations);
			this.transformTable._setExtendParamsWithoutRequest('transform', true);
			this.transformTable._setExtendParamsWithoutRequest('matrix', true);
			this.transformTable._setExtendParamsWithoutRequest('checkGraph', false);
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
		// this.chartBackStatus();
	}

	handleSelectChange() {
		(async () => {
			// 转换表重新获取数据
			this.checkedList.length = 0;
			this.chartBackStatus();

			let curExceed = await this.getGeneCount();
			if (this.isExceed != curExceed) {
				this.chartEntity['checkedClassifyType'] = this.selectedVal;
			} else {
				if (curExceed) {
					this.bigTable._initCheckStatus();
					this.bigTable._setParamsOfEntityWithoutRequest('checkedClassifyType', this.selectedVal);
					this.bigTable._getData(true);
				} else {
					this.chartEntity['checkedClassifyType'] = this.selectedVal;
					this.switchChart.reGetData();
				}
			}
			this.checkedList.length = 0;
			this.isExceed = curExceed;
		})();
	}

	chartBackStatus() {
		this.showBackButton = false;
		this.defaultEmitBaseThead = true;
		this.transformTable._initCheckStatus();
		this.transformTable._clearFilterWithoutRequest();
		this.resetCheckGraph = true;

		let checkedList = this.spliceKey([ ...this.checkedList ]);
		this.checkedList.length = 0;
		this.checkedList.push(...checkedList);

		if (!this.first) {
			this.defaultEntity['checkGraph'] = true;
			this.defaultEntity['addThead'] = [];
			this.defaultEntity['removeColumns'] = [];
			this.defaultEntity['rootSearchContentList'] = [];
			this.defaultEntity['pageIndex'] = 1;
			this.defaultEntity['checkedClassifyType'] = this.selectedVal;
			this.first = true;
		} else {
			this.transformTable._setParamsNoRequest('checkGraph', true);
			this.transformTable._setParamsNoRequest('pageIndex', 1);
			this.transformTable._setParamsNoRequest('checkedClassifyType', this.selectedVal);
			this.transformTable._getData();
		}
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
			this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - 24;
			if (this.tableHeight === h) this.computedScrollHeight = true;

			let l = this.leftTableHeight;
			this.leftTableHeight = this.leftBottom.nativeElement.offsetHeight - 24;
			if (this.leftTableHeight === l) this.leftComputedScrollHeight = true;
		} catch (error) {}
	}

	//画图
	drawChart(data) {
		this.chartData = data;
		let x, y, category, yTitle;
		let _self = this;
		x = data['baseThead'][data['baseThead'].length - 1]['true_key'];
		y = data['baseThead'][0]['true_key'];
		if (data['baseThead'].length > 2) category = data['baseThead'][1]['true_key'];
		if (y.indexOf(this.level1Key) != -1) {
			yTitle = 'Level1';
		} else if (y.indexOf(this.level2Key) != -1) {
			yTitle = 'Level2';
		} else {
			yTitle = 'Term';
		}

		let config = {
			chart: {
				title: `${this.annotation}分类`,
				dblclick: function(event) {
					_self.promptService.open(event.target.innerHTML, (newval) => {
						this.setChartTitle(newval);
						this.updateTitle();
					});
				},
				width: _self.set['width'],
				height: data['rows'].length * 20,
				custom: [ x, y, category ],
				el: '#geneClassChartDiv',
				type: 'bar',
				ticks: 6,
				enableChartSelect: true,
				selectedModule: _self.isMultipleSelect ? 'multiple' : 'single',
				direction: 'horizontal',
				data: data['rows'],
				clearselect: () => {
					_self.checkedList.length = 0;
					_self.chartBackStatus();
				},
				onselect: (data) => {
					_self.checkedList.length = 0;
					_self.checkedList.push(...data);
					if (!_self.isMultipleSelect) {
						_self.chartBackStatus();
					}
				}
			},
			axis: {
				x: {
					title: 'Number',
					dblclick: function(event) {
						_self.promptService.open(event.target.innerHTML, (newval) => {
							this.setXTitle(newval);
							this.updateTitle();
						});
					},
					rotate: 60
				},
				y: {
					title: yTitle,
					dblclick: function(event) {
						_self.promptService.open(event.target.innerHTML, (newval) => {
							this.setYTitle(newval);
							this.updateTitle();
						});
					}
				}
			},
			legend: {
				show: true,
				position: 'right',
				click: (d, index) => {
					this.color = d3.select(d).attr('fill');
					this.show = true;
					this.legendIndex = index;
				}
			},
			tooltip: function(d) {
				if (category)
					return (
						'<span>Number：' +
						d[x] +
						'</span><br><span>Level1：' +
						d[category] +
						'</span><br><span>Level2：' +
						d[y] +
						'</span>'
					);
				return '<span>Number：' + d[x] + '</span><br><span>Level2：' + d[y] + '</span>';
			}
		};

        this.chart = new d4().init(config, {
			yTitleWidth: 80,
			textMaxLength: Number(this.set['len']),
			legend: { textMaxLength: Number(this.set['len']) }
		});
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

	multipleSelectConfirm() {
		this.chartBackStatus();
	}

	chartSelectModelChange(model) {
		this.chart.setChartSelectModule(this.isMultipleSelect ? 'multiple' : 'single');
	}

	spliceKey(data: Array<Object>): any {
		if (!data.length) return data;

		let temp = [];
		if (this.selectedVal.indexOf(this.level2Key) != -1) {
			// level_2
			let level1TrueKey, level2TrueKey;
			for (let name in data[0]) {
				if (name.indexOf(this.level1Key) != -1) level1TrueKey = name;
				if (name.indexOf(this.level2Key) != -1) level2TrueKey = name;
			}
			data.forEach((v) => {
				temp.push(`${v[level1TrueKey]}+${v[level2TrueKey]}`);
			});
			return temp;
		} else if (this.selectedVal.indexOf(this.level1Key) != -1) {
			// level1
			let level1TrueKey;
			for (let name in data[0]) {
				if (name.indexOf(this.level1Key) != -1) level1TrueKey = name;
			}

			data.forEach((v) => {
				temp.push(v[level1TrueKey]);
			});
			return temp;
		} else if (this.selectedVal.endsWith(this.termKey)) {
			// term
			let termTrueKey;
			for (let name in data[0]) {
				if (name.endsWith(this.termKey)) termTrueKey = name;
			}

			data.forEach((v) => {
				temp.push(v[termTrueKey]);
			});
		}
		return temp;
	}

	handleBlur(index) {
		let rules = [ [ 600, 2000 ], [ 20, 50 ] ];
		if (!index) {
			if (this.set['width'] < rules[index][0]) {
				this.set['width'] = rules[index][0];
			} else if (this.set['width'] > rules[index][1]) {
				this.set['width'] = rules[index][1];
			}
		} else {
			if (this.set['len'] < rules[index][0]) {
				this.set['len'] = rules[index][0];
			} else if (this.set['len'] > rules[index][1]) {
				this.set['len'] = rules[index][1];
			}
		}
	}

	setConfirm() {
		this.copyVal(this.set, this.beforeSet);
		this.setVisible = false;
		this.drawChart(this.chartData);
		this.checkedList.length = 0;
		this.chartBackStatus();
	}

	setCancel() {
		this.copyVal(this.beforeSet, this.set);
		this.setVisible = false;
	}

	handleVisibleChange() {
		if (!this.setVisible) this.copyVal(this.beforeSet, this.set);
	}

	copyVal(obj, target) {
		for (let name in obj) {
			target[name] = obj[name];
		}
	}
}
