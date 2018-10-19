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
    showDefault: boolean = true;
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
        let paramsObject = {};
        let entity = {};
        let ajaxConfig = {
            geneCollectionId: this.geneCollectionId,
            tableEntity: {},
            url: ""
        };
        if (this.isFirst) {
            paramsObject = this.defaultTable._getInnerStatusParams();
            entity = paramsObject["tableEntity"];
            ajaxConfig["tableEntity"] = entity;
            ajaxConfig["url"] = paramsObject["url"];
            this.defaultUrl = paramsObject["url"];
        } else {
            // 循环转换
            paramsObject = this.extendTable._getInnerStatusParams();
            entity = paramsObject["tableEntity"];
            ajaxConfig["tableEntity"] = entity;
            // 如果基因集id被删除了 再进行转换需要带上url
            if (this.geneCollectionId === "all") {
                ajaxConfig["url"] = this.defaultUrl;
            }
        }
        this.ajaxService
            .getDeferData({
                url: "http://localhost:8086/getGeneList",
                data: ajaxConfig
            })
            .subscribe(
                data => {
                    this.geneCollectionId = data["geneCollectionId"];
                    if (this.extendTable) {
                        this.extendTable._setParamsOfEntityWithoutRequest(
                            "geneCollectionId",
                            this.geneCollectionId
                        );
                    } else {
                        this.extendTableEntity[
                            "geneCollectionId"
                        ] = this.geneCollectionId;
                    }

                    this.addColumn._resetStatusWithoutEmit();

                    if (!this.isFirst) {
                        this.extendTable.initAllTableStatus();
                        this.extendTable.init();
                    }
                    this.showDefault = false;
                    this.isFirst = false;
                },
                error => console.log(error)
            );
    }

    /**
     * @description 返回初始表格
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    back() {
        this.addColumn._resetStatusWithoutEmit();
        this.geneCollectionId = "all";
        this.showDefault = true;
        this.isFirst = true;
    }

    /**
     * @description 删除基因集合id
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    deleteGeneCollection() {
        this.geneCollectionId = "all";
        this.extendTable._setParamsOfEntity(
            "geneCollectionId",
            this.geneCollectionId
        );
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

    getGeneList(params) {
        this.ajaxService
            .getDeferData({
                url: "http://localhost:8086/getGeneList",
                data: params
            })
            .subscribe(
                data => {
                    return data["data"];
                },
                error => console.log(error)
            );
    }
}
