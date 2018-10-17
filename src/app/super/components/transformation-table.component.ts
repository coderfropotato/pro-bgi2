import { StoreService } from './../service/storeService';
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

    params: object;
    url: string;
    checkStatus: boolean;
    excludeGeneList: object;
    geneList: string[] = [];

    defaultTableCheckStatusInParams: boolean = false;
    defaultTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        rootSearchContentList: []
    };

    extendTableCheckStatusInParams: boolean = false;
    extendTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        rootSearchContentList: []
    };

    allThead:any[]=[];

    constructor(
        private ajaxService: AjaxService,
        private storeService:StoreService
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
        if (this.isFirst) {
            paramsObject = this.defaultTable._getInnerStatusParams();
            entity = paramsObject["tableEntity"];
        } else {
            // 循环转换
            paramsObject = this.extendTable._getInnerStatusParams();
            entity = paramsObject["tableEntity"];
        }
        this.ajaxService
            .getDeferData({
                url: "http://localhost:8086/getGeneList",
                data: {
                    // 是否需要url
                    check: paramsObject["others"]["checkStatus"],
                    excludeGeneList: paramsObject["others"]["excludeGeneList"],
                    geneList: this.geneList
                }
            })
            .subscribe(
                data => {
                    this.geneList = data["data"];
                    this.extendTableEntity["geneList"] = this.geneList;
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
        this.geneList = [];
        this.showDefault = true;
        this.isFirst = true;
    }

    addThead(thead){
        if(this.isFirst){
            this.defaultTable._addThead(thead);
        }else{
            this.extendTable._addThead(thead);
        }
    }

    clearThead(){
        if(this.isFirst){
            this.defaultTable._addThead([]);
        }else{
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
