import { Component, OnInit, Input } from "@angular/core";

@Component({
    selector: "app-add-column",
    templateUrl: "./add-column.component.html",
    styles: []
})
export class AddColumnComponent implements OnInit {
    @Input() thead: Array<object>;
    show: boolean = false;
    selected: Array<object> = [];
    beforeSelected: Array<object> = [];
    selectCount: Array<number> = [];
    constructor() {}

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
    }

    clear() {
        this.selected = [];
        this.beforeSelected = [];
        this.initTheadStatus();
        this.getCheckCount();
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
}
