import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from "@angular/core";
declare const $: any;
@Component({
    selector: "app-tree",
    template: `<div class="tree-component">
                    <b class="tree-head">当前匹配的头:{{selectComposeThead.length?selectComposeThead[0]:"暂无"}}</b>
                    <div class="tree-content">
                    <p>
                        <button class="mr12" *ngIf="showExpandAll" nz-button nzType="default" nzSize="small" (click)="handlerExpandAll()">Toggle expand</button>
                        <button *ngIf="selectComposeThead.length" nz-button nzType="default" nzSize="small" (click)="reChoose()">重新选择</button>
                    </p>
                    <div class="tree">
                            <ul *ngFor="let root of treeData;index as i">
                                <app-tree-item [floder]="root" (treeItemCheckedChange)="checkedChange($event)" (treeItemExpandChange)="expandChange($event)"></app-tree-item>
                            </ul>
                        </div>
                    </div>
                </div>`,
    styles: []
})
export class TreeComponent implements OnInit, OnChanges {
    // 树元数据
    @Input() treeData: Array<object> = [];
    /** 每一个表头可拆分的字段
     *  theadMap: object = {
        category1: [],
        category2: [],
        category3: [],
        category4: [],
        "category1-compose1": ["category1", "compose1"],
        "category1-compose1-one": ["category1", "compose1", "one"],
        "category2-compose2": ["category2", "compose2"],
        "category3-compose3-thr": ["category3", "compose3", "thr"],
        "category3-compose3": ["category3", "compose3"],
        "category4-compose4-four": ["category4", "compose4", "four"],
        "category1-compose1-four-thr": ["category1", "compose1", "four", "thr"]
       };
     */
    @Input() theadMap: object;
    // 每一个组成表头的字段  对应的表头
    /**
     *  theadMap
     * {
     * "category1-compose1-one": ["category1", "compose1", "one"],
     * "category2-compose2": ["category2", "compose2"]
     * }
     *
     *  theadReflactMap
     * {
     *      category1:["category1-compose1-one"],
     *      compose1:["category1-compose1-one"],
     *      one:["category1-compose1-one"],
     *      category2:["category2-compose2"],
     *      compose2:["category2-compose2"]
     * }
     *
     */
    // @Input() theadReflactMap: object;
    // 选中的数据
    @Input() selectData: any = [];
    // 选中的数据变化的时候  发出的事件
    @Output() selectDataChange: EventEmitter<any> = new EventEmitter();
    // 展开收起变化的时候 发出的事件
    @Output() expandChangeEvent: EventEmitter<any> = new EventEmitter();
    // 选中变化的时候 发出的事件
    @Output() checkedChangeEvent: EventEmitter<any> = new EventEmitter();
    // 树中选中的项 可组成表头并且变化了 发出的事件
    @Output() composeTheadChange: EventEmitter<any> = new EventEmitter();
    // 默认展开所有 false
    @Input() defaultExpandAll:boolean = false;
    // 是否显示”展开所有“ 按钮
    @Input() showExpandAll:boolean = true;
    // 展开所有  发生改变的时候发出的事件
    @Output() expandAllChange: EventEmitter<any> = new EventEmitter();

    // 是否重置树状态
    @Input() reset:boolean = false;

    selectComposeThead = [];
    beforeComposeThead = [];
    theadReflactMap:object = {};
    expandAll:boolean = false;

    constructor() {}

    ngOnInit() {

        for (let key in this.theadMap) {
            if (this.theadMap[key].length) {
                this.theadMap[key].forEach((val, index) => {
                    if (val in this.theadReflactMap) {
                        this.theadReflactMap[val].push(key);
                    } else {
                        this.theadReflactMap[val] = [key];
                    }
                });
            }
        }

        this.treeApplySelectData(this.treeData, this.selectData);

        if(this.defaultExpandAll) this.handlerExpandAll(this.defaultExpandAll);
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        // selectData不是第一次改变的时候 重新应用树数据
        if ( "selectData" in simpleChanges && !simpleChanges["selectData"].firstChange ) {
            this.treeApplySelectData(this.treeData, this.selectData);
        }

        // 重置树状态 后初始化重置状态
        if ( "reset" in simpleChanges && !simpleChanges["reset"].firstChange && simpleChanges["reset"].currentValue ) {
            this._reset();
            setTimeout(() => { this.reset = false; }, 30);
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

        this.computedStatus()
    }

    expandChange(floder) {
        this.expandChangeEvent.emit(floder);
    }

    computedStatus(){
        let deepItemRoot = [];   // 所有有子节点的树节点 从最底层开始收集
        this.forLeaves(this.treeData,(item)=>{
            deepItemRoot.unshift(item);
        })

        deepItemRoot.forEach(v=>{
            v['hidden'] = v['children'].every(val=>val['hidden']);
            v['expandDisabled'] = v['children'].every(val=>val['hidden']);
        })
    }

    reChoose(){
        this._reset();
        setTimeout(() => { this.reset = false; }, 30);
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
                    item.hidden = !status;
                } else {
                    item.disabled = status;
                    item.hidden = status;
                }
            } else {
                item.hidden = false;
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
            if(v['name'] in this.theadReflactMap){
                temp.push(this.theadReflactMap[v["name"]]);
            }
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
            publicItems.forEach(v => {
                composeItemsTemp = composeItemsTemp.concat(this.theadMap[v]);
                // composeItemsTemp = composeItemsTemp.concat(
                //     this.theadMap[v].slice(0, this.selectData.length + 1)
                // );
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

    handlerExpandAll(flag?:boolean){
        this.expandAll = arguments.length?flag:!this.expandAll;
        this.forLeaves(this.treeData,(item)=>{
            item.isExpand = this.expandAll;
        })
        this.expandAllChange.emit(this.expandAll);
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

    forLeaves(data, callback) {
		if (!data || !data.length) return;
		let stack = [];
		for (var i = 0, len = data.length; i < len; i++) {
			stack.push(data[i]);
		}

		let item;
		while (stack.length) {
			item = stack.shift();
			if (item['children'].length) {
				callback && callback(item);
			}
			if (item.children && item.children.length) {
				stack = item.children.concat(stack);
			}
		}
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
        this.selectData.length = 0;

        if (!this.treeData || !this.treeData.length) return;
        let stack = [];
        for (var i = 0, len = this.treeData.length; i < len; i++) {
            stack.push(this.treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            item.isChecked = false;
            item.isExpand = this.defaultExpandAll;
            item.disabled = false;
            item.hidden = false;
            item.expandDisabled = false;
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }
}
