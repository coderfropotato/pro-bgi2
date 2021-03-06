import { AddColumnService } from "./../../super/service/addColumnService";
import { StoreService } from "./../../super/service/storeService";
import { PageModuleService } from "./../../super/service/pageModuleService";
import { MessageService } from "./../../super/service/messageService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { GlobalService } from "src/app/super/service/globalService";
import config from "../../../config";
import { PromptService } from "./../../super/service/promptService";
import { ToolsService } from "./../../super/service/toolsService";
import { TranslateService } from '@ngx-translate/core';

declare const d3: any;
declare const gooalD3: any;
declare const $: any;

@Component({
  selector: 'app-snp-overview',
  templateUrl: './snp-overview.component.html',
  styles: []
})
export class SnpOverviewComponent implements OnInit {

  @ViewChild("snpOverview") snpOverview;
  @ViewChild('right') right;
  @ViewChild('func') func;
  @ViewChild('switchChart') switchChart;
  //@ViewChild('defaultSNPTable') defaultSNPTable;
  @ViewChild('bigTable') bigTable;

  chartUrl: string;
  chartEntity: object;
  chart: any;

  legendIndex: number = 0; //当前点击图例的索引
  color: string; //当前选中的color
  isShowColorPanel: boolean = false;

  tableHeight = 0;
  computedScrollHeight: boolean = false;

  switch = 'right';

  // 路由参数
  tid: string = null;
  geneType: string = "";
  version: string = null;

  // table
  defaultTableEntity: object;
  defaultTableUrl: string;
  defaultTableId: string;
  defaultTableChecked: boolean;
  defaultCheckStatusInParams: boolean;
  baseThead: any[] = [];

  // asType: string;
  // sample: string;

  expandModuleDesc: boolean = false;

  constructor(
    private message: MessageService,
    private store: StoreService,
    private ajaxService: AjaxService,
    private globalService: GlobalService,
    public storeService: StoreService,
    public pageModuleService: PageModuleService,
    private router: Router,
    private routes: ActivatedRoute,
    private promptService: PromptService,
    public toolsService: ToolsService,
    private addColumnService: AddColumnService,
    private translate: TranslateService,
  ) {
     // 订阅windowResize 重新计算表格滚动高度
     this.message.getResize().subscribe((res) => {
      if (res['message'] === 'resize') this.computedTableHeight();
    });

    // 每次切换路由计算表格高度
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.computedTableHeight();
    });

    this.routes.paramMap.subscribe(params => {
        this.tid = params["params"]["tid"];
        this.version = params["params"]["version"];
        this.geneType = params["params"]["geneType"];
        this.storeService.setTid(this.tid);
    });
  }

  ngOnInit() {
      this.chartUrl = `${config["javaPath"]}/alternativeSplice/snpSummary`;
      this.chartEntity = {
          LCID: sessionStorage.getItem("LCID"),
      };

      // this.asType = "A3SS";
      // this.sample = this.storeService.getStore("sample")[0];
      // table
      this.defaultTableUrl = `${config["javaPath"]}/alternativeSplice/tableSnp`;
      this.defaultTableEntity = {
          LCID: sessionStorage.getItem("LCID"),
          pageIndex: 1, //分页
          pageSize: 20,
          sortValue: null,
          sortKey: null, //排序
          searchList: [],
          geneType: "gene", //基因类型gene和transcript
          species: this.storeService.getStore("genome"), //物种
          checkStatus: true,
          checked: [],
          unChecked: []
      };
      this.defaultTableId = 'snp_default_overview';
      this.defaultTableChecked = true;
      this.defaultCheckStatusInParams = true;
  }

  computedTableHeight() {
		try {
			let h = this.tableHeight;
      this.tableHeight = this.right.nativeElement.offsetHeight  - config['layoutContentPadding'] * 2;
			if (this.tableHeight === h) this.computedScrollHeight = true;
		} catch (error) {}
  }

  ngAfterViewInit() {
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

  drawChart(data) {

    var baseThead = data.baseThead;
    var rows = data.rows;
		var chartData = [];

		for (var j = 0; j < rows.length; j++) {
			chartData.push({
				sample_name: rows[j].sample_name,
				A_G: rows[j].snp_a_g * 100 / rows[j].snp_total,
				C_T: rows[j].snp_c_t * 100 / rows[j].snp_total,
				A_C: rows[j].snp_a_c * 100 / rows[j].snp_total,
        A_T: rows[j].snp_a_t * 100 / rows[j].snp_total,
        C_G: rows[j].snp_c_g * 100 / rows[j].snp_total,
        G_T: rows[j].snp_g_t * 100 / rows[j].snp_total,
        number:{
          A_G:rows[j].snp_a_g,
          C_T:rows[j].snp_c_t,
          A_C:rows[j].snp_a_c,
          A_T:rows[j].snp_a_t,
          C_G:rows[j].snp_c_g,
          G_T:rows[j].snp_g_t
        },
        total:rows[j].snp_total
			});
		}

		let that = this;
		let config: object = {
			chart: {
				title: 'SNP类型统计',
				dblclick: function(event) {
					that.promptService.open(event.target.textContent,val=>{
						this.setChartTitle(val);
						this.updateTitle();
					})
				},
				el: '#snpOverviewDiv',
				type: 'stackBarPercent',
				width: 660,
				custom: [ 'sample_name','total', 'A_G','C_T','A_C','A_T','C_G','G_T'],
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
					// title: 'Length(nt)',
					dblclick: function(event) {
						that.promptService.open(event.target.textContent,val=>{
							this.setXTitle(val);
							this.updateTitle();
						})
					},
					rotate: 60
				},
				y: {
					title: 'Percentage (%)',
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
				}
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
			// tooltip: function(d) {
      //   return '<span>Type：' + d.key + '</span><br><span>Percentage：' + (d[1] - d[0]).toFixed(2) + '%</span><br><span>Sample：'+d.data['sample_name']+'</span>';
      // }
			tooltip: function(d) {
				// console.log(d)
				var p =+(d[1] - d[0]).toFixed(2);
				var n =Math.round(p/100*d.data.total);
				return '<span>Type：' + d.key + '</span><br><span>Percentage：' + p  + '%</span><br><span>Number：'+n+'</span><br><span>Group：'+d.data['sample_name']+'</span>';
			}
		};

		this.chart = new gooalD3().init(config);
  }

  handlerRefresh() {

  }

  moduleDescChange(){
    this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
  }

  //color change 回调函数
  colorChange(curColor) {
      this.chart.setColor(curColor, this.legendIndex);
      this.chart.redraw();
  }

}
