import { Injectable } from "@angular/core";
/**
 * @description 小工具服务
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-13 10:47:55
 * @export
 * @class StoreService
 */
@Injectable({
    providedIn: "root"
})
export class ToolsService {
    visible:boolean = false;
    geneCount:number = 0;
    geneList = [];

    constructor() {}

    init(){
        this.geneCount = 0;
        this.geneList = [];
    }

    showTools(geneList){
        this.visible = true;
        this.geneList = geneList;
        this.geneCount = geneList.length;
    }

    hide(){
        this.visible = false;
        this.init();
    }

}
