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

@Component({
	selector: 'app-overview',
	templateUrl: './overview.component.html',
	styles: []
})
export class OverviewComponent implements OnInit {
	@ViewChild('relevanceChart') relevanceChart;
	@ViewChild('PCAChart') PCAChart;
	@ViewChild('Boxplot') Boxplot;
	@ViewChild('DensityMap') DensityMap;
	@ViewChild('stackMap') stackMap;

	abstract_general_cn: string;
	abstract_general_en: string;

	// table one
	defaultUrl: string;
	defaultUrlTwo: string;
	defaultUrlThree: string;

	//相关性热图
	tableUrl: string;
	chartUrl: string;
	tableEntity: object;
	chart: any;
	selectPanelData: object[] = [];
	selectConfirmData: string[] = [];

	EntityOne: object;
	EntityTwo: object;
	EntityThree: object;

	//主成分分析
	PCASelectType: any = [];
	PCASearchType: string;
	tablePCAUrl: string;
	tablePCAEntity: object;
	chartPCA: any;

	//箱线图
	tableBoxUrl: string;
	chartBoxUrl: string;
	tableBoxEntity: object;
	chartBox: any;

	//密度图
	chartMapUrl: string;
	tableMapEntity: object;
	chartMap: any;

	//堆积图
	stackMapUrl: string;
	stackChartUrl: string;
	stackMapEntity: object;
	chartStack: any;

	//图例颜色
	isShowColorPanel: boolean = false;
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color

	colorArr:string []=[];

	isShowQualityColorPanel: boolean = false;
	legendIndexThree: number = 0; //当前点击图例的索引
	colorQuality: string; //当前选中的color

	isBoxShowColorPanel:boolean = false;
	legendIndexBox:number = 0;
	colorBox:string;

	isMapShowColorPanel:boolean = false;
	legendIndexMap:number = 0;
	colorMap:string;

	isShowColorPanelT: boolean = false;
	legendIndexT: number = 0; //当前点击图例的索引
	colorT: string; //当前选中的color

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
	itemFlag4: boolean = false;
	itemNum4: number = 0;

	itemFlag2_1: boolean = false;
	itemNum2_1: number = 0;
	itemFlag2_2: boolean = false;
	itemNum2_2: number = 0;
	itemFlag2_3: boolean = false;
	itemNum2_3: number = 0;

	itemFlag3_1: boolean = false;
	itemNum3_1: number = 0;
	itemFlag3_2: boolean = false;
	itemNum3_2: number = 0;

	itemFlag4_1: boolean = false;
	itemNum4_1: number = 0;
	itemFlag4_2: boolean = false;
	itemNum4_2: number = 0;
	itemFlag4_3: boolean = false;
	itemNum4_3: number = 0;

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

		this.abstract_general_cn = this.store.getStore('abstract_general_cn');
		this.abstract_general_en = this.store.getStore('abstract_general_en');

		//样品分组设置
		this.defaultUrl = `${config['javaPath']}/basicModule/groupPlan`;
		this.EntityOne = {
			LCID: this.store.getStore('LCID')
		}

		//差异分组设置
		this.defaultUrlTwo = `${config['javaPath']}/basicModule/diffExpPlan`;
		this.EntityTwo = {
			LCID: this.store.getStore('LCID')
		}

		//
		this.defaultUrlThree = `${config['javaPath']}/basicModule/timeCoursePlan`;
		this.EntityThree = {
			LCID: this.store.getStore('LCID')
		}

		//this.colorArr = this.store.colors;//
		//this.colorArr = ["#1f77b4", "#ff7f0e", "#aec7e8"];
		this.colorArr = ["#07519c", "#deecf8"];

		//相关性热图
		this.selectPanelData = [
			{
				type: '',
				data: this.store.getStore('sample')
			}
		];

