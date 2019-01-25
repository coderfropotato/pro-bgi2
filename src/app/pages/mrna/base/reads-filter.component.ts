
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
  selector: 'app-reads-filter',
  templateUrl: './reads-filter.component.html',
  styles: []
})
export class ReadsFilterComponent implements OnInit {
  @ViewChild('rawDataChart') rawDataChart;
  @ViewChild('rawBaseChart') rawBaseChart;
  @ViewChild('rawQualityChart') rawQualityChart;
  @ViewChild('bigTable') bigTable;
  @ViewChild('bigRNATable') bigRNATable;
  // table one
  defaultEntity: object;
  defaultUrl: string;
  defaultTableId: string;

  // table RNA
  defaultRNAEntity: object;
  defaultRNAUrl: string;
  defaultRNAId: string;

  tableHeight = 450;

  //原始数据过滤成分统计
  chartSelectType:any=[];
  curSearchType:string;
  tableUrl:string;
  tableEntity:object;
  chart:any;

  //Clean reads 碱基含量分布
  baseSelectType:any=[];
  baseSearchType:string;
  tableBaseUrl:string;
  tableBaseEntity:object;
  chartTwo:any;

  
  //Clean reads 碱基质量量分布
  qualitySelectType:any=[];
  qualitySearchType:string;
  tableQualityUrl:string;
  tableQualityEntity:object;
  chartThree:any;

  //图例颜色
  isShowColorPanel: boolean = false;
  legendIndex: number = 0; //当前点击图例的索引
  color: string; //当前选中的color

  //Clean reads 碱基含量分布 图例颜色
  isShowColorPanelTwo: boolean = false;
  legendIndexTwo: number = 0; //当前点击图例的索引
  colorTwo: string; //当前选中的color

  //Clean reads 碱基含量分布 图例颜色
  isShowColorPanelThree: boolean = false;
  legendIndexThree: number = 0; //当前点击图例的索引
  colorThree: string; //当前选中的color
  

  constructor(
    private message: MessageService,
    private store: StoreService,
    private ajaxService: AjaxService,
    private globalService: GlobalService,
    private storeService: StoreService,
    private promptService:PromptService,
    private router: Router
  ) { 

  }

  ngOnInit() {
      //Reads过滤表
      this.defaultUrl = `${config["javaPath"]}/basicModule/filterSummary`;
      this.defaultEntity = {
          LCID: "DEMO_TOM_APDENOVO",
          pageNum: 1,
          pageSize: 10
      };

      //Reads过滤表 RNA
      this.defaultRNAUrl = `${config["javaPath"]}/basicModule/filterSummaryMiRNA`;
      this.defaultRNAEntity = {
          LCID: "DEMO_TOM_APDENOVO",
          pageNum: 1,
          pageSize: 10
      };

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
        LCID: "DEMO_TOM_APDENOVO",
        sample: this.curSearchType
      };

      //Clean reads 碱基含量分布
      this.baseSelectType=sample;
      this.baseSearchType=sample[0].value;
      this.tableBaseUrl=`${config["javaPath"]}/basicModule/baseContentDistribution`;
      this.tableBaseEntity={
        LCID: "DEMO_TOM_APDENOVO",
        sample: this.baseSearchType
      };

      //Clean reads 碱基质量分布
      // this.qualitySelectType=sample;
      // this.qualitySearchType=sample[0].value;
      // this.tableQualityUrl=`${config["javaPath"]}/basicModule/BaseMassDistribution`;
      // this.tableQualityEntity={
      //   LCID: "DEMO_TOM_APDENOVO",
      //   sample: this.qualitySearchType
      // };

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
				padding:0.1,
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


  //Clean reads 碱基含量分布
  drawBaseReads(data){
    
    var baseThead = data.baseThead;
    var rows = data.rows;
    var chartData = [];
    for (var i = 0; i < baseThead.length; i++) {
        for (var j = 0; j < rows.length; j++) {
            if (baseThead[i].name != "index") {
                chartData.push({
                    category: baseThead[i].name,
                    name: rows[j].index,
                    value: rows[j][baseThead[i].true_key]
                })
            }
        }
    }

    console.log(chartData);

    let that = this;

    let config:object={
        chart: {
          title: "Clean reads 碱基含量分布",
          dblclick: function(event,title) {
            let text = title.firstChild.nodeValue;
            that.promptService.open(text,(data)=>{
                title.textContent = data;
            })
          },
          width:600,
          custom: ["name", "value", "category"],
          el: "#rawBaseID",
          type: "categoryLine",
          data: chartData
        },
        axis: {
          x: {
            title: "Position along reads",
            rotate: 60,
            dblclick: function(event) {
              var name = prompt("请输入需要修改的标题", "");
              if (name) {
                this.setYTitle(name);
                this.updateTitle();
              }
            }
          },
          y: {
            title: "Percentage (%)",
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
					click:function(d,index){
						that.colorTwo = d3.select(d).attr('fill');
            that.legendIndexTwo = index;
            that.isShowColorPanelTwo = true;
					}
				},
				tooltip: function(d) {
					return "<span>name："+d.name+"</span><br><span>category："+d.category+"</span><br><span>value："+d.value+"</span>";
				}
    }
    this.chartTwo=new d4().init(config);
    
  }

  //Clean reads 碱基质量分布
  drawQualityReads(data){
    console.log(data)
  }

  handlerRefresh(){

  }


  searchTypeChange(){
    this.tableEntity["sample"] = this.curSearchType;
    this.rawDataChart.reGetData();
  }

  searchBaseTypeChange(){
    this.tableBaseEntity["sample"] = this.baseSearchType;
    this.rawBaseChart.reGetData();
  }

  searchQualityTypeChange(){
    this.tableQualityEntity["sample"] = this.qualitySearchType;
    this.rawQualityChart.reGetData();
  }

  //legend color change
  colorChange(curColor){
    this.chart.setColor(curColor, this.legendIndex);
    this.chart.redraw();
  }

  //legend color change
  colorChangeTwo(curColor){
    this.chartTwo.setColor(curColor, this.legendIndexTwo);
    this.chartTwo.redraw();
  }

  //legend color change
  colorChangeThree(curColor){
    this.chartThree.setColor(curColor, this.legendIndexThree);
    this.chartThree.redraw();
  }

}
