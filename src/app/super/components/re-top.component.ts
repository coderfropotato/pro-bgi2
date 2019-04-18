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
      }
      .re_div_one{
        float: left;
        max-width: 300px;
        height: 40px;
        line-height:40px;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .re_div_two{
        float: left;
        margin-left: 10px;
        height: 40px;
        line-height:40px;
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
    private pageModuleService:PageModuleService
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
          } else {
            this.date = '';
            this.nickname = '';
            this.parent = [];
          }
        }
      );
  }
}
