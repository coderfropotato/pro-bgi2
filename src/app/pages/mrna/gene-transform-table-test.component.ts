import { Component, OnInit } from "@angular/core";

@Component({
    selector: "app-gene-transform-table-test",
    templateUrl: "./gene-transform-table-test.component.html",
    styles: []
})
export class GeneTransformTableTestComponent implements OnInit {
	defaultTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        indexName:"gene",
        isMatchAll: false,
        rootSearchContentList: [],
        geneListId: null
    };
    defaultTableUrl:string = "http://localhost:8086/filter";
    defaultTableId:string = 'transformation-table-default';
    defaultTableDefaultChecked:boolean = true;

    extendTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        indexName:"gene",
        isMatchAll: false,
        rootSearchContentList: [],
        geneListId: null
    };
    extendTableUrl:string = "http://localhost:8086/tableReverse";
    extendTableId:string = 'transformation-table-extendTable';
    extendTableDefaultChecked:boolean = true;

    constructor() {}

    ngOnInit() {}
}
