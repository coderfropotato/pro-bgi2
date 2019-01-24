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
  selector: 'app-lrna',
  templateUrl: './lrna.component.html',
  styles: []
})
export class LrnaComponent implements OnInit {
  // table one
  defaultEntity: object;
  defaultUrl: string;
  defaultTableId: string;

  tableHeight = 450;

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
    //5.1 小RNA数量
    this.defaultUrl = `${config["javaPath"]}/basicModule/smallRNAStat`;
    this.defaultEntity = {
        LCID: "DEMO_TOM_APDENOVO",
        pageNum: 1,
        pageSize: 10
    };

    
  }

}
