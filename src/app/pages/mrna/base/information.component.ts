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
	selector: 'app-information',
	templateUrl: './information.component.html',
	styles: []
})
export class InformationComponent implements OnInit {
	@ViewChild('RNAClassChart') RNAClassChart;
	@ViewChild('RNALchart') RNALchart;
	@ViewChild('miRNAFchart') miRNAFchart;
	@ViewChild('transcriptLength') transcriptLength;
	@ViewChild('exonsNum') exonsNum;

	species_name: string;
	ref_info: object;

	//2.2 RNA分类
	tableUrl: string;
	tableEntity: object;
	chart: any;

	isShowColorPanel: boolean = false;
	legendIndex: number = 0; //当前点击图例的索引
	color: string; //当前选中的color

	//2.3 基因长度
	transcriptLengthUrl: string;
	transcriptLengthEntity: object;
	chartT: any;
	selectPanelData: object[] = [];
	selectConfirmData: string[] = [];

	isShowColorPanelT: boolean = false;
	legendIndexT: number = 0; //当前点击图例的索引
	colorT: string; //当前选中的color

	//2.4 miRNA长度分布
	tableRNAUrl: string;
	tableRNAEntity: object;
	chartRNA: any;

	isShowColorPanelL: boolean = false;
	legendIndexL: number = 0; //当前点击图例的索引
	colorL: string; //当前选中的color

	//2.5 外显子数量
	exonsNumUrl: string;
	exonsNumEntity: object;
	chartE: any;
	selectPanelDataE: object[] = [];
	selectConfirmDataE: string[] = [];

	isShowColorPanelE: boolean = false;
	legendIndexE: number = 0; //当前点击图例的索引
	colorE: string; //当前选中的color

	// table one 2.6
	defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;

	//2.7 miRNA首位碱基分布
	tableRNAFUrl: string;
	tableRNAFEntity: object;
	chartFRNA: any;

	isShowColorPanelF: boolean = false;
	legendIndexF: number = 0; //当前点击图例的索引
	colorF: string; //当前选中的color

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

		this.species_name = this.store.getStore('species_name');

		this.ref_info = this.store.getStore('ref_info');

		//2.2 RNA分类

		this.tableUrl = `${config['javaPath']}/basicModule/RNAClass`;
		this.tableEntity = {
			LCID: this.store.getStore('LCID')
		};

		//2.3 基因长度
		let m_geneTypeList = [ 'mrna|known', 'mrna|novel', 'lncrna|known', 'lncrna|novel' ];

		this.selectPanelData = [
			{
				type: '',
				data: m_geneTypeList
			}
		];

		this.transcriptLengthUrl = `${config['javaPath']}/basicModule/transcriptLength`;
		this.transcriptLengthEntity = {
			LCID: this.store.getStore('LCID'),
			geneTypeList: m_geneTypeList
		};

		//2.4 miRNA长度分布
		this.tableRNAUrl = `${config['javaPath']}/basicModule/miRNALength`;
		this.tableRNAEntity = {
			LCID: this.store.getStore('LCID')
		};

		//2.5 外显子数量

		this.selectPanelDataE = [
			{
				type: '',
				data: m_geneTypeList
			}
		];

		this.exonsNumUrl = `${config['javaPath']}/basicModule/exonsNum`;
		this.exonsNumEntity = {
			LCID: this.store.getStore('LCID'),
			refGeneTypeList: m_geneTypeList
		};

		//2.6 小RNA数量
		this.defaultUrl = `${config['javaPath']}/basicModule/annotationStat`;
		this.defaultEntity = {
			LCID: this.store.getStore('LCID'),
			pageNum: 1,
			pageSize: 10
		};

