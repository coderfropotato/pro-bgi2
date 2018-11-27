import { Injectable } from "@angular/core";
/**
 * @description 小工具组件服务
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-13 10:47:55
 * @export
 * @class ToolsService
 */
@Injectable({
    providedIn: "root"
})
export class ToolsService {
    visible:boolean = false;
    geneCount:number = 0;
    tableEntity:object = {};
    tableUrl:string = '';

    constructor() {}

    init(){
        this.geneCount = 0;
        this.tableEntity = {};
        this.tableUrl = '';
    }

    showTools(total,entity){
        if(entity['others']['checkStatus']){
            this.geneCount = total - entity['others']['excludeGeneList']['unChecked'].length;
        }else{
            this.geneCount = entity['others']['excludeGeneList']['checked'].length;
        }
        this.tableUrl = entity['url'];
        this.tableEntity = entity['tableEntity'];
        this.tableEntity['reAnaly'] = true;
        this.visible = true;
    }

    hide():void{
        this.init();
        this.visible = false;
    }

    get(key){
        return this[key];
    }

}
