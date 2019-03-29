import config from 'src/config';
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

	constructor(private ajaxService: AjaxService, private loadingService: LoadingService) {}

	ngOnInit() {}

	download() {
		let entity = $.extend(true, {}, this.tableEntity);
		entity['isExport'] = true;
		entity['fileName'] = this.fileName || new Date().getTime();

		this.loadingService.open('body', '正在导出表格，请稍后...');

		this.ajaxService
			.getDeferData({
				url: this.url,
				data: entity
			})
			.subscribe(
				(data) => {
					if (data['status'] == "0") {
						let key_info = data['data']['key_info'];
						let actionStr = `${config['javaPath']}/CsvDownload`;
						let formID = this.fileName + '_exportform';
						let exportFormObj = null;
						let formJson = null;
						let formJsonID = this.fileName + '_exportformJson';

						exportFormObj = $('<form></form>');
						$(exportFormObj).attr('id', formID);
						$(exportFormObj).attr('method', 'post');
						$(exportFormObj).attr('target', '_parent');
						$(exportFormObj).attr('enctype', 'application/x-www-form-urlencoded');
						$(exportFormObj).attr('accept', 'application/octet-stream');

						formJson = document.createElement('input');
						$(formJson).attr('type', 'hidden');
						$(formJson).attr('id', formJsonID);
						$(formJson).attr('class', 'formJson');
						$(formJson).attr('name', 'key_info');
						$(exportFormObj).append(formJson);

						$(formJson).val(key_info);

						$(exportFormObj).attr('action', actionStr);
						$('body').append(exportFormObj);
						$(exportFormObj).submit();
                        $(exportFormObj).remove();

						this.loadingService.close();
					}
				},
				(error) => {
					console.log(error);
				}
			);
	}
}
