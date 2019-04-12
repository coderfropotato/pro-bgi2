import { AddColumnService } from './../../super/service/addColumnService';
import { Observable, fromEvent } from 'rxjs';
import { StoreService } from './../../super/service/storeService';
import { GlobalService } from './../../super/service/globalService';
import { AjaxService } from './../../super/service/ajaxService';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MessageService } from '../../super/service/messageService';
import { NgxSpinnerService } from 'ngx-spinner';
import config from '../../../config';
import { routeAnimation } from '../../super/animation/animation';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

// import {OuterDataBaseService} from './../../super/service/outerDataBaseService';

declare const window: any;
declare const $: any;
@Component({
	selector: 'app-mrna-index',
	templateUrl: './index.component.html',
	animations: [ routeAnimation ]
})
export class IndexComponent implements OnInit {
	menuList: any = [];
	allThead: any = [];
	ready: boolean = false;
	taskCount: number = 0;
	indexMenu: Object;

	routerState: boolean = true;
	routerStateCode: string = 'active';
	getUnReadAnalysisCountTimer: any = null;
	constructor(
		private routes: ActivatedRoute,
		private router: Router,
		private ajaxService: AjaxService,
		private storeService: StoreService,
		private ngxSpinnerService: NgxSpinnerService,
		private addColumnService: AddColumnService,
		private message: MessageService,
		private modalService: NzModalService // private outerDataBaseService:OuterDataBaseService
	) {
		// this.router.events.subscribe((event) => {
		// 	if (event instanceof NavigationEnd) {
		// 		this.routerState = !this.routerState;
		// 		this.routerStateCode = this.routerState ? 'active' : 'inactive';

		// 		this.storeService.setNavigatedRoutes(this.router.url);
		// 	}
		// });
	}

	ngOnInit() {
		this.ngxSpinnerService.show();
		(async () => {
			try {
				await this.getLcInfo();
				// await this.getAddThead();
                // await this.getMenuList();

				this.getUnReadAnalysisCount();
				this.ready = true;
				setTimeout(() => {
					this.ngxSpinnerService.hide();
				}, 300);
			} catch (error) {
				this.ngxSpinnerService.hide();
				let tpl = this.modalService.error({
					nzTitle: '系统错误',
					nzContent: '缺少必要信息，请重新登录',
					nzClosable: false,
					nzOnCancel: () => {
						tpl.destroy();
					},
					nzOnOk: () => {
						this.router.navigate([ `/report/login` ]);
					}
				});
			}
		})();
	}

