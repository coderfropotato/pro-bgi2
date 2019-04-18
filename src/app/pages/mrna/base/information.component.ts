import { StoreService } from '../../../super/service/storeService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../../config';
import { PromptService } from '../../../super/service/promptService';
import { MessageService } from '../../../super/service/messageService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { GeneListIndexComponent } from '../../geneList/index.component';

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
	genome_source: string;
	genome_url: string;
	genome_version: string;
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

	EntityOne: object;

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
	itemFlag5: boolean = false;
	itemNum5: number = 0;
	itemFlag6: boolean = false;
	itemNum6: number = 0;
	itemFlag7: boolean = false;
	itemNum7: number = 0;

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

		this.species_name = this.store.getStore('species_name');

		if(this.store.store.hasOwnProperty("ref_info")){
			this.genome_source = this.store.getStore('ref_info')["genome_source"];
			this.genome_url = this.store.getStore('ref_info')["genome_url"];
			this.genome_version = this.store.getStore('ref_info')["genome_version"];
		}

		//2.2 RNA分类

		this.tableUrl = `${config['javaPath']}/basicModule/RNAClass`;
		this.tableEntity = {
			LCID: this.store.getStore('LCID')
		};

		//2.3 基因长度
		let m_geneTypeList = [ 'mrna_known', 'mrna_novel', 'lncrna_known', 'lncrna_novel' ];

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

		this.EntityOne = {
			LCID: this.store.getStore('LCID')
		}

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
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
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
				return '<span>Type：' + d.data.name + '</span><br><span>Number：' + d.data.value + '</span>';
			}
		};

		this.chart = new d4().init(config);
	}

	//2.3基因长度
	drawTranscriptLength(data) {
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
				// if(tempName != "item"){
				//   total += tempValue;
				// }
			}
			//temp["total"] = total;
			chartData.push(temp)
		}

		//console.log(data)
		let that = this;

		let config: object = {
			chart: {
				title: '转录本长度分布图',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#TranscriptData',
				type: 'stackBar',
				width: 800,
				custom: [ 'rna_len_item', 'rna_len_all_rna',"rna_len_lncrna_known","rna_len_lncrna_novel",'rna_len_mrna_known',"rna_len_mrna_novel" ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Sequence Size(bp)',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					},
					rotate: 60
				},
				y: {
					title: 'Number of Transcripts',
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
					that.colorT = d3.select(d).attr('fill');
					that.legendIndexT = index;
					that.isShowColorPanelT = true;
				}
			},
			tooltip: function(d) {
				//console.log(d)
				return '<span>Type：' + d.key + '</span><br><span>Number：' + d.data[d.key] + '</span><br><span>Sequence Size(bp)：'+ d.data["rna_len_item"]+'</span>';
			}
		};

		this.chartT = new d4().init(config);
	}

	//2.4 miRNA长度
	drawRNALengthReads(data) {
		//console.log(data)
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
		//console.log(chartData)
		let that = this;

		let config: object = {
			chart: {
				title: 'miRNA长度分布',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
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
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
					//rotate: 60
				},
				y: {
					title: 'Number of miRNA',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setYTitle(val);
							this.updateTitle();
						})
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
					'<span>miRNA Length(bp)：' +
					d.key +
					'</span><br><span>Number：' +
					d.value +
					'</span><br><span>Type：' +
					d.category +
					'</span>'
				);
			}
    }

    this.chartRNA = new d4().init(config);

  }

  //2.5 外显子数量
  drawExonsNum(data){
    var baseThead = data.baseThead;
    var rows = data.rows;
    var chartData = [];

	//console.log(data)
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

    let that = this;

    let config:object={
      chart: {
				title: "外显子数量分布图",
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#exonsNumData',
				type: 'stackBar',
				width: 800,
				custom: [ 'exon_num_item', 'exon_num_all_rna','exon_num_lncrna_known','exon_num_lncrna_novel','exon_num_mrna_known','exon_num_mrna_novel' ],
				data: chartData
			},
			axis: {
				x: {
					title: 'Exon Number',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					}
					// rotate:60
				},
				y: {
					title: 'Number of Transcripts',
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
					that.colorE = d3.select(d).attr('fill');
					that.legendIndexE = index;
					that.isShowColorPanelE = true;
				}
			},
			tooltip: function(d) {
				return '<span>Type：' + d.key + '</span><br><span>Number：' + d.data[d.key] + '</span>';
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
				mirna_first_u: rows[j].mirna_first_u * 100 / total,
				mirna_first_c: rows[j].mirna_first_c * 100 / total,
				mirna_first_g: rows[j].mirna_first_g * 100 / total,
				number:{
					mirna_first_a:rows[j].mirna_first_a,
					mirna_first_u:rows[j].mirna_first_u,
					mirna_first_c:rows[j].mirna_first_c,
					mirna_first_g:rows[j].mirna_first_g,
				},
				total:total
			});
		}

		let that = this;

		let config: object = {
			chart: {
				title: 'The first nucleotide bias',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#RNAFData',
				type: 'stackBarPercent',
				width: 660,
				custom: [ 'sample_name','total', 'mirna_first_a','mirna_first_u','mirna_first_c','mirna_first_g'],
				data: chartData
			},
			axis: {
				x: {
					title: 'Length(nt)',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					},
					rotate: 60
				},
				y: {
					title: 'Percent(%)',
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
					that.colorF = d3.select(d).attr('fill');
					that.legendIndexF = index;
					that.isShowColorPanelF = true;
				}
			},
			tooltip: function(d) {
				return '<span>Type：' + d.data.sample_name + '</span><br><span>Percent(%)：' + (d[1] - d[0]).toFixed(2) + '%</span>';
			}
			// tooltip: function(d) {
			// 	var p =+(d[1] - d[0]).toFixed(2);
			// 	var n =Math.round(p/100*d.data.total);
			// 	return '<span>Type：' + d.key + '</span><br><span>Percentage：' + p  + '%</span><br><span>Number：'+n+'</span><br><span>Group：'+d.data['compare_group']+'</span>';
			// }
		};

		this.chartFRNA = new d4().init(config);
	}

	//选择面板 确定筛选的数据
	selectConfirm(data) {
		this.selectConfirmData = data;
		this.transcriptLengthEntity['geneTypeList'] = this.selectConfirmData;
		this.transcriptLength.reGetData();
	}

	//选择面板，默认选中数据
	defaultSelectList(data) {
		this.selectConfirmData = data;
	}

	//选择面板 确定筛选的数据
	selectConfirmE(data) {
		this.selectConfirmDataE = data;
		this.exonsNumEntity['refGeneTypeList'] = this.selectConfirmDataE;
		this.exonsNum.reGetData();
	}

	//选择面板，默认选中数据
	defaultSelectListE(data) {
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

	GeneListIndex(){
		let mindex = 1;
		let mindex2 = 1;
		let mindex3 = 1;
		this.store.getStore('basicMenu').forEach((d) => {
			if(d.indexOf("002")==0 && d.length != 3){
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
			if(d["name"]=="002"){
				this.tempIndex =  d["index"];
			}
		})

		this.tempMenu2.forEach((d)=>{
			switch (d["name"]) {
				case "002001":
					this.itemFlag = true;
					this.itemNum = d["index"];
					break;
				case "002002":
					this.itemFlag2 = true;
					this.itemNum2 = d["index"];
					break;
				case "002003":
					this.itemFlag3 = true;
					this.itemNum3 = d["index"];
					break;
				case "002004":
					this.itemFlag4 = true;
					this.itemNum4 = d["index"];
					break;
				case "002005":
					this.itemFlag5 = true;
					this.itemNum5 = d["index"];
					break;
				case "002006":
					this.itemFlag6 = true;
					this.itemNum6 = d["index"];
					break;
				case "002007":
					this.itemFlag7 = true;
					this.itemNum7 = d["index"];
					break;
				default:
					break;
			}
		})
	}
}
