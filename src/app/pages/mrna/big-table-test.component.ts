import { Component, OnInit,ViewChild } from "@angular/core";

@Component({
    selector: "app-big-table-test",
    templateUrl: "./big-table-test.component.html",
    styles: []
})
export class BigTableTestComponent implements OnInit {

    url:string = '';
    entity:object = {};
    tableId:string = '';
    tableHeight:number = 0;
    computedScrollHeight:boolean = false;
    
    @ViewChild('wrap') wrap;


    constructor() {
        this.url = `http://localhost:8086/filter`;
        this.entity = {
            LCID: sessionStorage.getItem("LCID"),
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            // matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            sortValue: null,
            sortKey: null, //排序
            rootSearchContentList: [],
            searchList: [],
        };
        this.tableId = "splice";
    }

    ngOnInit() {
        this.computedTableHeight();
    }

    ngAfterViewInit(){
        this.computedTableHeight();
    }

    computedTableHeight() {
		try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - 24;
            if(this.tableHeight===h) this.computedScrollHeight = true;
		} catch (error) {}


}
