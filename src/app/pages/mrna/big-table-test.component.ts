import { Component, OnInit,ViewChild } from "@angular/core";

@Component({
    selector: "app-big-table-test",
    templateUrl: "./big-table-test.component.html",
    styles: []
})
export class BigTableTestComponent implements OnInit {
    url:string = 'http://localhost:8086/filter';

    constructor() {}

    ngOnInit() {}


}
