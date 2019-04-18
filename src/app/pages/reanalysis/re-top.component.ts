import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from './../../super/service/promptService';
import config from '../../../config';
declare const d3: any;
declare const d4: any;
declare const Venn: any;

@Component({
  selector: 'app-re-top',
  templateUrl: './re-top.component.html'
})
export class ReTopComponent implements OnInit {

  @Input('tid') tid;

  nickname: string = '';
  date: string = '';
  parent: any[] = [];

  constructor(
    private ajaxService: AjaxService,
    private message: MessageService,
		private globalService: GlobalService,
		public storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private promptService: PromptService,
		private addColumnService: AddColumnService,
		private router: Router
  ) { }

  ngOnInit() {
    this.getReanalysisParent();

    // let tipText = `Group: ${bar_name[i]}<br> Number:  ${d}`;
    // _self.globalService.showPopOver(d3.event, tipText,"left");
    
    //_self.globalService.hidePopOver();
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

  // reMouseOver(){
  //   let tipText = `任务名称: ${this.nickname}<br>创建时间:  ${this.date}`;
  //   this.globalService.showPopOver(d3.event, tipText);
  // }

  // reMouseOut(){
  //   this.globalService.hidePopOver();
  // }


}
