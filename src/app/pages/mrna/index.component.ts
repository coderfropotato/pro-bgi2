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
		private message: MessageService,
		private ajaxService: AjaxService,
		private storeService: StoreService,
		private ngxSpinnerService: NgxSpinnerService,
		private addColumnService: AddColumnService,
		private modalService: NzModalService // private outerDataBaseService:OuterDataBaseService
	) {
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.routerState = !this.routerState;
				this.routerStateCode = this.routerState ? 'active' : 'inactive';

				this.storeService.setNavigatedRoutes(this.router.url);
			}
		});
	}

	ngOnInit() {
		this.ngxSpinnerService.show();
		(async () => {
			try {
				await this.getLcInfo();
				// await this.getAddThead();
                //await this.getMenuList();

				// this.getUnReadAnalysisCount();
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

							//this.menuList = data["data"].menu_list;

							/**
                             * 基础模块
                             * 项目概况	overview
                             * 参考信息	reference
                             * reads过滤	reads-filter
                             * reads检测	reads-alignment
                             * 小RNA检测	smallrna
                             * 帮助	basic-help
                             *
                             * 差异表达
                             * 差异表达	diff-expression
                             * 帮助	diff-expression-help
                             *
                             * 表达量
                             * 表达量	expression
                             * 帮助	expression-help
                             *
                             * 差异聚类	cluster
                             * 帮助	cluster-help
                             *
                             * GO
                             * GO分类 go-class
                             * GO富集	go-enrichment
                             * 帮助	go-help
                             *
                             * KEGG
                             * KEGG分类	kegg-class
                             * KEGG富集	kegg-enrichment
                             * 帮助	kegg-help
                             *
                             * 结构变异
                             * SNP	snp
                             * INDEL	indel
                             * 可变剪切	alternative-splicing
                             * 基因融合	gene-fusion
                             * 帮助	structure-variation-help
                             *
                             * 基因总表
                             * 基因总表	gene
                             */
							this.menuList = [
								{
									category: '主页',
									children: [
										{
											url: 'main',
											geneType: 'all',
											name: '主页',
											isExport: true
										}
									]
								},
								{
									category: '基因表达',
									children: [
										{
											url: 'diff-expression-number',
											geneType: 'all',
											name: '差异基因数量',
											isExport: true
										},
										{
											url: 'diff-expression',
											geneType: 'all',
											name: '差异venn',
											isExport: true
										},
										{
											url: 'cluster',
											geneType: 'all',
											name: '聚类',
											isExport: true
										},
										{
											url: 'expression',
											geneType: 'all',
											name: '表达量',
											isExport: true
										},
										{
											url: 'gene-expression-help',
											geneType: null,
											name: '帮助',
											isExport: true
										}
									]
								},
								{
									category: '基因注释',
									children: [
										{
											url: 'go-class',
											geneType: 'all',
											name: 'GO分类',
											isExport: true
										},
										{
											url: 'go-enrichment',
											geneType: 'all',
											name: 'GO富集',
											isExport: true
										},
										{
											url: 'kegg-class',
											geneType: 'all',
											name: 'KEGG分类',
											isExport: true
										},
										{
											url: 'kegg-enrichment',
											geneType: 'all',
											name: 'KEGG富集',
											isExport: true
										},
										{
											url: 'gene-annotation-help',
											geneType: null,
											name: '帮助',
											isExport: true
										}
									]
								},
								{
									category: '基因变异',
									children: [
										{
											url: 'alternative-splicing',
											geneType: 'all',
											name: '可变剪接',
											isExport: true
										},
										{
											url: 'diff-alternative-splicing',
											geneType: 'all',
											name: '差异可变剪接',
											isExport: true
										},
										{
											url: 'gene-fusion',
											geneType: 'all',
											name: '基因融合',
											isExport: true
										},
										{
											url: 'as-sv-help',
											geneType: null,
											name: '帮助',
											isExport: true
										}
									]
								},
								{
									category: 'SNP/InDel',
									children: [
										{
											url: 'snp-overview',
											geneType: 'all',
											name: 'SNP总览',
											isExport: true
										},
										{
											url: 'snp-distribution',
											geneType: 'all',
											name: 'SNP区域总览',
											isExport: true
										},
										{
											url: 'indel-overview',
											geneType: 'all',
											name: 'InDel总览',
											isExport: true
										},
										{
											url: 'indel-distribution',
											geneType: 'all',
											name: 'InDel区域总览',
											isExport: true
										},
										{
											url: 'snp-indel-help',
											geneType: 'all',
											name: '帮助',
											isExport: true
										}
									]
								},
								{
									category: '基因信息',
									children: [
										{
											url: 'overview',
											name: '项目概况',
											isExport: true
										},
										{
											url: 'reference',
											name: '参考信息',
											isExport: true
										},
										{
											url: 'reads-filter',
											name: 'Reads过滤',
											isExport: true
										},
										{
											url: 'reads-alignment',
											name: 'Reads比对',
											isExport: true
										},
										{
											url: 'smallrna',
											name: '小RNA检测',
											isExport: true
										},
										{
											url: 'basic-help',
											name: '帮助',
											isExport: true
										}
									]
								}
							];

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
