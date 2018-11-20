import { StoreService } from "./../service/storeService";
import { AjaxService } from "./../service/ajaxService";
import { Component, OnInit, ViewChild, Input } from "@angular/core";
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

    @ViewChild("defaultTable") defaultTable;
    @ViewChild("extendTable") extendTable;


    defaultUrl: string = "";
    params: object;
    url: string;
    checkStatus: boolean;
    excludeGeneList: object;
    geneCollectionId: string = null;
    currentGeneTable: any = null;
    allThead: any[] = [];

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService
    ) {
        this.allThead = this.storeService.getThead();
    }

    ngOnInit() {}

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
