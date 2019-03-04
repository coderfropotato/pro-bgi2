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
  selector: 'app-snp-distribution',
  templateUrl: './snp-distribution.component.html',
  styles: []
})
export class SnpDistributionComponent implements OnInit {

  @ViewChild("rawDataChart") rawDataChart;
  @ViewChild('right') right;
  @ViewChild('func') func;
  @ViewChild('switchChart') switchChart;
  // @ViewChild('defaultSNPTable') defaultSNPTable;

   //原始数据过滤成分统计
   chartSelectType:any=[];
   curSearchType:string;
   tableUrl:string;
   tableEntity:object;
   chart:any;

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

  }

  ngOnInit() {
    //原始数据过滤成分统计
    let sample = [];
    this.store.getStore("sample").forEach((d) => {
      let temp = {
        key:d,
        value:d
      }
      sample.push(temp)
    });
    this.chartSelectType=sample;
    this.curSearchType=sample[0].value;

    this.tableUrl=`${config["javaPath"]}/basicModule/rawReadsClass`;
    this.tableEntity={
      LCID: this.store.getStore('LCID'),
      sample: this.curSearchType
    };
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

  //原始数据过滤成分统计图表
  drawRawReads(data){
    let temp = data.rows[0];
    let tempArray = [
      {
        name:"n_read_num",
        value:temp.n_read_num
      },
      {
        name:"adapter_read_num",
        value:temp.adapter_read_num
      },
      {
        name:"low_qual_read_num",
        value:temp.low_qual_read_num
      },
      {
        name:"clean_read_num",
        value:temp.clean_read_num
      },
    ];

    let that = this;

    let config:object={
      chart: {
				title: "原始数据过滤成分统计",
        dblclick: function(event,title) {
          let text = title.firstChild.nodeValue;
          that.promptService.open(text,(data)=>{
              title.textContent = data;
          })
        },
        width:600,
        height:400,
        padding:0,
        outerRadius:120,
        startAngle:0,
        endAngle:360,
        showLabel:true,
        custom: ["name", "value"],
        el: "#rawDataID",
        type: "pie",
        data: tempArray
        },
        legend: {
            show: true,
            position: "right",
            click:function(d,index){
                that.color = d3.select(d).attr('fill');
                that.legendIndex = index;
                that.isShowColorPanel = true;
            }
        },
        tooltip: function(d) {
            return "<span>name："+d.data.name+"</span><br><span>value："+d.data.value+"</span>";
        }
    }

      this.chart=new d4().init(config);
  }

  handlerRefresh(){
    
  }

  //legend color change
  colorChange(curColor){
    this.chart.setColor(curColor, this.legendIndex);
    this.chart.redraw();
  }
}
