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

    /**
     * @description  menuRouteMap
     * @type {object}
     * @memberof StoreService
     */
    store:object=  {};


    navigatedRoute :Array<string>= [];
    tid:any = null;
    colors:string[] = ["#1f77b4", "#ff7f0e", "#aec7e8", "#ffbb78", "#2ca02c", "#ff9896", "#98df8a", "#d62728", "#8c564b", "#c49c94", "#e377c2", "#bcbd22", "#17becf", "#9edae5", "#e6550d", "#66CCCB", "#CCFF66", "#FF99CC", "#FF9999", "#FFCC99", "#FF6666", "#FFFF66", "#99CC66", "#666699", "#FF9999", "#99CC33", "#FF9900", "#FFCC00", "#FF0033", "#FF9966", "#FF9900", "#CCFF00", "#CC3399", "#FF6600", "#993366", "#CCCC33", "#666633", "#66CCCC", "#666699", "#FF0033", "#333399", "#CCCC00", "#33CC99", "#FFFF00", "#336699", "#FFFF99", "#99CC99", "#666600", "#996633", "#FFFF99", "#99CC66", "#006600", "#66CC66", "#CCFF99", "#666600", "#CCCC66", "#CCFFCC", "#669933", "#CCCC33", "#663300", "#666633", "#999933", "#CC9966", "#003300", "#669933", "#CCCC99", "#006633", "#CCCC66", "#666600", "#FFFFCC", "#999999", "#006633", "#333300", "#FFCCCC", "#99CCCA", "#3399CC", "#CCFFCC", "#99CCCB", "#FFFFCC", "#CCCCFF", "#99CCFF", "#FFCC99", "#FFFFCC", "#99CCFF", "#336699", "#CCFF99", "#CCFFFF", "#99CCCC", "#336699", "#6699CC", "#99CC33", "#3399CC", "#0099CC", "#FFFFCC", "#666699", "#CCCCCD", "#003366", "#99CCFF", "#0099CC", "#6699CC", "#336699", "#CCCC99", "#003366", "#3399CC", "#003366", "#6699CC", "#006699", "#003366", "#006699", "#999933", "#336699", "#333333", "#FFFFCC", "#CCFFFF", "#99CCCE", "#FFCC99", "#FF9999", "#996699", "#CC9999", "#FFFFCC", "#CCCC99", "#FFFF99", "#0099CC", "#CCCCCC", "#FF9966", "#FFCCCC", "#CC9966", "#CC9999", "#FFFF66", "#CC3333", "#003366", "#993333", "#CCCC00", "#663366", "#CCCC99", "#666666", "#CC9999", "#0066CC", "#CC0033", "#CCCC00", "#336633", "#990033", "#FFCC99", "#993333", "#CC9966", "#003300", "#FF0033", "#333399", "#CCCC00", "#CC0033", "#003399", "#99CC00", "#CC0033", "#999933", "#333300", "#FFFF00", "#CCCC00", "#99CCFF", "#FFCC33", "#FFFFCC", "#FFFF33", "#99CCFF", "#FFFF00", "#9933FF", "#99CCFF", "#FFFF33", "#FFCC00", "#66CC00", "#FFFF99", "#FF9900", "#FFFF00", "#0099CC", "#0000CC", "#CC9999", "#FFFFCC", "#6666CC", "#999933", "#FFFFCC", "#CC99CC", "#CCCC00", "#666600", "#FFFF66", "#FF9966", "#FFFFCC", "#99CC99", "#FFCC33"];
    constructor() {}

    setThead(thead) {
        this.thead = thead;
    }

    getThead() {
        // 每次都获取一个实例
        return JSON.parse(JSON.stringify(this.thead));
    }

    setLang(lang){
        this.lang = lang;
    }

    getLang(){
        return this.lang;
    }

    setStore(key,value){
        this.store[key] = value;
    }

    getStore(key){
        return this.store[key];
    }

    // 记录导航过的路由
    setNavigatedRoutes(url){
        if(!this.navigatedRoute.includes(url)){
            this.navigatedRoute.push(url)
        }
    }

    // 获取导航过的路由的集合
    getNavigatedRoutes(){
        return this.navigatedRoute;
    }

    getColors(){
        return this.colors;
    }

    setTid(id){
        this.tid = id;
    }

    getTid(){
        return this.tid;
    }
}
