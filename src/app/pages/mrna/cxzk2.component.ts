import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: "app-cxzk2",
    templateUrl: "./cxzk2.component.html"
})

export class cxzk2Component implements OnInit {
    @ViewChild('tableSwitchChart') tableSwitchChart;

    url: string;
    tableEntity: object = {
        "LCID": sessionStorage.getItem("LCID"),
        "sample": "",
        "compare": ""
    };

    sampleList: string[] = [];
    compareList: string[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.url = "http://localhost:8086/tableSwitchChart";

        this.sampleList=["HBRR1", "HBRR2", "HBRR3", "HBRR4", "uBRR1", "uBRR2", "uBRR3", "uBRR4"];
        this.compareList=["com1", "com2", "com3", "com4", "compare1", "compare2", "compare3", "compare4"];

        this.tableEntity['sample'] = this.sampleList[0];
        this.tableEntity["compare"] = this.compareList[0];
    }

    onSelectChange1() {
        this.tableSwitchChart.SelectChange('sample', this.tableEntity["sample"]);
    }

    onSelectChange2(){
        this.tableSwitchChart.SelectChange('compare', this.tableEntity["compare"]);
    }

}

