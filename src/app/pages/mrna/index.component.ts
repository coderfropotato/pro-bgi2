import { Observable, fromEvent } from "rxjs";
import { StoreService } from "./../../super/service/storeService";
import { GlobalService } from "./../../super/service/globalService";
import { AjaxService } from "./../../super/service/ajaxService";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { MessageService } from "../../super/service/messageService";
import { NgxSpinnerService } from "ngx-spinner";
import config from "../../../config";
import { routeAnimation } from "../../super/animation/animation";
declare const window: any;
declare const $: any;
@Component({
    selector: "app-mrna-index",
    templateUrl: "./index.component.html",
    animations: [routeAnimation]
})
export class IndexComponent implements OnInit {
    menuList: any = [];
    allThead: any = [];
    ready: boolean = false;
    taskCount: number = 0;
    indexMenu: Object;

    routerState: boolean = true;
    routerStateCode: string = "active";
    constructor(
        private routes: ActivatedRoute,
        private router: Router,
        private message: MessageService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private ngxSpinnerService: NgxSpinnerService
    ) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.routerState = !this.routerState;
                this.routerStateCode = this.routerState ? "active" : "inactive";

                this.storeService.setNavigatedRoutes(this.router.url);
            }
        });
    }

    ngOnInit() {
        this.ngxSpinnerService.show();

        (async () => {
            try {
                await this.getLcInfo();
                // await this.getAddThead();
                await this.getMenuList();
                setTimeout(() => {
                    this.ngxSpinnerService.hide();
                }, 300);
            } catch (error) {}
        })();
    }

    async getLcInfo() {
        this.ajaxService
            .getDeferData({
                url: `${config["javaPath"]}/LCINFO/${sessionStorage.getItem(
                    "LCID"
                )}`
            })
            .subscribe(data => {
                if (data["status"] === "0") {
                    for (let key in data["data"]) {
                        this.storeService.setStore(key, data["data"][key]);
                    }
                }
            });
    }

    async getMenuList() {
        let LCID = sessionStorage.getItem("LCID");
        this.ajaxService
            .getDeferData({
                data: { LCID },
                url: "http://localhost:8086/menu"
            })
            .subscribe(data => {
                this.menuList = [
                    {
                        url: "layout1",
                        title: "布局1",
                        isExport: true
                    },
                    {
                        url: "layout2",
                        title: "布局2",
                        isExport: true
                    },
                    {
                        url: "diff",
                        title: "差异",
                        isExport: true
                    },
                    {
                        url: "venn",
                        title: "韦恩",
                        isExport: true
                    },
                    {
                        url: "littleTableTest",
                        title: "小表",
                        isExport: true
                    },
                    {
                        url: "transformationTable",
                        title: "transformation-table",
                        isExport: true
                    },
                    {
                        url: "bigTable",
                        title: "普通大表",
                        isExport: true
                    },
                    {
                        url: "table",
                        title: "GeneId 大表",
                        isExport: true
                    },
                    {
                        url: "net",
                        title: "网络图",
                        isExport: true
                    },
                    {
                        url: "addColumn",
                        title: "增删列",
                        isExport: true
                    },

                    {
                        url: "cxzk1",
                        title: "测序质控-1",
                        isExport: true
                    },
                    {
                        url: "cxzk2",
                        title: "图表切换demo",
                        isExport: true
                    },
                    {
                        url: "multiOmics",
                        title: "多组学",
                        isExport: true
                    }
                ];
            });
    }

    async getAddThead() {
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
            });
    }
}
