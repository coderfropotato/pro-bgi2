import { LoadingService } from './../service/loadingService';
import { AjaxService } from './../service/ajaxService';
import { Component, OnInit, Input } from '@angular/core';
declare const $: any;
@Component({
	selector: 'app-grid-export',
	template: `<i class="iconfont icon-xiazai" [nzTitle]="'tableButton.download' | translate" nz-tooltip (click)="download()"></i>`,
	styles: []
})
export class GridExportComponent implements OnInit {
	// 查询表格的api
	@Input() url: string;
	// 表格的查询参数
	@Input() tableEntity: object;
	// 表格的下载名称
	@Input() fileName: any;

	constructor(private ajaxService: AjaxService,private loadingService:LoadingService) {}

	ngOnInit() {}

	download() {
		let entity = $.extend(true, {}, this.tableEntity);
		entity['isExport'] = true;
		entity['fileName'] = this.fileName || new Date().getTime();

        this.loadingService.open('body','正在导出表格，请稍后...')
        setTimeout(()=>{
            this.loadingService.close();
        },2000)
		this.ajaxService
			.getDeferData({
				url: this.url,
				data: entity
			})
			.subscribe(
				(data) => {},
				(error) => {
					console.log(error);
				}
			);
	}
}
