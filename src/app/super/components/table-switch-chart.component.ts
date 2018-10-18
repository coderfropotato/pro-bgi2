import { Component, OnInit, Input } from '@angular/core';
import { AjaxService } from "../../super/service/ajaxService";
import { LoadingService } from "../../super/service/loadingService";

@Component({
    selector: 'app-table-switch-chart',
    templateUrl: './table-switch-chart.component.html',
    styles: []
})
export class TableSwitchChartComponent implements OnInit {
    @Input() url: string;
    @Input() apiEntity: object;
    @Input() id: string;

    isShowTable: boolean = false;
    tableData: object;

    constructor(
        private ajaxService: AjaxService,
        private loadingService: LoadingService
    ) { }


    ngOnInit() {
        this.getData();
    }

    getData() {
        this.loadingService.open("#"+this.id);
        this.ajaxService
            .getDeferData(
                {
                    url: this.url,
                    data: this.apiEntity
                }
            )
            .subscribe(
                data => {
                    this.loadingService.close("#"+this.id);
                    this.tableData = data;
                },
                error => {
                    this.loadingService.close("#"+this.id);
                    console.log(error);
                }
            )
    }

}
