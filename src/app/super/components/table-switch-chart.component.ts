import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-table-switch-chart',
    templateUrl: './table-switch-chart.component.html',
    styles: []
})
export class TableSwitchChartComponent implements OnInit {

    constructor() { }

    dataSet: any[] = [];
    ngOnInit() {
        for (var i = 0; i < 50; i++) {

            this.dataSet.push(
                {
                    name: "xf"+i,
                    age: i+1,
                    address: "addr"+i
                }
            );


        }
    }

}