	async getLcInfo() {
		return new Promise((resolve, reject) => {
			this.ajaxService
				.getDeferData({
					url: `${config['javaPath']}/LCINFO/${sessionStorage.getItem('LCID')}`
				})
				.subscribe(
					(data) => {
						if (data['status'] === '0') {
							for (let key in data['data']) {
								this.storeService.setStore(key, data['data'][key]);
								if (typeof data['data'][key] !== 'object') {
									sessionStorage.setItem(key, data['data'][key]);
								} else {
									sessionStorage.setItem(key, JSON.stringify(data['data'][key]));
								}
							}

							this.menuList = data["data"].menu_list;

							// this.menuList = [
							// 	{
							// 		category: 'category_url_main',  // category_url_main
							// 		children: [
							// 			{
							// 				url: 'main',
							// 				geneType: 'all',
							// 				name: 'category_url_main',	// category_url_main
							// 				isExport: true,
							// 				content:"对全基因/转录本表格进行关键词搜索"
							// 			}
							// 		]
							// 	},
							// 	{
							// 		category: 'category_gene_expression',		// category_gene_expression
							// 		children: [
							// 			{
							// 				url: 'diff-expression-number',
							// 				geneType: 'all',
							// 				name: 'url_diff-expression-number',  // url_diff-expression-number
							// 				isExport: true,
							// 				content:"差异表达基因数量统计"
							// 			},
							// 			{
							// 				url: 'diff-expression',
							// 				geneType: 'all',
							// 				name: 'url_diff-expression',		// url_diff-expression
							// 				isExport: true,
							// 				content:"差异基因VENN/UpSetR图，查看各个比较组差异基因交/并集"
							// 			},
							// 			{
							// 				url: 'cluster',
							// 				geneType: 'all',
							// 				name: 'url_cluster',		// url_cluster
							// 				isExport: true,
							// 				content:"差异基因聚类热图，用色彩展示差异基因的表达量高低"
							// 			},
							// 			{
							// 				url: 'expression',
							// 				geneType: 'all',
							// 				name: 'url_expression',	// url_expression
							// 				isExport: true,
							// 				content:"表达量 VENN/UpSetR 图，查看各个分组或样本交/并集"
							// 			},
							// 			{
							// 				url: 'gene-expression-help',
							// 				geneType: null,
							// 				name: 'url_gene-expression-help',		// url_gene-expression-help
							// 				isExport: true,
							// 				content:"帮助信息"
							// 			}
							// 		]
							// 	},
							// 	{
							// 		category: 'category_annotation',		// category_annotation
							// 		children: [
							// 			{
							// 				url: 'go-class',	// url_go-class
							// 				geneType: 'all',
							// 				name: 'url_go-class',
							// 				isExport: true,
							// 				content:"差异基因GO注释分类"
							// 			},
							// 			{
							// 				url: 'go-enrichment',
							// 				geneType: 'all',
							// 				name: 'url_go-enrichment',		// url_go-enrichment
							// 				isExport: true,
							// 				content:"差异基因GO富集分析，查看差异基因富集在哪些功能类或参与哪些生物学过程"
							// 			},
							// 			{
							// 				url: 'kegg-class',
							// 				geneType: 'all',
							// 				name: 'url_kegg-class',		// url_kegg-class
							// 				isExport: true,
							// 				content:"差异基因KEGG Pathway注释分类"
							// 			},
							// 			{
							// 				url: 'kegg-enrichment',
							// 				geneType: 'all',
							// 				name: 'url_kegg-enrichment',		// url_kegg-enrichment
							// 				isExport: true,
							// 				content:"差异基因KEGG Pathway富集分析，查看差异基因主要富集在哪些代谢通路上"
							// 			},
							// 			{
							// 				url: 'enrichment-help',
							// 				geneType: null,
							// 				name: 'url_enrichment-help',		// url_enrichment-help
							// 				isExport: true,
							// 				content:"帮助信息"
							// 			}
							// 		]
							// 	},
							// 	{
							// 		category: 'category_variation',	// category_variation
							// 		children: [
							// 			{
							// 				url: 'alternative-splicing',
							// 				geneType: 'all',
							// 				name: 'url_alternative-splicing',		// url_alternative-splicing
							// 				isExport: true,
							// 				content:"各个样本可变剪接事件统计"
							// 			},
							// 			{
							// 				url: 'diff-alternative-splicing',
							// 				geneType: 'all',
							// 				name: 'url_diff-alternative-splicing',		// url_diff-alternative-splicing
							// 				isExport: true,
							// 				content:"各个比较组差异可变剪接事件统计"
							// 			},
							// 			{
							// 				url: 'gene-fusion',
							// 				geneType: 'all',
							// 				name: 'url_gene-fusion',		// url_gene-fusion
							// 				isExport: true,
							// 				content:"展示融合基因及其在染色体上位置情况"
							// 			},
							// 			{
							// 				url: 'as-fusion-help',
							// 				geneType: null,
							// 				name: 'url_fusion-help',		// url_fusion-help
							// 				isExport: true,
							// 				content:"帮助信息"
							// 			}
							// 		]
							// 	},
							// 	{
							// 		category: 'category_snp_indel',		// category_snp_indel
							// 		children: [
							// 			{
							// 				url: 'snp-overview',
							// 				geneType: 'all',
							// 				name: 'url_snp-overview',	// url_snp-overview
							// 				isExport: true,
							// 				content:"各个样本SNP类型统计"
							// 			},
							// 			{
							// 				url: 'snp-distribution',
							// 				geneType: 'all',
							// 				name: 'url_snp-distribution',	// url_snp-distribution
							// 				isExport: true,
							// 				content:"各个样本中SNP位点区域分布统计"
							// 			},
							// 			{
							// 				url: 'indel-overview',
							// 				geneType: 'all',
							// 				name: 'url_indel-overview',	// url_indel-overview
							// 				isExport: true,
							// 				content:"各个样本InDel注释统计"
							// 			},
							// 			{
							// 				url: 'indel-distribution',
							// 				geneType: 'all',
							// 				name: 'url_indel-distribution',	// url_indel-distribution
							// 				isExport: true,
							// 				content:"各个样本InDel位点区域分布统计"
							// 			},
							// 			{
							// 				url: 'snp-indel-help',
							// 				geneType: 'all',
							// 				name: 'url_snp-indel-help',	// url_snp-indel-help
							// 				isExport: true,
							// 				content:"帮助信息"
							// 			}
							// 		]
							// 	},
							// 	{
							// 		category: 'category_basic_info',	// category_basic_info
							// 		children: [
							// 			{
							// 				url: 'overview',
							// 				name: 'url_overview',	// url_overview
							// 				isExport: true,
							// 				content:"分析方案、样品相关性和表达量分布等"
							// 			},
							// 			{
							// 				url: 'reference',
							// 				name: 'url_reference',	// url_reference
							// 				isExport: true,
							// 				content:"参考物种的基因长度、外显子个数等统计等"
							// 			},
							// 			{
							// 				url: 'reads-filter',
							// 				name: 'url_reads-filter',	// url_reads-filter
							// 				isExport: true,
							// 				content:"测序数据的过滤和质控"
							// 			},
							// 			{
							// 				url: 'reads-alignment',
							// 				name: 'url_reads-alignment',	// url_reads-alignment
							// 				isExport: true,
							// 				content:"Reads与参考序列的比对、测序随机性和覆盖度等"
							// 			},
							// 			{
							// 				url: 'smallrna',
							// 				name: 'url_smallrna',	// url_smallrna
							// 				isExport: true,
							// 				content:"各样本小RNA数量、分类和长度等"
							// 			},
							// 			{
							// 				url: 'basic-help',
							// 				name: 'url_basic-help',	// url_basic-help
							// 				isExport: true,
							// 				content:"帮助信息"
							// 			}
							// 		]
							// 	}
							// ];

							//动态跳第一个页面  需要替换  /report/mrna 为当前url  不然后退的时候会回到 /report/mrna 导致路由容器为空
							let url =
								window.location.href.split('/report')[0] +
								`/report/mrna/${this.menuList[0]['children'][0]['url']}`;
							// let url = window.location.href.split('/report')[0]+`/report/mrna/diff-expression`;
							window.location.replace(url);

							let menuRouteMap = {};
							this.menuList.forEach((v, index) => {
								if (v['children'].length) {
									v['children'].forEach((val, i) => {
										val['category'] = v['category'];
										menuRouteMap[val['url']] = val;
									});
								}
							});
							
							sessionStorage.setItem('menu_list',JSON.stringify(this.menuList));
							this.storeService.setStore('menu', this.menuList);
							this.storeService.setStore('menuRouteMap', menuRouteMap);
							resolve('success');
						} else {
							reject('error');
						}
					},
					() => reject('error')
				);
		});
	}

