import { StoreService } from "./../service/storeService";
import { AjaxService } from "./../service/ajaxService";
import { Component, OnInit, ViewChild, Input, Output, EventEmitter,OnChanges,SimpleChanges } from "@angular/core";
/**
 * @description 表格转换
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class TransformationTableComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-table-transformation",
    templateUrl: "./transformation-table.component.html",
    styles: []
})
export class TransformationTableComponent implements OnInit {
    // 默认表的表格参数
    @Input() defaultTableEntity;
    // 默认表的api
    @Input() defaultTableUrl;
    // 默认表的id
    @Input() defaultTableId;
    // 默认表的默认选中状态
    @Input() defaultTableDefaultChecked;
    // 默认表的 gene选中状态是否放在参数里面
    @Input() defaultTableCheckStatusInParams;
    // 转换表的查询参数
    @Input() extendTableEntity;
    // 转换表的api
    @Input() extendTableUrl;
    // 转换表的id
    @Input() extendTableId;
    // 转换表的默认选中状态
    @Input() extendTableDefaultChecked;
    // 转换表的 gene选中状态是否放在参数里面
    @Input() extendTableCheckStatusInParams;
    @Input() tableHeight;
    @Input() isFirst;
    @Input() applyOnceSearchParams:boolean = false;
    @Output() applyOnceSearchParamsChange:EventEmitter<any> = new EventEmitter();

    @Input() defaultApplyOnceSearchParams:boolean = false;
    @Output() defaultApplyOnceSearchParamsChange:EventEmitter<any> = new EventEmitter();

    @Input() resetCheckGraph:boolean = false;
    @Output() resetCheckGraphChange:EventEmitter<any> = new EventEmitter();

    @Input() defaultEmitBaseThead:boolean =false; // 是否发射表格数据 true的时候下一次请求发射表格数据 false不发射
    @Output() defaultEmitBaseTheadChange:EventEmitter<any> = new EventEmitter();
    @Input() extendEmitBaseThead:boolean =false; // 是否发射表格数据 true的时候下一次请求发射表格数据 false不发射
    @Output() extendEmitBaseTheadChange:EventEmitter<any> = new EventEmitter();

    @Output() defaultBaseTheadChange:EventEmitter<any> = new EventEmitter();
    @Output() extendBaseTheadChange:EventEmitter<any> = new EventEmitter();
    @Output() selectGeneCountChange:EventEmitter<any> = new EventEmitter();

    @Input() defaultTableType:string = 'common';
    @Input() defaultMartix:boolean = false;

    @Input() computedScrollHeight:boolean = false;
    @Output() computedScrollHeightChange:EventEmitter<any> = new EventEmitter();

    @ViewChild("defaultTable") defaultTable;
    @ViewChild("extendTable") extendTable;

    @Input() defaultShowFilterStatus:boolean = false;
    @Input() extendShowFilterStatus:boolean = false;

    @Output() extendSaveGeneListSuccess:EventEmitter<any> = new EventEmitter();
    @Output() defaultSaveGeneListSuccess:EventEmitter<any> = new EventEmitter();


    defaultUrl: string = "";
    params: object;
    url: string;
    checkStatus: boolean;
    excludeGeneList: object;
    geneCollectionId: string = null;
    currentGeneTable: any = null;
    allThead: any[] = [];
    relative:any[] = [];   // 表格上的关系

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService
    ) {
        this.allThead = this.storeService.getThead();
    }

    ngOnInit() {}

    // emit default
    handlerDefaultEmitChange(status){
        this.defaultEmitBaseTheadChange.emit(status);
    }

    // emit extend
    handlerExtendEmitChange(status){
        this.extendEmitBaseTheadChange.emit(status);
    }

    // default thead change
    handlerDefaultBaseTheadChange(thead){
        this.defaultBaseTheadChange.emit(thead);
    }

    // extend thead change
    handlerExtendBaseTheadChange(thead){
        this.extendBaseTheadChange.emit(thead);
    }

    handlerApplyOnceSearchParamsChange(status){
        this.applyOnceSearchParamsChange.emit(status);
    }

    handlerDefaultAppluOnceSearchParamsChange(status){
        this.defaultApplyOnceSearchParamsChange.emit(status);
    }

    handleResetCheckGraphChange(status){
        this.resetCheckGraphChange.emit(status);
    }

    handleSelectGeneCountChange(selectGeneCount){
        this.selectGeneCountChange.emit(selectGeneCount);
    }

    handlerComputedScrollHeightChange(status){
        this.computedScrollHeightChange.emit(status);
    }

    handleDefaultSaveGeneListSuccess(params){
        this.defaultSaveGeneListSuccess.emit(params);
    }

    handleExtendSaveGeneListSuccess(params){
        this.extendSaveGeneListSuccess.emit(params);
    }

    handleDefaultSyncRelative(thead){
        this.relative = thead;
    }

    handleExtendSyncRelative(thead){
        this.relative = thead;
    }

    /**
     * @description 外部更新addThead查询条件并发请求
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-31
     * @param {*} thead
     * @memberof TransformationTableComponent
     */
    _addThead(thead) {
        this.isFirst ? this.defaultTable._addThead(thead) : this.extendTable._addThead(thead);
    }

    _clearThead() {
        this.isFirst ? this.defaultTable._addThead([]) : this.extendTable._addThead([]);
    }

    _setExtendParams(key,value){
        this.extendTable._setParamsOfEntity(key,value);
    }

    _setExtendParamsWithoutRequest(key,value){
        this.extendTable._setParamsOfEntityWithoutRequest(key,value);
    }

    _setDefaultParamsWithoutRequest(key,value){
        this.defaultTable._setParamsOfEntityWithoutRequest(key,value);
    }
    _setDefaultParams(key,value){
        this.defaultTable._setParamsOfEntity(key,value);
    }

    _setParamsNoRequest(key,value){
        this.isFirst? this.defaultTable._setParamsOfEntityWithoutRequest(key,value):this.extendTable._setParamsOfEntityWithoutRequest(key,value);
    }

    _filter(filterName, filterNamezh, searchType,filterType, filterValueOne, filterValueTwo){
        this.isFirst?this.defaultTable._filter(filterName, filterNamezh, searchType,filterType, filterValueOne, filterValueTwo):this.extendTable._filter(filterName, filterNamezh, searchType,filterType, filterValueOne, filterValueTwo);
    }

    _filterWithoutRequest(filterName, filterNamezh,searchType, filterType, filterValueOne, filterValueTwo){
        this.isFirst?this.defaultTable._filterWithoutRequest(filterName, filterNamezh,searchType, filterType, filterValueOne, filterValueTwo):this.extendTable._filterWithoutRequest(filterName, filterNamezh,searchType, filterType, filterValueOne, filterValueTwo);
    }

    _clearFilterWithoutRequest(){
        this.isFirst?this.defaultTable._clearFilterWithoutRequest():this.extendTable._clearFilterWithoutRequest();
    }


    _deleteFilter(filterName,filterNamezh,filterType){
        this.isFirst?this.defaultTable._deleteFilter(filterName,filterNamezh,filterType):this.extendTable._deleteFilter(filterName,filterNamezh,filterType);
    }

    _deleteFilterWithoutRequest(filterName,filterNamezh,filterType){
        this.isFirst?this.defaultTable._deleteFilterWithoutRequest(filterName,filterNamezh,filterType):this.extendTable._deleteFilterWithoutRequest(filterName,filterNamezh,filterType);

    }

    _initCheckStatus(){
        this.isFirst ? this.defaultTable._initCheckStatus() : this.extendTable._initCheckStatus();
    }

    _initTableStatus(){
        this.isFirst ? this.defaultTable.initAllTableStatus() : this.extendTable.initAllTableStatus();
    }

    _getInnerParams(){
        return this.isFirst ? this.defaultTable._getInnerStatusParams() : this.extendTable._getInnerStatusParams();
    }

    _getData(){
        this.isFirst ? this.defaultTable._getData() : this.extendTable._getData();
    }
}
