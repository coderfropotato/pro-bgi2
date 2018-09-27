import { Injectable } from "@angular/core";
declare const document: any;

@Injectable({
    providedIn: "root"
})
export class LoadingService {
    mask: any = null;
    constructor() {}

    open(selector) {
        let mask = document.createElement("div");
        let wrap = document.querySelector(selector);
        if (this.mask) return;
        if (wrap && !this.mask) {
            try {
                mask.innerHTML = "Loading...";
                mask.style.fontSize = "24px";
                mask.style.textAlign = "center";
                mask.style.lineHeight = "200px";
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

    close(selector) {
        let wrap = document.querySelector(selector);
        if (wrap) {
            try {
                wrap.removeChild(this.mask);
                this.mask = null;
            } catch (error) {}
        }
    }
}
