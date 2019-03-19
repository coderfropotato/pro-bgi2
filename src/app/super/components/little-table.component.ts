import { Component, OnInit, Input } from "@angular/core";
import { AjaxService } from "../../super/service/ajaxService";
import { LoadingService } from "../../super/service/loadingService";

declare const $: any;

@Component({
    selector: "app-little-table",
    templateUrl: "./little-table.component.html",
    styles: []
})
export class LittleTableComponent implements OnInit {
    @Input() url: string;
    @Input() pageEntity: object;
    @Input() inRefreshShow: boolean = true;

    tableError: string;

    isLoading: boolean = false;

    tableData: any[] = [];
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
        this.isLoading = true;
        this.ajaxService
            .getDeferData({
                url: this.url,
                data: this.pageEntity
            })
            .subscribe(
                (data: any) => {
                    if (data.status == "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.tableError = "nodata";
                    } else if (data.status == "-1") {
                        this.tableError = "error";
                    } else if (data.status == "-2") {
                        this.tableError = "dataOver";
                    } else {
                       this.tableError = "";
                       this.tableData = data.data;
                       this.rows = data["rows"];
                       this.thead = data["baseThead"];
                    }
                    this.isLoading = false;
                    //console.log(data)

                },
                error => {
                    this.tableError = error;
                    this.isLoading = false;
                }
            );
    }

    refresh() {
        this.getData();
    }

    down(){

    }
}
