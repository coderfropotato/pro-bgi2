import { StoreService } from "./../service/storeService";
import { AjaxService } from "./../service/ajaxService";
import { Component, OnInit, ViewChild } from "@angular/core";
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
    @ViewChild("defaultTable")
    defaultTable;
    @ViewChild("extendTable")
    extendTable;
    @ViewChild("addColumn")
    addColumn;

    isFirst: boolean = true;
    defaultUrl: string = "";
    params: object;
    url: string;
    checkStatus: boolean;
    excludeGeneList: object;
    geneCollectionId: string = "all";

    defaultTableCheckStatusInParams: boolean = true;
    defaultTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        rootSearchContentList: []
    };

    extendTableCheckStatusInParams: boolean = true;
    extendTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        rootSearchContentList: []
    };

    allThead: any[] = [];

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService
    ) {
        this.allThead = this.storeService.getThead();
    }

    ngOnInit() {}

    /**
     * @description 转换表格数据
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     * 查询转换表格数据 需要在原表格参数基础上 加上 基因集和原始表的api名称
     * 需要重置增删列
     */
    confirm() {
    }

    /**
     * @description 返回初始表格
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    back() {
    }

    /**
     * @description 删除基因集合id
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    deleteGeneCollection() {
    }

    addThead(thead) {
        if (this.isFirst) {
            this.defaultTable._addThead(thead);
        } else {
            this.extendTable._addThead(thead);
        }
    }

    clearThead() {
        if (this.isFirst) {
            this.defaultTable._addThead([]);
        } else {
            this.extendTable._addThead([]);
        }
    }
}
