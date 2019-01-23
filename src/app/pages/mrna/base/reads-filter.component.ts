
import { StoreService } from "../../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { GlobalService } from "src/app/super/service/globalService";
import config from "../../../../config";
import {PromptService} from '../../../super/service/promptService';

declare const d3: any;
declare const d4: any;
declare const $: any;

@Component({
  selector: 'app-reads-filter',
  templateUrl: './reads-filter.component.html',
  styles: []
})
export class ReadsFilterComponent implements OnInit {

  // table
  defaultEntity: object;
  defaultUrl: string;
  defaultTableId: string;
  defaultDefaultChecked: boolean;
  defaultCheckStatusInParams: boolean;
  baseThead: any[] = [];
  tableHeight = 0;

  tableUrl:string;
  tableEntity:object;

  computedScrollHeight:boolean = false;

  constructor(
    private store: StoreService,
    private ajaxService: AjaxService,
    private globalService: GlobalService,
    private storeService: StoreService,
    private promptService:PromptService
  ) { 
    
  }

  ngOnInit() {

    // //Reads过滤表
    // this.defaultUrl = `${config["javaPath"]}/basicModule/filterSummary`;
    // this.defaultEntity = {
    //     LCID: "DEMO_TOM_APDENOVO",
    // };


    //原始数据过滤成分统计
    let sample = this.store.getStore("sample");
    this.tableUrl=`${config["javaPath"]}/basicModule/rawReadsClass`;
    this.tableEntity={
      LCID: "DEMO_TOM_APDENOVO",
      sample: sample[4]
    };
  }

  drawRawReads(data){
    //n_read_num: "872", adapter_read_num: "459", low_qual_read_num: "0", clean_read_num: "14038340"

    console.log(data);

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

    document.getElementById('rawDataChart').innerHTML = "";
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
				el: "#rawDataChart",
				type: "pie",
				data: tempArray
				},
				legend: {
					show: true,
					position: "right",
					dblclick:function(el){
						console.log(el)
					}
				},
				tooltip: function(d) {
					return "<span>name："+d.data.name+"</span><br><span>value："+d.data.value+"</span>";
				}
			}

      new d4().init(config);


  }

  handlerRefresh(){
    
  }

}
