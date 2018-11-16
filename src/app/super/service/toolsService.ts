import { Injectable } from "@angular/core";
/**
 * @description 小工具组件服务
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

    constructor() {}

    init(){
        this.geneCount = 0;
    }

    showTools(total,tableEntity){
        if(tableEntity['others']['checkStatus']){
            this.geneCount = total - tableEntity['others']['excludeGeneList']['unChecked'].length;
        }else{
            this.geneCount = tableEntity['others']['excludeGeneList']['checked'].length;
        }
        this.visible = true;
    }

    hide(){
        this.init();
        this.visible = false;
    }

}
