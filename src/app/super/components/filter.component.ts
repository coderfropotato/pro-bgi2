import { StoreService } from "./../service/storeService";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Component({
    selector: "app-filter",
    templateUrl: "./filter.component.html",
    styleUrls: ["./filter.component.css"]
})
export class FilterComponent implements OnInit {
    /*  string (default regExp)      searchType
            模糊like                       regExp
            等于=                           equal
            不等于！=                       $ne
            包含in                          $in
            不为空                          $notNull

        int double (default range)
            范围A-B                         range
            等于=                           equal
            不等于！=                       $ne
            包含In                          $in
            大于（>）                       $gt
            小于(<)                         $lt
            大于等于（>=）                  $gte
            小于等于（<=）                  $lte
            绝对值>=                        $gteabs
            绝对值>                         $gtabs
            不为空                          $notNull

        新增类型

        total
            大于等于（>=）                  $gte
        number
            0-1                             $and
    */

    // 表头的数据类型
    @Input() searchType: string;
    // 表头的查询名称
    @Input() filterName: string;
    // 表头在页面显示的名称
    @Input() filterNamezh: string;
    // 筛选的时候 向外发出当前筛选的值
    @Output() getData: EventEmitter<any> = new EventEmitter();
    // 筛选面板清空发出的事件
    @Output() deleteData: EventEmitter<any> = new EventEmitter();
    // 筛选面板清空发出的事件 表格不发请求
    @Output() deleteDataWithoutRequest: EventEmitter<any> = new EventEmitter();
    // 父级表格的id
    @Input() pid;

    filter: object;
    // radioValue: string;
    // 当前筛选类型  in gt equap ...
    selectType: string;
    filtering: boolean = false;
    visible: boolean = false;
    filterPanelPlace:string = 'bottomRight';

    // 国际化
    closeButtonText: string;
    clearButtonText: string;
    confirmButtonText: string;

    // 存每次确定后的值
    beforeSearchOne: any;
    beforeSearchTwo: any;
    // beforeRadioValue: any;
    beforeSelectType: string;

    // 输入值判断
    nodata: boolean = false;

