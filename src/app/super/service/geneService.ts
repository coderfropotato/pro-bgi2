
import { Injectable } from "@angular/core";
/**
 * @description
 * @author Yangwd<277637411@qq.com>
 * @date 2019-03-08
 * @export
 * @class GeneService
 */
@Injectable({
    providedIn: "root"
})

export class GeneService {

    geneOptions:object = {
        radioValue:'or',
        content:"",
        selectedList:[]
    };

    set(key,value){
        this.geneOptions[key] = value;
    }
}
