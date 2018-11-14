import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
declare const $: any;

@Component({
    selector: "app-color-picker",
    template: `<div class="color-picker-mask" [hidden]="!show">
                        <div class="color-picker-warp">
                            <input [colorPicker]="color" style="opacity:0;"
                                [cpDialogDisplay]="'inline'" [cpSaveClickOutside]="false"
                                [cpToggle]="show"
                                [cpAddColorButtonText]="'AddColor'"
                                [cpAddColorButton]="true"
                                [(cpPresetColors)]="presetColor"
                                [cpCancelButton]="true"
                                [cpCancelButtonClass]="'ant-btn ant-btn-default'"
                                [cpOKButton]="true"
                                [cpOKButtonClass]="'ant-btn ant-btn-primary'"
                                (colorPickerCancel)="handlerCancel()"
                                (colorPickerSelect)="handlerConfirm($event)"
                            />
                        </div>
                </div>`,
    styles: [
        `
            .color-picker {
                border: none !important;
            }

            .color-picker-mask {
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.2);
            }

            .color-picker-warp {
                width: 230px;
                position: absolute;
                top: 0;
                left: 50%;
                margin-left: -115px;
            }

            .color-picker-wrap input {
                cursor: default;
            }
        `
    ]
})
export class ColorPickerComponent implements OnInit {
    @Input() color; // 默认选中的颜色
    @Output() colorChange: EventEmitter<any> = new EventEmitter();

    @Input() show; // 是否显示当前颜色选择器
    @Output() showChange: EventEmitter<any> = new EventEmitter();

    presetColor = ["#000", "#fff"];

    constructor() {}

    ngOnInit() {
        $(".color-picker-mask")
            .parent()
            .parent()
            .css("position", "relative");
    }

    handlerCancel(){
        this.showChange.emit(false);
    }

    handlerConfirm(color){
        this.colorChange.emit(color);
        this.showChange.emit(false);
    }
}
