import { StoreService } from './../service/storeService';
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-filter",
    templateUrl: "./filter.component.html",
    styleUrls: ["./filter.component.css"]
})
export class FilterComponent implements OnInit {
    /*string       searchType    default regExp
            模糊like    regExp
            等于=
            不等于！=
            包含in

        float double              default    range
            范围A-B     range
            等于=       equal
            不等于！=   $ne
            包含In      $in
            大于（>）   $gt
            小于(<)     $lt
            大于等于（>=）  $gte
            小于等于（<=）  $lte */

    // 外部数据类型
    @Input()
    searchType: string;
    @Input()
    filterName: string;
    @Input()
    filterNamezh: string;
    @Input()
    callBack: object;
    @Input()
    pid: string;
    @Output()
    getData: EventEmitter<any> = new EventEmitter();
    @Output()
    deleteData: EventEmitter<any> = new EventEmitter();

    filter: object;

    // 当前筛选类型  in gt equap ...
    selectType: string;
    filtering: boolean = false;
    visible: boolean = false;

    // 国际化
    closeButtonText:string;
    clearButtonText:string;
    confirmButtonText:string;

    constructor(
        private translate:TranslateService,
        private storeService:StoreService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        this.init();
    }

    init() {
        switch (this.searchType) {
            case "string":
                this.selectType = "regExp";
                break;
            default:
                this.selectType = "range";
        }
        this.filter = {
            regExp: "",
            rangeA: null,
            rangeB: null,
            equal: "",
            unequal: "",
            in: "",
            gt: null,
            lt: null,
            gte: null,
            lte: null
        };


    }

    // 确定
    confirm() {
        // 找出所有修改的值 传给父级
        let valueOne = null,
            valueTwo = null;
        switch (this.selectType) {
            case "regExp":
                valueOne = this.filter["regExp"];
                break;
            case "range":
                valueOne = this.filter["rangeA"];
                valueTwo = this.filter["rangeB"];
                break;
            case "equal":
                valueOne = this.filter["equal"];
                break;
            case "$ne":
                valueOne = this.filter["unequal"];
                break;
            case "$in":
                valueOne = this.filter["in"];
                break;
            case "$gt":
                valueOne = this.filter["gt"];
                break;
            case "$lt":
                valueOne = this.filter["lt"];
                break;
            case "$gte":
                valueOne = this.filter["gte"];
                break;
            case "$lte":
                valueOne = this.filter["lte"];
                break;
        }

        this.emit([this.filterName,this.filterNamezh, this.selectType, valueOne, valueTwo]);
        this.visible = false;
        this.filtering = true;
    }

    emit(argv: any): void {
        console.log(argv);
        this.getData.emit(argv);
    }

    // 关闭
    close() {
        this.visible = false;
    }

    // 清空
    clear() {
        // 初始化之前存之前的筛选类型
        let beforeFilterType = this.selectType;
        // 初始化筛选面板
        this.init();
        // 初始化筛选状态
        this.filtering = false;
        // 隐藏筛选面板
        this.visible = false;
        // 通知表格删除 筛选条件为  filterName 类型为beforeFilterType 的 筛选对象
        this.deleteData.emit([this.filterName,this.filterNamezh, beforeFilterType]);
    }

    // 外部更新内部筛选条件
    _outerUpdate(
        filterName: string,
        filterNamezh:string,
        filterType: string,
        filterValueOne: any,
        filterValueTwo: any
    ): void {
        this.selectType = filterType;
        this.filter = {
            regExp: "",
            rangeA: null,
            rangeB: null,
            equal: "",
            unequal: "",
            in: "",
            gt: null,
            lt: null,
            gte: null,
            lte: null
        };

        switch (filterType) {
            case "regExp":
                this.filter["regExp"] = filterValueOne;
                break;
            case "range":
                this.filter["rangeA"] = filterValueOne;
                this.filter["rangeB"] = filterValueTwo;
                break;
            case "equal":
                this.filter["equal"] = filterValueOne;
                break;
            case "$ne":
                this.filter["unequal"] = filterValueOne;
                break;
            case "$in":
                this.filter["in"] = filterValueOne;
                break;
            case "$gt":
                this.filter["gt"] = filterValueOne;
                break;
            case "$lt":
                this.filter["lt"] = filterValueOne;
                break;
            case "$gte":
                this.filter["gte"] = filterValueOne;
                break;
            case "$lte":
                this.filter["lte"] = filterValueOne;
                break;
        }

        // 如果外部更新的字段名称和当前筛选面板的字段一样  那就更新内部筛选条件 并且状态改成筛选中；
        if (this.filterName === filterName) this.filtering = true;
    }

    /*
        外部删除条件
    */
    _outerDelete(filterName: string, filterNamezh:string,filterType: string) {
        if (this.filterName === filterName && this.filterNamezh === filterNamezh &&  this.selectType === filterType) {
            // 初始化之前存之前的筛选类型
            let beforeFilterType = this.selectType;
            // 初始化筛选面板
            this.init();
            // 初始化筛选状态
            this.filtering = false;
            // 隐藏筛选面板
            this.visible = false;
            // 通知表格删除 筛选条件为  filterName 类型为beforeFilterType 的 筛选对象
            this.deleteData.emit([this.filterName,this.filterNamezh, beforeFilterType]);
        }else{
            console.log('else');
        }
    }
}
