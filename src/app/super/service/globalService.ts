import { Injectable, TemplateRef } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import {NzModalRef, NzModalService } from "ng-zorro-antd";
declare const $: any;
/**
 * @description 小服务集合
 * @author Yangwd<277637411@qq.com>
 * @date 2018-10-12
 * @export
 * @class GlobalService
 */
@Injectable({
    providedIn: "root"
})
export class GlobalService {

    colorPickerModal:NzModalRef = null;

    constructor(
        private sanitizer: DomSanitizer,
        private modalService: NzModalService
    ) {}

    // 将表格的筛选条件装换成文字
    /*  string (default regExp)      searchType
            模糊like                       regExp
            等于=                           equal
            不等于！=                       $ne
            包含in                          $in
            不为空                          $notNull

        int double (default range)
            范围A-B                         range
            等于=                           equal
            不等于！=                       $ne
            包含In                          $in
            大于（>）                       $gt
            小于(<)                         $lt
            大于等于（>=）                  $gte
            小于等于（<=）                  $lte
            绝对值>=                        $gteabs
            绝对值>                         $gtabs
            不为空                          $notNull

        新增类型

        total
            大于等于（>=）                  $gte
        number
            0-1                             $and
    */

    /*
        [
            {
                filterName:"gender",
                filterType:"equal",
                valueOne:"male",
                valueTwo:null
            }
        ]
    */
    transformFilter(filterObjectList) {
        let text: string;
        let htmlStringList: object[] = [];
        // text = "<span>筛选条件:</span>&emsp;";
        // htmlStringList.push({ html: null, obj: null, beforeHtml: text });
        if (filterObjectList.length) {
            filterObjectList.forEach(el => {
                switch (el.filterType) {
                    case "regExp":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">like</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "range":
                        // Identity BETWEEN valueOne ~ valueTwo
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">BETWEEN</font>&nbsp;${
                            el.valueOne
                        }~${el.valueTwo}&emsp;`;
                        break;
                    case "equal":
                        // Identity = 12
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">=</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$ne":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">!=</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$in":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">IN</font>&nbsp;${el.valueOne.split(
                            ","
                        )}&emsp;`;
                        break;
                    case "$gt":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">$gt;</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$lt":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">&lt;</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$gte":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">&gt;=</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$lte":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">&lt;=</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$gteabs":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">abs &gt;=</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$gtabs":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">abs &gt;</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                        break;
                    case "$notNull":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">not Null</font>&nbsp;&emsp;`;
                    break;
                    case "$and":
                        text = `<span>${
                            el.filterNamezh
                        }</span>&nbsp;<font color="#f40">choose</font>&nbsp;${
                            el.valueOne
                        }&emsp;`;
                    break;
                }
                htmlStringList.push({ html: null, obj: el, beforeHtml: text });
            });
            return this.trustHtml(htmlStringList);
        } else {
            htmlStringList = [];
            return htmlStringList;
        }
    }

    transformRootFilter(rootFilterList) {
        let text: string;
        let htmlStringList: object[] = [];
        // text = "<span>一级筛选条件:</span>&emsp;";
        // htmlStringList.push({ html: null, obj: null, beforeHtml: text });

        if (rootFilterList.length) {
            rootFilterList.forEach(el => {
                text = `<span>${
                    el.filterNamezh
                }</span>&nbsp;<font color="#f40">${el.filterType}</font>&nbsp;${
                    el.valueOne
                }&emsp;`;
                htmlStringList.push({ html: null, obj: el, beforeHtml: text });
            });
            return this.trustHtml(htmlStringList);
        } else {
            htmlStringList = [];
            return htmlStringList;
        }
    }

    // 将html字符串 绕过安全检查 生成可以直接通过[innerHTML]绑定的字符串
    trustHtml(html: object[]) {
        if (html.length) {
            let res: object[] = [];
            html.forEach((val, index) => {
                html[index]["html"] = this.sanitizer.bypassSecurityTrustHtml(
                    val["beforeHtml"]
                );
            });
        }
        return html;
    }

    openColorPicker(
        templateRef: TemplateRef<any>,
        confirmCallBack: any,
        cancelCallBack: any,
        posLeft?: string,
        posTop?: String
    ): void {
        this.colorPickerModal = this.modalService.create({
            nzMask: true,
            nzContent: templateRef,
            nzStyle: {
                position: "absolute",
                marginLeft: `${posLeft ? 0 : -138}px`,
                marginTop: `${posTop ? 0 : -250}px`,
                top: posTop || "50%",
                left: posLeft || "50%"
            },
            nzWidth: 276,
            nzMaskClosable: true,
            nzOnOk: () => {
                this.colorPickerModal.destroy();
                confirmCallBack();
            },
            nzOnCancel() {
                this.colorPickerModal.destroy();
                cancelCallBack();
            }
        });
    }

    /**
     * @description popover
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-02
     * @param {*} event 事件对象
     * @param {*} text 显示的文本信息
     * @memberof GlobalService
     */
    showPopOver(event, text) {
        if ($(".popover-service").length) $(".popover-service").remove();

        let pop = $(
            `<div class='ng-popover popover-service'>${text}<i class="arrow-outer"></i><i class="arrow-inner"></i></div>`
        );

        $("body")
            .css("position", "realtive")
            .append(pop);

        pop.css("position", "absolute")
            .css("opacity", 0)
            .css("z-index", 100);
        let dis = 20;
        let direction = "right";
        let w = pop.outerWidth();
        let h = pop.outerHeight();

        if (event.pageX + w < document.body.clientWidth - 20) {
            // right
            direction = "right";
            pop.css("left", event.pageX  + dis);
        } else {
            // left
            direction = "left";
            pop.css("left", event.pageX - w - dis);
        }

        pop.css("top", event.pageY - h / 2);
        pop.addClass(direction).css("opacity", 1);
    }

    hidePopOver() {
        $(".popover-service").remove();
    }
}
