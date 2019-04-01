import { StoreService } from "../../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { GlobalService } from "src/app/super/service/globalService";
import config from "../../../../config";
import {PromptService} from '../../../super/service/promptService';
import { MessageService } from '../../../super/service/messageService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

declare const d3: any;
declare const d4: any;
declare const $: any;

@Component({
  selector: 'app-reads',
  templateUrl: './reads-comparison.component.html',
  styles: []
})
export class ReadsComparisonComponent implements OnInit {
  @ViewChild('rondDataChart') rondDataChart;//saturationDataChart
  @ViewChild('coverageDataChart') coverageDataChart;
  @ViewChild('saturationDataChart') saturationDataChart;

  // table one
  defaultEntity: object;
  defaultUrl: string;
  defaultTableId: string;

  // table two
  defaultgeneEntity: object;
  defaultgeneUrl: string;
  defaultgeneTableId: string;

  //reads 在转录本上的分布
  chartSelectType:any=[];
  curSearchType:string;
  tableUrl:string;
  tableEntity:object;
  chart:any;

  //转录本的 reads 覆盖度
  coverSelectType:any=[];
  coverSearchType:string;
  coverTableUrl:string;
  coverTableEntity:object;
  coverChart:any;

  //测序饱和度曲线
  saturationSelectType:any=[];
  saturationSearchType:string;
  saturationTableUrl:string;
  saturationTableEntity:object;
  saturationChart:any;


  //图例颜色
  isShowColorPanel: boolean = false;
  legendIndex: number = 0; //当前点击图例的索引
  color: string; //当前选中的color

  constructor(
    private message: MessageService,
    private store: StoreService,
    private ajaxService: AjaxService,
    private globalService: GlobalService,
    private storeService: StoreService,
    private promptService:PromptService,
    private router: Router
  ) { }

  ngOnInit() {
    //4.1 参考基因组比对
    this.defaultUrl = `${config["javaPath"]}/basicModule/genomeMappingSummary`;
    this.defaultEntity = {
        LCID: this.store.getStore('LCID'),
        pageNum: 1,
        pageSize: 10
    };

    //4.2 参考基因比对
    this.defaultgeneUrl = `${config["javaPath"]}/basicModule/geneMappingSummary`;
    this.defaultgeneEntity = {
        LCID: this.store.getStore('LCID'),
        pageNum: 1,
        pageSize: 10
    };

    //reads 在转录本上的分布
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

    this.tableUrl=`${config["javaPath"]}/basicModule/readsRandom`;
    this.tableEntity={
      LCID: this.store.getStore('LCID'),
      sample: this.curSearchType
    };

    //转录本的 reads 覆盖度
    this.coverSelectType=sample;
    this.coverSearchType=sample[0].value;

    this.coverTableUrl=`${config["javaPath"]}/basicModule/readsCoverage`;
    this.coverTableEntity={
      LCID: this.store.getStore('LCID'),
      sample: this.coverSearchType
    };

    //测序饱和度曲线
    this.saturationSelectType=sample;
    this.saturationSearchType=sample[0].value;

    this.saturationTableUrl=`${config["javaPath"]}/basicModule/seqSaturation`;
    this.saturationTableEntity={
      LCID: this.store.getStore('LCID'),
      sample: this.saturationSearchType
    };

  }

