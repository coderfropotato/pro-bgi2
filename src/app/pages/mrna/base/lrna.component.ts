import { StoreService } from '../../../super/service/storeService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../../config';
import { PromptService } from '../../../super/service/promptService';
import { MessageService } from '../../../super/service/messageService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

declare const d3: any;
declare const d4: any;
declare const $: any;

@Component({
	selector: 'app-lrna',
	templateUrl: './lrna.component.html',
	styles: []
})
export class LrnaComponent implements OnInit {
	@ViewChild('smallRNAChart') smallRNAChart;
	@ViewChild('RNALchart') RNALchart;

	// table one
	defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;

	tableHeight = 450;

	//5.2 小RNA分类
	chartSelectType: any = [];
	curSearchType: string;
	tableUrl: string;
	tableEntity: object;
	chart: any;

	//小RNA长度分布
	tableRNAUrl: string;
	chartUrl: string;
	tableRNAEntity: object;
	chartRNA: any;
	selectPanelData: object[] = [];
	selectConfirmData: string[] = [];

	//图例颜色
	isShowColorPanel: boolean = false;
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color

	//图例颜色
	isShowColorPanelL: boolean = false;
	legendIndexL: number = 0; //当前点击图例的索引
	colorL: string; //当前选中的color

	constructor(
		private message: MessageService,
		private store: StoreService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		private promptService: PromptService,
		private router: Router
	) {}

	ngOnInit() {
		//5.1 小RNA数量
		this.defaultUrl = `${config['javaPath']}/basicModule/smallRNAStat`;
		this.defaultEntity = {
			LCID: this.store.getStore('LCID'),
			pageNum: 1,
			pageSize: 10
		};

		//5.2 小RNA分类
		let sample = [];
		this.store.getStore('sample').forEach((d) => {
			let temp = {
				key: d,
				value: d
			};
			sample.push(temp);
		});
		this.chartSelectType = sample;
		this.curSearchType = sample[0].value;

		this.tableUrl = `${config['javaPath']}/basicModule/smallRNAClass`;
		this.tableEntity = {
			LCID: this.store.getStore('LCID'),
			sample: this.curSearchType
		};

		//5.3 小RNA长度
		this.selectPanelData = [
			{
				type: '',
				data: this.store.getStore('sample')
			}
		];

		this.tableRNAUrl = `${config['javaPath']}/basicModule/smallRNALengthDistribution`;
		this.tableRNAEntity = {
			LCID: this.store.getStore('LCID'),
			smallRNASampleList: this.store.getStore('sample')
		};
	}

	//小RNA分类
	drawRNAReads(data) {
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		for (var j = 0; j < rows.length; j++) {
			if (rows[j].smallrna_class != 'total') {
				chartData.push({
					name: rows[j].smallrna_class,
					value: rows[j].smallrna_count
				});
			}
		}

		let that = this;

		let config: object = {
			chart: {
				title: 'Count number distribution of total Small RNAs in YK',
				dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
					  this.setChartTitle(name);
					  this.updateTitle();
					}
				},
				width: 600,
				height: 400,
				padding: 0,
				outerRadius: 120,
				startAngle: 0,
				endAngle: 360,
				showLabel: false,
				custom: [ 'name', 'value' ],
				el: '#RNADataID',
				type: 'pie',
				data: chartData
			},
			legend: {
				show: true,
				position: 'right',
				click: function(d, index) {
					that.color = d3.select(d).attr('fill');
					that.legendIndex = index;
					that.isShowColorPanel = true;
				}
			},
			tooltip: function(d) {
				return '<span>name：' + d.data.name + '</span><br><span>value：' + d.data.value + '</span>';
			}
		};

		this.chart = new d4().init(config);
	}

	//5.3 小RNA长度
	drawRNALengthReads(data) {
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		for (var i = 0; i < baseThead.length; i++) {
			for (var j = 0; j < rows.length; j++) {
				if (baseThead[i].name != 'length') {
					chartData.push({
						key: rows[j].length,
						value: rows[j][baseThead[i].true_key],
						category: baseThead[i].name
					});
				}
			}
		}

		let that = this;

		let config: object = {
			chart: {
				// title: "小RNA长度分布",
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#RNALData',
				type: 'groupBar',
				width: 900,
				custom: [ 'key', 'value', 'category' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Length (nt)',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					},
					rotate: 60
				},
				y: {
					title: 'Length distribution of small RNA in 8 libraries',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
					}
					// formatter:val=>val+"%"
				}
			},
			legend: {
				show: true,
				position: 'right',
				click: function(d, index) {
					that.colorL = d3.select(d).attr('fill');
					that.legendIndexL = index;
					that.isShowColorPanelL = true;
				}
			},
			tooltip: function(d) {
				return (
					'<span>key：' +
					d.key +
					'</span><br><span>value：' +
					d.value +
					'</span><br><span>category：' +
					d.category +
					'</span>'
				);
			}
		};

		this.chartRNA = new d4().init(config);
	}

	searchTypeChange() {
		this.tableEntity['sample'] = this.curSearchType;
		this.smallRNAChart.reGetData();
	}

	//legend color change
	colorChange(curColor) {
		this.chart.setColor(curColor, this.legendIndex);
		this.chart.redraw();
	}

	colorLChange(curColor) {
		this.chartRNA.setColor(curColor, this.legendIndexL);
		this.chartRNA.redraw();
	}

	//选择面板 确定筛选的数据
	selectConfirm(data) {
		this.selectConfirmData = data;
		this.tableRNAEntity['smallRNASampleList'] = this.selectConfirmData;
		this.RNALchart.reGetData();
	}

	//选择面板，默认选中数据
	defaultSelectList(data) {
		this.selectConfirmData = data;
	}

	handlerRefresh() {}
}
