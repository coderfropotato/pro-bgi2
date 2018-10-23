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


    moduleId :string = '001';
    // moduleId url1 url2

    isFirst: boolean = true;
    defaultUrl: string = "";
    params: object;
    url: string;
    checkStatus: boolean;
    excludeGeneList: object;
    geneCollectionId: string = null;
    currentGeneTable:any = null;

    defaultTableCheckStatusInParams: boolean = false;
    defaultTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        isMatchAll:false,
        rootSearchContentList: [],
        geneListId:null
    };

    extendTableCheckStatusInParams: boolean = false;
    extendTableEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        searchList: [],
        isMatchAll:false,
        rootSearchContentList: [],
        geneListId:null
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
        this.currentGeneTable = this.isFirst?this.defaultTable:this.extendTable;
        // 获取当前表的内部状态
        let tableInnerStatus = this.currentGeneTable._getInnerStatusParams();
        // 获取基因集id
        this.ajaxService.getDeferData({
            data:{
                moduleId:"001",
                geneListId:this.geneCollectionId,
                maskGene:tableInnerStatus['others'],
                tableEntity:tableInnerStatus['tableEntity']
            },
            url:"http://localhost:8086/getGeneList"
        }).subscribe(data=>{
            this.geneCollectionId = data['id'];
            // 是否是第一次转换 第一次转换就把id集合穿进去
            if(this.isFirst){
                this.extendTableEntity['geneListId'] = this.geneCollectionId;
            }else{
                // 第二次转换就设置参数 并 重置表格状态
                // 把获取到的基因集id放在下一个表格的参数里面
                this.currentGeneTable._setParamsOfEntity('geneListId',this.geneCollectionId);
                this.currentGeneTable.initAllTableStatus();
            }
            // 重置增删列状态
            this.addColumn._resetStatusWithoutEmit();
            // 切换表格
            this.isFirst = false;
        },error=>{
            console.log(error);
        })
    }

    /**
     * @description 返回初始表格
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    back() {
        this.geneCollectionId = null;
        this.addColumn._resetStatusWithoutEmit();
        this.isFirst = true;
    }

    /**
     * @description 删除基因集合id
     * @author Yangwd<277637411@qq.com>
     * @memberof TransformationTableComponent
     */
    deleteGeneCollection() {
        this.geneCollectionId = null;
        this.currentGeneTable._setParamsOfEntity('isMatchAll',true);
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
