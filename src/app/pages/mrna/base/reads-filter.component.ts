
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

  seq_platform: string;
  seq_length: string;
  fragment_peak: string;

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

  colorArr:string []=[];

  //图例颜色
  isShowColorPanel: boolean = false;
  legendIndex: number = 0; //当前点击图例的索引
  colorYS: string; //当前选中的color

  //Clean reads 碱基含量分布 图例颜色
  isShowContentColorPanel: boolean = false;
  legendIndexTwo: number = 0; //当前点击图例的索引
  colorContent: string; //当前选中的color

  //Clean reads 碱基含量分布 图例颜色
  isShowQualityColorPanel: boolean = false;
  legendIndexThree: number = 0; //当前点击图例的索引
  colorQuality: string; //当前选中的color


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

    this.seq_platform=this.store.getStore('seq_platform');
    this.seq_length=this.store.getStore('seq_length');
    this.fragment_peak=this.store.getStore('fragment_peak');

      //Reads过滤表
      this.defaultUrl = `${config["javaPath"]}/basicModule/filterSummary`;
      this.defaultEntity = {
          LCID: this.store.getStore('LCID'),
          pageNum: 1,
          pageSize: 10
      };

      //Reads过滤表 RNA
      this.defaultRNAUrl = `${config["javaPath"]}/basicModule/filterSummaryMiRNA`;
      this.defaultRNAEntity = {
          LCID: this.store.getStore('LCID'),
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
        LCID: this.store.getStore('LCID'),
        sample: this.curSearchType
      };

      //Clean reads 碱基含量分布
      this.baseSelectType=sample;
      this.baseSearchType=sample[0].value;
      this.tableBaseUrl=`${config["javaPath"]}/basicModule/baseContentDistribution`;
      this.tableBaseEntity={
        LCID: this.store.getStore('LCID'),
        sample: this.baseSearchType
      };

      //Clean reads 碱基质量分布
      //this.colorArr = ["#ff0000", "#ffffff", "#0070c0", "#8c564b", "#c49c94", "#e377c2", "#bcbd22", "#FF9900", "#FFCC00", "#17becf", "#9edae5", "#e6550d", "#66CCCB", "#CCFF66", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0", "#FFE5E5", "#FFF9E5", "#FFFFE5", "#F4FAED", "#E5F7ED", "#E5F7FD", "#E5F0F9", "#E5E8EF", "#F0EAF5", "#EFEFEF", "#FFCCCC", "#FFF2CC", "#FFFFCC", "#E9F6DC", "#CCEFDC", "#CCEFFC", "#CCE2F2", "#CCD2DF", "#E2D6EC", "#DFDFDF", "#FF9999", "#FFE699", "#FFFF99", "#D3ECB9", "#99DF89", "#99DFF9", "#99C6E6", "#99A6BF", "#C6ACD9", "#BFBFBF", "#FF6666", "#FFD966", "#FFFF66", "#BEE396", "#66D096", "#66D0F6", "#66A9D9", "#6679A0", "#A983C6", "#A0A0A0", "#FF3333", "#FFCD33", "#FFFF33", "#A8D973", "#33C073", "#33C3F3", "#338DCD", "#334D80", "#8D59B3", "#000000"];
      //this.colorArr = ["#3195BC", "#FF6666", "#009e71", "#DBBBAF", "#A7BBC3", "#FF9896", "#F4CA60", "#6F74A5", "#E57066", "#C49C94", "#3b9b99", "#FACA0C", "#F3C9DD", "#0BBCD6", "#BFB5D7", "#BEA1A5", "#0E38B1", "#A6CFE2", "#607a93", "#C7C6C4", "#DABAAE", "#DB9AAD", "#F1C3B8", "#EF3E4A", "#C0C2CE", "#EEC0DB", "#B6CAC0", "#C5BEAA", "#FDF06F", "#EDB5BD", "#17C37B", "#2C3979", "#1B1D1C", "#E88565", "#FFEFE5", "#F4C7EE", "#77EEDF", "#E57066", "#FBFE56", "#A7BBC3", "#3C485E", "#055A5B", "#178E96", "#D3E8E1", "#CBA0AA", "#9C9CDD", "#20AD65", "#E75153", "#4F3A4B", "#112378", "#A82B35", "#FEDCCC", "#00B28B", "#9357A9", "#C6D7C7", "#B1FDEB", "#BEF6E9", "#776EA7", "#EAEAEA", "#EF303B", "#1812D6", "#FFFDE7", "#D1E9E3", "#7DE0E6", "#3A745F", "#CE7182", "#340B0B", "#F8EBEE", "#002CFC", "#75FFC0", "#FB9B2A", "#FF8FA4", "#000000", "#083EA7", "#674B7C", "#19AAD1", "#12162D", "#121738", "#0C485E", "#FC3C2D", "#864BFF", "#EF5B09", "#97B8A3", "#FFD101", "#C26B6A", "#E3E3E3", "#FF4C06", "#CDFF06", "#0C485E", "#1F3B34", "#384D9D", "#E10000", "#F64A00", "#89937A", "#C39D63", "#00FDFF", "#B18AE0", "#96D0FF", "#3C225F", "#FF6B61", "#EEB200", "#F9F7E8", "#EED974", "#F0CF61", "#B7E3E4"];
      //this.colorArr = this.store.colors;
      this.colorArr = ["#ffffff", "#00FF7F", "#FF0000"];
      this.qualitySelectType=sample;
      this.qualitySearchType=sample[0].value;
      this.tableQualityUrl=`${config["javaPath"]}/basicModule/baseMassDistribution`;
      this.tableQualityEntity={
        LCID: this.store.getStore('LCID'),
        sample: this.qualitySearchType
      };

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
                dblclick: function(event) {
                    var name = prompt("请输入需要修改的标题", "");
                    if (name) {
                      this.setChartTitle(name);
                      this.updateTitle();
                    }
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
        //type: "pie",
        data: tempArray
        },
        legend: {
            show: true,
            position: "right",
            click:function(d,index){
                that.colorYS = d3.select(d).attr('fill');
                that.legendIndex = index;
                that.isShowColorPanel = true;
            }
        },
        tooltip: function(d) {
            return "<span>Type："+d.data.name+"</span><br><span>Gene Number："+d.data.value+"</span>";
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

    let that = this;

    let config:object={
        chart: {
          title: "Clean reads 碱基含量分布",
          dblclick: function(event) {
            var name = prompt("请输入需要修改的标题", "");
            if (name) {
              this.setChartTitle(name);
              this.updateTitle();
            }
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
                this.setXTitle(name);
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
                that.colorContent = d3.select(d).attr('fill');
                that.legendIndexTwo = index;
                that.isShowContentColorPanel = true;
            }
        },
        tooltip: function(d) {
            return "<span>Position Along Reads："+d.name+"</span><br><span>Type："+d.category+"</span><br><span>Percent(%)："+d.value+"</span>";
        }
    }
    this.chartTwo=new d4().init(config);

  }

  //Clean reads 碱基质量分布
  drawQualityReads(data){
    //d3.selectAll("#rawQualityID svg g").remove();
    document.getElementById('rawQualityID').innerHTML = '';

    //["#ffffff", "#00FF7F", "#FF0000"]

    var that = this;
    var chartData = data.data,
        maxBase = data.maxBase,
        // maxValue = resdata.maxValue;
        maxValue = 1000;

    //容器宽高
    var width = 600,
        height = 500,
        margin = {
            top: 40,
            left: 60,
            bottom: 60,
            right: 90
        },
        space = 24,
        bodyWidth = width - margin.left - margin.right - space,
        bodyHeight = height - margin.top - margin.bottom;

    for (var i = 0; i < chartData.length; i++) {
        for (var j = 0; j < chartData[i].hover.length; j++) {
            chartData[i].hover[j].rect_w = bodyWidth / chartData[i].hover.length;
            chartData[i].rect_h = bodyHeight / chartData.length;
            chartData[i].hover[j].rect_h = bodyHeight / chartData.length;
            chartData[i].hover[j].y = chartData[i].y;
        }
    }

    var legend_width = 20,
        legend_height = 180;

    var colorScale = null;

    let t_chartID = document.getElementById('rawQualityID');
    let str = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
    </svg>`
    t_chartID.innerHTML = str;

    var svg = d3.select("#svg")
        .attr("width", width)
        .attr("height", height);

    // 比例尺
    var xScale = d3.scaleLinear().range([0, bodyWidth]).domain([0, maxBase]);

    var xAxis = d3.axisBottom(xScale);

    var yScale = d3.scaleBand()
        .range([bodyHeight, 0])
        .domain(chartData.map(function(d) {
            return d.y
        }));

    var yAxis = d3.axisLeft(yScale);

    //渐变中心距离顶部位置
    var midPosNum = 20;
    var legendScale = d3.scaleLinear().domain([0, maxValue]).range([0, legend_height]);
    var legendAxis = d3.axisRight(legendScale).ticks(4). tickFormat(function(d) { return d/10 + "%"; });;

    // 画标题
    svg.append("g")
        .attr("transform", "translate(" + (bodyWidth / 2 + margin.left) + "," + margin.top / 2 + ")")
        .append("text")
        .attr("font-size", "18px")
        .attr("text-anchor", "middle")
        .text("Clean reads 的碱基质量分布")
        .style("cursor", "pointer")
        .on("dblclick", function() {
            // let text = title.firstChild.nodeValue;
            // that.promptService.open(text,(data)=>{
            //     title.textContent = data;
            // });
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
            d3.select(this).select("title").remove();
        });

    //画x、y标题
    svg.append("g")
        .attr("class", "x_text")
        .attr("transform", "translate(" + (margin.left + bodyWidth / 2) + "," + (margin.top + bodyHeight + 35) + ")")
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Position along reads")
        .style("cursor", "pointer")
        .on("dblclick", function() {
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
            d3.select(this).select("title").remove();
        });

    svg.append("g")
        .attr("class", "y_text")
        .attr("transform", "translate(30," + ((bodyHeight + margin.top) / 2) + ") rotate(-90)")
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Quality")
        .style("cursor", "pointer")
        .on("dblclick", function() {
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
            d3.select(this).select("title").remove();
        });

    //画轴
    svg.append("g")
        .attr("class", "xAxis_basicAnalysisHeatmap")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + bodyHeight) + ")")
        .call(xAxis);

    d3.selectAll(".xAxis_basicAnalysisHeatmap .tick text")
        .attr("font-size", "12px")

    svg.append("g")
        .attr("class", "yAxis_basicAnalysisHeatmap")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(yAxis);

    d3.selectAll(".yAxis_basicAnalysisHeatmap .tick text")
        .attr("font-size", "12px")

    //主容器
    var body_g = svg.append("g")
        .attr("class", "allRects")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    drawRect(that.colorArr);

    //画rect
    function drawRect(colors) {
        d3.selectAll(".basicAnalysisHeatmap_g").remove();

        colorScale = d3.scaleLinear().domain([0, maxValue/midPosNum, maxValue]).range(colors).interpolate(d3.interpolateRgb);

        var basicAnalysisHeatmap_g = body_g.selectAll(".basicAnalysisHeatmap_g")
            .data(chartData)
            .enter()
            .append("g")
            .attr("class", "basicAnalysisHeatmap_g")
            .attr("transform", function(d) {
                return "translate(0," + yScale(d.y) + ")";
            })

        //rect
        basicAnalysisHeatmap_g.selectAll(".basicHeatmapRect")
            .data(function(d) {
                return d.hover
            })
            .enter()
            .append("rect")
            .attr("width", function(d) {
                return d.rect_w;
            })
            .attr("height", function(d) {
                return d.rect_h;
            })
            .attr("fill", function(d) {
                return colorScale(d.value);
            })
            .attr("transform", function(d, i) {
                return "translate(" + xScale(d.base) + ",0)";
            })
            .on("mouseover", function(d) {
                var errY = Math.pow(10, d.y * (-1) / 10);
                //var tipText = ["第" + d.base + "个碱基", "碱基比例：" + d.value / 10 + "%", "质量值： " + d.y, "碱基准确率：" + ((1 - errY) * 100).toFixed(2) + "%"];
                let tipText = `第${d.base}个碱基<br>碱基比例：${d.value/10}%<br>质量值：${d.y}<br>碱基准确率：${((1 - errY) * 100).toFixed(2)}%`;
                that.globalService.showPopOver(d3.event, tipText);
            })
            .on("mouseout", function() {
                that.globalService.hidePopOver();
            })

    }

    //画图例
    var legend_g = svg.append("g")
        .attr("class", "basicAnalysisHeatmap_legend")
        .attr("transform", "translate(" + (margin.left + bodyWidth + space) + "," + (height - legend_height) / 2 + ")");

    drawLegend(that.colorArr);

    //画图例
    function drawLegend(colors) {
        d3.selectAll(".basicAnalysisHeatmap_legend defs").remove();
        d3.selectAll(".basicAnalysisHeatmap_legend rect.legend_rect").remove();
        //线性填充
        var linearGradient = legend_g.append("defs")
            .append("linearGradient")
            .attr("id", "basicAnalysisHeatmap_Color")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");


        linearGradient.append("stop").attr("offset", 0 + "%").style("stop-color", colors[0]);
        linearGradient.append("stop").attr("offset", 100/midPosNum+ "%").style("stop-color", colors[1]);
        linearGradient.append("stop").attr("offset", 100 + "%").style("stop-color", colors[2]);

        //画图例矩形
        legend_g.append("rect").attr("width", legend_width).attr("height", legend_height).attr("class", "legend_rect")
            .attr("fill", "url(#" + linearGradient.attr("id") + ")");

    }

    //点击图例改图颜色
    var legendClickRect_h = legend_height / that.colorArr.length;
    var legendClick_g = svg.append("g").attr("transform", "translate(" + (bodyWidth + margin.left + space) + "," + (height - legend_height) / 2 + ")")
        .style("cursor", "pointer")
        .on("mouseover", function() {
            d3.select(this).append("title").text("单击修改颜色");
        })
        .on("mouseout", function() {
            d3.select(this).select("title").remove();
        });
    legendClick_g.selectAll(".basicHeatmaplegendClick_Rect")
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

            // this.colorArr_i = i;
            // this.isShowColorPanel = true;
            // this.$apply();
            that.clearEventBubble(d3.event);
            that.colorQuality = colorScale(d);
            that.isShowQualityColorPanel = true;
            that.legendIndexThree = i;
        });

    //色盘指令回调函数
    this.colorChange = function(curColor) {
        this.colorArr.splice(this.colorArr_i, 1, curColor);
        drawLegend(this.colorArr);
        drawRect(this.colorArr);
    }

    //画图例轴
    legend_g.append("g")
        .attr("transform", "translate(" + legend_width + ",0)")
        .call(legendAxis);

    d3.selectAll(".basicAnalysisHeatmap_legend .tick text")
        .attr("font-size", "12px");
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

  colorChange(curColor){
    // this.chart.setColor(curColor, this.legendIndex);
    // this.chart.redraw();
  }

  //legend color change
  colorYSChange(curColor){
    this.chart.setColor(curColor, this.legendIndex);
    this.chart.redraw();
  }

  //legend color change
  colorContentChange(curColor){
    this.chartTwo.setColor(curColor, this.legendIndexTwo);
    this.chartTwo.redraw();
  }

  //legend color change
  colorQualityChange(curColor){
    this.colorQuality = curColor;
    this.colorArr.splice(this.legendIndex, 1, curColor);
    this.rawQualityChart.redraw();
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