	async getMenuList() {
		return new Promise((resolve, reject) => {
			let LCID = sessionStorage.getItem('LCID');
			this.ajaxService
				.getDeferData({
					data: { LCID },
					url: `${config['javaPath']}/menu`
				})
				.subscribe(
					(data) => {
						this.menuList = [
							{
								category: '布局一',
								children: [
									{
										url: 'layout1',
										name: '布局页面',
										isExport: true
									}
								]
							},
							{
								category: '布局二',
								children: [
									{
										url: 'layout2',
										name: '布局页面',
										isExport: true
									}
								]
							},
							{
								category: '表达量',
								children: [
									{
										url: 'express-venn',
										name: '表达量venn',
										isExport: true
									}
								]
							},
							{
								category: '差异',
								children: [
									{
										url: 'diff-venn',
										name: '差异venn',
										isExport: true
									}
								]
							},
							{
								category: '小表_demo',
								children: [
									{
										url: 'littleTableTest',
										name: '小表',
										isExport: true
									}
								]
							},
							{
								category: '表格转换_demo',
								children: [
									{
										url: 'transformationTable',
										name: 'transformation-table',
										isExport: true
									}
								]
							},
							{
								category: '普通大表_demo',
								children: [
									{
										url: 'bigTable',
										name: '普通大表',
										isExport: true
									}
								]
							},
							{
								category: '基因表_demo',
								children: [
									{
										url: 'table',
										name: 'GeneId 大表',
										isExport: true
									}
								]
							},
							{
								category: '网络图_demo',
								children: [
									{
										url: 'net',
										name: '网络图',
										isExport: true
									}
								]
							},
							{
								category: '增删列_demo',
								children: [
									{
										url: 'addColumn',
										name: '增删列',
										isExport: true
									}
								]
							},
							{
								category: '测序质控_demo',
								children: [
									{
										url: 'cxzk1',
										name: '测序质控',
										isExport: true
									}
								]
							},
							{
								category: 'GO富集',
								children: [
									{
										url: 'goRich',
										name: '图表切换',
										isExport: true
									}
								]
							},
							{
								category: '多组学_demo',
								children: [
									{
										url: 'multiOmics',
										name: '多组学',
										isExport: true
									}
								]
							},
							{
								category: '聚类_demo',
								children: [
									{
										url: 'cluster',
										name: '聚类',
										isExport: true
									}
								]
							}
						];

						//动态跳第一个页面
						let url =
							window.location.href.split('/report')[0] +
							`/report/mrna/${this.menuList[0]['children'][0]['url']}`;
						window.location.replace(url);
						resolve('success');
					},
					() => {
						reject('error');
					}
				);
		});
	}

