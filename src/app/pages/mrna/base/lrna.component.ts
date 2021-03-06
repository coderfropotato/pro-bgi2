import { StoreService } from '../../../super/service/storeService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../../config';
import { PromptService } from '../../../super/service/promptService';
import { MessageService } from '../../../super/service/messageService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

declare const d3: any;
declare const gooalD3: any;
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

	tempIndex: number = 0;
	tempMenu: any[] = [];
	tempMenu2: any[] = [];
	tempMenu3: any[] = [];

	itemFlag: boolean = false;
	itemNum: number = 0;
	itemFlag2: boolean = false;
	itemNum2: number = 0;
	itemFlag3: boolean = false;
	itemNum3: number = 0;

	ReadsTitle: string = '';

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

		this.GeneListIndex();

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

		this.ReadsTitle = "Count number distribution of total Small RNAs in " + this.curSearchType;

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
				title: that.ReadsTitle,
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				width: 750,
				height: 400,
				padding: 0,
				outerRadius: 120,
				startAngle: 0,
				endAngle: 360,
				showLabel: true,
				custom: [ 'name', 'value' ],
				el: '#RNADataID',
				type: 'pie',
				data: chartData,
                mouseover: function (event,node) {
                    node.attr("fill", "#5378f8");
                    node.append("title").text("双击修改");
                },
                mouseout: function (event,node) {
                    node.attr("fill", "#000");
                    node.select("title").remove();
                },
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

		this.chart = new gooalD3().init(config);
	}

	//5.3 小RNA长度
	drawRNALengthReads(data) {
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		for (var i = 0; i < baseThead.length; i++) {
			for (var j = 0; j < rows.length; j++) {
				if (baseThead[i].true_key != 'length') {
					chartData.push({
						key: rows[j].length,
						value: rows[j][baseThead[i].true_key],
						category: baseThead[i].name
					});
				}
			}
		}
		let that = this;

		// console.log(that.selectConfirmData)
		let xData = that.selectConfirmData;

		// console.log(chartData)
		let tempWidth = 0;

		tempWidth = chartData.length *8;

		let config: object = {
			chart: {
				// title: "小RNA长度分布",
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#RNALData',
				type: 'groupBar',
				width: tempWidth,
				custom: [ 'key', 'value', 'category' ],
				data: chartData,
                mouseover: function (event,node) {
                    node.attr("fill", "#5378f8");
                    node.append("title").text("双击修改");
                },
                mouseout: function (event,node) {
                    node.attr("fill", "#000");
                    node.select("title").remove();
                },
			},
			axis: {
				x: {
					title: 'Length (nt)',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					},
					rotate: 60,
                    mouseover: function (event,node) {
                        node.attr("fill", "#5378f8");
                        node.append("title").text("双击修改");
                    },
                    mouseout: function (event,node) {
                        node.attr("fill", "#000");
                        node.select("title").remove();
                    },
				},
				y: {
					title: 'Length distribution of small RNA in 8 libraries',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					},
                    mouseover: function (event,node) {
                        node.attr("fill", "#5378f8");
                        node.append("title").text("双击修改");
                    },
                    mouseout: function (event,node) {
                        node.attr("fill", "#000");
                        node.select("title").remove();
                    },
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

		this.chartRNA = new gooalD3().init(config);
	}

	searchTypeChange() {
		this.tableEntity['sample'] = this.curSearchType;
		this.ReadsTitle = "Count number distribution of total Small RNAs in" + this.curSearchType;
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

	GeneListIndex(){
		let mindex = 1;
		let mindex2 = 1;
		let mindex3 = 1;
		this.store.getStore('basicMenu').forEach((d) => {
			if(d.indexOf("005")==0 && d.length != 3){
				if(d.length == 6){
					this.tempMenu2.push({
						name:d,
						index:mindex
					});
					mindex++;
				}else{
					this.tempMenu3.push({
							name:d,
							index:d.substr(d.length-1,1)
					});
				}

			}
			if(d.length == 3){
				this.tempMenu.push({
						name:d,
						index:mindex2
				});
				mindex2++;
			}
		});

		// console.log(this.tempMenu);
		// console.log(this.tempMenu2);
		// console.log(this.tempMenu3);

		this.tempMenu.forEach((d)=>{
			if(d["name"]=="005"){
				this.tempIndex =  d["index"];
			}
		})

		this.tempMenu2.forEach((d)=>{
			switch (d["name"]) {
				case "005001":
					this.itemFlag = true;
					this.itemNum = d["index"];
					break;
				case "005002":
					this.itemFlag2 = true;
					this.itemNum2 = d["index"];
					break;
				case "005003":
					this.itemFlag3 = true;
					this.itemNum3 = d["index"];
					break;
				default:
					break;
			}
		})
	}
}
