import { AjaxService } from 'src/app/super/service/ajaxService';
import { Component, OnInit } from "@angular/core";
import config from '../../../config';
declare const Venn:any;
@Component({
    selector: "app-venn-component",
    templateUrl: "./venn.component.html",
    styles: []
})
export class VennComponent implements OnInit {
    // 图表切换
    tableUrl: string;
    chartUrl: string;
    tableEntity: object = {
        "LCID": sessionStorage.getItem("LCID"),
        "sample": "",
        "compare": ""
    };

    sampleList: string[] = [];
    compareList: string[] = [];

    chart: any;
    isMultiSelect: boolean;
    selectedData:object[]=[];

    // 大表
    pageEntity:object = {
        pageSize:10,
        pageIndex:1,
        addThead:[],
        searchList:[],
        rootSearchContentList:[],
        sortKey:"",
        sortValue:"",
        sample:["A1","B1"]
    }
    url = `${config["javaPath"]}/DiffVenn/table`;

    constructor(
        private ajaxService:AjaxService
    ) {}

    ngOnInit() {
        this.isMultiSelect = false;
        this.tableUrl = `${config["javaPath"]}/DiffVenn/table`;
        this.chartUrl = `${config["javaPath"]}/DiffVenn/graph`;

        this.sampleList = ["HBRR1", "HBRR2", "HBRR3", "HBRR4", "uBRR1", "uBRR2", "uBRR3", "uBRR4"];
        this.compareList = ["com1", "com2", "com3", "com4", "compare1", "compare2", "compare3", "compare4"];

        this.tableEntity['sample'] = this.sampleList[0];
        this.tableEntity["compare"] = this.compareList[0];

        this.getVennData();
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
}
