import { ToolsService } from "./../service/toolsService";
import { MessageService } from "./../service/messageService";
import { Observable, fromEvent } from "rxjs";
import { StoreService } from "./../service/storeService";
import { Component, OnInit, Input, ViewChildren, TemplateRef, OnChanges, SimpleChanges, AfterViewChecked, AfterViewInit, AfterContentInit, ElementRef, ViewChild, Output, EventEmitter } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { GlobalService } from "../service/globalService";
import { LoadingService } from "../service/loadingService";
import { AjaxService } from "../service/ajaxService";
import { NzNotificationService } from "ng-zorro-antd";
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import config from '../../../config';

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
export class GeneTableComponent implements OnInit, OnChanges {
    /** 默认参数
     * this.tableEntity["pageIndex"] = 1;
        this.tableEntity["pageSize"] = 10;
        this.tableEntity["sortValue"] = null;
        this.tableEntity["sortKey"] = null;
        this.tableEntity["searchList"] = [];
        this.tableEntity["rootSearchContentList"] = [];
        this.tableEntity["addThead"] = [];
        如果有默认参数之外的参数 需要传进来，如果没有可以不传。
     */

    @Input() defaultChecked: boolean = false; // 基因表的默认选中还是不选中
    @Input() tableId: string; // 表的id
    @Input() url: string; // 表格的请求api
    @Input() pageEntity: object; // 表格的请求参数
    @Input() checkStatusInParams: boolean; // 是否把表的gene选中状态放在表的查询参数里面 默认false
    @Input() fileName: string; // 表格下载的名称?
    @Input() selectItems: TemplateRef<any>; // 表格模板插槽?
    @Input() tableHeight: number = 0; // 计算后的表格高度?
    @Input() tableType:string = 'common'; // 表的类型  普通 还是 transform
    @Input() emitBaseThead:boolean =false; // 是否发射表格数据 true的时候下一次请求发射表格数据 false不发射
    @Output() emitBaseTheadChange:EventEmitter<any> = new EventEmitter();
    @Output() baseTheadChange:EventEmitter<any> = new EventEmitter();
    @Input() applyOnceSearchParams:boolean = false;
    // TODO 双向绑定applyOnceSearchParams 下次再次触发
    @Output() applyOnceSearchParamsChange:EventEmitter<any> = new EventEmitter();
    @Output() selectGeneCountChange:EventEmitter<any> = new EventEmitter();

    count:number = 0; // 选中的基因个数
    mongoId:any = null;
    scroll: any = { x: "0", y: "0" };
    isLoading: boolean = true;
    @ViewChildren("child")
    children;
    // 初始选中状态
    checkStatus: boolean;
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

    isFirst = true;
    firstColumnGene = [];
    matchAll:boolean = true;
    isErrorDelete:boolean = false;

    // 是否在保存基因集
    isSaveGeneList:boolean=false;
    validateForm: FormGroup;
    openSelect:boolean = false;
    labels:any[] = [];
    labelSelect:any[] = [];
    labelSelectError:boolean = false;
    delSelect:any[] = [];
    textareaMaxLen:number = 100;

