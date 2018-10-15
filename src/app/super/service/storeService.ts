import { Injectable } from "@angular/core";
/**
 * @description 存取全局数据
 * @author Yangwd<277637411@qq.com>
 * @date 2018-10-12
 * @export
 * @class StoreService
 */
@Injectable({
    providedIn: "root"
})
export class StoreService {
    thead: Array<object> = [];
    lang:string = 'zh';
    constructor() {}

    setThead(thead) {
        this.thead = thead;
    }

    getThead() {
        return this.thead;
    }

    setLang(lang){
        this.lang = lang;
    }

    getLang(){
        return this.lang;
    }
}
