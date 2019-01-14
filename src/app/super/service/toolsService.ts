import { Injectable } from "@angular/core";
import { Observable, Subject, fromEvent } from "rxjs";
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
    baseThead:object[] = [];  // 多组学要表头
    geneType:string = '';
    mongoId:string = '';
    isRelation:boolean = false;

    open = new Subject<any>();

    constructor() {}

    init(){
        this.geneCount = 0;
        this.tableEntity = {};
        this.tableUrl = '';
        this.geneType = '';
        this.baseThead = [];
        this.mongoId = '';
        this.isRelation = false;
    }

    showTools(total,entity){
        entity = JSON.parse(JSON.stringify(entity));
        if(entity['others']['checkStatus']){
            this.geneCount = total - entity['others']['excludeGeneList']['unChecked'].length;
        }else{
            this.geneCount = entity['others']['excludeGeneList']['checked'].length;
        }
        this.tableUrl = entity['url'];
        this.mongoId = entity['mongoId'];
        this.tableEntity = entity['tableEntity'];
        this.tableEntity['reAnaly'] = true;
        this.tableEntity['checkStatus'] = entity['others']['checkStatus'];
        this.tableEntity['checked'] = entity['others']['excludeGeneList']['checked'];
        this.tableEntity['unChecked'] = entity['others']['excludeGeneList']['unChecked'];
        this.baseThead = entity['baseThead'];
        this.geneType =  entity['tableEntity']['geneType'];


        let allRelations = JSON.parse(sessionStorage.getItem('relations'));
        if(allRelations.length){
            this.baseThead.forEach((val,index)=>{
                if(val['children'].length){
                    let index = allRelations.findIndex((v,i)=>{
                        return v['key'] === val['true_key'];
                    })
                    if(index!=-1) {
                        this.isRelation = true;
                        return;
                    }
                }
            })
        }

        this.visible = true;
        this.sendOpen();
    }

    hide():void{
        this.init();
        this.visible = false;
    }

    get(key){
        return this[key];
    }

    sendOpen(){
        this.open.next([this.geneCount,this.isRelation]);
    }

    getOpen(){
        return this.open.asObservable();
    }


}
