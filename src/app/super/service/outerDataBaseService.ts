/**
 * @description 增删列的全局外部数据库
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-28
 * @export
 * @class OuterDataBaseService
 */
import { Injectable } from "@angular/core";
import { Observable, Subject, fromEvent } from "rxjs";
@Injectable({
    providedIn: "root"
})
export class OuterDataBaseService {

    outerDataBase:object = {};

    constructor(){

    }

    set(data){
        this.outerDataBase = data;
    }

    get(){
        return this.outerDataBase;
    }

    // // 通过树增加选择的头
    // setGeneratedThead(index,thead){
    //     console.log(index.thead)
    //     if(this.outerDataBase['children'][index]['generatedThead'].includes(thead)) return;
    //     this.outerDataBase['children'][index]['generatedThead'].push(thead);
    // }
}
