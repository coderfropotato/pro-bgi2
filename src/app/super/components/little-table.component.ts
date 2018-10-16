import { Component, OnInit, Input } from "@angular/core";
import { AjaxService } from "../../super/service/ajaxService";
import { LoadingService } from "../../super/service/loadingService";
@Component({
    selector: "app-little-table",
    templateUrl: "./little-table.component.html",
    styles: []
})
export class LittleTableComponent implements OnInit {
    @Input()
    url: string;

    tableData: object;
    rows: any[] = [];
    thead: any[] = [];
    constructor(
        private ajaxService: AjaxService,
        private loadingService: LoadingService
    ) {}

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.loadingService.open(".little-table");
        this.ajaxService
            .getDeferData({
                url: this.url,
                data: {
                    LCID: sessionStorage.getItem("LCID")
                }
            })
            .subscribe(
                data => {
                    this.loadingService.close(".little-table");
                    this.tableData = data;
                    this.rows = data["rows"];
                    this.thead = data["baseThead"];
                },
                error => {
                    this.loadingService.close(".little-table");
                    console.log(error);
                }
            );
    }

    refresh() {
        this.getData();
    }
}
