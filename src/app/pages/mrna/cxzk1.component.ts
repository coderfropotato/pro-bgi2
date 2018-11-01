import { AjaxService } from "src/app/super/service/ajaxService";
import { GlobalService } from "./../../super/service/globalService";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { MessageService } from "../../super/service/messageService";
import { ColorPickerService } from "ngx-color-picker";
import config from "../././../../config";

declare const d4: any;
declare const Venn: any;

@Component({
    selector: "app-cxzk1",
    templateUrl: "./cxzk1.component.html"
})
export class cxzk1Component implements OnInit {
    subscription: Subscription;

    // pagination test data
    total: number = 100000;
    pageSize: number = 10;
    pageIndex: number = 1;

    // preset colors
    presetColor: string[] = ["#fff", "#000"];

    @ViewChild("colorPickerTpl")
    colorPickerTpl;
    color: string = "#ccc";
    beforeColor: string = "#ccc";

    // tree test
    selectData = [];
    // 所有表格的头 带可组合字段
    theadMap: object = {
        category1: [],
        category2: [],
        category3: [],
        category4: [],
        "category1-compose1": ["category1", "compose1"],
        "category1-compose1-one": ["category1", "compose1", "one"],
        "category2-compose2": ["category2", "compose2"],
        "category3-compose3-thr": ["category3", "compose3", "thr"],
        "category3-compose3": ["category3", "compose3"],
        "category4-compose4-four": ["category4", "compose4", "four"],
        "category1-compose1-four-thr": ["category1", "compose1", "four", "thr"]
    };

    theadReflactMap = {};
    treeData = [
        {
            name: "category",
            key: "root",
            isExpand: false,
            isChecked: false,
            disabled: true,
            isRoot: true,
            children: [
                {
                    name: "category1",
                    key: "catogory1",
                    isChecked: false,
                    disabled: false,
                    children: [
                        {
                            name: "category2",
                            key: "category2",
                            isChecked: false,
                            disabled: false,
                            children: []
                        }
                    ]
                },
                {
                    name: "category3",
                    key: "category3",
                    isChecked: false,
                    disabled: false,
                    children: [
                        {
                            name: "category4",
                            key: "category4",
                            isChecked: false,
                            disabled: false,
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            name: "compose",
            key: "compose",
            isExpand: false,
            isChecked: false,
            disabled: true,
            isRoot: true,
            children: [
                {
                    name: "compose1",
                    key: "compose1",
                    isChecked: false,
                    disabled: false,
                    children: [
                        {
                            name: "compose3",
                            key: "compose3",
                            isChecked: false,
                            disabled: false,
                            children: []
                        },
                        {
                            name: "compose4",
                            key: "compose4",
                            isChecked: false,
                            disabled: false,
                            children: []
                        }
                    ]
                },
                {
                    name: "compose2",
                    key: "compose2",
                    isChecked: false,
                    disabled: false,
                    children: []
                }
            ]
        },
        {
            name: "type",
            key: "type",
            isExpand: false,
            isChecked: false,
            disabled: true,
            isRoot: true,
            children: [
                {
                    name: "one",
                    key: "one",
                    isChecked: false,
                    disabled: false,
                    children: [
                        {
                            name: "thr",
                            key: "thr",
                            isChecked: false,
                            disabled: false,
                            children: [
                                {
                                    name: "four",
                                    key: "four",
                                    isChecked: false,
                                    disabled: false,
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    // test venn table
    @ViewChild("geneTable")
    geneTable;
    pageEntity: object = {
        LCID: sessionStorage.getItem("LCID"),
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        compareGroup: ["a1", "b2"],
        searchList: [],
        rootSearchContentList: []
    };
    url: string = `${config["javaPath"]}/DiffVenn/table`;

    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message: MessageService,
        private globalService: GlobalService,
        private colorPickerService: ColorPickerService,
        private ajaxService: AjaxService
    ) {
        let browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|zh/) ? browserLang : "zh");
    }

    ngOnInit() {
        this.getVennData();

        //根据theadMap 生成theadReflactMap
        for (let key in this.theadMap) {
            if (this.theadMap[key].length) {
                this.theadMap[key].forEach((val, index) => {
                    if (val in this.theadReflactMap) {
                        this.theadReflactMap[val].push(key);
                    } else {
                        this.theadReflactMap[val] = [key];
                    }
                });
            }
        }
    }

    ngOnDestory() {}

    // test tree selectChange
    composeTheadChange(obj){
    }

    colorPickerTest() {
        this.globalService.openColorPicker(
            this.colorPickerTpl,
            () => {
                this.beforeColor = this.color;
                console.log(`confirm:${this.color}`);
            },
            () => {
                this.color = this.beforeColor;
                console.log(`cancel:${this.color}`);
            }
        );
    }

    sizeChange() {
        console.log(this.pageSize);
        this.pageIndex = 1;
    }

    changeTotal() {
        this.total = 10;
        this.pageIndex = 1;
    }

    indexChange() {
        console.log(this.pageIndex);
    }

    // venn test
    getVennData() {
        this.ajaxService
            .getDeferData({
                url: `${config["javaPath"]}/DiffVenn/graph`,
                data: {
                    path: "aisdb0001.gene_diff",
                    from: 0,
                    size: 1000000,
                    LCID: "demo",
                    FDR: 0.001,
                    log2FC: 1.01,
                    compareGroup: [
                        "A1-vs-B1",
                        "A1-vs-C1",
                        "B1-vs-C1",
                        "B2-vs-A2",
                        "C2-vs-A2",
                        "C2-vs-B2"
                    ]
                }
                // data: {
                //     path: "aisdb0001.gene_diff",
                //     from: 0,
                //     size: 1000000,
                //     FDR: 0.001,
                //     log2FC: 1.0,
                //     LCID: sessionStorage.getItem("LCID"),
                //     compareGroup: ["A1-vs-B1", "A1-vs-C1"]
                // }
            })
            .subscribe(
                data => {
                    console.log(data);
                },
                error => {
                    console.log(error);
                }
            );
    }

    drawVenn(data) {
        let oVenn = new Venn({ id: "venn-chart" })
            .config({
                data: data,
                compareGroup: this.pageEntity["sample"]
            })
            .drawVenn();
    }

    selectOneChange() {
        this.geneTable._setParamsOfEntity(
            "compareGroup",
            this.pageEntity["compareGroup"]
        );
    }
}
