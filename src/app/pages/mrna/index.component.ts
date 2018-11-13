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
                        category: "布局一",
                        children: [
                            {
                                url: "layout1",
                                name: "布局页面",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "布局二",
                        children: [
                            {
                                url: "layout2",
                                name: "布局页面",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "差异基因",
                        children: [
                            {
                                url: "diff",
                                name: "差异",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "韦恩图",
                        children: [
                            {
                                url: "venn",
                                name: "韦恩",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "小表_demo",
                        children: [
                            {
                                url: "littleTableTest",
                                name: "小表",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "表格转换_demo",
                        children: [
                            {
                                url: "transformationTable",
                                name: "transformation-table",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "普通大表_demo",
                        children: [
                            {
                                url: "littleTableTest",
                                name: "普通大表",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "基因表_demo",
                        children: [
                            {
                                url: "table",
                                name: "GeneId 大表",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "网络图_demo",
                        children: [
                            {
                                url: "net",
                                name: "网络图",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "增删列_demo",
                        children: [
                            {
                                url: "addColumn",
                                name: "增删列",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "测序质控_demo",
                        children: [
                            {
                                url: "cxzk1",
                                name: "测序质控",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "图标切换_demo",
                        children: [
                            {
                                url: "cxzk2",
                                name: "图表切换",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "多组学_demo",
                        children: [
                            {
                                url: "multiOmics",
                                name: "多组学",
                                isExport: true
                            }
                        ]
                    },
                    {
                        category: "聚类_demo",
                        children: [
                            {
                                url: "cluster",
                                name: "聚类",
                                isExport: true
                            }
                        ]
                    }
                ];

                //动态跳第一个页面
                // let url = window.location.href.split('/report')[0]+`/report/mrna/${this.menuList[0]['children'][0]['url']}`;
                // window.location.replace(url)
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
