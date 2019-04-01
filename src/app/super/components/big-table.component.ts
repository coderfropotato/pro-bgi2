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
declare const $:any;
/**
 * @description 普通大表 没有首列选项
 * @author Yangwd<277637411@qq.com>
 * @export
 * @classBigTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-big-table",
    templateUrl: "./big-table.component.html"
})
export class BigTableComponent implements OnInit {

    @Input() tableId: string; // 表格id

    @Input() url: string;    // 表格查询参数可有可无  默认有 pageSize pageIndex sortValue sortKey searchList rootSearchContentList addThead 对于有超出默认参数之外的查询参数 需要放在pageEntity里传进来
    @Input() pageEntity: object;
    @Input() fileName: string;  // 表格下载名称
    @Input() selectItems: TemplateRef<any>; // 下拉选项模板插槽 TemplateRef
    @Input() tableHeight: number = 0; // 计算后的表格高度?
    @Input() tableType:string = 'common'; // 表的类型  普通 还是 transform
    @Input() emitBaseThead:boolean =false; // 是否发射表格数据 true的时候下一次请求发射表格数据 false不发射
    @Output() emitBaseTheadChange:EventEmitter<any> = new EventEmitter();
    @Output() baseTheadChange:EventEmitter<any> = new EventEmitter();
    @Input() applyOnceSearchParams:boolean = false;
    // TODO 双向绑定applyOnceSearchParams 下次再次触发
    @Output() applyOnceSearchParamsChange:EventEmitter<any> = new EventEmitter();

    @Input() computedScrollHeight:boolean = false; // 当表格容器高度不变 内部高度变化时  需要重新计算滚动高度
    @Output() computedScrollHeightChange:EventEmitter<any> = new EventEmitter();

    // 在kegg富集需要跳转map的时候用到  其他都为默认值空
	@Input() compareGroup:any =undefined; // 比较组
	@Input() reanalysisId:any =undefined; // 重分析id

    @ViewChildren("child") children;
    tableEntity: object = {};

    isLoading:boolean = false;
    scroll: any = { x: "0", y: "0" };
    // 开始排序
    beginFilterStatus: boolean = false;
    accuracy = -1;
    head: string[] = [];
    total = 1;
    dataSet = [];
    // 并集筛选条件
    unionSearchConditionList: object[] = [];
    // 交集筛选条件
    interSearchConditionList: object[] = [];

    sortMap: object = {};
    sortValue = null;
    sortKey = null;

    popoverText:any[]  = [];
    popoverSearchType = "";
    poppverThead = '';

    // filter html string
    filterHtmlString: object[] = [];
    interConditionHtmlString: object[] = [];
    unionConditionHtmlStirng: object[] = [];

    // 增加的头
    addThead: string[] = [];
    // 之前增加的头
    beforeAddThead: string[] = [];

    // 错误信息
    error: any = false;

    // 选中列
    key: any;

    // 表头宽度
    totalWidth: string;
    widthConfig: string[];
    // 首列表头的left值
    colLeftConfig: string[];
    // 二级表头集合
    twoLevelHead: object[];
    tbodyOutFirstCol: object[];
    rootHtmlString: object[] = [];

    isErrorDelete:boolean = false;
    computedTimer = null;

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

    // 页面加载完成的时候会把算好的 tableHeight传进来，触发changes 然后组件内部计算表格滚动区域的高度；
    ngOnChanges(change: SimpleChanges) {
        if(!("tableHeight" in change) && !this.tableHeight) {
            // 不传高度默认显示十条数据的高度 默认滚动高度388px
            this.scroll["y"] = "388px";
        }

        if ("tableHeight" in change && change["tableHeight"]["currentValue"]) {
            this.computedTbody(change["tableHeight"]["currentValue"]);
        }

        if("computedScrollHeight" in change && change["computedScrollHeight"] && !change['computedScrollHeight'].firstChange){
            if(this.computedTimer) clearTimeout(this.computedTimer);
            this.computedTbody(this.tableHeight);
            this.computedTimer = setTimeout(()=>{
                this.computedScrollHeight = false;
                this.computedScrollHeightChange.emit(this.computedScrollHeight);
            },30)
        }

    }

    init() {
        this.tableEntity["pageIndex"] = 1;
        this.tableEntity["pageSize"] = this.pageEntity["pageSize"] || 20;
        this.tableEntity["sortValue"] = null;
        this.tableEntity["sortKey"] = null;
        this.tableEntity["searchList"] = this.pageEntity["searchList"] || [];
        this.tableEntity["rootSearchContentList"] = this.pageEntity["rootSearchContentList"] || [];
        this.tableEntity["addThead"] = this.pageEntity["addThead"] || [];

        // 把其他的查询参数也放进去
        if (!$.isEmptyObject(this.pageEntity)) {
            for (let name in this.pageEntity) {
                if (name in this.tableEntity) {
                    continue;
                } else {
                    this.tableEntity[name] = this.pageEntity[name];
                }
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
        if (reset) {
            this.tableEntity["pageIndex"] = 1;
        }
        // this.loadingService.open(`#${this.parentId}`);
        this.isLoading = true;
        let ajaxConfig = {
            url: this.url,
            data: this.tableEntity
        };

        this.ajaxService.getDeferData(ajaxConfig).subscribe(
            (responseData: any) => {
                this.isLoading = false;
                if (responseData.status == "0" ) {
                    if(!responseData.data['rows'].length){
                        this.total = 0;
                        this.error = 'nodata';
                        return;
                    }

                    // 是否需要发射表头
                    if(this.emitBaseThead){
                        this.emitBaseThead = false;
                        this.emitBaseTheadChange.emit(this.emitBaseThead);
                        this.baseTheadChange.emit({baseThead:responseData['data']['baseThead']});
                    }

                    this.error = '';
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

                    if(this.isErrorDelete){ // 如果是在无数据或者系统错误的情况下 删除了筛选条件 表格获取数据初始化以后就需要重新应用之前的筛选状态
                        setTimeout(()=>{
                            //如果表之前是错误的状态 筛选组件需要重新应用之前的状态
                            this.tableEntity['searchList'].forEach(v=>{
                                this._filterWithoutRequest(v['filterName'],v['filterNamezh'],v['searchType'],v['filterType'],v['valueOne'],v['valueTwo'])
                            })
                            this.isErrorDelete = false;
                        },30)
                    }
                }else{
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
                this.error = 'error';
            },
            ()=>{
                if(this.applyOnceSearchParams){
                    // 每次应用一次设置的查询参数 然后清空恢复默认，用自己的查询参数；
                    this.tableEntity['searchList'] = [];
                    this.tableEntity['rootSearchContentList'] = [];
                    if('leftChooseList' in this.tableEntity) this.tableEntity['leftChooseList'] = [];
                    if('upChooseLIst' in this.tableEntity) this.tableEntity['upChooseList'] = [];
                    if('compareGroup' in this.tableEntity) this.tableEntity['compareGroup'] = '';
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

            this.getRemoteData(true);
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
        this.getRemoteData(true);
        this.classifySearchCondition();
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
                    this.getRemoteData(true);
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
    setPopoverText(text, type,thead) {
        this.popoverText = text;
        this.popoverSearchType = type;
        this.poppverThead = thead;
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
                this.getRemoteData(true);
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
        // widthConfig.unshift(60);
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
            widthConfig[i] += 29;   // 排序和筛选按钮的宽度
            widthConfig[i] += 'px';
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
                        );

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
            baseThead:this.head
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
