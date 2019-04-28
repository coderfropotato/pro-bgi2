import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";
import { PageModuleService } from "../service/pageModuleService";

declare const $: any;

@Component({
  selector: 'app-re-top',
  templateUrl: './re-top.component.html',
  styles: [
    `
      .re_div{
        height: 40px;
        width: 600px;
      }
      .re_div_one{
        float: left;
        max-width: 251px;
        height: 40px;
        line-height:40px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
        font-weight: bold;
      }
      .re_div_two{
        float: left;
        margin-left: 20px;
        height: 40px;
        line-height:40px;
        font-weight: bold;
      }
      .link{
        border: 1px solid #ececec;
        margin: 6px auto;
        border-radius: 2px;
        cursor:pointer;
        // text-indent:0.5rem;
      }
      `
  ]
})
export class ReTopComponent implements OnInit {

  @Input('tid') tid;

  nickname: string = '';
  date: string = '';
  parent: any[] = [];

  constructor(
    private ajaxService: AjaxService,
    private storeService: StoreService,
    private notification: NzNotificationService,
    private pageModuleService: PageModuleService
  ) { }

  ngOnInit() {
    this.getReanalysisParent();
  }

  //获取重分析前置任务
  getReanalysisParent() {
    this.ajaxService
      .getDeferData({
        url: `${config['javaPath']}/reAnalysis/getParent`,
        data: {
          tid: this.tid
        }
      })
      .subscribe(
        (data) => {
          if (data['status'] === '0') {
            this.date = data['data']['date'];
            this.nickname = data['data']['nickname'];
            this.parent = data['data']['parent'];
            console.log(this.parent)
          } else {
            this.date = '';
            this.nickname = '';
            this.parent = [];
          }
        }
      );
  }

  toDetail(data) {
    let type = '';
    if (data['reanalysisType'].indexOf('heatmap') != -1) {
      if (data['reanalysisType'] != 'heatmapRelation') {
        type = 'heatmap';
      } else {
        type = 'heatmapRelation';
      }
    } else {
      type = data['reanalysisType'];
    }

    let href = location.href.split('/report');

    if (type === 'enrichment') {
      window.open(
        `${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']['key']}/${data['isEdited']}/${data['date'].substring(0, 10)}`
      );
      // this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']}`);
    } else if (type === 'classification') {
      window.open(
        `${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']['key']}/${data['isEdited']}`
      );
    } else {
      window.open(
        `${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['isEdited']}`
      );
      // this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}`);
    }
  }

}
