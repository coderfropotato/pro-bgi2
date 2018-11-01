import {
    Component,
    OnInit,
    Input,
    Output,
    OnChanges,
    SimpleChanges,
    EventEmitter
} from "@angular/core";
declare const $: any;
@Component({
    selector: "app-tree",
    template: `<div class="tree-component">
    {{ selectComposeThead | json}}
                    <ul *ngFor="let root of treeData;index as i">
                        <app-tree-item [floder]="root" (treeItemCheckedChange)="checkedChange($event)" (treeItemExpandChange)="expandChange($event)"></app-tree-item>
                    </ul>
                </div>`,
    styles: []
})
export class TreeComponent implements OnInit, OnChanges {
    @Input()
    treeData: Array<object> = [];
    @Input()
    theadMap: object;
    @Input()
    theadReflactMap: object;
    @Input()
    selectData: any = [];
    @Output()
    selectDataChange: EventEmitter<any> = new EventEmitter();

    @Output()
    expandChangeEvent: EventEmitter<any> = new EventEmitter();
    @Output()
    checkedChangeEvent: EventEmitter<any> = new EventEmitter();
    @Output()
    composeTheadChange: EventEmitter<any> = new EventEmitter();

    selectComposeThead = [];
    beforeComposeThead = [];
    constructor() {}

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
        if (floder.isChecked) {
            this.selectData.push(floder);
        } else {
            this.selectData.forEach((val, index) => {
                if (val["name"] === floder["name"]) {
                    this.selectData.splice(index, 1);
                }
            });
        }
        // 过滤出当前选择项匹配的字段
        let matchObject = this.getCanSuitHeadBySelectData();
        let suitableItems = matchObject["treeCanSelectItems"];
        this.selectComposeThead = matchObject["curThead"];

        // 把选中的数据和组合出来的头数据发射出去
        this.selectDataChange.emit(this.selectData);
        if (
            this.stringing(this.selectComposeThead) !=
            this.stringing(this.beforeComposeThead)
        ) {
            this.beforeComposeThead = this.selectComposeThead.concat();
            this.composeTheadChange.emit(this.selectComposeThead);
        }
        // 遍历树把不匹配的字段 disabled = true
        this.treeSetDisabledStatus(this.treeData, suitableItems, true);
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

    /**
     * @description
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-30
     * @param {*} treeNodes
     * @param {*} treeItemNames
     * @param {*} status
     * @returns
     * @memberof TreeComponent
     */
    treeSetDisabledStatus(treeNodes, treeItemNames, status) {
        if (!treeNodes || !treeNodes.length) return;
        let stack = [];
        for (var i = 0, len = treeNodes.length; i < len; i++) {
            stack.push(treeNodes[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            if (treeItemNames !== "all") {
                if (treeItemNames.includes(item.name)) {
                    item.disabled = !status;
                } else {
                    item.disabled = status;
                }
            } else {
                item.disabled = false;
            }

            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

    /**
     * @description 根据当前选择的字段，获取可以匹配的字段名集合
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-30
     * @returns {Array<any>}
     * @memberof TreeComponent
     */
    getCanSuitHeadBySelectData(): object {
        let temp = [];
        // 根据选中的字段  找到所有匹配当前字段的集合 并求交集
        // 反向根据并集的表头字段找到可组合的字段 求并集
        // 收集匹配的集合
        this.selectData.forEach(v => {
            temp.push(this.theadReflactMap[v["name"]]);
        });
        // 所有集合求交集
        // 按数组长度排序
        temp.sort((a, b) => a.length - b.length);

        // 循环最小length的集合选出所有集合的公共项
        let publicItems = []; // 公共项对应的表头集合
        let composeItemsTemp = [];
        let composeItems = [];
        let singleThead = [];

        // 有选择的数据
        if (temp.length) {
            temp[0].forEach(v => {
                let allIncludes = true;
                let otherCollection = temp.slice(1);
                for (let i = 0, len = otherCollection.length; i < len; i++) {
                    if (!this.arrIncludeItem(otherCollection[i], v)) {
                        allIncludes = false;
                        break;
                    }
                }
                if (allIncludes) publicItems.push(v);
            });

            // 找出公共项对应的表头集合的组合集合 去重
            // 组合 abc abcd   选中ab的时候 d的状态为不可选
            publicItems.forEach(v => {
                composeItemsTemp = composeItemsTemp.concat(
                    this.theadMap[v].slice(0, this.selectData.length + 1)
                );
            });
            let tempJson = {};
            composeItemsTemp.forEach(v => (tempJson[v] = 1));
            composeItems = Object.keys(tempJson);

            // 看当前可能匹配的表头里的 可组合的集合是不是都在当前选择的数据里  任一不在就删掉
            let selectNames = this.selectData.map(v => v["name"]);
            for (let j = 0; j < publicItems.length; j++) {
                if (this.theadMap[publicItems[j]].length) {
                    for (
                        let i = 0;
                        i < this.theadMap[publicItems[j]].length;
                        i++
                    ) {
                        if (
                            !this.arrIncludeItem(
                                selectNames,
                                this.theadMap[publicItems[j]][i]
                            )
                        ) {
                            publicItems.splice(j, 1);
                            j--;
                            break;
                        }
                    }
                }
            }

            // 当前选择的项 单一匹配所有的头
            if (this.selectData.length == 1) {
                this.selectData.forEach(v => {
                    if (v["name"] in this.theadMap) singleThead.push(v["name"]);
                });
            }
        }

        return temp.length
            ? {
                  treeCanSelectItems: composeItems,
                  curThead: singleThead.concat(publicItems)
              }
            : {
                  treeCanSelectItems: "all",
                  curThead: singleThead.concat(publicItems)
              };
    }

    /**
     * @description 数组是否包含某一项
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-30
     * @param {*} arr
     * @param {*} item
     * @returns
     * @memberof TreeComponent
     */
    arrIncludeItem(arr, item) {
        return arr.includes(item);
    }

    stringing(obj) {
        return JSON.stringify(obj);
    }

    /**
     * @description 重置树状态
     * 默认 不选中  展开  不禁用
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-31
     * @returns
     * @memberof TreeComponent
     */
    _reset() {
        this.selectComposeThead = [];
        this.beforeComposeThead = [];

        if (!this.treeData || !this.treeData.length) return;
        let stack = [];
        for (var i = 0, len = this.treeData.length; i < len; i++) {
            stack.push(this.treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            item.isChecked = false;
            item.isExpand = true;
            item.disabled = false;
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }
}
