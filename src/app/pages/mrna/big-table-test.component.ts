import { Component, OnInit,ViewChild } from "@angular/core";

@Component({
    selector: "app-big-table-test",
    templateUrl: "./big-table-test.component.html",
    styles: []
})
export class BigTableTestComponent implements OnInit {
    @ViewChild('bigTable') bigTable;
    pageEntity: object = {
        sample:"bsa"
    };
    constructor() {}

    ngOnInit() {}

    selectChange(){
        this.bigTable._setParamsOfEntity('sample',this.pageEntity['sample']);
    }
}
