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
import { NzModalRef, NzModalService,NzNotificationService } from 'ng-zorro-antd';

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
        private notify:NzNotificationService,
		private modalService: NzModalService // private outerDataBaseService:OuterDataBaseService
	) {
		// this.router.events.subscribe((event) => {
		// 	if (event ins，tanceof NavigationEnd) {
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
                this.getUnReadAnalysisCount();
                this.getNotification();
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

    getNotification(){
        this.ajaxService.getDeferData({
            data:{},
            url:`${config['javaPath']}/getInform`
        }).subscribe(res=>{
            if(res['status'] == 0 && res['data'][0].length){
                this.notify.blank('System notification',res['data'][0],{
                    nzDuration:0,
                    nzStyle:{
                        width: '320px'
                    }
                });
            }
        })
    }
}
