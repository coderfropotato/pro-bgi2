import { StoreService } from "../../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { GlobalService } from "src/app/super/service/globalService";
import config from "../../../../config";
import {PromptService} from '../../../super/service/promptService';
import { MessageService } from '../../../super/service/messageService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styles: []
})
export class OverviewComponent implements OnInit {
  // table one
  defaultUrl: string;

  defaultUrlTwo: string;

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

  }

}
