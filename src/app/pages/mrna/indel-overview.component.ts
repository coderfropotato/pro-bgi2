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


@Component({
  selector: 'app-indel-overview',
  templateUrl: './indel-overview.component.html',
  styles: []
})
export class IndelOverviewComponent implements OnInit {
  @ViewChild('defaultIndelTable') defaultIndelTable;
  @ViewChild('right') right;

  switch = 'left';
  // table
  defaultTableEntity: object;
  defaultTableUrl: string;
  defaultTableId: string;
  defaultTableChecked: boolean;
  defaultCheckStatusInParams: boolean;
  baseThead: any[] = [];

  tableHeight = 0;
  computedScrollHeight: boolean = false;

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
      this.defaultTableUrl = `${config["javaPath"]}/alternativeSplice/tableIndel`;
      this.defaultTableEntity = {
          LCID: sessionStorage.getItem("LCID"),
          pageIndex: 1, //分页
          pageSize: 20,
          sortValue: null,
          sortKey: null, //排序
          searchList: [],
          geneType: "gene", //基因类型gene和transcript
          species: this.storeService.getStore("genome"), //物种
          checkStatus: true,
          checked: [],
          unChecked: [],
      };
      this.defaultTableId = 'indel_default_overview';
      this.defaultTableChecked = true;
      this.defaultCheckStatusInParams = true;
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
			// try {
			// 	this.switchChart.scrollHeight();
			// } catch (e) {}
			this.computedTableHeight();
		}, 320);
	}

}
