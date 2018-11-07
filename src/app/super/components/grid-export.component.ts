import { AjaxService } from "./../service/ajaxService";
import { Component, OnInit, Input } from "@angular/core";
declare const $:any;
@Component({
    selector: "app-grid-export",
    template: `<i class="anticon anticon-download" [nzTitle]="'tableButton.download' | translate" nz-tooltip (click)="download()"></i>`,
    styles: []
})
export class GridExportComponent implements OnInit {
    // 查询表格的api
    @Input() url: string;
    // 表格的查询参数
    @Input() tableEntity: object;
    // 表格的下载名称
    @Input() fileName: any;
    

    constructor(private ajaxService: AjaxService) {}

    ngOnInit() {}


    download() {
        let entity = $.extend(true,{},this.tableEntity);
        entity["isExport"] = true;
        entity["fileName"] = this.fileName || '表格下载';

        this.ajaxService
            .getDeferData({
                url: this.url,
                data: entity
            })
            .subscribe(
                data => {},
                error => {
                    console.log(error);
                }
            );
    }
}
