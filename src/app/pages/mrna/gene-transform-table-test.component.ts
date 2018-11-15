import { Component, OnInit } from "@angular/core";
import config from "../../../config";
@Component({
    selector: "app-gene-transform-table-test",
    templateUrl: "./gene-transform-table-test.component.html",
    styles: []
})
export class GeneTransformTableTestComponent implements OnInit {
    defaultTableEntity: object = {
        LCID:sessionStorage.getItem('LCID'),
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        removeColumns: [],
        addThead: {},
        transform: false,
        mongoId: null,
        chartType: null, // matrix
        relations: [],
        geneType: "gene", // 表格类型
        species: "aisdb",
        diffThreshold: {
            PossionDis: {
                log2FC: 1.0,
                FDR: 0.001
            }
        },
        compareGroup: ["A1-vs-C1","C2-vs-A2","A1-vs-B1"],
        rootSearchContentList: []
    };
    defaultTableUrl: string = `${config["javaPath"]}/Venn/diffGeneTable`;
    defaultTableId: string = "transformation-table-default";
    defaultTableDefaultChecked: boolean = true;
    defaultTableCheckStatusInParams = true;

    extendTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        indexName: "gene",
        isMatchAll: false,
        rootSearchContentList: [],
        connects: [],
        geneListId: null
    };
    extendTableUrl: string = "http://localhost:8086/tableReverse";
    extendTableId: string = "transformation-table-extendTable";
    extendTableDefaultChecked: boolean = true;
    extendTableCheckStatusInParams = true;
    constructor() {}

    ngOnInit() {}
}
