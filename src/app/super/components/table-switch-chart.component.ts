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

    @Input() isShowAccuracy: boolean;

    isShowTable: boolean = false;
    tableData: object;
    error: string;

    accuracyList: object[] = [];
    accuracy:number=-1;

    constructor(
        private ajaxService: AjaxService,
        private loadingService: LoadingService
    ) { }


    ngOnInit() {
        this.accuracyList=[
            {
                name:"精度：1位小数",
                value:1
            },
            {
                name:"精度：2位小数",
                value:2
            },
            {
                name:"精度：3位小数",
                value:3
            },
            {
                name:"精度：4位小数",
                value:4
            },
            {
                name:"精度：5位小数",
                value:5
            },
            {
                name:"精度：6位小数",
                value:6
            },
            {
                name:"精度：7位小数",
                value:7
            },
            {
                name:"精度：全数据",
                value:-1
            }
        ];
        this.getData();
    }

    getData() {
        this.loadingService.open("#" + this.id);
        this.ajaxService
            .getDeferData(
                {
                    url: this.url,
                    data: this.apiEntity
                }
            )
            .subscribe(
                (data: any) => {
                    if (data.length == 0 || data.rows.length == 0 || $.isEmptyObject(data)) {
                        this.error = "nodata";
                    } else if (data.Error) {
                        this.error = "error";
                    } else {
                        this.error = "";
                        this.tableData = data;
                    }
                    this.loadingService.close("#" + this.id);

                },
                error => {
                    this.loadingService.close("#" + this.id);
                    this.error = error;
                }
            )
    }

}
