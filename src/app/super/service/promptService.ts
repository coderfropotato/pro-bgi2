import { Injectable } from '@angular/core';
import { Component, Input } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  modal:NzModalRef = null;

  constructor(
    private modalService:NzModalService
  ) { }

  /**
   * @description 图标题弹出窗
   * @author dongCC<dongcc@gooalgene.com>
   * @date 2018-12-06
   * @param {string} value
   * @param {*} confirm
   * @param {*} [cancel]
   * @memberof PromptService
   */
  open(value:string,confirm,cancel?){
    let oldVal:any;
    let params = {
      nzTitle  : '标题修改',
      nzContent: PromtComponent,
      nzComponentParams:{
        value:{
          'key':value
        }
      },
      nzClosable: true,
      nzOnCancel:()=>{
        this.modal.destroy();
        cancel && cancel(oldVal)
      },
      nzOnOk: ()=>{
        this.modal.destroy();
        confirm && confirm(params['nzComponentParams']['value']['key'])
      }
    }
    oldVal = params['nzComponentParams']['value']['key'];

    this.modal = this.modalService.create(params);
  }
}



@Component({
    selector: "app-propmt",
    template: `<input nz-input [attr.value]="value['key']" (keyup)="handlerChange($event)" />
    <div style="text-align:center;margin-top:10px;color:red;" [hidden]="isshowFlag != true">最多输入25位字符</div>`,
    styles: []
})
export class PromtComponent{
    @Input() value:object;

    beforeValue:string = null;
    isshowFlag:boolean=false;

    ngOnInit(){
      this.beforeValue =this.value['key'];
    }

    handlerChange(ev){
    //   console.log(ev.target.value.length);
      if(ev.target.value.length>25){
        this.isshowFlag = true;
      }else{
        this.isshowFlag = false;
      }
      this.value['key'] = ev.target.value;
    }
}
