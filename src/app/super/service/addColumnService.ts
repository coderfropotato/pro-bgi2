import { Injectable } from "@angular/core";
/**
 * @description 增删列的供选择数据 全局共享
 * @author Yangwd<277637411@qq.com>
 * @date 2018-12-04
 * @export
 * @class AddColumnService
 */
@Injectable({
    providedIn: "root"
})
export class AddColumnService {
    thead:object[] = [];

    constructor(){}

    get(){
        return JSON.parse(JSON.stringify(this.thead));
    }

    set(thead){
        this.thead = thead;
    }
}