    constructor(
        private translate: TranslateService,
        private storeService: StoreService
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
            case "int":
                this.selectType = "range";
                break;
            case "double":
                this.selectType = "range";
                break;
            case "total":
                this.selectType = "$gte";
                break;
            case "number":
                this.selectType = "$and";
                break;

        }
        // this.radioValue = "inter";
        // this.beforeRadioValue = "inter";
        this.beforeSearchOne = "";
        this.beforeSearchTwo = "";
        this.beforeSelectType = this.selectType;
        this.nodata = false;
        this.filter = {
            regExp: "",
            rangeA: "",
            rangeB: "",
            equal: "",
            unequal: "",
            in: "",
            gt: "",
            lt: "",
            gte: "",
            lte: "",
            gteabs: "",
            gtabs: "",
            notNull:"",
            and:"All"
        };
    }

    // 下拉选择变化
    selectChange() {
        this.nodata = false;
    }

    // 输入值的时候
    oninput() {
        this.nodata = false;
    }

    // 确定
    confirm() {
        // 找出所有修改的值 传给父级
        let valueOne = "",
            valueTwo = "";
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
            case "$gteabs":
                valueOne = this.filter["gteabs"];
                break;
            case "$gtabs":
                valueOne = this.filter["gtabs"];
                break;
            case "$notNull":
                valueOne = null;
                valueTwo = null;
            case "$and":
                valueOne = this.filter['and'];
                valueTwo = null;
        }
        // 必填值
        if (this.selectType === "range") {
            if (
                (!this.force(valueOne)) ||
                (!this.force(valueTwo))
            ) {
                this.nodata = true;
                return;
            } else {
                this.nodata = false;
            }
        } else {
            if(this.selectType === '$notNull'){
                this.nodata = false;
            }else{

                if (!this.force(valueOne)) {
                    this.nodata = true;
                    return;
                } else {
                    this.nodata = false;
                }
            }
        }

        // 值变了才传给父组件
        // this.beforeRadioValue === this.radioValue &&
        if (
            this.beforeSearchOne === valueOne &&
            this.beforeSearchTwo === valueTwo &&
            this.beforeSelectType === this.selectType
        ) {
            return;
        }

        this.beforeSearchOne = valueOne;
        this.beforeSearchTwo = valueTwo;
        // this.beforeRadioValue = this.radioValue;
        this.beforeSelectType = this.selectType;

        // $in 默认用逗号拼接
        if(this.selectType==='$in'){
            if(valueOne.indexOf(',')!=-1){
            }else if(valueOne.indexOf('，')!=-1){
                valueOne = valueOne.replace(/\，/,',');
            }else{
                valueOne = valueOne.replace(/\n/,',');
            }
        }

        this.emit([
            this.filterName,
            this.filterNamezh,
            this.selectType,
            valueOne,
            valueTwo,
            this.searchType
            // this.radioValue
        ]);
        this.visible = false;
        this.filtering = true;
    }

    emit(argv: any): void {
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
        this.deleteData.emit([
            this.filterName,
            this.filterNamezh,
            beforeFilterType
        ]);
    }

    /**
     * @description 输入的值是否有效
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-01
     * @param {*} val
     * @returns
     * @memberof FilterComponent
     */
    force(val){
        if(typeof val === 'string'){
            return val.length?true:false;
        }else if(typeof val === 'number'){
            return true;
        }else{
            return false;
        }

    }

    // 外部更新内部筛选条件  需要带上交并集类型
    _outerUpdate(
        filterName: string,
        filterNamezh: string,
        filterType: string,
        filterValueOne: any,
        filterValueTwo: any,
        searchType:any,
        // crossUnion: string
    ): void {
        this.selectType = filterType;
        this.searchType = searchType;
        // this.radioValue = crossUnion;
        this.filter = {
            regExp: "",
            rangeA: "",
            rangeB: "",
            equal: "",
            unequal: "",
            in: "",
            gt: "",
            lt: "",
            gte: "",
            lte: "",
            gteabs: "",
            gtabs: "",
            notNull:"",
            and:"All"
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
            case "$gteabs":
                this.filter["gteabs"] = filterValueOne;
                break;
            case "$gtabs":
                this.filter["gtabs"] = filterValueOne;
                break;
            case "$notNull":
                this.filter["notNull"] = filterValueOne || "";
                break;
            case "$and":
                this.filter["and"] = filterValueOne || "All";
                break;
        }

        // 如果外部更新的字段名称和当前筛选面板的字段一样  那就更新内部筛选条件 并且状态改成筛选中；
        if (this.filterName === filterName) this.filtering = true;
    }

    /*
        外部删除条件
    */
    _outerDelete(filterName: string, filterNamezh: string, filterType: string) {
        if (
            this.filterName === filterName &&
            this.filterNamezh === filterNamezh &&
            this.selectType === filterType
        ) {
            // 初始化之前存之前的筛选类型
            let beforeFilterType = this.selectType;
            // 初始化筛选面板
            this.init();
            // 初始化筛选状态
            this.filtering = false;
            // 隐藏筛选面板
            this.visible = false;
            // 通知表格删除 筛选条件为  filterName 类型为beforeFilterType 的 筛选对象
            this.deleteData.emit([
                this.filterName,
                this.filterNamezh,
                beforeFilterType
            ]);
        }
    }

    _outerDeleteWithoutRequest(filterName: string, filterNamezh: string, filterType: string){
        if (
            this.filterName === filterName &&
            this.filterNamezh === filterNamezh &&
            this.selectType === filterType
        ) {
            // 初始化之前存之前的筛选类型
            let beforeFilterType = this.selectType;
            // 初始化筛选面板
            this.init();
            // 初始化筛选状态
            this.filtering = false;
            // 隐藏筛选面板
            this.visible = false;
            // 通知表格删除 筛选条件为  filterName 类型为beforeFilterType 的 筛选对象
            this.deleteDataWithoutRequest.emit([
                this.filterName,
                this.filterNamezh,
                beforeFilterType
            ]);
        }
    }


}
