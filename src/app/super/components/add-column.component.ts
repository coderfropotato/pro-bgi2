import { TranslateService } from "@ngx-translate/core";
import { StoreService } from "./../service/storeService";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
/**
 * @description 增删列
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class AddColumnComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-add-column",
    templateUrl: "./add-column.component.html",
    styles: []
})
export class AddColumnComponent implements OnInit {
    @Input()
    thead: Array<object>;
    show: boolean = false;
    selected: Array<object> = [];
    beforeSelected: Array<object> = [];
    selectCount: Array<number> = [];
    @Output()
    addThead: EventEmitter<any> = new EventEmitter();
    @Output()
    clearThead: EventEmitter<any> = new EventEmitter();

    constructor(
        private storeService: StoreService,
        private translate: TranslateService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        this.thead.forEach(val => {
            val["checked"] = false;
        });
        this.applyCheckedStatus();
    }

    toggleSelect(item): void {
        item.checked = !item.checked;
        this.computedStatus();
        this.getCheckCount();
    }

    applyCheckedStatus() {
        if (this.beforeSelected.length) {
            let status = false;
            this.thead.forEach(val => {
                for (let i = 0; i < val["children"].length; i++) {
                    if (
                        this.isInArr(
                            val["children"][i],
                            this.beforeSelected,
                            "name"
                        )
                    ) {
                        status = true;
                    } else {
                        status = false;
                    }

                    val["children"][i]["checked"] = status;
                }
            });
        } else {
            this.initTheadStatus();
        }
        this.getCheckCount();
    }

    isInArr(x, arr, key): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (x[key] === arr[i][key]) {
                return true;
            }
        }
        return false;
    }

    computedStatus() {
        this.selected = [];
        this.thead.forEach(val => {
            val["children"].forEach(v => {
                if (v.checked) this.selected.push(v);
            });
        });
    }

    getCheckCount() {
        this.thead.forEach((v, i) => {
            let count = 0;
            v["children"].forEach(val => {
                if (val["checked"]) count++;
            });
            this.selectCount[i] = count;
        });
    }

    initTheadStatus() {
        this.thead.forEach(val => {
            val["children"].forEach(v => {
                v.checked = false;
            });
        });
    }

    confirm() {
        this.beforeSelected = this.selected.concat([]);
        this.addThead.emit(this.selected);
    }

    clear() {
        this.selected = [];
        this.beforeSelected = [];
        this.initTheadStatus();
        this.getCheckCount();
        this.clearThead.emit([]);
    }

    cancel() {
        this.selected = this.beforeSelected.concat([]);
        this.applyCheckedStatus();
    }

    closeTag(d) {
        this.toggleSelect(d);
    }

    /**
     * @description 外部清空
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-12
     * @memberof AddColumnComponent
     */
    _resetStatus() {
        this.clear();
    }

    /**
     * @description 外部清空不发出事件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-12
     * @memberof AddColumnComponent
     */
    _resetStatusWithoutEmit() {
        this.selected = [];
        this.beforeSelected = [];
        this.initTheadStatus();
        this.getCheckCount();
    }
}
