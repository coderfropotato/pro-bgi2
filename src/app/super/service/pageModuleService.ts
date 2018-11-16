import { Router ,ActivatedRoute} from '@angular/router';
import { Observable, Subject } from "rxjs";
import { Injectable } from "@angular/core";
/**
 * @description 页面模块切换
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-13 10:47:55
 * @export
 * @class PageModuleService
 */
@Injectable({
    providedIn: "root"
})
export class PageModuleService {
    defaultModule: string = "gene";
    renderModule: boolean = true;
    moduleChange = new Subject<any>();

    constructor(
        private router:Router,
        private routes:ActivatedRoute
    ) {}

    init() {
        this.defaultModule = "gene";
    }

    /**
     * @description 每次设置 显示模块的名称 先隐藏模块后初始化模块 模块初始化读取 defaultModule 获取不同模块的数据
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-16
     * @param {*} module
     * @memberof PageModuleService
     */
    setModule(module:string):void{
        this.renderModule = false;
        this.defaultModule = module ? module : "gene";
        this.send();
        setTimeout(()=>{
            this.renderModule = true;
        },30)
    }

    send(){
        this.moduleChange.next();
    }

    as(){
        return this.moduleChange.asObservable();
    }
}
