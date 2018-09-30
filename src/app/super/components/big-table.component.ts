import { HttpClient, HttpParams } from "@angular/common/http";
import {
    Component,
    Injectable,
    OnInit,
    Input,
    ViewChildren
} from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { GlobalService } from "../service/globalService";
import { LoadingService } from "../service/loadingService";

import { Observable } from "rxjs";

declare const $: any;

@Injectable()
export class RandomUserService {
    randomUserUrl = "http://localhost:8086/filter";

    getUsers(
        pageIndex: number = 1,
        pageSize: number = 10,
        sortField: string,
        sortOrder: string,
        searchList: object[],
        addThead: string[]
    ): Observable<{}> {
        const params = {
            pageIndex,
            pageSize,
            sortField,
            sortOrder,
            searchList,
            addThead
        };

        return this.http.post(`${this.randomUserUrl}`, params);
    }

    constructor(private http: HttpClient) {}
}

@Component({
    selector: "app-bigTable",
    templateUrl: "./big-table.component.html",
    providers: [RandomUserService]
})
export class BigTableComponent implements OnInit {
    @Input()
    defaultChecked: boolean;
    @Input()
    idFlag: string;
    @ViewChildren("child")
    children;

    // isFirst
    isFirst: boolean = true;
    // 开始排序
    beginFilterStatus: boolean = false;
    // aot
    sortEmail: string;
    sortPhone: string;
    filterGender: string;

    head: string[] = [];
    pageIndex = 1;
    pageSize = 10;
    total = 1;
    dataSet = [];
    searchList: object[] = [];

    sortMap: object = {};
    sortValue = null;
    sortKey = null;

    popoverText = "";

    // filter html string
    filterHtmlString: object[] = [];

    // 增加的头
    addThead: string[] = [];
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
    totalWidth:string;
    widthConfig:string[];
    // 首列表头的left值
    colLeftConfig:string[];
    // 二级表头集合
    twoLevelHead:object[];
    tbodyOutFirstCol:object[];



    constructor(
        private randomUserService: RandomUserService,
        private translate: TranslateService,
        private globalService: GlobalService,
        private loadingService: LoadingService
    ) {
        this.translate.onLangChange.subscribe(() => {
            this.sortEmail = this.translate.instant("sortEmail");
            this.sortPhone = this.translate.instant("sortPhone");
            this.filterGender = this.translate.instant("filterGender");
        });
    }

    ngOnInit(): void {
        this.allChecked = !!this.defaultChecked;
        this.indeterminate = false;

        this.selectMenu = [
            {
                text: "全选",
                onSelect: () => {
                    this.checkAll(true);
                }
            },
            {
                text: "反选",
                onSelect: () => {
                    this.reverseCheck();
                }
            }
        ];

        this.getRemoteData();
    }

    sort(key, value): void {
        this.initSortMap();
        this.sortMap[key] = value;

        // 取消排序
        if (value == null) {
            this.sortKey = null;
            this.sortValue = null;
        } else {
            // 有排序
            this.sortKey = key;
            this.sortValue = value;
        }
        this.getRemoteData();
    }

