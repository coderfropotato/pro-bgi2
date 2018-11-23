import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";

declare const $: any;

@Component({
    selector: "app-clusterSet",
    templateUrl: "./clusterSet.component.html",
    styles: []
})
export class ClusterSetComponent implements OnInit {
    isShowSetPanel:boolean=false;

    constructor(
        private ajaxservice: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {}

    setClick(){

    }
}
