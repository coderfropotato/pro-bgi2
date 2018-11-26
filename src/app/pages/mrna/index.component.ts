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
                await this.getAddThead();
                await this.getMenuList();
                this.ready = true;
                setTimeout(() => {
                    this.ngxSpinnerService.hide();
                }, 300);
            } catch (error) {}
        })();
    }

    async getLcInfo() {
        return new Promise((resolve, reject) => {
            this.ajaxService
                .getDeferData({
                    url: `${config["javaPath"]}/LCINFO/${sessionStorage.getItem(
                        "LCID"
                    )}`
                })
                .subscribe(
                    data => {
                        if (data["status"] === "0") {
                            for (let key in data["data"][0]) {
                                this.storeService.setStore(
                                    key,
                                    data["data"][0][key]
                                );
                            }
                        }
                        resolve("success");
                    },
                    () => reject("error")
                );
        });
    }

    async getMenuList() {
        return new Promise((resolve, reject) => {
            let LCID = sessionStorage.getItem("LCID");
            this.ajaxService
                .getDeferData({
                    data: { LCID },
                    url: "http://localhost:8086/menu"
                })
                .subscribe(
                    data => {
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
                                category: "表达量",
                                children: [
                                    {
                                        url: "express-venn",
                                        name: "表达量venn",
                                        isExport: true
                                    }
                                ]
                            },
                            {
                                category: "差异",
                                children: [
                                    {
                                        url: "diff-venn",
                                        name: "差异venn",
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
                                        url: "bigTable",
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
                        resolve("success");
                    },
                    () => {
                        reject("error");
                    }
                );
        });
    }

    async getAddThead() {
        return new Promise((resolve, reject) => {
            let LCID = sessionStorage.getItem("LCID");
            this.ajaxService
                .getDeferData({
                    data: {},
                    url: `${config['javaPath']}/addColumn/${LCID}`
                })
                .subscribe(
                    data => {
                        this.allThead = data['data'];
                        this.storeService.setThead(this.allThead);
                        resolve("success");
                    },
                    () => reject("error")
                );
        });
    }
}
