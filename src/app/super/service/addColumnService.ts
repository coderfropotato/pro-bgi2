import { Injectable } from "@angular/core";
import config from '../../../'
import { Observable, Subject, fromEvent } from "rxjs";
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
    public sortThead:string[] = [];  // 每次保存增删列的时候  都需要把增删列添加的头的顺序保存下来
    constructor(){}

    get(){
        return JSON.parse(JSON.stringify(this.thead));
    }

    set(thead){
        this.thead = thead;
    }
    
    initIndexAndChecked(data) {
		data.forEach((val, index) => {
			if (val['children'] && val['children'].length) {
				val['children'].forEach((v, i) => {
					if (v['children'] && v['children'].length) {
						for (let m = 0; m < v['children'].length; m++) {
							v['children'][m]['index'] = index;
							v['children'][m]['checked'] = false;
						}
					}
				});
			}
        });
	}
}