		this.chartUrl = `${config['javaPath']}/basicModule/correlationHeatmapGraph`;
		this.tableUrl = `${config['javaPath']}/basicModule/correlationHeatmap`;
		this.tableEntity = {
			LCID: this.store.getStore('LCID'),
			correlationSampleList: this.store.getStore('sample')
		};

		//PCA
		let pca_info = [];
		this.store.getStore('pca_info').forEach((d) => {
			let temp = {
				key: d,
				value: d
			};
			pca_info.push(temp);
		});
		this.PCASelectType = pca_info;
		if(pca_info.length != 0){
			this.PCASearchType = pca_info[0].value;
		}else{
			this.PCASearchType = "";
		}


		this.tablePCAUrl = `${config['javaPath']}/basicModule/PCA`;
		this.tablePCAEntity = {
			LCID: this.store.getStore('LCID'),
			pca_info: this.PCASearchType
		};

		//箱线图
		this.tableBoxUrl = `${config['javaPath']}/basicModule/boxTable`;
		this.chartBoxUrl = `${config['javaPath']}/basicModule/box`;
		this.tableBoxEntity = {
			LCID: this.store.getStore('LCID')
		};

		//密度图
		this.chartMapUrl = `${config['javaPath']}/basicModule/density`;
		this.tableMapEntity = {
			LCID: this.store.getStore('LCID')
		};