  //4.3 随机性 reads 在转录本上的分布画图
  drawRondReads(data){

    var rows = data.rows;
    rows.sort((a,b)=>{
      return a["window_pos"] - b["window_pos"]
    })

    var min = rows[0]['window_pos'];
    var max = rows[rows.length-1]['window_pos'];

    let scale = d3.scaleLinear().domain([min,max]).range([0,1])

    let temps = [];
    rows.forEach((d) => {
      temps.push({
        window_pos:scale(d.window_pos),
        window_read_num:d.window_read_num
      })
    });


    // console.log(temps)

    let that = this;
    let config: object={
      chart: {
        title: "reads 在转录本上的分布",
        dblclick: function(event) {
				  var name = prompt("请输入需要修改的标题", "");
				  if (name) {
					this.setChartTitle(name);
					this.updateTitle();
				  }
				},
        width:660,
        el: "#rondData",
        custom: ["window_pos", "window_read_num"],
        type: "line",
        interpolate:'cardinal',
        data: temps
      },
      axis: {
        x: {
          title: "Relative Position in Genes(5‘->3’)(200 windows)",
          // rotate: 60,
          ticks:5,
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
              this.setXTitle(name);
							this.updateTitle();
            }
          }
        },
        y: {
          title: "Reads Number of Each Window",
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
              this.setYTitle(name);
              this.updateTitle();
            }
          }
        }
      },
      tooltip: function(d,index) {
        return "<span>Relative Position in Genes(5‘->3’)(200 windows)："+d.window_pos+"</span><br><span>Reads Number of Each Window："+d.window_read_num+"</span>";
      }
    }

    new d4().init(config);

  }

  //4.4 覆盖度 转录本的 reads 覆盖度
  drawCoverReads(data){
    // console.log(data);
    // let rows = [];

    // data.rows.forEach((d) => {
    //   rows.push({
    //     index: d["percent_covered"].split("-")[0],

    //   })
    //   d["percent_covered"].split("-")[0]

    // });

    // rows.sort((a,b)=>{
    //   return a["window_pos"] - b["window_pos"]
    // })

    // var min = rows[0]['window_pos'];
    // var max = rows[rows.length-1]['window_pos'];

    // let scale = d3.scaleLinear().domain([min,max]).range([0,1])

    // let temps = [];
    // rows.forEach((d) => {
    //   temps.push({
    //     window_pos:scale(d.window_pos),
    //     window_read_num:d.window_read_num
    //   })
    // });

    let that = this;
    let config: object={
        chart: {
          title: "转录本的 reads 覆盖度",
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
            this.setChartTitle(name);
            this.updateTitle();
            }
          },
          width:600,
          custom: ["percent_covered", "percent_transcript"],
          el: "#coverageData",
          type: "bar",
          data: data.rows
          },
          axis: {
          x: {
            title: "Percent covered(%)",
            dblclick: function(event) {
              var name = prompt("请输入需要修改的标题", "");
              if (name) {
                this.setXTitle(name);
                this.updateTitle();
              }
            }
          },
          y: {
            title: "Percentage of Transcripts(%)",
            dblclick: function(event) {
              var name = prompt("请输入需要修改的标题", "");
              if (name) {
                this.setYTitle(name);
                this.updateTitle();
              }
            }
          },
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
          "tooltip": function(d) {
            return "<span>Percent covered(%):"+d.percent_covered+"</span><br><span>Percentage of Transcripts(%):"+d.percent_transcript+"</span>"
          }
      }
    new d4().init(config);
  }

  //4.5 测序饱和度 测序饱和度曲线
  drawSaturationReads(data){
    // console.log(data);

    // let rows = data.rows;
    // rows.sort((a,b)=>{
    //   return a["readnum_100k"]-b["readnum_100k"]
    // })

    var rows = data.rows;
    rows.sort((a,b)=>{
      return a["readnum_100k"] - b["readnum_100k"]
    })

    var min = rows[0]['readnum_100k'];
    var max = rows[rows.length-1]['readnum_100k'];

    let scale = d3.scaleLinear().domain([min,max]).range([0,1])

    let temps = [];
    rows.forEach((d) => {
      temps.push({
        readnum_100k:scale(d.readnum_100k),
        gene_idt_ratio:d.gene_idt_ratio
      })
    });

    let that = this;
    let config: object={
      chart: {
        title: "测序饱和度曲线",
        dblclick: function(event) {
				  var name = prompt("请输入需要修改的标题", "");
				  if (name) {
					this.setChartTitle(name);
					this.updateTitle();
				  }
				},
        width:660,
        interpolate:'cardinal',
        el: "#saturationData",
        custom: ["readnum_100k", "gene_idt_ratio"],
        type: "line",
        data: temps
      },
      axis: {
        x: {
          title: "Amount of reads (x100K)",
          // rotate: 60,
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
              this.setXTitle(name);
							this.updateTitle();
            }
          }
        },
        y: {
          title: "Gene Identification ratio(%)",
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
              this.setYTitle(name);
              this.updateTitle();
            }
          }
        }
      },
      tooltip: function(d,index) {
        return "<span>Reads Number(x100K)："+d.readnum_100k+"</span><br><span>Gene Identification Ratio(%)："+d.gene_idt_ratio+"</span>";
      }
    }

    new d4().init(config);
  }

  handlerRefresh(){

  }

  //legend color change
  colorChange(curColor){
    this.chart.setColor(curColor, this.legendIndex);
    this.chart.redraw();
  }

  searchTypeChange(){
    this.tableEntity["sample"] = this.curSearchType;
    this.rondDataChart.reGetData();
  }

  searchCoverTypeChange(){
    this.coverTableEntity["sample"] = this.coverSearchType;
    this.coverageDataChart.reGetData();
  }

  saturationTypeChange(){
    this.saturationTableEntity["sample"] = this.saturationSearchType;
    this.saturationDataChart.reGetData();
  }

}
