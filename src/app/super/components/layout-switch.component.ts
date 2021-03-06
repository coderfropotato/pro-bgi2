import { Component, OnInit, Input, Output, EventEmitter,forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ControlValueAccessor } from '@angular/forms/src/directives';

/**
 * @description 布局切换 left true  right false
 * @author Yangwd<277637411@qq.com>
 * @date 2018-12-13
 * @export
 * @class LayoutSwitchComponent
 * @implements {OnInit}
 */

// <ul class="layout-src-ele">
// <li *ngFor="let pos of ['left','right']" (click)="handleToggleLayout(pos)" nz-tooltip  [nzTitle]="'切换布局'" nzPlacement="top"></li>
// </ul>
// <div class="layout-switch">
// <span [class.left]="innerValue==='left'" [class.right]="innerValue==='right'" [class.center]="innerValue==='center'"></span>
// </div>
@Component({
	selector: 'app-layout-switch',
    template: `<div class="layout-switch-wrap">
                    <nz-switch [(ngModel)]="switchValue" [nzControl]="true" (click)="clickSwitch()" nz-tooltip  [nzTitle]="'切换布局'" nzPlacement="top"></nz-switch>
                    <ng-content></ng-content>
                </div>
                `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => LayoutSwitchComponent),
            multi: true
        }
    ],
	styles: []
})
export class LayoutSwitchComponent implements ControlValueAccessor {
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

    @Input() onlyTable:boolean = false;  // 可选参数 当前是否是 只有表的状态
    @Output() onlyTableChange:EventEmitter<any> = new EventEmitter();

    innerValue:any = null;
    switchValue = true;

    constructor() {}

    clickSwitch(): void {
        setTimeout(() => {
            this.switchValue = !this.switchValue;
            if(this.switchValue){
                this.writeValue('right');
            }else{
                this.writeValue('left');
            }
            console.log(this.switchValue)
        }, 0);
    }

    handleToggleLayout(pos){
        this.writeValue(pos)
    }

    // 该方法用于将模型中的新值写入视图或 DOM 属性中
    writeValue(value){
        if(value!==this.innerValue){
            if(this.innerValue!=null){
                this.ngModelChange.emit(value);
            }
            this.innerValue = value;
        }
    }

    // 设置当控件接收到 change 事件后，调用的函数
    registerOnChange(fn:any){
        return false;
    }

    // 设置当控件接收到 touched 事件后，调用的函数
    registerOnTouched(fn:any){
        return false;
    }

    // 当控件状态变成 DISABLED 或从 DISABLED 状态变化成 ENABLE 状态时，会调用该函数。该函数会根据参数值，启用或禁用指定的 DOM 元素
    setDisabledState(isDisabled:boolean){
        return false;
    }
}
