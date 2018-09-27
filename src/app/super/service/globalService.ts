import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
    providedIn: "root"
})
export class GlobalService {
    loading: object;
    constructor(private sanitizer: DomSanitizer) {
    }

    // 将表格的筛选条件装换成文字
    /*string       searchType    default regExp
            模糊like    regExp
            等于=
            不等于！=
            包含in

        float double              default    range
            范围A-B     range
            等于=       equal
            不等于！=   $ne
            包含In      $in
            大于（>）   $gt
            小于(<)     $lt
            大于等于（>=）  $gte
            小于等于（<=）  $lte
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
        text = "<span>筛选条件:</span>&emsp;";
        htmlStringList.push({ html: null, obj: null, beforeHtml: text });

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
                }
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
}
