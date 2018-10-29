import { Component, OnInit } from '@angular/core'
import { AjaxService } from 'src/app/super/service/ajaxService';

declare const d3:any;

@Component({
    selector: 'app-multiOmics',
    templateUrl: './multiOmics.component.html'
})

export class multiOmicsComponent implements OnInit {
    constructor(
        private ajaxService :AjaxService
    ){}

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.ajaxService
            .getDeferData(
                {
                    url: "http://localhost:8086/multiOmics",
                    data: {}
                }
            )
            .subscribe(
                (data: any) => {
                    this.drawChart(data);
                },
                error => {
                    console.log(error);
                }
            )
    }

    drawChart(data){
        d3.select("#multiOmicsSvg").selectAll("g").remove();
    }
}
