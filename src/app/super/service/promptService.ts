import  config  from 'src/config';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Component, Input,Injectable,NgZone,OnInit,OnDestroy} from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Injectable({
	providedIn: 'root'
})
export class PromptService {
	modal: NzModalRef = null;

	constructor(private modalService: NzModalService) {}

	/**
   * @description 图标题弹出窗
   * @author dongCC<dongcc@gooalgene.com>
   * @date 2018-12-06
   * @param {string} value
   * @param {*} confirm
   * @param {*} [cancel]
   * @memberof PromptService
   */
	open(value:string='', confirm, cancel?) {
		// let murl = window.location.host+"显示";
		let oldVal: any;
		let params = {
			nzTitle: '系统提示',
			nzContent: PromtComponent,
			nzComponentParams: {
				value: {
					key: value
				},
				isshowFlag: {
					key: value.length > config['maxTextLength'] ? true : false
				}
			},
			nzWrapClassName: 'prompt-service',
			nzClosable: true,
			nzOnCancel: () => {
				this.modal.destroy();
				cancel && cancel(oldVal);
			},
			nzOnOk: () => {
				if(params['nzComponentParams']['isshowFlag']['key']) {
					return false;
				}else{
					this.modal.destroy();
					confirm && confirm(params['nzComponentParams']['value']['key'].trim());
				}
			}
		};
		oldVal = params['nzComponentParams']['value']['key'];

		this.modal = this.modalService.create(params);
	}
}

@Component({
	selector: 'app-propmt',
	template: `<div style="margin-bottom: 10px;">请输入需要修改的内容：</div><input nz-input [(ngModel)]="value['key']" (ngModelChange)="handlerChange($event)" />
    <div style="text-align:left;margin-top:10px;color:red;" [hidden]="!isshowFlag['key']">最多输入${config['maxTextLength']}位字符且不能为空</div>`,
	styles: []
})
export class PromtComponent implements OnInit,OnDestroy {
	@Input() value: object;
	@Input() isshowFlag: object;

	beforeValue: string = null;
	timer:any = null;

	changeSubject = new Subject<null>();
	changeObserver = null;

	constructor(
		private zone:NgZone
	){}

	ngOnInit() {
		this.beforeValue = this.value['key'];
		this.isshowFlag['key'] = this.value['key'].trim()?false:true;

		this.changeObserver = this.changeSubject.pipe(debounceTime(300)).subscribe(()=>{
			this.value['key'] = this.value['key'].trim();
			if (this.value['key'].length > config['maxTextLength'] || !this.value['key']) {
				this.isshowFlag['key'] = true;
			} else {
				this.isshowFlag['key'] = false;
			}
		})
	}

	handlerChange(ev) {
		this.changeSubject.next();
	}

	ngOnDestroy(): void {
		this.changeObserver.unsubscribe();
	}
}
