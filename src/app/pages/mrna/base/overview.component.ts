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

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styles: []
})
export class OverviewComponent implements OnInit {
  @ViewChild('relevanceChart') relevanceChart;
  @ViewChild('PCAChart') PCAChart;

  // table one
  defaultUrl: string;
  defaultUrlTwo: string;

  //相关性热图
  tableUrl:string;
  chartUrl:string;
  tableEntity:object;
  chart:any;
  selectPanelData: object[] = [];
  selectConfirmData: string[] = [];

  //主成分分析
  PCASelectType:any=[];
  PCASearchType:string;
  tablePCAUrl:string;
  tablePCAEntity:object;
  chartPCA:any;

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
      //样品分组设置
      this.defaultUrl = `${config["javaPath"]}/basicModule/groupPlan`;

      //差异分组设置
      this.defaultUrlTwo = `${config["javaPath"]}/basicModule/diffExpPlan`;


      //相关性热图
      this.selectPanelData = [
        {
          type: '',
          data: this.store.getStore("sample")
        }
      ];

      this.chartUrl=`${config["javaPath"]}/basicModule/diffExpPlan`; //暂代
      this.tableUrl=`${config["javaPath"]}/basicModule/correlationHeatmap`;
      this.tableEntity={
        LCID: "DEMO_TOM_APDENOVO",
        correlationSampleList: this.store.getStore("sample")
      };


      //PCA
      let pca_info = [];
      this.store.getStore("pca_info").forEach((d) => {
        let temp = {
          key:d,
          value:d
        }
        pca_info.push(temp)
      });
      this.PCASelectType=pca_info;
      this.PCASearchType=pca_info[0].value;

      this.tablePCAUrl=`${config["javaPath"]}/basicModule/PCA`;
      this.tablePCAEntity={
        LCID: "DEMO_TOM_APDENOVO",
        pca_info: this.PCASearchType
      };
  }

  //相关性热图
  drawRelevanceReads(data){
    console.log(data);

  }
  //选择面板 确定筛选的数据
	selectConfirm(data) {
    //console.log(data)
    this.selectConfirmData = data;
  }

  //选择面板，默认选中数据
	defaultSelectList(data) {
    //console.log(data)
		this.selectConfirmData = data;
	}

  handlerRefresh(){

  }

  drawPCAReads(data){

    // pca_comp1: -0.414345827931845
    // pca_comp2: 0.234081607476174
    // sample_name: "KO_elo"
    let lengendtitle = [];
    data.rows.forEach((d) => {
        //console.log(d.sample_name);
        lengendtitle.push(d.sample_name)
    });


    let that = this;
    let config:object={
      chart: {
				title: "主成分分析",
				dblclick: function(event,title) {
          let text = title.firstChild.nodeValue;
          that.promptService.open(text,(data)=>{
              title.textContent = data;
          })
        },
        width:660,
				el: "#PCADataID",
				type: "scatter",
				radius:3,  // custom radius
				hoverRadius:6,  // custom hover radius
				custom: ["pca_comp1", "pca_comp2","sample_name"], // x y category
				data: data.rows
			},
			axis: {
				x: {
					title: "PC1",
					dblclick: function(event) {
						var name = prompt("请输入需要修改的标题", "");
						if (name) {
							this.setXTitle(name);
							this.updateTitle();
						}
					}
				},
				y: {
					title: "PC2",
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
          that.color = d3.select(d).attr('fill');
          that.legendIndex = index;
          that.isShowColorPanel = true;
        },
				data:lengendtitle
			},
			tooltip: function(d) {
				return "<span>Sample："+d.sample_name+"</span><br><span>pca_comp1："+d.pca_comp1+"</span><br><span>pca_comp2："+d.pca_comp2+"</span>";
			}
    }

    this.chartPCA=new d4().init(config);
  }

  searchPCATypeChange(){
    this.tablePCAEntity["pca_info"] = this.PCASearchType;
    this.PCAChart.reGetData();
  }

  //legend color change
  colorChange(curColor){
    this.chartPCA.setColor(curColor, this.legendIndex);
    this.chartPCA.redraw();
  }

}
