import { NzMessageService } from 'ng-zorro-antd';
import config from 'src/config';
import { LoadingService } from './../service/loadingService';
import { AjaxService } from './../service/ajaxService';
import { Component, OnInit, Input } from '@angular/core';

declare const $: any;
@Component({
	selector: 'app-grid-export',
	template: `<button nz-button [class.disabled]="disabled" [nzTitle]="(disabled ? 'tableButton.overDownload' : 'tableButton.download') | translate" nz-tooltip (click)="download()"><i class="iconfont icon-xiazai"></i></button>`,
	styles: [
		`
		button{
			height: 20px;
			line-height: 17px;
			background: #f7f7f8;
			border: none;
			padding-left: 0px !important;
			padding-right: 0px !important;
		}
		`
	]
})
export class GridExportComponent implements OnInit {
	// 查询表格的api
	@Input() url: string;
	// 表格的查询参数
	@Input() tableEntity: object;
	// 表格的下载名称
	@Input() fileName: any;
	@Input() disabled:boolean;

	constructor(
		private ajaxService: AjaxService,
		private loadingService: LoadingService,
		private messageService:NzMessageService
		) {}

	ngOnInit() {}

	download() {
		if(this.disabled){
			return;
		}
		let entity = $.extend(true, {}, this.tableEntity);
		entity['isExport'] = true;
		entity['fileName'] = ''+(this.fileName || new Date().getTime());

		this.loadingService.open('body', '正在导出表格，请稍后...');

		this.ajaxService
			.getDeferData({
				url: this.url,
				data: entity
			})
			.subscribe(
				(data) => {
					if (data['status'] == "0" && data['data']['key_info']) {
						let key_info = data['data']['key_info'];
						let actionStr = `${config['javaPath']}/CsvDownload`;
						let formID = this.fileName + '_exportform';
						let exportFormObj = null;
						let formJson = null;
						let formJsonID = this.fileName + '_exportformJson';

						exportFormObj = $('<form></form>');
						$(exportFormObj).attr('id', formID);
						$(exportFormObj).attr('method', 'post');
						$(exportFormObj).attr('target', '');
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
						this.messageService.success('Table Export Successful')
					}else{
						this.loadingService.close();
						let lang = localStorage.getItem('lang');
						if(data['status']==5){
							if(lang=="zh"){
								this.messageService.warning("有下载任务未完成");
							}
							if(lang=="en"){
								this.messageService.warning("Unfinished download task");
							}
						}else if(data['status']==6){
							if(lang=="zh"){
								this.messageService.warning("禁止下载");
							}
							if(lang=="en"){
								this.messageService.warning("prohibit download");
							}
						}
						//this.messageService.warning(data['message']);
						//this.messageService.warning('Table Export Failed');
					}
				},
				(error) => {
					this.loadingService.close();
					this.messageService.warning('Table Export Failed')
				}
			);
	}
}
