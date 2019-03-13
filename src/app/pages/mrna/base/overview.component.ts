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

	abstract_general: string;

	// table one
	defaultUrl: string;
	defaultUrlTwo: string;

	//相关性热图
	tableUrl: string;
	chartUrl: string;
	tableEntity: object;
	chart: any;
	selectPanelData: object[] = [];
	selectConfirmData: string[] = [];

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

		this.abstract_general = this.store.getStore('abstract_general');

		//样品分组设置
		this.defaultUrl = `${config['javaPath']}/basicModule/groupPlan`;

		//差异分组设置
		this.defaultUrlTwo = `${config['javaPath']}/basicModule/diffExpPlan`;

		this.colorArr = this.store.colors;

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
			bottom: max_sampleLength * 4 + 20,
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
        .attr("height", height);

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
					return "start";
				}
			})
			.attr("transform", function() {
				if (sampleLen <= 2) {
					return "";
				} else {
					return "rotate(25)";
				}
			});

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
					var tipText = "<span>样本1："+d.sample1+"</span><br><span>样本2："+d.sample2+"</span><br><span>样本2："+d.value+"</span>";
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
		this.colorQualityChange = function(curColor) {
			this.colorArr.splice(this.colorArr_i, 1, curColor);
			drawLegend(this.colorArr);
			drawRect(this.colorArr);
		}

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
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
					  this.setChartTitle(name);
					  this.updateTitle();
					}
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
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
				},
				y: {
					title: 'PC2',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
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
					'</span><br><span>pca_comp1：' +
					d.pca_comp1 +
					'</span><br><span>pca_comp2：' +
					d.pca_comp2 +
					'</span>'
				);
			}
		};

		this.chartPCA = new d4().init(config);
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

			lineData.push({
				x: tempBoxData[i].name,
				y: tempBoxData[i].spotData[spotLength - 1].y
			});
		}

		let that = this;
		let config: object = {
			chart: {
				title: "表达量箱线图",
				dblclick: function(event) {
				  var name = prompt("请输入需要修改的标题", "");
				  if (name) {
					this.setChartTitle(name);
					this.updateTitle();
				  }
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
				width: 660,
				onselect: data => {
					console.log(data);
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
				  data: lineData,
				  tooltip: function(d) {
					return "<span>x轴：d.x</span><br><span>y轴：d.y</span>";
				  }
				},
				data: tempBoxData
			  },
			  axis: {
				x: {
				  title: "",
				  rotate: 30,
				  data:xData,
				  dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
					  this.setXTitle(name);
					  this.updateTitle();
					}
				  }
				},
				y: {
				  title: "log10(FPKM+1)",
				  min: 0,
				  data:yData,
				  dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
					  this.setYTitle(name);
					  this.updateTitle();
					}
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
			  },
			//   tooltip: function(d) {
			// 	return "<span>样本："+d.x+"</span><br><span>y："+d.y+"</span>";
			//   }
		}

		this.chartBox = new d4().init(config);
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
					var name = prompt("请输入需要修改的标题", "");
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				custom: ["x", "y","name"],
				el: "#MapDataID", // area chart type
				type: "area",
				width:660,
				data: targetData
			},
			axis: {
				x: {
					title: "log10(FPKM+1)",
					dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
				},
				y: {
					title: "density",
					dblclick: function(event) {
					var name = prompt("请输入需要修改的标题", "");
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
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
					"<span>x：" + d.x + "</span><br><span>y：" + d.y +"</span><br><span>name："+ d.name +"</span>"
				);
			}
		}

		this.chartMap = new d4().init(config)
	}

	//堆积图
	drawStackMap(data){

		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		var sample =  this.store.getStore('sample');

		for (var i = 0; i < sample.length; i++) {
			var row = {'sample': sample[i], 'total': 0}
			for (var j = 0; j < rows.length; j++) {
				row[rows[j].range] = rows[j]['fpkm_' + sample[i]]
			}
			for (var j = 0; j < rows.length; j++) {
				row['total'] += rows[j]['fpkm_' + sample[i]]
			}
			chartData.push(row);
		}

		//console.log(chartData)
		// for (var i = 0; i < rows.length; i++) {
		// 	let temp = {};
		// 	let total = 0;
		// 	for (let j = 0; j < baseThead.length; j++) {
		// 		let tempName = baseThead[j].true_key;
		// 		let tempValue = rows[i][tempName];
		// 		temp[tempName] = tempValue;
		// 		if(tempName != "range"){
		// 		  total += tempValue;
		// 		}
		// 	}
		// 	temp["total"] = total;
		// 	chartData.push(temp)
		// }

		let that = this;

		let config: object = {
			chart: {
				title: '表达量堆积图',
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#stackMapData',
				type: 'stackBar',
				width: 800,
				custom: [ 'sample', 'total' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Sample',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					},
					// rotate: 60
				},
				y: {
					title: 'GeneNumber',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
					}
				}
			},
			legend: {
				show: true,
				position: 'right',
				click: function(d, index) {
					that.colorT = d3.select(d).attr('fill');
					that.legendIndexT = index;
					that.isShowColorPanelT = true;
				}
			},
			tooltip: function(d) {
				return '<span>类型：' + d.key + '</span><br><span>转录本数目：' + d.data[d.key] + '</span><br><span>转录本数目：'+ d.data["item"]+'</span>';
			}
		};

		this.chartStack = new d4().init(config);
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
		this.colorQuality = curColor;
		this.colorArr.splice(this.legendIndexThree, 1, curColor);
		this.relevanceChart.redraw();
	}

	//legend color change
	colorBoxChange(curColor){
		this.chartBox.setColor(curColor, this.legendIndexThree);
		this.chartBox.redraw();
	}

	//legend color change
	colorMapChange(curColor){
		this.chartMap.setColor(curColor, this.legendIndexMap);
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
}
