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

	transform(value: any, thead: any, type:any, whitespace: boolean = false): object {
		if (!value && value != 0) return this.globalService.trustStringHtml(`<span>NA</span>`);
		if (type === 'string') {
			if (thead.endsWith('splice_site')) {
				if (value.indexOf('-') != -1) {
					let strArr = value.split('-');
					let htmlstring = '';
					strArr.forEach((v, index) => {
						htmlstring += `<span>${v}</span>`;
						if (index !== strArr.length - 1) {
							if (whitespace) {
								htmlstring += '<br>';
							} else {
								htmlstring += '&emsp;';
							}
						}
					});
					return this.globalService.trustStringHtml(htmlstring);
				} else {
					return this.globalService.trustStringHtml(`<span>${value}</span>`);
				}
			}else if (config['geneInfo'].includes(thead)){
				// 基因详情页
				let url = `${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${value}`;
				let htmlStr = `<a href="${url}" target="_blank">${value}</a>`
				return this.globalService.trustStringHtml(htmlStr);
			} else {
				// 其他跳转规则
				let matchList = config['matchList'];
				let matchRule = config['matchRule'];
				let flag = config['urlSplitFlag'];
				let valSplitFlag = config['valSplitFlag'];
				let idFlag = config['idComposeDesc'];
				let htmlStr = '',
					urlArr = [];
				let whiteWrapReg = /.+(\_desc)|(\_term)$/g;

				if (matchList.includes(thead)) {
					let curRule = matchRule[thead];
					let curUrl = curRule['url'];

					if (matchRule[thead]['url']) {
						urlArr = typeof curUrl === 'string' ? curUrl.split(flag) : curUrl[0].split(flag);

						if (whiteWrapReg.test(thead)) {
							let textArr = value.split(valSplitFlag);
							textArr.forEach((v, i) => {
								let id = v.indexOf(idFlag) != -1 ? v.split(idFlag)[0] : null;
								let url = urlArr[0] + id;
								if (urlArr[1]) url += urlArr[1];

								htmlStr += `<a href="${url}" target="_blank">${v}</a>`;
								htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
							});
						} else {
							let url = urlArr[0] + value;
							if (urlArr[1]) url += urlArr[1];

							htmlStr += `<a href="${url}" target="_blank">${value}</a>`;
						}
					} else {
						if (whiteWrapReg.test(thead)) {
							let textArr = value.split(valSplitFlag);
							textArr.forEach((v, i) => {
								htmlStr += `<span>${v}</span>`;
								htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
							});
						} else {
							htmlStr += value;
						}
					}
				} else {
					htmlStr += value;
				}

				return this.globalService.trustStringHtml(htmlStr);
			}
		} else {
			return this.accuracy(value, null, type);
		}
	}

	accuracy(value: any, args?: any, type?: any): any {
		if (!value && value != 0) return 'NA';
		if (type == 'string') {
			return value;
		} else {
			if (type === 'double') {
				// if (args == -1) return value;
				if (`${value}`.indexOf('.') != -1) {
					if (`${value}`.split('.')[1].length > 5) {
						let e = value.toExponential(3);
						return e;
					} else {
						return value;
					}
				} else {
					return value;
				}
				// if (!isNaN(value)) {
				//     var f = parseFloat(value);
				//     if (isNaN(f)) {
				//         return value;
				//     } else {
				//         return this.toAccuracy(value, args);
				//     }
				// } else {
				//     return value;
				// }
			} else if (type == 'int') {
				return this.toThousands(value);
			} else {
				return value;
			}
		}
	}

	toThousands(num) {
		let number = (num || 0).toString(),
			result = '';
		while (number.length > 3) {
			result = ',' + number.slice(-3) + result;
			number = number.slice(0, number.length - 3);
		}
		if (number) {
			result = number + result;
		}
		return result;
	}

	toAccuracy(value, args) {
		if (isNaN(parseFloat(value))) {
			return value;
		} else {
			let t = 1;
			let num = args;
			for (; args > 0; t *= 10, args--);
			for (; args < 0; t /= 10, args++);

			let rlt = Math.round(value * t) / t;
			let rltText = '';
			rltText = rlt.toString();
			let rs = rltText.indexOf('.');
			if (rs < 0) {
				rs = rltText.length;
				rltText += '.';
			}
			rs = Number(rs) + Number(num);
			while (rltText.length <= rs) {
				rltText += '0';
			}
			return rltText;
		}
	}
}
