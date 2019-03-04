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
  @ViewChild('defaultSNPTable') defaultSNPTable;

   chartSelectType:any=[];
   curSearchType:string;
   tableUrl:string;
   tableEntity:object;
   chart:any;

  legendIndex: number = 0; //当前点击图例的索引
  color: string; //当前选中的color
  isShowColorPanel: boolean = false;

  defaultTableEntity:object;
  defaultTableUrl:string;
  defaultTableId:string;  

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
    //SNP 位点区域分布
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

    // this.tableUrl=`${config["javaPath"]}/basicModule/rawReadsClass`;
    // this.tableEntity={
    //   LCID: this.store.getStore('LCID'),
    //   sample: this.curSearchType
    // };

    this.tableUrl = `${config["javaPath"]}/alternativeSplice/sampleAs`;
    this.tableEntity = {
        LCID: sessionStorage.getItem("LCID"),
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

  //SNP 位点区域分布
  drawRawReads(data){
    let data1 = {
      "rows": [{
        "sample_name": "HBRR1",
        "snp_stat_up2k": 1702,
        "snp_stat_exon": 43902,
        "snp_stat_intron": 47315,
        "snp_stat_down2k": 3852,
        "snp_stat_intergenic": 12990
      }],
      "baseThead": [{
        "true_key": "sample_name",
        "name": "Sample",
        "searchType": "string",
        "hover": "",
        "children":[]
      }, {
        "true_key": "snp_stat_up2k",
        "name": "Up2k",
        "searchType": "int",
        "hover": "",
        "children":[]
      }, {
        "true_key": "snp_stat_exon",
        "name": "Exon",
        "searchType": "int",
        "hover": "",
        "children":[]
      }, {
        "true_key": "snp_stat_intron",
        "name": "Intron",
        "searchType": "int",
        "hover": "",
        "children":[]
      }, {
        "true_key": "snp_stat_down2k",
        "name": "Down2k",
        "searchType": "int",
        "hover": "",
        "children":[]
      }, {
        "true_key": "snp_stat_intergenic",
        "name": "Intergenic",
        "searchType": "int",
        "hover": "",
        "children":[]
      }]
    };
    let temp = data1.rows[0];
    //let temp = data.rows[0];
    let tempArray = [
      {
        name:"Up2k",
        value:temp.snp_stat_up2k
      },
      {
        name:"Exon",
        value:temp.snp_stat_exon
      },
      {
        name:"intron",
        value:temp.snp_stat_intron
      },
      {
        name:"Down2k",
        value:temp.snp_stat_down2k
      },
      {
        name:"intergenic",
        value:temp.snp_stat_intergenic
      },
    ];

    let that = this;

    let config:object={
      chart: {
				title: "SNP位点区域分布",
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
        el: "#snpDataID",
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
            return "<span>name："+d.data.key+"</span><br><span>value："+d.data.value+"</span>";
        }
    }

      this.chart=new d4().init(config);
  }

  doWithDatas(res){
    var sum = 0;
    for (var name in res.rows[0]) {
        if (typeof res.rows[0][name] == 'number') {
            sum += res.rows[0][name];
        }
    }
    var list = []
    for (var key in res.rows[0]) {
        if (typeof res.rows[0][key] == 'number') {
            var obj = {};
            obj['key'] = key;
            obj['value'] = Math.round((res.rows[0][key] / sum) * 100 * 100) / 100;
            list.push(obj);
        }
    }

    var mapJson = {};
    //$scope.mapJson2 = {};
    res.baseThead.forEach(function(d, i) {
        mapJson[d['true_key']] = d['name'];
        //$scope.mapJson2[d['name']] = d['true_key'];
    })

    list.forEach(function(val, index) {
        var temp = val.key;
        delete val.key;
        val['key'] = mapJson[temp]
    })

    return list;
  }

  handlerRefresh(){
    
  }

  //legend color change
  colorChange(curColor){
    this.chart.setColor(curColor, this.legendIndex);
    this.chart.redraw();
  }
}