		//堆积图
		this.stackMapUrl = `${config['javaPath']}/basicModule/geneExpression`;
		this.stackMapEntity = {
			LCID: this.store.getStore('LCID')
		};
	}

	//相关性热图
	drawRelevanceReads(data) {
		document.getElementById('relevanceData').innerHTML = '';

		var that = this;

		let colorArray = ["#1f77b4", "#ff7f0e", "#aec7e8"];

		//数据
		var chartData = data.chartData,
			samples = data.sampleList,
			sampleLen = samples.length;

		var rowRectNum = Math.sqrt(chartData.length);

		//样本名最长
		var max_sampleLength = d3.max(samples, function(d) {
			return d.length;
		});

		//value min
		var valuemin = d3.min(chartData, function(d) {
			return d.value;
		})
		var minValue = 0;
		if (chartData.length != 1) {
			minValue = parseInt(valuemin);
		}

		//容器宽高
		var bodyWidth = 0,
			bodyHeight = 0;
		var eachRect_w = 0,
			eachRect_h = 0;

		if (sampleLen <= 6) {
			bodyWidth = 400;
			bodyHeight = 400;
			eachRect_w = bodyWidth / rowRectNum;
			eachRect_h = bodyHeight / rowRectNum;
		} else {
			eachRect_w = 40;
			eachRect_h = 40;
			bodyWidth = eachRect_w * rowRectNum;
			bodyHeight = eachRect_h * rowRectNum;
		}

		var margin = {
			top: 40,
			left: max_sampleLength * 8 + 20,
			bottom: max_sampleLength * 8 + 20,
			right: 90
		};
		if (sampleLen <= 2) {
			margin.bottom = 40;
		}
		var space = 24,
			width = bodyWidth + margin.left + margin.right + space,
			height = bodyHeight + margin.top + margin.bottom;

		var legend_width = 20,
			legend_height = 180;

		var colorScale = null;

		let t_chartID = document.getElementById('relevanceData');
		let str = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
		</svg>`
		t_chartID.innerHTML = str;

		var svg = d3.select("#svg")
        .attr("width", width)
		.attr("height", height)
		.attr('transform', 'translate(' + 0 + ',' + 30 + ')');

		// 比例尺
		var xScale = d3.scalePoint()
			.rangeRound([0, bodyWidth])
			.padding(0.5);

		xScale.domain(samples.map(function(d) { return d; }));
		var xAxis = d3.axisBottom(xScale);

		var yScale = d3.scalePoint()
			.rangeRound([bodyHeight, 0])
			.padding(0.5);

		yScale.domain(samples.map(function(d) { return d; }));
		var yAxis = d3.axisLeft(yScale);

		var yValueScale = d3.scaleOrdinal().domain(d3.range(rowRectNum)).range(d3.range(rowRectNum).reverse());

		var legendScale = d3.scaleLinear().domain([minValue, 1]).range([legend_height, 0]);

		var legendAxis = d3.axisRight(legendScale).ticks(2).tickFormat(d3.format(".2f"));

		// 画标题
		svg.append("g")
			.attr("transform", "translate(" + (bodyWidth / 2 + margin.left) + "," + margin.top / 2 + ")")
			.append("text")
			.attr("font-size", "18px")
			.attr("text-anchor", "middle")
			.text("相关性热图")
			.style("cursor", "pointer")
			.on("dblclick", function() {
				// var textNode = d3.select(this).node();
				// toolService.popPrompt(textNode);
				var textNode = d3.select(this).node();
				that.promptService.open(textNode.innerHTML,(data)=>{
					textNode.textContent = data;
				});
			})
			.on("mouseover", function() {
				d3.select(this).attr("fill", "#5378f8");
				//d3.select(this).append("title").text("双击修改");
			})
			.on("mouseout", function() {
				d3.select(this).attr("fill", "#000");
				//d3.select(this).select("title").remove();
			});

		//画轴
		svg.append("g")
			.attr("class", "xAxis_sampleCorrelate")
			.attr("transform", "translate(" + margin.left + "," + (margin.top + bodyHeight) + ")")
			.call(xAxis)
			.select(".domain")
			.attr("stroke", "none");

		d3.selectAll(".xAxis_sampleCorrelate .tick text")
			.style("font-size", "12px")
			.style("font-family", "Consolas, Monaco, monospace")
			.style("text-anchor", function() {
				if (sampleLen <= 2) {
					return "middle";
				} else {
					return "end";
				}
			})
			// .attr("dx", function() {
            //     return "-0.8em"
            // })
            // .attr("dy", function() {
            //         return "0.5em"
            // })
			.attr("transform", function() {
				if (sampleLen <= 2) {
					return "";
				} else {
					return "rotate(-60)";
				}
			})
			.attr("dx","-6")
			.attr("dy","0");

		svg.append("g")
			.attr("class", "yAxis_sampleCorrelate")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.call(yAxis)
			.select(".domain")
			.attr("stroke", "none");

		d3.selectAll(".yAxis_sampleCorrelate .tick text")
			.style("font-size", "12px")
			.style("font-family", "Consolas, Monaco, monospace");

		//主容器
		var body_g = svg.append("g")
			.attr("class", "allRects")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		drawRect(that.colorArr);

		//画rect
		function drawRect(colors) {
			d3.selectAll(".sampleCorrelate_g").remove();

			colorScale = d3.scaleLinear().domain([1, minValue]).range(colors).interpolate(d3.interpolateRgb);

			var sampleCorrelate_g = body_g.selectAll(".sampleCorrelate_g")
				.data(chartData)
				.enter()
				.append("g")
				.attr("class", "sampleCorrelate_g")
				.attr("transform", function(d) {
					return "translate(" + d.x * eachRect_w + "," + yValueScale(d.y) * eachRect_h + ")"
				})
				.on("mouseover", function(d) {
					//var tipText = ["样本1： " + d.sample1, "样本2： " + d.sample2, "相关系数：" + d.value];
					var tipText = "<span>Sample1："+d.sample1+"</span><br><span>Sample2："+d.sample2+"</span><br><span>Pearson Value："+d.value+"</span>";
					//reportService.GenericTip.Show(d3.event, tipText);
					that.globalService.showPopOver(d3.event, tipText);
				})
				.on("mouseout", function() {
					//reportService.GenericTip.Hide();
					that.globalService.hidePopOver();
				})

			//rect
			sampleCorrelate_g.append("rect")
				.attr("width", eachRect_w)
				.attr("height", eachRect_h)
				.attr("stroke", "#cccccc")
				.attr("stroke-width", 0.5)
				.attr("fill", function(d) {
					return colorScale(d.value);
				})

			//text
			//if (is_showValue) {
				sampleCorrelate_g.append("text")
					.attr("text-anchor", "middle")
					.attr("dominant-baseline", "middle")
					.style("font-family", "Consolas, Monaco, monospace")
					.attr("x", eachRect_w / 2)
					.attr("y", eachRect_h / 2)
					.style("font-size", "12px")
					.text(function(d) {
						if (d.value === 1) {
							return d.value;
						} else {
							return d.value.toFixed(3);
						}
					})
			//}

		}

		//画图例
		var legend_g = svg.append("g")
			.attr("class", "sampleCorrelate_legend")
			.attr("transform", "translate(" + (margin.left + bodyWidth + space) + "," + (margin.top + 20) + ")");

		legend_g.append("text")
			.attr("y", "-1em")
			.text("Pearson value")
			.style("font-size", "12px")
		drawLegend(that.colorArr);

		//画图例
		function drawLegend(colors) {
			d3.selectAll(".sampleCorrelate_legend defs").remove();
			d3.selectAll(".sampleCorrelate_legend rect.legend_rect").remove();
			//线性填充
			var linearGradient = legend_g.append("defs")
				.append("linearGradient")
				.attr("id", "sampleCorrelate_Color")
				.attr("x1", "0%")
				.attr("y1", "0%")
				.attr("x2", "0%")
				.attr("y2", "100%");

			for (var i = 0; i < colors.length; i++) {
				linearGradient.append("stop")
					.attr("offset", i * 50 + "%")
					.style("stop-color", colors[i]);
			}

			//画图例矩形
			legend_g.append("rect").attr("width", legend_width).attr("height", legend_height).attr("class", "legend_rect")
				.attr("fill", "url(#" + linearGradient.attr("id") + ")");

		}

		//点击图例改图颜色
		var legendClickRect_h = legend_height / that.colorArr.length;
		var legendClick_g = svg.append("g").attr("transform", "translate(" + (bodyWidth + margin.left + space) + "," + (margin.top + 20) + ")")
			.style("cursor", "pointer")
			.on("mouseover", function() {
				d3.select(this).append("title").text("单击修改颜色");
			})
			.on("mouseout", function() {
				d3.select(this).select("title").remove();
			});
		legendClick_g.selectAll(".legendClick_Rect")
			.data(that.colorArr)
			.enter()
			.append("rect")
			.attr("width", legend_width)
			.attr("height", legendClickRect_h)
			.attr("y", function(d, i) {
				return i * legendClickRect_h;
			})
			.attr("fill", "transparent")
			.on("click", function(d, i) {
				// var oEvent = d3.event || event;
				// oEvent.stopPropagation();

				// $scope.colorArr_i = i;
				// $scope.isShowColorPanel = true;
				// $scope.$apply();
				that.clearEventBubble(d3.event);
				that.colorQuality = colorScale(d);
				that.isShowQualityColorPanel = true;
				that.legendIndexThree = i;
			});

		//色盘指令回调函数
		// this.colorQualityChange = function(curColor) {
		// 	this.colorArr.splice(this.colorArr_i, 1, curColor);
		// 	drawLegend(this.colorArr);
		// 	drawRect(this.colorArr);
		// }

		//画图例轴
		legend_g.append("g")
			.attr("transform", "translate(" + legend_width + ",0)")
			.call(legendAxis);

		d3.selectAll(".sampleCorrelate_legend .tick text")
			.attr("font-size", "12px");


	}

	drawPCAReads(data) {
		let lengendtitle = [];
		data.rows.forEach((d) => {
			lengendtitle.push(d.sample_name);
		});

		let that = this;
		let config: object = {
			chart: {
				title: '主成分分析',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
                width: 660,
				el: '#PCADataID',
				type: 'scatter',
				radius: 3, // custom radius
				hoverRadius: 6, // custom hover radius
				custom: [ 'pca_comp1', 'pca_comp2', 'sample_name' ], // x y category
				data: data.rows
			},
			axis: {
				x: {
					title: 'PC1',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
				},
				y: {
					title: 'PC2',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					}
				}
			},
			legend: {
				show: true,
				position: 'right',
				click: function(d, index) {
					that.color = d3.select(d).attr('fill');
					that.legendIndex = index;
					that.isShowColorPanel = true;
				},
				data: lengendtitle
			},
			tooltip: function(d) {
				return (
					'<span>Sample：' +
					d.sample_name +
					'</span><br><span>PC1：' +
					d.pca_comp1 +
					'</span><br><span>PC2：' +
					d.pca_comp2 +
					'</span>'
				);
			}
		};

		this.chartPCA = new gooalD3().init(config);
	}

	//箱线图
	drawBoxReads(data) {
		var tempBoxData = data['data'];

		var dataLength = tempBoxData.length;
		var xData = [],
		yData = [],
		lineData = [];

		for (var i = 0; i < dataLength; i++) {

			tempBoxData[i].boxData = tempBoxData[i].boxData[0];

			xData.push(tempBoxData[i].name);
			var spotLength = tempBoxData[i].spotData.length;

			for (var j = 0; j < spotLength; j++) {
				yData.push(tempBoxData[i].spotData[j].y);
			}

			if (spotLength !== 0) {
                lineData.push({
                    x: tempBoxData[i].name,
                    y: tempBoxData[i].spotData[spotLength - 1].y
                });
            }
		}
		let tempWidth = 0;
		if(xData.length<=12){
			tempWidth = 660;
		}else if(xData.length>12 && xData.length <= 19){
			tempWidth = 800;
		}else if(xData.length>19 && xData.length <= 38){
			tempWidth = 960;
		}else if(xData.length>38 && xData.length <= 57){
			tempWidth = 1100;
		}else if(xData.length>57 && xData.length <= 65){
			tempWidth = 1240;
		}else{
			tempWidth = 1380;
		}

		let that = this;
		let config: object = {
			chart: {
				title: "表达量箱线图",
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				mouseover: function(event, titleObj) {
				  titleObj
					.attr("fill", "blue")
					.append("title")
					.text("custom");
				},
				mouseout: function(event, titleObj) {
				  titleObj.attr("fill", "#333");
				  titleObj.select("title").remove();
				},
				el: "#BoxDataID",
				type: "boxplot",
				width: tempWidth,
				onselect: data => {
					// console.log(data);
				},
				// style: {
				//   fill: "#ffffff",
				//   stroke: "#000000"
				// },
				scatter: {
				  show: true,
				  style: {
					// fill: "#000",
					// stroke: "#000",
					// "stroke-width": 1,
					// radius: 4
				  }
				},
				line: {
				  show: true,
				  smooth: true,
				  point: true,
				  style: {
					stroke: "red",
					"stroke-width": 2
				  },
				  //data: lineData,
				  data: [],
				  tooltip: function(d) {
					return "<span>Sample：d.x</span><br><span>log10(FPKM+1)：d.y</span>";
				  }
				},
				data: tempBoxData
			  },
			  axis: {
				x: {
				  title: "",
				  rotate: 60,
				  data:xData,
				  dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setXTitle(val);
						this.updateTitle();
					})
				  }
				},
				y: {
				  title: "log10(FPKM+1)",
				  min: 0,
				  data:yData,
				  dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setYTitle(val);
						this.updateTitle();
					})
				  }
				}
			  },
			  legend: {
				show: true,
				data:xData,
				position: "right",
				click: function(d, index) {
					that.colorBox = d3.select(d).attr('fill');
					that.legendIndexBox = index;
					that.isBoxShowColorPanel = true;
				},
			  }
		}

		this.chartBox = new gooalD3().init(config);
	}

	//密度图
	drawMapReads(data){
		let tempData = data.data;
		let targetData = [];
		for(var i = 0;i < tempData.length;i++){
			let temp_name = tempData[i].name;
			for(var j = 0;j <tempData[i].areaData.length;j++){
				var tempObj = {
					x:tempData[i].areaData[j].x,
					y:tempData[i].areaData[j].y,
					name:temp_name
				}
				targetData.push(tempObj)
			}
        }

		let that = this;
		let config: object = {
			chart: {
				title: "表达量密度图",
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				custom: ["x", "y","name"],
				el: "#MapDataID", // area chart type
				type: "area",
				width:660,
				data: targetData,
				radius:0
			},
			axis: {
				x: {
					title: "log10(FPKM+1)",
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
				},
				y: {
					title: "density",
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					}
				}
			},
			legend: {
				show: true,
				position: "right",
				click: function(d,index) {
					//console.log(el);
					that.colorMap = d3.select(d).attr('fill');
					that.legendIndexMap = index;
					that.isMapShowColorPanel = true;
				}
			},
			tooltip: function(d) {
				return (
					"<span>log10(FPKM+1)：" + d.x + "</span><br><span>Density Value：" + d.y +"</span><br><span>Sample："+ d.name +"</span>"
				);
			}
		}

		this.chartMap = new gooalD3().init(config)
	}

	//堆积图
	drawStackMap(data){

		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		var sample =  this.store.getStore('sample');

		console.log(data)
		for (var i = 0; i < sample.length; i++) {
			var row = {'sample': sample[i], 'total': 0}
			for (var j = 0; j < rows.length; j++) {
				row[rows[j].range] = rows[j]['exp_' + sample[i]]
			}
			for (var j = 0; j < rows.length; j++) {
				row['total'] += rows[j]['exp_' + sample[i]]
			}
			chartData.push(row);
		}

		// let chartData2 = [];

		// for(var j = 0; j < chartData.length; j++) {
		// 	let tempC = {
		// 		"sample":chartData[j]["sample"],
		// 		"total":chartData[j]["total"],
		// 		"FPKM <=1":chartData[j]["FPKM <=1"],
		// 		"FPKM 1-10":chartData[j]["FPKM 1-10"],
		// 		"FPKM >=10":chartData[j]["FPKM >=10"]
		// 	}
		// 	chartData2.push(tempC);
		// }

		console.log(chartData)
		let that = this;

		let config: object = {
			chart: {
				title: '表达量堆积图',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#stackMapData',
				type: 'stackBar',
				width: 800,
				custom: [ 'sample', 'total','FPKM 1-10','FPKM <=1','FPKM >=10'],
				colors:['#0768AC','#2B8CBE','#4EB3D3'],
				data: chartData
			},
			axis: {
				x: {
					title: 'Sample',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					},
					rotate: 60
				},
				y: {
					title: 'GeneNumber',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
					}
				}
			},
			legend: {
				show: true,
				position: 'right',
				isReverse:true,
				click: function(d, index) {
					that.colorT = d3.select(d).attr('fill');
					that.legendIndexT = index;
					that.isShowColorPanelT = true;
				}
			},
			tooltip: function(d) {
				//console.log(d)
				return '<span>Range：' + d.key + '</span><br><span>Gene Number：' + d.data[d.key] + '</span><br><span>Sample：'+ d.data["sample"]+'</span>';
			}
		};

		this.chartStack = new gooalD3().init(config);
	}
	//选择面板 确定筛选的数据
	selectConfirm(data) {
		//console.log(data)
		this.selectConfirmData = data;
		this.tableEntity['correlationSampleList'] = this.selectConfirmData;
		this.relevanceChart.reGetData();
	}



	//选择面板，默认选中数据
	defaultSelectList(data) {
		//console.log(data)
		this.selectConfirmData = data;
	}

	handlerRefresh() {}

	searchPCATypeChange() {
		this.tablePCAEntity['pca_info'] = this.PCASearchType;
		this.PCAChart.reGetData();
	}

	//legend color change
	colorChange(curColor) {
		this.chartPCA.setColor(curColor, this.legendIndex);
		this.chartPCA.redraw();
	}

	//legend color change
	colorQualityChange(curColor){
		// console.log(this.legendIndexThree);
		this.colorQuality = curColor;
		this.colorArr.splice(this.legendIndexThree, 1, curColor);
		// console.log(curColor);
		// console.log(this.colorArr);
		this.relevanceChart.redraw();
	}

	//legend color change
	colorBoxChange(curColor){
		this.chartBox.setColor(curColor, this.legendIndexBox);
		this.chartBox.redraw();
	}

	//legend color change
	colorMapChange(curColor){
		this.chartMap.setColor(curColor, this.legendIndexMap,'aColors');
		this.chartMap.redraw();
	}

	colorTChange(curColor) {
		this.chartStack.setColor(curColor, this.legendIndexT);
		this.chartStack.redraw();
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

	GeneListIndex(){
		let mindex = 1;
		let mindex2 = 1;
		let mindex3 = 1;
		this.store.getStore('basicMenu').forEach((d) => {
			if(d.indexOf("001")==0 && d.length != 3){
				if(d.length == 6){
					this.tempMenu2.push({
						name:d,
						index:mindex
                    });
                    mindex++;
				}else{
					this.tempMenu3.push({
						name:d,
						father:d.substr(0,6)
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
			if(d["name"]=="001"){
				this.tempIndex =  d["index"];
			}
		})

		this.tempMenu2.forEach((d)=>{
			switch (d["name"]) {
				case "001001":
					this.itemFlag = true;
					this.itemNum = d["index"];
					break;
				case "001002":
					this.itemFlag2 = true;
					this.itemNum2 = d["index"];
					break;
				case "001003":
					this.itemFlag3 = true;
					this.itemNum3 = d["index"];
					break;
				case "001004":
					this.itemFlag4 = true;
					this.itemNum4 = d["index"];
					break;
				default:
					break;
			}
		})

		var map = {},
			dest = [];
		for(var i = 0; i < this.tempMenu3.length; i++){
			var ai = this.tempMenu3[i];
			if(!map[ai.father]){
				dest.push({
					father: ai.father,
					data: [ai]
				});
				map[ai.father] = ai;
			}else{
				for(var j = 0; j < dest.length; j++){
					var dj = dest[j];
					if(dj.father == ai.father){
						dj.data.push(ai);
						break;
					}
				}
			}
		}

		let tempArray = [];
		for (let index = 0; index < dest.length; index++) {
			let element = dest[index].data;
			for (let index2 = 0; index2 < element.length; index2++) {
				let element2 = element[index2];
				tempArray.push({
					name: element2["name"],
					index: index2+1
				})
			}
		}

		this.tempMenu3.length = 0;
		this.tempMenu3 = tempArray;
		// console.log(this.tempMenu3);

		this.tempMenu3.forEach((d)=>{
			switch (d["name"]) {
				case "001002001":
					this.itemFlag2_1 = true;
					this.itemNum2_1 = d["index"];
					break;
				case "001002002":
					this.itemFlag2_2 = true;
					this.itemNum2_2 = d["index"];
					break;
				case "001002003":
					this.itemFlag2_3 = true;
					this.itemNum2_3 = d["index"];
					break;
				case "001003001":
					this.itemFlag3_1 = true;
					this.itemNum3_1 = d["index"];
					break;
				case "001003002":
					this.itemFlag3_2 = true;
					this.itemNum3_2 = d["index"];
					break;
				case "001004001":
					this.itemFlag4_1 = true;
					this.itemNum4_1 = d["index"];
					break;
				case "001004002":
					this.itemFlag4_2 = true;
					this.itemNum4_2 = d["index"];
					break;
				case "001004003":
					this.itemFlag4_3 = true;
					this.itemNum4_3 = d["index"];
					break;
				default:
					break;
			}
		})

	}
}
