import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/app/super/service/ajaxService';

@Component({
    selector: 'app-cluster',
    templateUrl: './cluster.component.html'
})

export class clusterComponent implements OnInit {
    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.ajaxService
            .getDeferData({
                url: 'http://localhost:8086/cluster',
                data: {}
            })
            .subscribe(
                (data: any) => {
                    this.drawCluster(data);
                    console.log(data)
                }
            )
    }

    drawCluster(data) {

    }
}
