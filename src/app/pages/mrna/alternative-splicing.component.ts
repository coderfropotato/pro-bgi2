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
declare const d4: any;
declare const $: any;

@Component({
  selector: 'app-alternative-splicing',
  templateUrl: './alternative-splicing.component.html',
  styles: []
})
export class AlternativeSplicingComponent implements OnInit {
  @ViewChild("alternativeSpliceChart") alternativeSpliceChart;
  @ViewChild('right') right;
  @ViewChild('func') func;
  @ViewChild('switchChart') switchChart;

  chartUrl: string;
  chartEntity: object;
  chart: any;

  legendIndex: number = 0; //当前点击图例的索引
  color: string; //当前选中的color
  isShowColorPanel: boolean = false;

  tableHeight = 0;
  computedScrollHeight: boolean = false;

  switch = 'right';

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

      let browserLang = this.storeService.getLang();
		  this.translate.use(browserLang);
   }

  ngOnInit() {
    this.chartUrl = `${config["javaPath"]}/alternativeSplice/sampleAs`;
    this.chartEntity = {
        LCID: sessionStorage.getItem("LCID"),
    };
  }

  computedTableHeight() {
		try {
			let h = this.tableHeight;
			this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2;
			if (this.tableHeight === h) this.computedScrollHeight = true;
		} catch (error) {}
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
    console.log(data);
    return;
    var baseThead = data.baseThead;
		var rows = data.rows;
		var chartData = [];

		for (var j = 0; j < rows.length; j++) {
			chartData.push({
				sample_name: rows[j].sample_name,
				as_a3ss: rows[j].as_a3ss * 100 / rows[j].as_total,
				as_a5ss: rows[j].as_a5ss * 100 / rows[j].as_total,
				as_mxe: rows[j].as_mxe * 100 / rows[j].as_total,
        as_ri: rows[j].as_ri * 100 / rows[j].as_total,
        as_se: rows[j].as_se * 100 / rows[j].as_total
			});
		}

		let that = this;

		let config: object = {
			chart: {
				title: '可变剪接事件统计',
				dblclick: function(event,title) {
          let text = title.firstChild.nodeValue;
          that.promptService.open(text,(data)=>{
              title.textContent = data;
          })
        },
				el: '#alternativeSpliceDiv',
				type: 'stackBarPercent',
				width: 660,
				custom: [ 'sample_name' ],
				data: chartData
			},
			axis: {
				x: {
					// title: 'Length(nt)',
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
					title: 'Percentage (%)',
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
				}
			},
			tooltip: function(d) {
        //console.log(d);
        // console.log(d.data[d.key])
        //return '<span>Type：' + d.key + '</span><br><span>Percentage：' + (d[1] - d[0]) + '%</span><br><span>Number：'+d.data[d.key]/100*d.data['as_total']+'</span><br><span>Sample：'+d.data['sample_name']+'</span>';
        return '<span>Type：' + d.key + '</span><br><span>Percentage：' + (d[1] - d[0]) + '%</span><br><span>Sample：'+d.data['sample_name']+'</span>';
			}
		};

		this.chart = new d4().init(config);
  }

  handlerRefresh() {
  
  }

  //color change 回调函数
  colorChange(curColor) {
      this.chart.setColor(curColor, this.legendIndex);
      this.alternativeSpliceChart.redraw();
  }

}
