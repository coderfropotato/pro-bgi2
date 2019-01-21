import { AddColumnService } from './../../super/service/addColumnService';
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
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

// import {OuterDataBaseService} from './../../super/service/outerDataBaseService';

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
        private ngxSpinnerService: NgxSpinnerService,
        private addColumnService:AddColumnService,
        private modalService:NzModalService
        // private outerDataBaseService:OuterDataBaseService
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
                //await this.getMenuList();
                this.ready = true;
                setTimeout(() => {
                    this.ngxSpinnerService.hide();
                }, 300);
            } catch (error) {
                this.ngxSpinnerService.hide();
                let tpl = this.modalService.error({
                    nzTitle: '系统错误',
                    nzContent: '缺少必要信息，请重新登录',
                    nzClosable: false,
                    nzOnCancel:()=>{
                        tpl.destroy();
                    },
                    nzOnOk: () => {
                        this.router.navigate([`/report/login`])
                    }
                  });
            }
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
                            for (let key in data["data"]) {
                                this.storeService.setStore(
                                    key,
                                    data["data"][key]
                                );
                                if(typeof data["data"][key]!=='object'){
                                    sessionStorage.setItem(key,data["data"][key]);
                                }else{
                                    sessionStorage.setItem(key,JSON.stringify(data["data"][key]));
                                }
                            }

                            this.storeService.setStore('LCTYPE','mrna');

                            //this.menuList = data["data"].menu_list;
                            this.menuList = [
                                {
                                    category: "基础模块",
                                    children: [
                                        {
                                            url: "pro-overview",
                                            name: "项目概况",
                                            isExport: true
                                        },
                                        {
                                            url: "ref-information",
                                            name: "参考信息",
                                            isExport: true
                                        },
                                        {
                                            url: "reads-filter",
                                            name: "Reads过滤",
                                            isExport: true
                                        },
                                        {
                                            url: "reads-comparison",
                                            name: "Reads比对",
                                            isExport: true
                                        },
                                        {
                                            url: "rna-detection",
                                            name: "小RNA检测",
                                            isExport: true
                                        },
                                        {
                                            url: "help",
                                            name: "帮助",
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
                                }
                            ];
                            resolve("success");
                        }else{
                            reject('error');
                        }
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
                    url:`${config['javaPath']}/menu`
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
                                category: "GO富集",
                                children: [
                                    {
                                        url: "goRich",
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
                        // window.location.replace(url);
                        resolve("success");
                    },
                    () => {
                        reject("error");
                    }
                );
        });
    }


    // async getAddThead() {
    //     return new Promise((resolve, reject) => {
    //         let LCID = sessionStorage.getItem("LCID");
    //         this.ajaxService
    //             .getDeferData({
    //                 data: {},
    //                 url: `${config['javaPath']}/addColumn/${LCID}`
    //             })
    //             .subscribe(
    //                 data => {
    //                     if(data['status']==='0'){
    //                         let d = data['data'];
    //                         // let outerFlag = "006";
    //                         // let outerDataBase;

    //                         d.forEach((val,index)=>{
    //                             if(val['category']===config['outerDataBaseIndex']){
    //                                 // outerDataBase = d.splice(index,1)[0];
    //                                 val['children'].forEach(v=>{
    //                                     if(!('children' in v)) v['children'] = [];
    //                                     v['modalVisible'] = false;
    //                                     v['children'].forEach(item=>{
    //                                         this.initTreeData(item['treeData']);
    //                                     })
    //                                 })
    //                             }
    //                         })

    //                         // this.storeService.setThead(d);
    //                         this.addColumnService.set(d);
    //                         // outerDataBase['children'].forEach(v=>{
    //                         //     v['children'].forEach((val,index)=>{
    //                         //         val['generatedThead'] = [];
    //                         //         this.initTreeData(val['treeData']);
    //                         //     })
    //                         // });
    //                         // this.outerDataBaseService.set(outerDataBase);
    //                         resolve("success");
    //                     }else{
    //                         reject('error');
    //                     }
    //                 },
    //                 () => reject("error")
    //             );
    //     });
    // }

    // // 初始化 增删列树节点数据
    // initTreeData(treeData){
    //     if (!treeData || !treeData.length) return;
    //     let stack = [];
    //     for (var i = 0, len = treeData.length; i < len; i++) {
    //         stack.push(treeData[i]);
    //     }
    //     let item;
    //     while (stack.length) {
    //         item = stack.shift();

    //         if(item['isRoot']) item['isExpand'] = true;
    //         item['isExpand'] = true;
    //         item['isChecked'] = false;
    //         item['disabled'] = false;

    //         if (item.children && item.children.length) {
    //             stack = stack.concat(item.children);
    //         }
    //     }
    // }
}
