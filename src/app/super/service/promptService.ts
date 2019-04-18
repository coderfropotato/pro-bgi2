import { Injectable } from '@angular/core';
import { Component, Input } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import config from "../../../config";

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
    // console.log(window.location.host);
    // console.log(window.location.port);
    let murl = window.location.host+"显示";
    let oldVal:any;
    let params = {
      nzTitle  : murl,
      nzContent: PromtComponent,
      nzComponentParams:{
        value:{
          'key':value
        }
      },
      nzWrapClassName:"prompt-service",
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


// value['key']
@Component({
    selector: "app-propmt",
    template: `<div style="margin-bottom: 10px;">请输入需要修改的标题</div><input nz-input [attr.value]="" (keyup)="handlerChange($event)" />
    <div style="text-align:center;margin-top:10px;color:red;" [hidden]="isshowFlag != true">最多输入${config['maxTextLength']}位字符</div>`,
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
      if(ev.target.value.length>config['maxTextLength']){
        this.isshowFlag = true;
      }else{
        this.isshowFlag = false;
      }
      this.value['key'] = ev.target.value;
    }
}