		//2.7 miRNA首位碱基分布
		this.tableRNAFUrl = `${config['javaPath']}/basicModule/miRNAFirstBaseBias`;
		this.tableRNAFEntity = {
			LCID: this.store.getStore('LCID')
		};
	}

	//2.2 RNA分类
	drawRNAClass(data) {
		let temp = data.rows[0];
		let tempArray = [
			{
				name: 'lncrna_num',
				value: temp.lncrna_num
			},
			{
				name: 'mirna_num',
				value: temp.mirna_num
			},
			{
				name: 'mrna_num',
				value: temp.mrna_num
			}
		];

		let that = this;

		let config: object = {
			chart: {
				title: '各类型RNA数量统计',
				dblclick: function(event, title) {
					let text = title.firstChild.nodeValue;
					that.promptService.open(text, (data) => {
						title.textContent = data;
					});
				},
				width: 600,
				height: 400,
				padding: 0,
				outerRadius: 120,
				startAngle: 0,
				endAngle: 360,
				showLabel: true,
				custom: [ 'name', 'value' ],
				el: '#RNAClassID',
				type: 'pie',
				data: tempArray
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

	//2.3基因长度
	drawTranscriptLength(data) {
		//console.log(data);
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];

		// for (var i = 0; i < rows.length; i++) {
		// 	let temp = {};
		// 	for (let j = 0; j < baseThead.length; j++) {
		// 		let tempName = baseThead[j].true_key;
		// 		let tempValue = rows[i][tempName];
		// 		temp[tempName] = tempValue;
		// 		//console.log(tempName+":"+tempValue)
		// 	}
		// 	chartData.push(temp);
		// }
		for (var i = 0; i < rows.length; i++) {
			let temp = {};
			let total = 0;
			for (let j = 0; j < baseThead.length; j++) {
				let tempName = baseThead[j].true_key;
				let tempValue = rows[i][tempName];
				temp[tempName] = tempValue;
				if(tempName != "item"){
				  total += tempValue;
				}
			}
			temp["total"] = total;
			chartData.push(temp)
		}
		//console.log(chartData);

		let that = this;

		let config: object = {
			chart: {
				title: '转录本长度分布图',
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#TranscriptData',
				type: 'stackBar',
				width: 800,
				custom: [ 'item', 'total' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Sequence Size(bp)',
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
					title: 'Number of Transcripts',
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

		this.chartT = new d4().init(config);
	}

	//2.4 miRNA长度
	drawRNALengthReads(data) {
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];
		for (var i = 0; i < baseThead.length; i++) {
			for (var j = 0; j < rows.length; j++) {
				if (baseThead[i].name != 'mirna_length') {
					chartData.push({
						key: rows[j].mirna_length,
						value: rows[j][baseThead[i].true_key],
						category: baseThead[i].name
					});
				}
			}
		}

		let that = this;

		let config: object = {
			chart: {
				title: 'miRNA长度分布',
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#RNALData',
				type: 'groupBar',
				innerPadding: 0.01,
				width: 800,
				custom: [ 'key', 'value', 'category' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'miRNALength (bp)',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
					//rotate: 60
				},
				y: {
					title: 'Number of miRNA',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setYTitle(name);
							this.updateTitle();
						}
					}
					//formatter: (val) => val + '%'
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
    }

    this.chartRNA = new d4().init(config);

  }

  //2.5 外显子数量
  drawExonsNum(data){
    // console.log(data);
    var baseThead = data.baseThead;
    var rows = data.rows;
    var chartData = [];

    for (var i = 0; i < rows.length; i++) {
      let temp = {};
      let total = 0;
      for (let j = 0; j < baseThead.length; j++) {
        let tempName = baseThead[j].true_key;
        let tempValue = rows[i][tempName];
        temp[tempName] = tempValue;
        // if(tempName != "ref_all"&&tempName !="ref_item"){
        //   total += tempValue;
        // }
      }
      //temp["total"] = total;
      chartData.push(temp)
    }
    // console.log(chartData);

    let that = this;

    let config:object={
      chart: {
				title: "外显子数量分布图",
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#exonsNumData',
				type: 'stackBar',
				width: 800,
				custom: [ 'ref_item', 'ref_all' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Exon Number',
					dblclick: function(event) {
						var name = prompt('请输入需要修改的标题', '');
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
					// rotate:60
				},
				y: {
					title: 'Number of Transcripts',
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
					that.colorE = d3.select(d).attr('fill');
					that.legendIndexE = index;
					that.isShowColorPanelE = true;
				}
			},
			tooltip: function(d) {
				return '<span>类型：' + d.key + '</span><br><span>数量：' + d.data[d.key] + '</span>';
			}
		};

		this.chartE = new d4().init(config);
	}

	//2.7 miRNA首位碱基分布
	drawRNAFristReads(data) {
		var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];

		for (var j = 0; j < rows.length; j++) {
			var total = rows[j].mirna_first_a + rows[j].mirna_first_c + rows[j].mirna_first_g + rows[j].mirna_first_u;
			chartData.push({
				sample_name: rows[j].mirna_first_len,
				mirna_first_a: rows[j].mirna_first_a * 100 / total,
				mirna_first_c: rows[j].mirna_first_c * 100 / total,
				mirna_first_g: rows[j].mirna_first_g * 100 / total,
				mirna_first_u: rows[j].mirna_first_u * 100 / total
			});
		}

		let that = this;

		let config: object = {
			chart: {
				title: 'The first nucleotide bias',
				dblclick: function(event) {
					var name = prompt('请输入需要修改的标题', '');
					if (name) {
						this.setChartTitle(name);
						this.updateTitle();
					}
				},
				el: '#RNAFData',
				type: 'stackBarPercent',
				width: 660,
				custom: [ 'sample_name' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Length(nt)',
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
					title: 'Percent(%)',
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
					that.colorF = d3.select(d).attr('fill');
					that.legendIndexF = index;
					that.isShowColorPanelF = true;
				}
			},
			tooltip: function(d) {
				return '<span>样本：' + d.data.sample_name + '</span><br><span>占比：' + (d[1] - d[0]) + '%</span>';
			}
		};

		this.chartFRNA = new d4().init(config);
	}

	//选择面板 确定筛选的数据
	selectConfirm(data) {
		// console.log(data);
		this.selectConfirmData = data;
		this.transcriptLengthEntity['geneTypeList'] = this.selectConfirmData;
		this.transcriptLength.reGetData();
	}

	//选择面板，默认选中数据
	defaultSelectList(data) {
		// console.log(data);
		this.selectConfirmData = data;
	}

	//选择面板 确定筛选的数据
	selectConfirmE(data) {
		//console.log(data)
		this.selectConfirmDataE = data;
		this.exonsNumEntity['RefGeneTypeList'] = this.selectConfirmDataE;
		this.exonsNum.reGetData();
	}

	//选择面板，默认选中数据
	defaultSelectListE(data) {
		//console.log(data)
		this.selectConfirmDataE = data;
	}

	handlerRefresh() {}

	//2.2 RNA分类
	colorChange(curColor) {
		this.chart.setColor(curColor, this.legendIndex);
		this.chart.redraw();
	}

	//2.4 miRNA长度分布
	colorLChange(curColor) {
		this.chartRNA.setColor(curColor, this.legendIndexL);
		this.chartRNA.redraw();
	}

	//2.5 外显子数量
	colorEChange(curColor) {
		this.chartE.setColor(curColor, this.legendIndexE);
		this.chartE.redraw();
	}

	//2.7 miRNA首位碱基分布
	colorFChange(curColor) {
		this.chartFRNA.setColor(curColor, this.legendIndexF);
		this.chartFRNA.redraw();
	}

	//2.3
	colorTChange(curColor) {
		this.chartT.setColor(curColor, this.legendIndexT);
		this.chartT.redraw();
	}
}
