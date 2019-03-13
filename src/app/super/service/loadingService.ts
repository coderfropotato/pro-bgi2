import { Injectable } from "@angular/core";
declare const document: any;
/**
 * @description 加载框服务
 * @author Yangwd<277637411@qq.com>
 * @date 2018-10-12
 * @export
 * @class LoadingService
 */
@Injectable({
    providedIn: "root"
})
export class LoadingService {
    mask: any = null;
    selector:any = null;
    constructor() {}

    open(selector,text = 'loading...') {
        this.selector = selector;
        let mask = document.createElement("div");
        let wrap = document.querySelector(selector);
        if (this.mask) return;
        if (wrap && !this.mask) {
            try {
                wrap.style.position = 'relative';
                mask.className = 'custom-loading-service'
                mask.innerHTML = '<div class="custom-loading-service-content"><i class="anticon anticon-loading"></i><p>'+text+'</p></div>';
                mask.style.fontSize = "24px";
                mask.style.textAlign = "center";
                mask.style.position = "absolute";
                mask.style.left = 0;
                mask.style.top = 0;
                mask.style.position = "absolute";
                mask.style.width = wrap.offsetWidth + "px";
                mask.style.height = wrap.offsetHeight + "px";
                mask.style.backgroundColor = "rgba(0,0,0,0.5)";
                mask.style.className = "loading loading-mask";
                mask.style.zIndex = 1000;
                this.mask = mask;
                wrap.appendChild(mask);
            } catch (error) {}
        }
    }

    close(selector?) {
        if(!selector) selector = this.selector;
        let wrap = document.querySelector(selector);
        if (wrap) {
            try {
                wrap.removeChild(this.mask);
                this.mask = null;
            } catch (error) {}
        }
    }
}