	getUnReadAnalysisCount() {
		let getCount = () => {
			this.ajaxService
				.getDeferData({
					data: {
						LCID: sessionStorage.getItem('LCID')
					},
					url: `${config['javaPath']}/reAnalysis/count`
				})
				.subscribe(
					(data) => {
						if (data['status'] == 0) this.storeService.setStore('analysisCount', data['data'][0]);
					},
					(error) => {
						clearInterval(this.getUnReadAnalysisCountTimer);
					}
				);
		};

		getCount();

		this.getUnReadAnalysisCountTimer = setInterval(() => {
			getCount();
		}, config['getAnalysisCountInterval']);
	}

	// async getAddThead() {
	//     return new Promise((resolve, reject) => {
	//         let LCID = sessionStorage.getItem("LCID");
	//         this.ajaxService
	//             .getDeferData({
	//                 data: {},
	//                 url: `${config['javaPath']}/addColumn/${LCID}`
	//             })
	//             .subscribe(
	//                 data => {
	//                     if(data['status']==='0'){
	//                         let d = data['data'];
	//                         // let outerFlag = "006";
	//                         // let outerDataBase;

	//                         d.forEach((val,index)=>{
	//                             if(val['category']===config['outerDataBaseIndex']){
	//                                 // outerDataBase = d.splice(index,1)[0];
	//                                 val['children'].forEach(v=>{
	//                                     if(!('children' in v)) v['children'] = [];
	//                                     v['modalVisible'] = false;
	//                                     v['children'].forEach(item=>{
	//                                         this.initTreeData(item['treeData']);
	//                                     })
	//                                 })
	//                             }
	//                         })

	//                         // this.storeService.setThead(d);
	//                         this.addColumnService.set(d);
	//                         // outerDataBase['children'].forEach(v=>{
	//                         //     v['children'].forEach((val,index)=>{
	//                         //         val['generatedThead'] = [];
	//                         //         this.initTreeData(val['treeData']);
	//                         //     })
	//                         // });
	//                         // this.outerDataBaseService.set(outerDataBase);
	//                         resolve("success");
	//                     }else{
	//                         reject('error');
	//                     }
	//                 },
	//                 () => reject("error")
	//             );
	//     });
	// }

	// // 初始化 增删列树节点数据
	// initTreeData(treeData){
	//     if (!treeData || !treeData.length) return;
	//     let stack = [];
	//     for (var i = 0, len = treeData.length; i < len; i++) {
	//         stack.push(treeData[i]);
	//     }
	//     let item;
	//     while (stack.length) {
	//         item = stack.shift();

	//         if(item['isRoot']) item['isExpand'] = true;
	//         item['isExpand'] = true;
	//         item['isChecked'] = false;
	//         item['disabled'] = false;

	//         if (item.children && item.children.length) {
	//             stack = stack.concat(item.children);
	//         }
	//     }
	// }
}
