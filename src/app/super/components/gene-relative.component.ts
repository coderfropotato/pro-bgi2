import { StoreService } from "./../service/storeService";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
/**
 * @description gene 关系选择
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class GeneRelativeComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-gene-relative",
    templateUrl: "./gene-relative.component.html",
    styles: []
})

export class GeneRelativeComponent implements OnInit {
    @Output()
    backEvent: EventEmitter<any> = new EventEmitter();
    @Output()
    confirmEvent: EventEmitter<any> = new EventEmitter();

    constructor() {}

    ngOnInit() {}

    confirm(): void {
        this.confirmEvent.emit();
    }

    back(): void {
        this.backEvent.emit();
    }

    relative(type: string): void {
        console.log(type);
    }

    initRelative(){

    }

    _getRelative(){
        return [Math.random(),Math.random()]
    }
}
