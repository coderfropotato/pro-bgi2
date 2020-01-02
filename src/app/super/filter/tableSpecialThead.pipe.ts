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

	// kegg富集表头 符合 mapMatchItems的项  需要多传compareGroup 或者 重分析id
	transform(
		value: any,    // 输入的值
		thead: any,  // 表头
		type:any, 	// searchType
		whitespace: boolean = false,	// 内容是否需要换行   popover里面需要换行（true） 在表格里显示不需要换行（false）
		compareGroup:any = undefined,  // 比较组，默认为空  在KEGG富集里面会跳转map  需要比较组或者重分析id作为参数
        id:any = undefined,	// 重分析id
		geneType:any = undefined, // 当前表格的基因类型  gene还是rna
		date: any = undefined,//时间
        keggrich:boolean = false,// 如果是富集  默认跳map 不是富集跳官网   只针对一个字段 kegg_pathway_term_id
	): object {

		// type = 'string';
		// thead = 'go_all';
		// value="[Cellular Component]---GO:0005737///cytoplasm+++GO:0000784///unclear chromosome,telomeric region+++GO:0000346///transcriot export complex+++GO:0000445///THO complex part of transcript export complex+++[Biological Process]---GO:20000002///negative regulation of DNA damage checkpoint+++GO:0046784///viral mRna export form host cell nucleus";


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
				if(geneType=="gene"){
					let url = `${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${sessionStorage.getItem('species_kingdom')}/${geneType}/nosts/${value}`;
					let htmlStr = `<a href="${url}" target="_blank">${value}</a>`
					return this.globalService.trustStringHtml(htmlStr);
				}else{
					if(thead == "rna_id"){
						let url = `${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${sessionStorage.getItem('species_kingdom')}/${geneType}/nosts/${value}`;
						let htmlStr = `<a href="${url}" target="_blank">${value}</a>`
						return this.globalService.trustStringHtml(htmlStr);
					}else if(thead == "gene_id"){
						let url = `${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${sessionStorage.getItem('species_kingdom')}/gene/nosts/${value}`;
						let htmlStr = `<a href="${url}" target="_blank">${value}</a>`
						return this.globalService.trustStringHtml(htmlStr);
					}
				}
				
			} else {
				// 其他跳转规则
				let matchList = config['matchList'];
				let matchRule = config['matchRule'];
				let flag = config['urlSplitFlag'];//链接url的@
				let mapMatchItems = config['mapMatchItems'];
				let valSplitFlag = config['valSplitFlag']; //value的'+++'
				let idFlag = config['idComposeDesc']; //id+描述的'///'
				let unableClickSplitFlag = config['unableClickSplitFlag'];
				let htmlStr = '',
					urlArr = [];
				let whiteWrapReg = /.+(\_desc)|(\_term)$/g;
				let goAll = config['goAll'];

				// 链接跳转
				if (matchList.includes(thead)) {
					let curRule = matchRule[thead];
					let curUrl = curRule['url'];
					let session=curRule['session'] || "";
					let sessionVal= sessionStorage.getItem(session) || '';

					if (curUrl) {
						if(typeof curUrl === 'string'){
							urlArr=curUrl.split(flag);
						}else if(curUrl instanceof Array && curUrl.length){
							if(session && sessionVal){
								if(session=='species_kingdom'){
									switch (sessionVal) {
										case "animal":
											urlArr =curUrl[0].split(flag);
											break;
										case "plant":
											urlArr =curUrl[1].split(flag);
											break;
										default:
											if (whiteWrapReg.test(thead) || value.indexOf(valSplitFlag)!=-1) {
												let textArr = value.split(valSplitFlag);
												textArr.forEach((v, i) => {
													htmlStr += `<span>${v}</span>`;
													htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
												});
											} else {
												htmlStr += value;
											}
											break;
									}
								}
							}
						}
						
						if (whiteWrapReg.test(thead) || value.indexOf(valSplitFlag)!=-1) {
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
						if (whiteWrapReg.test(thead) || value.indexOf(valSplitFlag)!=-1) {
							let textArr = value.split(valSplitFlag);
							textArr.forEach((v, i) => {
								htmlStr += `<span>${v}</span>`;
								htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
							});
						} else {
							htmlStr += value;
						}
					}
				}else if(mapMatchItems.includes(thead)){  // map跳转
					// 04145///Phagosome+++04540///Gap junction+++05130///Pathogenic Escherichia coli infection

					// 先按+++ 切

					// 04145///Phagosome
					// 04540///Gap junction
					// 05130///Pathogenic Escherichia coli infection

                    // /// 切[0]

                        let a = value.split(valSplitFlag);
                        a.forEach((v,index) => {
                            let mapid = v.split(idFlag)[0];
                            let href:string;

                            if(keggrich){
                                // 跳map
                                href=`${window.location.href.split('report')[0]}report/map/${sessionStorage.getItem('LCID')}/${mapid}/${compareGroup}/${id}/${geneType}/${date}`;
                            }else{
                                // 跳官网
                                let url = matchRule[thead]['url'].split(flag)[0];
                                href=url+mapid;
                            }

                            htmlStr+=`<a href="${href}" target="_blank">${v}</a>`;
                            if(whitespace) {
                                htmlStr+=index !==a.length-1?'<br>':'';
                            }else{
                                htmlStr+='&emsp;';
                            }
                        });

				}else if(goAll.includes(thead)){
					// goAll
					let splitUnlink = value.split(unableClickSplitFlag);
					// [Cellular Component]---GO:0005737///cytoplasm+++GO:0000784///unclear chromosome,telomeric region+++GO:0000346///transcriot export complex+++GO:0000445///THO complex part of transcript export complex+++[Biological Process]---GO:20000002///negative regulation of DNA damage checkpoint+++GO:0046784///viral mRna export form host cell nucleus
					/*
						[Cellular Component]
						<a href="GO:0005737">GO:0005737///cytoplasm</a>
					*/
					let prefixUrl = matchRule[thead]['url'].split(flag)[0];
					splitUnlink.forEach(v=>{
						if(v.indexOf(valSplitFlag)==-1 && v.indexOf(idFlag)==-1){
							htmlStr+=`<span>${v}</span>`
							htmlStr+=whitespace?'<br>':'';
						}else{
							v.split(valSplitFlag).forEach((val,index)=>{
								if(val.indexOf(idFlag)!=-1){
									htmlStr+=`<a href="${prefixUrl+val.split(idFlag)[0]}" target="_blank">${val}</a>`
								}else{
									htmlStr+=`<span>${val}</span>`
								}

								if(whitespace){
									htmlStr+=index!=val.length-1?'<br>':'';
								}else{
									htmlStr+='&emsp;';
								}
							})
						}
					})

				}else if(thead=="url_ncbi_gene_id"||thead=="url_hgnc_gene_id"||thead=="url_ensembl_gene_id"){
					let href:string;
					if(thead=="url_ncbi_gene_id"){
						let url=`https://www.ncbi.nlm.nih.gov/gene/`;
						href=url+value;
					}else if(thead=="url_hgnc_gene_id"){
						let url=`https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/`;
						href=url+value;
					}else if(thead=="url_ensembl_gene_id"){
						let url=`https://ensembl.org/${sessionStorage.getItem('species_name')}/Gene/Summary?g=`;
						href=url+value;
					}

					htmlStr+=`<a href="${href}" target="_blank">${value}</a>`;
					


					// 有+++ 按+++ 换行  没有默认
					// if ((''+value).indexOf(valSplitFlag)!=-1) {
					// 	let textArr = value.split(valSplitFlag);
					// 	textArr.forEach((v, i) => {
					// 		htmlStr += `<span>${v}</span>`;
					// 		htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
					// 	});
					// } else {
					// 	htmlStr += value;
					// }
				} else {
					// 有+++ 按+++ 换行  没有默认
					if ((''+value).indexOf(valSplitFlag)!=-1) {
						let textArr = value.split(valSplitFlag);
						textArr.forEach((v, i) => {
							htmlStr += `<span>${v}</span>`;
							htmlStr += i !== textArr.length - 1 && whitespace ? '<br>' : '&emsp;';
						});
					} else {
						htmlStr += value;
					}
				}

				return this.globalService.trustStringHtml(htmlStr);
			}
		} else {
			return whitespace?value:this.accuracy(value, null, type)
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
