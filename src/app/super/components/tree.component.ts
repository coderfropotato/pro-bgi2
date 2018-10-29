import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter
} from "@angular/core";

@Component({
    selector: "app-tree",
    template: `<div class="tree-component">
                    <ul *ngFor="let root of treeData;index as i">
                        <app-tree-item [floder]="root" (treeItemCheckedChange)="checkedChange($event)" (treeItemExpandChange)="expandChange($event)"></app-tree-item>
                    </ul>
                </div>`,
    styles: []
})
export class TreeComponent implements OnInit, OnChanges {
    @Input() treeData: Array<object> = [];
    @Input() selectData: any = [];
    @Output() selectDataChange: EventEmitter<any> = new EventEmitter();

    @Output() expandChangeEvent: EventEmitter<any> = new EventEmitter();
    @Output() checkedChangeEvent: EventEmitter<any> = new EventEmitter();

    constructor() {

    }

    ngOnInit() {
        this.treeApplySelectData(this.treeData, this.selectData);
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        // selectData不是第一次改变的时候 重新应用树数据
        if (
            "selectData" in simpleChanges &&
            !simpleChanges["selectData"].isFirstChange
        ) {
            this.treeApplySelectData(this.treeData, this.selectData);
        }
    }

    checkedChange(floder) {
        this.checkedChangeEvent.emit(floder);
        if (floder.isChekced) {
            this.selectData.push(floder);
        } else {
            this.selectData.forEach((val, index) => {
                if (val["name"] === floder["name"]) {
                    this.selectData.splice(index, 1);
                }
            });
        }

        this.selectDataChange.emit(this.selectData);
    }

    expandChange(floder) {
        this.expandChangeEvent.emit(floder);
    }

    /**
     * @description 树数据应用默认选中的数据
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-26
     * @param {*} treeNodes
     * @param {*} selectData  namelist
     * @returns
     * @memberof TreeComponent
     */
    treeApplySelectData(treeNodes, selectData) {
        if (!treeNodes || !treeNodes.length) return;
        let stack = [];
        for (var i = 0, len = treeNodes.length; i < len; i++) {
            stack.push(treeNodes[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            if (selectData.includes(item.name)) item.isChecked = true;
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }
}
