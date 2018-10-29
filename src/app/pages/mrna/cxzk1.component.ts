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
    selectData = ["root1"];
    treeData = [
        {
            name: "root1",
            key: "root",
            isExpand: false,
            isChecked: false,
            disabled:false,
            children: [
                {
                    name: "leaf-one",
                    key: "leaf",
                    isChecked: false,
                    disabled:false,
                    children: []
                },
                {
                    name: "leaf-two",
                    key: "leaf",
                    isChecked: false,
                    disabled:false,
                    children: []
                }
            ]
        },
        {
            name: "root2",
            key: "root",
            isExpand: false,
            isChecked: false,
            disabled:false,
            children: [
                {
                    name: "leaf-thr",
                    key: "leaf",
                    isExpand: false,
                    isChecked: false,
                    disabled:false,
                    children: [
                        {
                            name: "last-leaf",
                            key: "last-leaf",
                            isExpand: false,
                            isChecked: false,
                            disabled:false,
                            children: [
                                {
                                    name: "test-last-leaf",
                                    key: "tets-last-leaf",
                                    isChecked: false,
                                    disabled:false,
                                    children: []
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "leaf-four",
                    key: "leaf",
                    isChecked: false,
                    disabled:false,
                    children: []
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
    }

    ngOnDestory() {}

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