    constructor(
        private translate: TranslateService,
        private globalService: GlobalService,
        private loadingService: LoadingService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private el: ElementRef,
        private message: MessageService,
        private notify: NzNotificationService,
        private toolsService: ToolsService,
        private modalService:NzModalService,
        private fb:FormBuilder
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit(): void {
        this.init();
        this.initFormValue();
    }

    // 页面加载完成的时候会把算好的 tableHeight传进来，触发changes 然后组件内部计算表格滚动区域的高度；
    ngOnChanges(change: SimpleChanges) {
        if(!("tableHeight" in change) && !this.tableHeight) {
            // 不传高度默认显示十条数据的高度 默认滚动高度388px
            this.scroll["y"] = "388px";
        }

        if ("tableHeight" in change && change["tableHeight"]["currentValue"]) {
            this.computedTbody(change["tableHeight"]["currentValue"]);
        }

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
        this.tableEntity["pageSize"] = this.pageEntity["pageSize"] || 20;
        this.tableEntity["sortValue"] = null;
        this.tableEntity["sortKey"] = null;
        this.tableEntity["searchList"] = this.pageEntity["searchList"] || [];
        this.tableEntity["rootSearchContentList"] = this.pageEntity["rootSearchContentList"] || [];
        this.tableEntity["addThead"] = this.pageEntity["addThead"] || [];

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
        this.sortMap[value] = key ;

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
        // this.loadingService.open(`#${this.parentId}`);
        this.isLoading = true;

        if (reset) {
            this.tableEntity["pageIndex"] = 1;
        }

        if (this.checkStatusInParams) {
            this.tableEntity["checkStatus"] = this.checkStatus;
            this.tableEntity["checked"] = this.checked;
            this.tableEntity["unChecked"] = this.unChecked;
        }

        let ajaxConfig = {
            url: this.url,
            data: this.tableEntity
        };

        // 如果是转换表把上次的mongoid 放在下一次的参数里面
        if(this.tableType==='transform') this.tableEntity['mongoId'] = this.mongoId;
        this.ajaxService.getDeferData(ajaxConfig).subscribe(
            (responseData: any) => {
                // 如果需要保存基因集合id 并且 返回值有id这个key （针对转换表) 就保存下来
                this.isLoading = false;
                if (responseData.status == "0") {
                    if(this.tableType === 'transform'){
                        this.tableEntity['transform'] = false;
                        this.tableEntity['matrix'] = true;
                        this.mongoId = responseData['data']['mongoId'];
                        // if(this.isFirst) this.applyOnceBeforeStatusThenReset();
                    }
                    if (!responseData.data["rows"].length) {
                        this.total = 0;
                        this.error = "nodata";
                        return;
                    }

                    // 是否需要发射表头
                    if(this.emitBaseThead){
                        this.emitBaseThead = false;
                        this.emitBaseTheadChange.emit(this.emitBaseThead);
                        this.baseTheadChange.emit({baseThead:responseData['data']['baseThead']});
                    }

                    this.error = "";
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
                    this.scroll["x"] = this.totalWidth;
                    // 根据表头生成sortmap
                    this.generatorSortMap();
                    if (responseData.data.total != this.total) this.tableEntity["pageIndex"] = 1;
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
                    this.getCollection();
                    this.isFirst = false;

                    if(this.isErrorDelete){ // 如果是在无数据或者系统错误的情况下 删除了筛选条件 表格获取数据初始化以后就需要重新应用之前的筛选状态
                        setTimeout(()=>{
                            //如果表之前是错误的状态 筛选组件需要重新应用之前的状态
                            this.tableEntity['searchList'].forEach(v=>{
                                this._filterWithoutRequest(v['filterName'],v['filterNamezh'],v['searchType'],v['filterType'],v['valueOne'],v['valueTwo'])
                            })
                            this.isErrorDelete = false;
                        },30)
                    }

                } else {
                    this.total = 0;
                    this.error = "error";
                }

                setTimeout(() => {
                    this.computedTbody(this.tableHeight);
                }, 30);
            },
            err => {
                this.isLoading = false;
                this.total = 0;
            },
            ()=>{
                // if('matchAll' in this.tableEntity) this.tableEntity['matchAll'] = false;
                if(this.applyOnceSearchParams){
                    // 每次应用一次设置的查询参数 然后清空恢复默认，用自己的查询参数；
                    this.tableEntity['searchList'] = [];
                    this.tableEntity['rootSearchContentList'] = [];
                    if('leftChooseList' in this.tableEntity) this.tableEntity['leftChooseList'] = [];
                    if('upChooseLIst' in this.tableEntity) this.tableEntity['upChooseList'] = [];
                    if('compareGroup' in this.tableEntity) this.tableEntity['compareGroup'] = [];
                    if('setNameList' in this.tableEntity) this.tableEntity['setNameList'] = [];
                    if('diffThreshold' in this.tableEntity) this.tableEntity['diffThreshold'] = {};
                    this.applyOnceSearchParams = false;
                    this.applyOnceSearchParamsChange.emit(this.applyOnceSearchParams);
                }
            }
        );
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
        this.interConditionHtmlString = this.globalService.transformFilter( this.interSearchConditionList );
        this.unionConditionHtmlStirng = this.globalService.transformFilter( this.unionSearchConditionList );
        this.rootHtmlString = this.globalService.transformRootFilter( this.tableEntity["rootSearchContentList"] );
        this.checkedMap = {};
        this.unCheckedMap = {};
        this.checked = [];
        this.unChecked = [];
        this.checkStatus = this.defaultChecked;

        if(this.tableType==='transform'){
            this.tableEntity['transform'] = true;
            this.tableEntity['matrix'] = true;
            this.tableEntity['mongoId'] = this.mongoId;

        }
        // if('matchAll' in this.tableEntity) this.tableEntity['matchAll'] = false;
    }

    matchAllFn(){
        if(this.tableType==='transform'){
            if('matchAll' in this.tableEntity){
                this.tableEntity['matchAll'] = true;
                this.matchAll = false;
                this.getRemoteData();
            }
        }
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
            this.unCheckedMap = {};
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
        this.count = this.checkStatus?(this.total - this.unChecked.length):this.checked.length;
        this.selectGeneCountChange.emit(this.count);
    }

    /**
     * @description 外部初始化表内部选中状态
     * @author Yangwd<277637411@qq.com>
     * @date 2018-12-19
     * @memberof GeneTableComponent
     */
    _initCheckStatus(){
        this.checkedMap = {};
        this.unCheckedMap = {};
        this.checked = [];
        this.unChecked = [];
        this.checkStatus = this.defaultChecked;
    }

    // applyOnceBeforeStatusThenReset(){
    //     console.log('use itself');
    //     console.log(this.checked);
    //     if('checkStatus' in this.tableEntity) this.tableEntity['checkStatus'] = this.defaultChecked;
    //     if('checked' in this.tableEntity) this.tableEntity['checked'] = this.checked;
    //     if('unChecked' in this.tableEntity) this.tableEntity['unChecked'] = this.unChecked;
    // }

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
                    searchType:argv[5]
                    // crossUnion: argv[5]
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
                        searchType:argv[5]
                        // crossUnion: argv[5]
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
                    searchType:argv[5]
                    // crossUnion: argv[5]
                });
        }
        // 每次筛选的时候 重置选中的集合
        this.checkStatus = this.defaultChecked;
        this.checkedMap = {};
        this.unCheckedMap = {};
        this.checked = [];
        this.unChecked = [];

        this.getRemoteData();
        this.classifySearchCondition();
    }

    // 把筛选条件 按交并集归类
    classifySearchCondition() {
        this.unionSearchConditionList = [];
        this.interSearchConditionList = [];
        if (this.tableEntity["searchList"].length) {
            // this.tableEntity["searchList"].forEach(val => {
            //     val["crossUnion"] === "union"
            //         ? this.unionSearchConditionList.push(val)
            //         : this.interSearchConditionList.push(val);
            // });
            this.filterHtmlString = this.globalService.transformFilter(this.tableEntity['searchList']);
        }else{
            this.filterHtmlString.length = 0;
        }

        // this.interConditionHtmlString = this.globalService.transformFilter(
        //     this.interSearchConditionList
        // );
        // this.unionConditionHtmlStirng = this.globalService.transformFilter(
        //     this.unionSearchConditionList
        // );

        // 每次分类筛选条件的时候 重新计算表格滚动区域高度
        setTimeout(() => {
            this.computedTbody(this.tableHeight);
        }, 0);
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

    deleteWithoutRequest(argv){
        if (this.tableEntity["searchList"].length) {
            this.tableEntity["searchList"].forEach((val, index) => {
                if (
                    val["filterName"] === argv[0] &&
                    val["filterNamezh"] === argv[1]
                ) {
                    this.tableEntity["searchList"].splice(index, 1);
                    this.classifySearchCondition();
                    // this.getRemoteData();
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
        if(this.error){
            this.isErrorDelete = true;
            // 没数据的时候 在表格筛选参数里找出当前的筛选条件删除 重新获取表格数据
            let index = this.tableEntity['searchList'].findIndex((val,i)=>{
                return (val['filterName'] === filterObj['filterName'] && val['filterType'] === filterObj['filterType'])
            })
            if(index!=-1) {
                this.tableEntity['searchList'].splice(index,1);
                this.getRemoteData();
            }
            this.filterHtmlString = this.globalService.transformFilter(this.tableEntity['searchList']);
        }else{
            this._deleteFilter(
                filterObj["filterName"],
                filterObj["filterNamezh"],
                filterObj["filterType"]
            );
        }
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

    // track by function
    identify(index, item) {
        return item["true_key"];
    }

    refresh() {
        if(this.tableType==='transform'){
            this.tableEntity['mongoId'] = this.mongoId;
            this.tableEntity['transform'] = false;
            this.tableEntity['matrix'] = true;
        }
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
        let defaultWidth = 12;
        let widthConfig = [];
        let twoLevelHead = [];
        let totalWidth: string;

        head.forEach(v => {
            let singleWidth = 0;
            if (v.children.length) {
                v["colspan"] = v.children.length;
                v["rowspan"] = 1;
                v.children.forEach(val => {
                    singleWidth = val.name.length * defaultWidth + 22;
                    widthConfig.push(singleWidth);
                    twoLevelHead.push(val);
                });
            } else {
                v["colspan"] = 1;
                v["rowspan"] = 2;
                singleWidth = defaultWidth * v.name.length + 22;
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

    computedTbody(tableHeight) {
        if(tableHeight){
            // 固定头的高度
            let head = $(`#${this.tableId} .ant-table-fixed .ant-table-thead`).outerHeight();
            // 分页的高度
            let bottom = $(`#${this.tableId} .table-bottom`).outerHeight();
            // 筛选条件的高度
            let filter = $(`#${this.tableId} .table-filter`).outerHeight();
            // 表头工具栏的高度
            let tools = $(`#${this.tableId} .table-thead`).outerHeight();
            // 首列gene的高度
            let res = tableHeight - head - bottom - filter - tools  - 2;
            $(`#${this.tableId} .ant-table-body`).css("height", `${res}px`);
            this.scroll["y"] = `${res}px`;
        }
    }

    pageSizeChange() {
        this._initCheckStatus();
        this.tableEntity["pageIndex"] = 1;
        this.getRemoteData(true);
    }

    /**
     * @description 点击分析按钮
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-13
     * @memberof GeneTableComponent
     */
    analysis() {
        this.count = this.checkStatus?(this.total - this.unChecked.length):this.checked.length;
        if (!this.count) {
            this.notify.blank("tips：", "请选择需要分析的基因", {
                nzStyle: { width: "200px" },
                nzDuration: 2000
            });
        } else {
            let params = this._getInnerStatusParams();
            this.toolsService.showTools(this.total, params);
        }
    }

    /**
     * @description 保存基因集
     * @author Yangwd<277637411@qq.com>
     * @date 2018-12-14
     * @memberof GeneTableComponent
     */
    initFormValue(){
        // name reg /^[a-z0-9_]{1,12}$/gi
        this.validateForm = this.fb.group({
            name:["",[Validators.required,Validators.pattern("^[a-z0-9_A-Z]{1,16}$")]],
            label:[null],
            mark:[""]
        });
        this.labelSelectError = false;
    }

    saveGeneList(){
        this.initFormValue();
        this.isSaveGeneList = true;
        this.delSelect.length = 0;
        this.openSelect = false;

        this.getAllLabels();
    }

    getAllLabels(){
        this.ajaxService.getDeferData({
            url:`${config['javaPath']}/geneSet/existed`,
            data:{
                LCID: sessionStorage.getItem('LCID'),
                geneType: this._getInnerStatusParams()['tableEntity']['geneType']
            }
        }).subscribe((res)=>{
            if(res['status']=='0'){
                this.labels = res['data'];
            }else{
                this.labels = [];
            }
        },)
    }

    handleSaveGeneConfirm(){
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }

        if(this.validateForm.controls["name"]["valid"] && !this.labelSelectError){
            this.isSaveGeneList = false;
            let params = JSON.parse(JSON.stringify(this._getInnerStatusParams()['tableEntity']));
            let formValue = this.validateForm.value;

            params['tags'] = formValue['label'] || [];
            params['setName'] = formValue['name'] || '';
            params['setAnnot'] = formValue['mark'] || '';
            params['saveGeneSet'] = true;

            this.ajaxService.getDeferData({
                url:this.url,
                data:params
            }).subscribe(res=>{
                let msg:string;
                if(res['status']==0){
                    msg = `${params['setName']} 保存成功`;
                }else{
                    msg = `${params['setName']} ${res['message'][0]}`;
                }

                this.notify.success("基因集",msg);
            })
        }
    }

    handleSaveGeneCancel(){
        this.isSaveGeneList = false;
    }

    handleSelectChange(){
        var timer = null;
        if(timer) clearTimeout(timer);
        timer = setTimeout(()=>{
            if(!this.arrEquals(this.labelSelect,this.validateForm.value['label'].concat())){
                let reg = /^[a-z0-9_]{1,16}$/gi;
                this.delSelect.length = 0;
                this.labelSelect = [...this.validateForm.value['label']];

                this.validateForm.value['label'].forEach((v,i)=>{
                    if(!v.match(reg))  this.delSelect.push(...this.labelSelect.splice(i,1));
                })

                this.validateForm.get('label').setValue([...this.labelSelect]);

                this.labelSelectError = !!this.delSelect.length;
                // 关闭下拉选择框
                if(this.labelSelectError) this.openSelect = false;
                setTimeout(()=>{this.labelSelectError = false},3000);
            }
        },30)
    }

    arrEquals(temp,arr):boolean{
        if(temp.length!==arr.length) return false;
        temp.forEach((v,i)=>{
            if(v!=arr[i]) return false;
        })
        return true;
    }

    // textarea 字符提示
    handleTextKeyUp(){
        let textLen = this.validateForm.value['mark'].length;
        if(textLen>=this.textareaMaxLen){
            let str = this.validateForm.value['mark'];
            this.validateForm.get('mark').setValue(str.substring(0,this.textareaMaxLen));
        }
    }

    /**
     * @description 组件外设置内部查询参数 更新参数并发请求
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-19
     * @param {*} object
     * @memberof GeneTableComponent
     */
    _setParamsOfObject(object) {
        if (!$.isEmptyObject(object)) {
            for (let key in object) {
                this.tableEntity[key] = object[key];
            }
            this.getRemoteData();
        }
    }

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
                val._outerDelete(filterName, filterNamezh, filterType);
            }
        });
    }

    _deleteFilterWithoutRequest(filterName, filterNamezh, filterType){
        this.children._results.forEach(val => {
            if (
                val.pid === this.tableId &&
                val.filterName === filterName &&
                val.selectType === filterType &&
                val.filterNamezh === filterNamezh
            ) {
                val._outerDeleteWithoutRequest(filterName, filterNamezh, filterType);
            }
        });
    }

    /**
     * @description 表格组件外部清空筛选条件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @memberof BigTableComponent
     */
    _clearFilter() {
        this.beginFilterStatus = false;
        this.tableEntity["searchList"] = [];
        this.classifySearchCondition();

        this.tableEntity["rootSearchContentList"] = [];
        this.rootHtmlString = this.globalService.transformRootFilter(
            this.tableEntity["rootSearchContentList"]
        );

        this.getRemoteData();
    }

    _clearFilterWithoutRequest(){
        this.beginFilterStatus = false;
        this.tableEntity["searchList"] = [];
        this.classifySearchCondition();

        this.tableEntity["rootSearchContentList"] = [];
        this.rootHtmlString = this.globalService.transformRootFilter(
            this.tableEntity["rootSearchContentList"]
        );

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
     * @param {string} searchType
     * @param {*} filterType
     * @param {*} filterValueOne
     * @param {*} filterValueTwo
     * @memberof BigTableComponent
     */
    _filter(
        filterName, filterNamezh, searchType, filterType, filterValueOne, filterValueTwo,
        // crossUnion
    ) {
        /* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        setTimeout(() => {
            if(this.children._results.length){
                this.children._results.forEach(val => {
                    if (val.pid === this.tableId && val.filterName === filterName) {
                        val._outerUpdate( filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType);// crossUnion
                        this.recive([ filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType]);  // crossUnion
                    }
                });
            }else{
                this.recive([ filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType  ]); // crossUnion
            }
        }, 30);
    }

    _filterWithoutRequest(filterName,
        filterNamezh,
        searchType,
        filterType,
        filterValueOne,
        filterValueTwo,
        // crossUnion
    ) {
        /* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        console.log(this.children._results.length);
        if(this.children._results.length){
            setTimeout(() => {
                this.children._results.forEach(val => {
                    if (val.pid === this.tableId && val.filterName === filterName) {
                        val._outerUpdate(
                            filterName,
                            filterNamezh,
                            filterType,
                            filterValueOne,
                            filterValueTwo,
                            searchType
                            // crossUnion
                        );

                        this.checkStatus = this.defaultChecked;
                        this.checkedMap = {};
                        this.unCheckedMap = {};
                        this.checked = [];
                        this.unChecked = [];

                        this.classifySearchCondition();
                    }
                });
            }, 30);
        }
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
     * 永远都是覆盖参数的增删列
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-29
     * @param {string[]} addThead
     * @param {string} key
     * @memberof GeneTableComponent
     */
    _addThead(addThead: string[]) {
        this.tableEntity["addThead"] = addThead;
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = this.tableEntity["addThead"].concat();
        this.getRemoteData();
    }

    _clearThead(){
        this.tableEntity["addThead"] = [];
        this.deleteSearchListItemOrderByAddThead();
        this.beforeAddThead = [];
        this.getRemoteData();
    }

    /**
     * @description 外部获取表格内部状态数据
     * @author Yangwd<277637411@qq.com>
     * @returns
     * @memberof GeneTableComponent
     */
    _getInnerStatusParams() {
        // if('checked' in this.tableEntity) this.tableEntity['checked'] = this.checked;
        // if('unChecked' in this.tableEntity) this.tableEntity['unChecked'] = this.unChecked;
        // if('checkStatus' in this.tableEntity) this.tableEntity['checkStatus'] = this.checkStatus;
        return {
            tableEntity: this.tableEntity,
            url: this.url,
            baseThead:this.head,
            others: {
                checkStatus: this.checkStatus,
                excludeGeneList: {
                    checked: this.checked,
                    unChecked: this.unChecked
                }
            },
            mongoId:this.mongoId || null
        };
    }

    _getData(){
        this.getRemoteData();
    }

    deleteSearchListItemOrderByAddThead() {
        if (this.beforeAddThead) {
            this.beforeAddThead.forEach(val => {
                if (!this.isInArr(val, this.tableEntity["addThead"],'key')) {
                    // 删除搜索条件
                    this.tableEntity["searchList"].forEach((v, n) => {
                        if (v["filterName"] === val['key']) {
                            this.tableEntity["searchList"].splice(n, 1);
                        }
                    });
                    // 删除排序
                    if (this.tableEntity["sortKey"] === val['key']) {
                        this.tableEntity["sortKey"] = null;
                        this.tableEntity["sortValue"] = null;
                        if (val['key'] in this.sortMap) {
                            this.sortMap[val['key']] = null;
                        }
                    }
                }
            });
            this.classifySearchCondition();
        }
    }

    isInArr(x, arr,key?) {
        for (let i = 0; i < arr.length; i++) {
            if(key){
                if (arr[i][key] === x[key])  return true;
            }else{
                if(arr[i]==x) return true
            }
        }
        return false;
    }
}
