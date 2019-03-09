import { GlobalService } from 'src/app/super/service/globalService';
import { Pipe, PipeTransform } from '@angular/core';
import config from '../../../config';

/**
 * @description 表格特殊字段过滤
 * @author Yangwd<277637411@qq.com>
 * @date 2019-03-08
 * @param {*} value 表格值
 * @param {*} thead 表头
 * @param {boolean} whitespace 表格内部不换行为false 外部popover换行为true
 * @returns {string}
 * @memberof TableSpecialTheadFilter
 */

@Pipe({
	name: 'tableSpecialTheadFilter',
	pure: true
})
export class TableSpecialTheadFilter implements PipeTransform {
	constructor(private globalService: GlobalService) {}

	transform(value: any, thead: any, whitespace: boolean = false): object {
		if (!value && value != 0) return this.globalService.trustStringHtml(`<span>NA</span>`);

		if (thead === 'splie_site') {
			if (value.indexOf('-') != -1) {
				let strArr = value.split('-');
				let htmlstring = '';
				strArr.forEach((v, index) => {
					htmlstring += `<span>${v}</span>`;
					if (index !== strArr.length - 1) htmlstring += '<br>';
				});
				return this.globalService.trustStringHtml(htmlstring);
			} else {
				return this.globalService.trustStringHtml(`<span>${value}</span>`);
			}
		} else {
			let matchList = config['matchList'];
			let matchRule = config['matchRule'];
			let flag = config['urlSplitFlag'];
			let valSplitFlag = config['valSplitFlag'];
			let idFlag = config['idComposeDesc'];
			let htmlStr = '',
				urlArr = [];
			let whiteWrapReg = /.+(\_desc)|(\_term)$/g;

			if (matchList.includes(thead) && matchRule[thead]['url']) {
				let curRule = matchRule[thead];
				let curUrl = curRule['url'];

				// if((typeof curUrl) ==='string'){
				//     urlArr = curUrl.split(flag);
				// }else{
				//     urlArr = curUrl[0].split(flag);
				// }

				urlArr = typeof curUrl === 'string' ? curUrl.split(flag) : curUrl[0].split(flag);

				if (whiteWrapReg.test(thead)) {
					let textArr = value.split(valSplitFlag);
					textArr.forEach((v, i) => {
                        let id = v.indexOf(idFlag) != -1 ? v.split(idFlag)[0] : null;
                        let url = urlArr[0] + id ;
                        if(urlArr[1]) url+=urlArr[1];

						htmlStr += `<a href="${url}" target="_blank">${v}</a>`;
						htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
					});
				} else {
                    let url = urlArr[0] + value ;
                    if(urlArr[1]) url+=urlArr[1];

					htmlStr += `<a href="${url}" target="_blank">${value}</a>`;
				}
			} else {
				htmlStr += value;
			}

			return this.globalService.trustStringHtml(htmlStr);
		}
	}
}
