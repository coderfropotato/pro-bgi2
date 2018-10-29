import { StoreService } from "./../service/storeService";
import {
    Component,
    OnInit,
    Input,
    ViewChildren,
    TemplateRef
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { GlobalService } from "../service/globalService";
import { LoadingService } from "../service/loadingService";
import { AjaxService } from "../service/ajaxService";

declare const $: any;
/**
 * @description gene 表
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class GeneTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-geneTable",
    templateUrl: "./gene-table.component.html"
})
export class GeneTableComponent implements OnInit {
    @Input()
    defaultChecked: boolean;
    @Input()
    tableId: string;
    @Input()
    parentId: string;
    @Input()
    url: string;
    @Input()
    pageEntity: object;
    @Input()
    checkStatusInParams: boolean;
    @Input()
    fileName: string;
    // select slot
    @Input()
    selectItems: TemplateRef<any>;

    @ViewChildren("child")
    children;
    // 初始选中状态
    checkStatus: boolean;
    // isFirst
    isFirst: boolean = true;
    // 开始排序
    beginFilterStatus: boolean = false;

    head: string[] = [];

    total = 1;
    dataSet = [];
    accuracy = -1;
    // 并集筛选条件
    unionSearchConditionList: object[] = [];
    // 交集筛选条件
    interSearchConditionList: object[] = [];
    sortMap: object = {};

    tableEntity: object = {
        addThead: [],
        searchList: [],
        sortValue: null,
        sortKey: null,
        rootSearchContentList: [],
        pageIndex: 1,
        pageSize: 10
    };

    popoverText = "";
    popoverSearchType = "";

    // filter html string
    filterHtmlString: object[] = [];
    interConditionHtmlString: object[] = [];
    unionConditionHtmlStirng: object[] = [];

    // 之前增加的头
    beforeAddThead: string[] = [];

    // 错误信息
    error: any = false;

    // 选中列
    key: any;
    selectMenu: Object[];
    allChecked: boolean;
    indeterminate: boolean;
    checked: any[] = [];
    unChecked: any[] = [];
    checkedMap: object = {};
    unCheckedMap: object = {};

    // 表头宽度
    totalWidth: string;
    widthConfig: string[];
    // 首列表头的left值
    colLeftConfig: string[];
    // 二级表头集合
    twoLevelHead: object[];
    tbodyOutFirstCol: object[];
    // 一级筛选条件

    rootHtmlString: object[] = [];

    constructor(
        private translate: TranslateService,
        private globalService: GlobalService,
        private loadingService: LoadingService,
        private ajaxService: AjaxService,
        private storeService: StoreService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit(): void {
        this.init();
    }

    init() {
        this.checkStatus = this.defaultChecked;
        this.allChecked = this.checkStatus;
        this.indeterminate = false;
        this.selectMenu = [
            {
                text: "全选",
                onSelect: () => {
                    this.globalCheckAll();
                }
            },
            {
                text: "反选",
                onSelect: () => {
                    this.globalReverseCheck();
                }
            }
        ];

        this.tableEntity["pageIndex"] = 1;
        this.tableEntity["pageSize"] = 10;
        this.tableEntity["sortValue"] = null;
        this.tableEntity["sortKey"] = null;
        this.tableEntity["searchList"] = [];
        this.tableEntity["rootSearchContentList"] = [];
        this.tableEntity["addThead"] = [];

        // 把其他的查询参数也放进去
        for (let name in this.pageEntity) {
            if (name in this.tableEntity) {
                continue;
            } else {
                this.tableEntity[name] = this.pageEntity[name];
            }
        }

        this.getRemoteData();
    }

    sort(key, value): void {
        this.initSortMap();
        this.sortMap[key] = value;

        // 取消排序
        if (value == null) {
            this.tableEntity["sortKey"] = null;
            this.tableEntity["sortValue"] = null;
        } else {
            // 有排序
            this.tableEntity["sortKey"] = key;
            this.tableEntity["sortValue"] = value;
        }
        this.getRemoteData();
    }

    // 获取表格数据
    getRemoteData(reset: boolean = false): void {
        this.loadingService.open(`#${this.parentId}`);

        if (reset) {
            this.tableEntity["pageIndex"] = 1;
        }

        if (this.checkStatusInParams) {
            let checkStatus = {};
            checkStatus["check"] = this.checkStatus;
            checkStatus["excludeGeneList"] = {
                checked: this.checked,
                unChecked: this.unChecked
            };
            this.tableEntity["checkStatus"] = checkStatus;
        }

        let ajaxConfig = {
            url: this.url,
            data: this.tableEntity
        };

        this.ajaxService.getDeferData(ajaxConfig).subscribe(
            (responseData: any) => {
                if (responseData.status === "0" && !$.isEmptyObject(responseData.data)) {
                    this.loadingService.close(`#${this.parentId}`);
                    let arr = [];
                    this.head = responseData.data.baseThead;

                    responseData.data.baseThead.slice(1).forEach(val => {
                        arr = val.children.length
                            ? arr.concat(val.children)
                            : arr.concat(val);
                    });
                    this.tbodyOutFirstCol = arr;
                    let tempObj = this.computedTheadWidth(this.head);
                    this.widthConfig = tempObj["widthConfig"];
                    this.twoLevelHead = tempObj["twoLevelHead"];
                    this.colLeftConfig = tempObj["colLeftConfig"];
                    this.totalWidth = tempObj["totalWidth"];
                    // 根据表头生成sortmap
                    this.generatorSortMap();
                    if (responseData.data.total != this.total)
                        this.tableEntity["pageIndex"] = 1;
                    this.total = responseData.data.total;
                    this.dataSet = responseData.data.rows;
                    // 标志key
                    this.key = this.head[0]["children"].length
                        ? this.head[0]["children"][0]["true_key"]
                        : this.head[0]["true_key"];
                    // 增加筛选状态key
                    this.dataSet.forEach(val => {
                        val["checked"] = this.checkStatus;

                        if (this.checkStatus) {
                            this.checkedMap[val[this.key]] = val;
                        } else {
                            this.unCheckedMap[val[this.key]] = val;
                        }

                        if (
                            !$.isEmptyObject(this.checkedMap) ||
                            !$.isEmptyObject(this.unCheckedMap)
                        ) {
                            // 默认选中 就看未选中的列表里有没有当前项 有就变成未选中
                            if (this.checkStatus) {
                                if (!$.isEmptyObject(this.unCheckedMap)) {
                                    for (let name in this.unCheckedMap) {
                                        if (name == val[this.key]) {
                                            val["checked"] = false;
                                            delete this.checkedMap[
                                                val[this.key]
                                            ];
                                        }
                                    }
                                }
                            } else {
                                // 默认不选中  就看选中的列表里有没有当前项 有就变成选中
                                if (!$.isEmptyObject(this.checkedMap)) {
                                    for (let name in this.checkedMap) {
                                        if (name == val[this.key]) {
                                            val["checked"] = true;
                                            delete this.unCheckedMap[
                                                val[this.key]
                                            ];
                                        }
                                    }
                                }
                            }
                        }
                    });
                    this.computedStatus();
                } else {
                    this.loadingService.close(`#${this.parentId}`);
                    this.total = 0;
                    this.error = "nodata";
                }
            },
            err => {
                this.loadingService.close(`#${this.parentId}`);
                this.total = 0;
                console.log(err);
            }
        );
    }

    // 扩展表
    toExtendTable() {}

    // 返回到初始表
    backToDefaultTable() {
        this.initAllTableStatus();
        this.getRemoteData();
    }

    // 重置表格状态 回到初始状态
    initAllTableStatus() {
        this.tableEntity["pageIndex"] = 1;
        this.tableEntity["addThead"] = [];
        this.tableEntity["rootSearchContentList"] = [];
        this.tableEntity["searchList"] = [];
        this.interSearchConditionList = [];
        this.unionSearchConditionList = [];
        this.tableEntity["sortKey"] = null;
        this.tableEntity["sortValue"] = null;
        this.accuracy = -1;
        this.beginFilterStatus = false;
        this.interConditionHtmlString = this.globalService.transformFilter(
            this.interSearchConditionList
        );
        this.unionConditionHtmlStirng = this.globalService.transformFilter(
            this.unionSearchConditionList
        );
        this.rootHtmlString = this.globalService.transformRootFilter(
            this.tableEntity["rootSearchContentList"]
        );
        this.checkedMap = {};
        this.unCheckedMap = {};
        this.checked = [];
        this.unChecked = [];
        this.checkStatus = this.defaultChecked;
    }

    // 选中框
    refreshStatus(status, d): void {
        if (status) {
            this.checkedMap[d[this.key]] = d;
            delete this.unCheckedMap[d[this.key]];
        } else {
            this.unCheckedMap[d[this.key]] = d;
            delete this.checkedMap[d[this.key]];
        }
        this.computedStatus();
    }

    // 计算表头checkbox选中状态
    computedStatus() {
        const allChecked = this.dataSet.every(val => val.checked === true);
        const allUnChecked = this.dataSet.every(val => !val.checked);

        this.allChecked = allChecked;
        this.indeterminate = !allChecked && !allUnChecked;
        this.getCollection();
    }

    // 当前页全选
    checkAll(value) {
        this.dataSet.forEach(val => {
            val.checked = value;
            if (value) {
                this.checkedMap[val[this.key]] = val;
                delete this.unCheckedMap[val[this.key]];
            } else {
                this.unCheckedMap[val[this.key]] = val;
                delete this.checkedMap[val[this.key]];
            }
        });
        this.computedStatus();
    }

    // 反选
    reverseCheck() {
        this.dataSet.forEach(val => {
            val.checked = !val.checked;
            if (val.checked) {
                this.checkedMap[val[this.key]] = val;
                delete this.unCheckedMap[val[this.key]];
            } else {
                this.unCheckedMap[val[this.key]] = val;
                delete this.checkedMap[val[this.key]];
            }
        });
        this.computedStatus();
    }

    // 全局全选
    globalCheckAll() {
        this.checkStatus = true;
        this.dataSet.forEach(val => {
            val.checked = this.checkStatus;
            this.checkedMap[val[this.key]] = val;
            delete this.unCheckedMap[val[this.key]];
        });
        this.computedStatus();
    }

    // 全局反选
    globalReverseCheck() {
        this.checkStatus = !this.checkStatus;
        this.dataSet.forEach(val => {
            val.checked = !val.checked;
        });
        let temp = JSON.stringify(this.checkedMap);
        this.checkedMap = JSON.parse(JSON.stringify(this.unCheckedMap));
        this.unCheckedMap = JSON.parse(temp);
        this.computedStatus();
    }

    getCollection() {
        this.checked = Object.keys(this.checkedMap);
        this.unChecked = Object.keys(this.unCheckedMap);
    }

    // 重置排序状态
    initSortMap() {
        this.head.forEach(val => {
            this.sortMap[val["true_key"]] = null;
            if (val["children"].length) {
                val["children"].forEach(
                    v => (this.sortMap[v["true_key"]] = null)
                );
            }
        });
    }

    // 根据表头生成sortmap
    generatorSortMap() {
        if ($.isEmptyObject(this.sortMap)) {
            this.head.forEach(val => {
                this.sortMap[val["true_key"]] = null;
                if (val["children"].length) {
                    val["children"].forEach(
                        v => (this.sortMap[v["true_key"]] = null)
                    );
                }
            });
        } else {
            this.head.forEach(val => {
                if (!this.sortMap[val["true_key"]]) {
                    this.sortMap[val["true_key"]] = null;
                    if (val["children"].length) {
                        val["children"].forEach(v => {
                            if (!this.sortMap[v["true_key"]]) {
                                this.sortMap[v["true_key"]] = null;
                            }
                        });
                    }
                }
            });
        }
    }

    // 开始排序 显示筛选按钮
    beginFilter() {
        this.beginFilterStatus = !this.beginFilterStatus;
        // 关闭筛选 重置筛选条件
        if (!this.beginFilterStatus) {
            // 重置表格筛选
            this.tableEntity["searchList"] = [];
            this.classifySearchCondition();

            // 重置一级筛选
            this.tableEntity["rootSearchContentList"] = [];
            this.rootHtmlString = this.globalService.transformRootFilter(
                this.tableEntity["rootSearchContentList"]
            );

            this.getRemoteData();
        }
    }

    //添加搜索 收到参数 整理搜索条件
    recive(argv) {
        if (!this.tableEntity["searchList"]) {
            this.tableEntity["searchList"] = [
                {
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4],
                    crossUnion: argv[5]
                }
            ];
        } else {
            var isIn = false;
            this.tableEntity["searchList"].forEach((val, index) => {
                if (val["filterName"] === argv[0]) {
                    this.tableEntity["searchList"][index] = {
                        filterName: argv[0],
                        filterNamezh: argv[1],
                        filterType: argv[2],
                        valueOne: argv[3],
                        valueTwo: argv[4],
                        crossUnion: argv[5]
                    };
                    isIn = true;
                }
            });

            if (!isIn)
                this.tableEntity["searchList"].push({
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4],
                    crossUnion: argv[5]
                });
        }

        this.getRemoteData();
        this.classifySearchCondition();
    }

    // 把筛选条件 按交并集归类
    classifySearchCondition() {
        this.unionSearchConditionList = [];
        this.interSearchConditionList = [];
        if (this.tableEntity["searchList"].length) {
            this.tableEntity["searchList"].forEach(val => {
                val["crossUnion"] === "union"
                    ? this.unionSearchConditionList.push(val)
                    : this.interSearchConditionList.push(val);
            });
        }

        this.interConditionHtmlString = this.globalService.transformFilter(
            this.interSearchConditionList
        );
        this.unionConditionHtmlStirng = this.globalService.transformFilter(
            this.unionSearchConditionList
        );
    }

    // 清空搜索
    // 筛选面板组件 发来的删除筛选字段的请求
    delete(argv) {
        if (this.tableEntity["searchList"].length) {
            this.tableEntity["searchList"].forEach((val, index) => {
                if (
                    val["filterName"] === argv[0] &&
                    val["filterNamezh"] === argv[1]
                ) {
                    this.tableEntity["searchList"].splice(index, 1);
                    this.classifySearchCondition();
                    this.getRemoteData();
                    return;
                }
            });
        }
    }

    // 表格单元格hover的时候 把单元格的值存起来 传到统一的ng-template里
    setPopoverText(text, type) {
        this.popoverText = text;
        this.popoverSearchType = type;
    }

    // 删除筛选条件
    deleteFilterItem(item) {
        let filterObj = item.obj;
        this._deleteFilter(
            filterObj["filterName"],
            filterObj["filterNamezh"],
            filterObj["filterType"]
        );
    }

    // 删除一级筛选条件
    deleteRootFilterItem(item) {
        let filterObj = item.obj;
        this.tableEntity["rootSearchContentList"].forEach((val, index) => {
            if (
                val["filterName"] === filterObj["filterName"] &&
                val["filterNamezh"] === filterObj["filterNamezh"] &&
                val["filterType"] === filterObj["filterType"]
            ) {
                this.tableEntity["rootSearchContentList"].splice(index, 1);
                this.rootHtmlString = this.globalService.transformRootFilter(
                    this.tableEntity["rootSearchContentList"]
                );
            }
        });
        this.getRemoteData();
    }

    relative(relative) {
        console.log(relative);
    }

    // track by function
    identify(index, item) {
        return item["true_key"];
    }

    refresh() {
        this.getRemoteData();
    }

    /**
     * @description  根据表头层级关系计算表头宽度
        {
            "name":1,
            "true_key":2,
            "hover":3,
            "colspan":children.length?children.length:1,
            "rowspan":children.length?2:1,
            "searchType""string",
            "children":[]
        }
        一级表头:
        1，如果当前表头没有子表头 rowspan 2 colspan 1
        2，如果当前表头有子表头 rowspan 1 colspan children.length
        3，如果当前的表头只有一个子表头 rowspan = colspan = 1
            如果children的length =0  rowspan2
            ！=0  rowspan 1 colspan = children.length

        二级表头:不用算
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} head
     * @returns {object}
     * @memberof BigTableComponent
     */
    computedTheadWidth(head): object {
        let defaultWidth = 20;
        let widthConfig = [];
        let twoLevelHead = [];
        let totalWidth: string;

        head.forEach(v => {
            let singleWidth = 0;
            if (v.children.length) {
                v["colspan"] = v.children.length;
                v["rowspan"] = 1;
                v.children.forEach(val => {
                    singleWidth = val.name.length * defaultWidth;
                    widthConfig.push(singleWidth);
                    twoLevelHead.push(val);
                });
            } else {
                v["colspan"] = 1;
                v["rowspan"] = 2;
                singleWidth = defaultWidth * v.name.length;
                widthConfig.push(singleWidth);
            }
        });
        widthConfig.unshift(61);
        let colLeftConfig: any[] = [];
        // 计算首列的left
        if (head[0]["children"].length) {
            head[0]["children"].forEach((v, i) => {
                let sunDis = 0;
                for (var k = 0; k < i + 1; k++) {
                    sunDis += widthConfig[k];
                }
                colLeftConfig.push(sunDis);
            });
        } else {
            colLeftConfig.push(widthConfig[0]);
        }

        let tempTotalWidth = 0;
        widthConfig.map((v, i) => {
            tempTotalWidth += v;
            widthConfig[i] += "px";
        });
        colLeftConfig.map((v, i) => (colLeftConfig[i] += "px"));
        totalWidth = tempTotalWidth + "px";
        return { widthConfig, twoLevelHead, colLeftConfig, totalWidth };
    }

    pageSizeChange() {
        this.tableEntity["pageIndex"] = 1;
        this.getRemoteData(true);
    }

    /**
     * @description  以下方法为外部调用
     * @author Yangwd<277637411@qq.com>
     * @memberof BigTableComponent
     */

    /**
     * @description  组件外设置内部查询参数 更新参数并发请求
     * @author Yangwd<277637411@qq.com>
     * @param {any} key
     * @param {any} value
     * @memberof GeneTableComponent
     */
    _setParamsOfEntity(key, value) {
        this.tableEntity[key] = value;
        this.getRemoteData();
    }

    /**
     * @description  组件外设置内部查询参数 更新参数不发请求
     * @author Yangwd<277637411@qq.com>
     * @param {any} key
     * @param {any} value
     * @memberof GeneTableComponent
     */
    _setParamsOfEntityWithoutRequest(key, value) {
        this.tableEntity[key] = value;
    }

    /**
     * @description 表格组件外部删除筛选条件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName
     * @param {*} filterNamezh
     * @param {*} filterType
     * @memberof BigTableComponent
     */
    _deleteFilter(filterName, filterNamezh, filterType) {
        this.children._results.forEach(val => {
            if (
                val.pid === this.tableId &&
                val.filterName === filterName &&
                val.selectType === filterType &&
                val.filterNamezh === filterNamezh
            ) {
                console.log(val);
                val._outerDelete(filterName, filterNamezh, filterType);
            }
        });
    }

    /**
     * @description 表格的顶层筛选
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @memberof BigTableComponent
     * 只需要塞进筛选条件 并且显示筛选条件
     */
    _rootFilter(filterName, filterNamezh, filterType, valueOne, valueTwo) {
        let obj = { filterName, filterNamezh, filterType, valueOne, valueTwo };
        for (
            let i = 0;
            i < this.tableEntity["rootSearchContentList"].length;
            i++
        ) {
            if (
                this.tableEntity["rootSearchContentList"][i]["filterName"] ===
                filterName
            ) {
                this.tableEntity["rootSearchContentList"][i] = obj;
                this.getRemoteData();
                return;
            }
        }

        this.tableEntity["rootSearchContentList"].push(obj);
        this.rootHtmlString = this.globalService.transformRootFilter(
            this.tableEntity["rootSearchContentList"]
        );
        this.getRemoteData();
    }

    /**
     * @description
     * 外部可通过此方法 进行筛选
     * 通过@ViewChild('child') child;this.child._filter()筛选
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName
     * @param {*} filterNamezh
     * @param {*} filterType
     * @param {*} filterValueOne
     * @param {*} filterValueTwo
     * @param {string} crossUnion
     * @memberof BigTableComponent
     */
    _filter(
        filterName,
        filterNamezh,
        filterType,
        filterValueOne,
        filterValueTwo,
        crossUnion
    ) {
        /* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        setTimeout(() => {
            this.children._results.forEach(val => {
                if (val.pid === this.tableId && val.filterName === filterName) {
                    val._outerUpdate(
                        filterName,
                        filterNamezh,
                        filterType,
                        filterValueOne,
                        filterValueTwo,
                        crossUnion
                    );
                    this.recive([
                        filterName,
                        filterNamezh,
                        filterType,
                        filterValueOne,
                        filterValueTwo,
                        crossUnion
                    ]);
                }
            });
        }, 30);
    }

    /**
     * @description 外部排序字段
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName string "name"
     * @param {*} sortMethod string "descend"
     * @memberof BigTableComponent
     */
    _sort(filterName, sortMethod): void {
        this.sort(filterName, sortMethod);
    }

    /**
     * @description 外部增删列   字段相同的列保留筛选条件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-15
     * @param {string[]} addThead
     * @memberof BigTableComponent
     */
    _addThead(addThead: string[]) {
        this.tableEntity["addThead"] = addThead;
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.tableEntity["addThead"].concat();
        this.getRemoteData();
    }

    /**
     * @description 外部获取表格内部状态数据
     * @author Yangwd<277637411@qq.com>
     * @returns
     * @memberof GeneTableComponent
     */
    _getInnerStatusParams() {
        return {
            tableEntity: this.tableEntity,
            url: this.url,
            others: {
                checkStatus: this.checkStatus,
                excludeGeneList: {
                    checked: this.checked,
                    unChecked: this.unChecked
                }
            }
        };
    }

    deleteSearchListItemOrderByAddThead() {
        if (this.beforeAddThead) {
            this.beforeAddThead.forEach(val => {
                if (!this.isInArr(val, this.tableEntity["addThead"])) {
                    // 删除搜索条件
                    this.tableEntity["searchList"].forEach((v, n) => {
                        if (v["filterName"] === `${val}`) {
                            this.tableEntity["searchList"].splice(n, 1);
                        }
                    });
                    // 删除排序
                    if (this.tableEntity["sortKey"] === val) {
                        this.tableEntity["sortKey"] = null;
                        this.tableEntity["sortValue"] = null;
                        if (val in this.sortMap) {
                            this.sortMap[val] = null;
                        }
                    }
                }
            });

            this.classifySearchCondition();
        }
    }

    isInArr(x, arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == x) {
                return true;
            }
        }
        return false;
    }
}