    // 获取表格数据
    getRemoteData(reset: boolean = false): void {
        if (reset) {
            this.pageIndex = 1;
        }
        this.loadingService.open('.table-content');

        this.randomUserService
            .getUsers(
                this.pageIndex,
                this.pageSize,
                this.sortKey,
                this.sortValue,
                this.searchList,
                this.addThead
            )
            .subscribe((data: any) => {
                this.loadingService.close('.table-content');
                let arr = [];
                this.head = data.baseThead;

                data.baseThead.slice(1).forEach((val)=>{
                    arr = val.children.length?arr.concat(val.children):arr.concat(val);
                })
                this.tbodyOutFirstCol = arr;
                let tempObj = this.computedTheadWidth(this.head)
                this.widthConfig = tempObj['widthConfig'];
                this.twoLevelHead = tempObj['twoLevelHead'];
                this.colLeftConfig = tempObj['colLeftConfig'];
                this.totalWidth= tempObj['totalWidth'];
                // 根据表头生成sortmap
                this.generatorSortMap();
                this.total = data.total;
                this.dataSet = data.rows;
                // 标志key
                this.key = this.head[0]['children'].length?this.head[0]['children'][0]["true_key"]:this.head[0]['true_key'];
                // 增加筛选状态key
                this.dataSet.forEach(val => {
                    val["checked"] = this.defaultChecked;

                    if (this.defaultChecked) {
                        this.checkedMap[val[this.key]] = val;
                    } else {
                        this.unCheckedMap[val[this.key]] = val;
                    }

                    if (
                        !$.isEmptyObject(this.checkedMap) ||
                        !$.isEmptyObject(this.unCheckedMap)
                    ) {
                        // 默认选中 就看未选中的列表里有没有当前项 有就变成未选中
                        if (this.defaultChecked) {
                            if (!$.isEmptyObject(this.unCheckedMap)) {
                                for (let name in this.unCheckedMap) {
                                    if (name == val[this.key]) {
                                        val["checked"] = false;
                                    }
                                }
                            }
                        } else {
                            // 默认不选中  就看选中的列表里有没有当前项 有就变成选中
                            if (!$.isEmptyObject(this.checkedMap)) {
                                for (let name in this.checkedMap) {
                                    if (name == val[this.key]) {
                                        val["checked"] = true;
                                    }
                                }
                            }
                        }
                    }
                });
                this.computedStatus();
            });
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

    computedStatus() {
        const allChecked = this.dataSet.every(val => val.checked === true);
        const allUnChecked = this.dataSet.every(val => !val.checked);

        this.allChecked = allChecked;
        this.indeterminate = !allChecked && !allUnChecked;
        this.getCollection();
    }

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

    getCollection() {
        this.checked = Object.keys(this.checkedMap);
        this.unChecked = Object.keys(this.unCheckedMap);
    }

    // 重置排序状态
    initSortMap() {
        this.head.forEach(val => {
            this.sortMap[val["true_key"]] = null;
            if(val['children'].length){
                val['children'].forEach(v=>this.sortMap[v["true_key"]] = null);
            }
        });
    }

    // 根据表头生成sortmap
    generatorSortMap() {
        if ($.isEmptyObject(this.sortMap)) {
            this.head.forEach(val => {
                this.sortMap[val["true_key"]] = null;
                if(val['children'].length){
                    val['children'].forEach(v=>this.sortMap[v["true_key"]] = null);
                }
            });
        } else {
            this.head.forEach(val => {
                if (!this.sortMap[val["true_key"]]) {
                    this.sortMap[val["true_key"]] = null;
                    if(val['children'].length){
                        val['children'].forEach(v=>{
                            if(!this.sortMap[v["true_key"]]){
                                this.sortMap[v["true_key"]] = null;
                            }
                        })
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
            this.searchList = [];
            this.filterHtmlString = this.globalService.transformFilter(
                this.searchList
            );
            this.getRemoteData();
        }
    }

    //添加搜索 收到参数 整理搜索条件
    recive(argv) {
        if (!this.searchList) {
            this.searchList = [
                {
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4]
                }
            ];
        } else {
            var isIn = false;
            this.searchList.forEach((val, index) => {
                if (val["filterName"] === argv[0]) {
                    this.searchList[index] = {
                        filterName: argv[0],
                        filterNamezh: argv[1],
                        filterType: argv[2],
                        valueOne: argv[3],
                        valueTwo: argv[4]
                    };
                    isIn = true;
                }
            });

            if (!isIn)
                this.searchList.push({
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4]
                });
        }

        // TODO 重新获取数据
        this.getRemoteData();
        // TODO 重新解析搜索条件
        this.filterHtmlString = this.globalService.transformFilter(
            this.searchList
        );
    }

    // 清空搜索
    // 筛选面板组件 发来的删除筛选字段的请求
    delete(argv) {
        if (this.searchList.length) {
            this.searchList.forEach((val, index) => {
                if (
                    val["filterName"] === argv[0] &&
                    val["filterNamezh"] === argv[1]
                ) {
                    this.searchList.splice(index, 1);
                    // TODO  重新获取数据
                    this.getRemoteData();
                    // 更新筛选条件
                    this.filterHtmlString = this.globalService.transformFilter(
                        this.searchList
                    );
                    return;
                }
            });
        }
    }

    // 表格单元格hover的时候 把单元格的值存起来 传到统一的ng-template里
    setPopoverText(text) {
        this.popoverText = text;
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

    identify(index, item) {
        return item["true_key"];
    }

    refresh() {
        this.getRemoteData();
    }

    // 根据表头层级关系计算表头宽度
    /*
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
    */
    computedTheadWidth(head):object{
        let defaultWidth = 20;
        let widthConfig = [];
        let twoLevelHead = [];
        let totalWidth:string;

        head.forEach(v=>{
            let singleWidth = 0;
            if(v.children.length){
                v['colspan'] = v.children.length;
                v['rowspan'] = 1;
                v.children.forEach(val=>{
                    singleWidth=val.name.length*defaultWidth;
                    widthConfig.push(singleWidth);
                    twoLevelHead.push(val);
                })
            }else{
                v['colspan'] = 1;
                v['rowspan'] = 2;
                singleWidth = defaultWidth*v.name.length;
                widthConfig.push(singleWidth);
            }
        })
        widthConfig.unshift(61);
        let colLeftConfig:any[] = [];
        // 计算首列的left
        if(head[0]['children'].length){
            head[0]['children'].forEach((v,i)=>{
                let sunDis = 0;
                for(var k=0;k<i+1;k++){
                    sunDis +=widthConfig[k]
                }
                colLeftConfig.push(sunDis);
            })
        }else{
            colLeftConfig.push(widthConfig[0]);
        }

        let tempTotalWidth = 0;
        widthConfig.map((v,i)=>{
            tempTotalWidth+=v;
            widthConfig[i]+='px'
        });
        colLeftConfig.map((v,i)=>colLeftConfig[i]+='px');
        totalWidth=tempTotalWidth+'px';
        return {widthConfig,twoLevelHead,colLeftConfig,totalWidth};
    }

    /**
     * @description  以下方法为外部调用
     * @author Yangwd<277637411@qq.com>
     * @date 2018-09-18
     * @memberof BigTableComponent
     */

    /*
        表格组件外部删除筛选条件
    */
    _deleteFilter(filterName, filterNamezh, filterType) {
        this.children._results.forEach(val => {
            if (
                val.pid === this.idFlag &&
                val.filterName === filterName &&
                val.selectType === filterType &&
                val.filterNamezh === filterNamezh
            ) {
                console.log(val);
                val._outerDelete(filterName, filterNamezh, filterType);
            }
        });
    }

    /* 外部可通过此方法 进行筛选
     通过
     @ViewChild('child') child;
     this.child._filter()
     筛选*/
    _filter(
        filterName,
        filterNamezh,
        filterType,
        filterValueOne,
        filterValueTwo
    ) {
        /* 向filter组件传递  idFlag  filterName  filterType
         找匹配idFlag的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        setTimeout(() => {
            this.children._results.forEach(val => {
                if (val.pid === this.idFlag && val.filterName === filterName) {
                    val._outerUpdate(
                        filterName,
                        filterNamezh,
                        filterType,
                        filterValueOne,
                        filterValueTwo
                    );
                    this.recive([
                        filterName,
                        filterNamezh,
                        filterType,
                        filterValueOne,
                        filterValueTwo
                    ]);
                }
            });
        }, 0);
    }

    /*
        外部排序字段
        @params filterName string "name"
        @patams sortMethod string "descend"
    */
    _sort(filterName, sortMethod): void {
        this.sort(filterName, sortMethod);
    }

    // test
    add1() {
        this.addThead = ["name", "age"];
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.addThead.concat();
        this.getRemoteData();
    }
    add2() {
        this.addThead = ["age", "name"];
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.addThead.concat();
        this.getRemoteData();
    }
    add3() {
        this.addThead = ["age"];
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.addThead.concat();
        this.getRemoteData();
    }
    add4() {
        this.addThead = ["name"];
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.addThead.concat();
        this.getRemoteData();
    }

    deleteSearchListItemOrderByAddThead() {
        if (this.beforeAddThead) {
            this.beforeAddThead.forEach(val => {
                if (!this.isInArr(val, this.addThead)) {
                    // 删除搜索条件
                    this.searchList.forEach((v, n) => {
                        if (v["filterName"] === `${val}`) {
                            this.searchList.splice(n, 1);
                        }
                    });
                    // 删除排序
                    if (this.sortKey === val) {
                        this.sortKey = null;
                        this.sortValue = null;
                        if (val in this.sortMap) {
                            this.sortMap[val] = null;
                        }
                    }
                }
            });

            this.filterHtmlString = this.globalService.transformFilter(
                this.searchList
            );
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
