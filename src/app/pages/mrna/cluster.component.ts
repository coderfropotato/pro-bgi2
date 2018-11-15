import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/app/super/service/ajaxService';

@Component({
    selector: 'app-cluster',
    templateUrl: './cluster.component.html'
})

export class clusterComponent implements OnInit {
    chartUrl: string;
    chartEntity: object;

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.chartUrl = 'http://localhost:8086/cluster';
        this.chartEntity = {
            "LCID": sessionStorage.getItem('LCID')
        }
    }

    drawChart(data) {
        console.log(data);
    }
}
