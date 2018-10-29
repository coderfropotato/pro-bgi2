import { StoreService } from "./../../super/service/storeService";
import { GlobalService } from "./../../super/service/globalService";
import { AjaxService } from "./../../super/service/ajaxService";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../../super/service/messageService";
import config from "../../../config";

@Component({
    selector: "app-mrna-index",
    templateUrl: "./index.component.html"
})
export class IndexComponent implements OnInit {
    menuList: any = [];
    allThead: any = [];
    ready: boolean = false;
    taskCount: number = 0;
    constructor(
        private routes: ActivatedRoute,
        private router: Router,
        private message: MessageService,
        private ajaxService: AjaxService,
        private storeService: StoreService
    ) {}

    ngOnInit() {
        this.getMenuList();
        this.getAddThead();
    }

    getMenuList() {
        let LCID = sessionStorage.getItem("LCID");
        this.ajaxService
            .getDeferData({
                data: { LCID },
                url: "http://localhost:8086/menu"
            })
            .subscribe(data => {
                this.menuList = [
                    {
                        url: "mrna/littleTableTest",
                        title: "小表",
                        isExport: true
                    },
                    {
                        url: "mrna/transformationTable",
                        title: "transformation-table",
                        isExport: true
                    },
                    {
                        url: "mrna/bigTable",
                        title: "普通大表",
                        isExport: true
                    },
                    {
                        url: "mrna/table",
                        title: "GeneId 大表",
                        isExport: true
                    },
                    {
                        url: "mrna/net",
                        title: "网络图",
                        isExport: true
                    },
                    {
                        url: "mrna/addColumn",
                        title: "增删列",
                        isExport: true
                    },

                    {
                        url: "mrna/cxzk1",
                        title: "测序质控-1",
                        isExport: true
                    },
                    {
                        url: "mrna/cxzk2",
                        title: "图表切换demo",
                        isExport: true
                    },
                    {
                        url: "mrna/multiOmics",
                        title: "多组学",
                        isExport: true
                    },
                ];
                this.taskCount++;
                this.computedReadyStatus();
            });
    }

    getAddThead() {
        let LCID = sessionStorage.getItem("LCID");
        this.ajaxService
            .getDeferData({
                data: { LCID },
                url: "http://localhost:8086/addThead"
            })
            .subscribe(data => {
                this.allThead = [
                    {
                        category: "基因属性",
                        children: [
                            { name: "Other Gene ID" },
                            { name: "Transcript" },
                            { name: "Gene Type" },
                            { name: "Transcripts Number" },
                            { name: "Start" }
                        ]
                    },
                    {
                        category: "样本表达量",
                        children: [
                            { name: "HepG2con1" },
                            { name: "HepG2con2" },
                            { name: "HepG2con3" },
                            { name: "Huh7con1" }
                        ]
                    },
                    {
                        category: "注释",
                        children: [
                            { name: "TFs" },
                            { name: "Kegg Orthology" },
                            { name: "GO" }
                        ]
                    }
                ];
                this.storeService.setThead(this.allThead);
                this.taskCount++;
                this.computedReadyStatus();
            });
    }

    computedReadyStatus() {
        this.ready = this.taskCount == 2;
        if (this.ready) {
            window.location.href.split('/report')
            let url = window.location.href.split('/report')[0]+'/report/mrna/multiOmics';
            window.location.replace(url);
        }
    }
}
