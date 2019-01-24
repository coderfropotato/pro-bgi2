import { StoreService } from './../service/storeService';
import { AjaxService } from './../service/ajaxService';
import { ToolsService } from './../service/toolsService';
import {
	Component,
	OnInit,
	Input,
	Output,
	OnChanges,
	SimpleChanges,
	EventEmitter
} from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import config from '../../../config';
declare const $: any;
@Component({
	selector: 'app-tools',
	templateUrl: './tools.component.html',
	styles: []
})
export class ToolsComponent implements OnInit {
	// heatmap goRich keggRich goClass keggClass line net

	/*
        "heatmaprelation""关联聚类"
        "heatmapexpress""表达量聚类"
        "heatmapdiff" "差异聚类"
        "multiOmics" "多组学关联"
        "net" 普通网络图
        "netrelation" "关联网络图"
    */

	/*
        聚类，富集，KDA 需要生信重分析
    */

	toolList: object[] = [
		{
			type: 'heatmap',
			name: '聚类重分析',
			desc:
				'横轴表示取log2后的差异倍数，即log2FoldChange。纵轴表示基因，默认配色下，色块的颜色越红表达量越高，颜色越蓝，表达量越低。',
			limit: [1],
			category: 'common'
		},
		{
			type: 'classification',
			name: '基因分类',
			desc:
				'将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。',
			limit: [1],
			category: 'common'
		},
		{
			type: 'enrichment',
			name: '基因富集',
			desc:
				'将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。',
			limit: [1],
			category: 'common'
		},
		{
			type: 'net',
			name: '蛋白网络互作',
			desc:
				'图中的每个点代表一个基因，连线表示这两个基因间有互作关系。点的大小和颜色都表示互作连接数，点越大，连接数越多。颜色由蓝色到红色渐变，越红表示连接数越多。',
			limit: [1, 500],
			category: 'common'
		},
		{
			type: 'line',
			name: '折线图',
			desc: '以折线图方式呈现数据',
			limit: [1, 100],
			category: 'common'
		},
		{ type: 'KDA', name: 'KDA', desc: 'kda', limit: [1, 500], category: 'common' },
		{
			type: 'multiOmics',
			name: '多组学关联',
			desc: '多组学',
			limit: [1, 500],
			category: 'common'
		},
		{ type: 'chiSquare', name: '卡方检测', desc: '卡方', limit: [1, 500], category: 'common' },
		{ type: 'as', name: '可变剪切', desc: '可变剪切', limit: [1, 500], category: 'common' },
		{
			type: 'linkedNetwork',
			name: '关联网络图',
			desc: '关联网络图',
			limit: [1, 500],
			category: 'relation'
		},
		{
			type: 'heatmaprelation',
			name: '关联聚类热图',
			desc: '关联聚类热图',
			limit: [1, 500],
			category: 'relation'
		}
	];
	desc: string = '';
	title: String = '';
	disabled: boolean = false;

	// 聚类参数
	expressData: any[] = [];
	expressUpload: any = [];
	expressSelect: any[] = [];
	expressError: any = false;

	diffData: any[] = [];
	diffUpload: any = [];
	diffSelect: any[] = [];
	diffError: any = false;

	customData: any[] = [];
	customUpload: any[] = [];
	customSelect: any[] = [];
	customError: any = false;

	geneType: any[] = [];
	geneTypeError: any = false;
	selectGeneType: any[] = [];

	stand: string = '';
	standList: any[] = [];

	doHeatmapAjax: boolean = false;
	clusterByGeneType: boolean = false;

	// 多组学参数
	multiOmicsData: any[] = [];
	multiOmicsSelect: any[] = [];
	multiOmicsError: any = false;
	doMultiOmicsAjax: boolean = false;

	// 折线图参数
	lineGroupData: object[] = [];
	lineSampleData: object[] = [];
	lineGroupSelect: object[] = [];
	lineSampleSelect: object[] = [];
	lineGroupError: boolean = false;
	lineSampleError: boolean = false;
	lineCustomData: object[] = [];
	lineCustomSelect: object[] = [];
	lineCustomError: boolean = false;
	doLineAjax: boolean = false;

	//卡方图参数
	geneNum: number;
	kaFunDataName: string;
	kaFunStatistics: any[] = [];
	kaFunStatisticsName: string;
	kaFunGroupData: object[] = [];
	kaFunGroupSelect: object[] = [];
	kaFunGroupError: boolean = false;
	doKaFunAjax: boolean = false;

	// 网络图参数
	netData: object[] = [];
	netError: boolean = false;
	netSelect: object[] = [];
	doNetAjax: boolean = false;

	// 关联网络图参数
	relativeNetData: object[] = [];
	relativeNetError: boolean = false;
	relativeNetSelect: object[] = [];
	doRelativeNetAjax: boolean = false;

	// 关联聚类参数
	heatmapReStand: string[] = [];
	heatmapReSelectStand: string = '';
	heatmapReGeneType: object[] = [];
	heatmapReGeneTypeError: boolean = false;
	heatmapReRelations: object[] = [];
	heatmapReError: any = false;
	doHeatmapRelationAjax: boolean = false;
	heatmapReSelectRelation: any[] = [];
	heatmapReSelectGeneType: object[] = [];

	// 基因分类参数
	geneClassData: any[] = [];
	geneClassSelect: any[] = [];
	geneClassError: boolean = false;
	doGeneClassAjax: boolean = false;

	// 基因富集参数
	geneRichData: any[] = [];
	geneRichSelect: any[] = [];
	geneRichError: boolean = false;
	doGeneRichAjax: boolean = false;

	// 当前选择的重分析类型
	selectType: string = '';
	childVisible: boolean = false;
	isSubmitReanalysis: boolean = false; // 是否在提交重分析任务
	geneCount: number = 0;
	isRelation: boolean = false; // 是否是关联关系的表格

	constructor(
		public toolsService: ToolsService,
		private ajaxService: AjaxService,
		private storeService: StoreService,
		private notify: NzNotificationService
	) {}

	ngOnInit() {
		this.init();

		// 订阅打开抽屉
		this.toolsService.getOpen().subscribe(res => {
			this.geneCount = res[0];
			this.isRelation = res[1];
			this.formatTools();
		});
	}

	init() {
		this.desc = '';
		this.title = '';
		this.disabled = false;
		// 初始化聚类参数
		this.expressData = [];
		this.expressUpload = [];
		this.expressSelect = [];
		this.expressError = false;

		this.diffData = [];
		this.diffUpload = [];
		this.diffSelect = [];
		this.diffError = false;

		this.customData = [];
		this.customUpload = [];
		this.customSelect = [];
		this.customError = false;

		this.geneType = [];
		this.selectGeneType = [];
		this.geneTypeError = false;

		this.stand = '';
		this.standList = [];
		this.doHeatmapAjax = false;
		this.clusterByGeneType = false;

		// 多组学参数
		this.multiOmicsData = [];
		this.multiOmicsSelect = [];
		this.multiOmicsError = true;
		this.doMultiOmicsAjax = false;

		// 折线图参数
		this.lineGroupData = [];
		this.lineSampleData = [];
		this.lineGroupSelect = [];
		this.lineSampleSelect = [];
		this.lineGroupError = false;
		this.lineSampleError = false;
		this.lineCustomError = false;
		this.lineCustomData = [];
		this.lineCustomSelect = [];
		this.doLineAjax = false;

		//卡方检验
		this.geneNum = 1;
		this.kaFunDataName = '';
		this.kaFunGroupData = [];
		this.kaFunGroupSelect = [];
		this.kaFunGroupError = false;
		this.doKaFunAjax = false;

		// 网络图
		this.netData = [];
		this.netError = false;
		this.netSelect = [];
		this.doNetAjax = false;

		// 关联网络图
		this.relativeNetData = [];
		this.relativeNetError = false;
		this.relativeNetSelect = [];
		this.doRelativeNetAjax = false;

		// 关联聚类
		this.heatmapReStand = [];
		this.heatmapReSelectStand = '';
		this.heatmapReGeneType = [];
		this.heatmapReSelectGeneType = [];
		this.heatmapReGeneTypeError = false;
		this.heatmapReRelations = [];
		this.heatmapReSelectRelation = [];
		this.heatmapReError = false;
		this.doHeatmapRelationAjax = false;

		// 基因分类参数
		this.geneClassData = [];
		this.geneClassSelect = [];
		this.geneClassError = false;
		this.doGeneClassAjax = false;

		// 基因富集参数
		this.geneRichData = [];
		this.geneRichSelect = [];
		this.geneRichError = false;
		this.doGeneRichAjax = false;

		// 页面参数
		this.selectType = '';
		this.childVisible = false;
		this.isSubmitReanalysis = false;
	}

	formatTools() {
		this.toolList.forEach(v => {
			if (v['category'] === 'common') {
				if (v['limit'].length === 1) {
					v['disabled'] = this.geneCount >= v['limit'][0] ? false : true;
				} else {
					v['disabled'] =
						this.geneCount < v['limit'][0] || this.geneCount > v['limit'][1]
							? true
							: false;
				}
			} else {
				if (!this.isRelation) {
					v['disabled'] = true;
				} else {
					if (v['limit'].length === 1) {
						v['disabled'] = this.geneCount >= v['limit'][0] ? false : true;
					} else {
						v['disabled'] =
							this.geneCount < v['limit'][0] || this.geneCount > v['limit'][1]
								? true
								: false;
					}
				}
			}
		});
	}

	close() {
		this.toolsService['visible'] = false;
		this.init();
	}

	handlerMouseOver(tool) {
		this.title = tool['name'];
		this.desc = tool['desc'];
		this.disabled = tool['disabled'];
	}

	selectParams(tool) {
		if (tool['disabled']) return;
		let type = tool['type'];
		this.init();
		if (type == 'as') {
			this.relativeSpliceConfirm();
		} else {
			this['get' + type + 'Params']();
			this.selectType = type;
			this.childVisible = true;
		}
	}

	/**
	 * @description 聚类的参数选择
	 * @author Yangwd<277637411@qq.com>
	 * @date 2018-11-27
	 * @param {*} target 当前点击的对象
	 * @param {*} selected 当前分类选中的数据集合
	 * @param {*} type 当前分类类型  用于设置错误信息
	 * @returns
	 * @memberof ToolsComponent
	 */
	handlerHeatmapSelect(target, selected, type) {
		// 选中变为不选中
		if (target['checked']) {
			target['checked'] = false;
			let index = this.findIndex(target['name'], selected, 'name');
			if (index != -1) selected.splice(index, 1);
			this[`${type}Error`] = false;
		} else {
			// 不选中变为选中
			// 最多选择20个
			if (selected.length >= 20) {
				this[`${type}Error`] = 'maxover';
				return;
			}
			this[`${type}Error`] = false;
			target['checked'] = true;
			selected.push(target);
		}

		if (!selected.length) this[`${type}Error`] = 'nodata';
	}

	// 基因分类选择 默认不选 只能选一个
	handlerGeneSelect(geneType) {
		// 选中变未选中
		if (geneType['checked']) {
			this.geneType.forEach(v => (v['checked'] = false));
			let index = this.findIndex(geneType['name'], this.selectGeneType, 'name');
			if (index != -1) this.selectGeneType.splice(index, 1);
		} else {
			this.geneType.forEach(v => (v['checked'] = false));
			this.selectGeneType.length = 0;
			// 未选中变选中
			geneType['checked'] = true;
			this.selectGeneType.push(geneType);
		}
		this.clusterByGeneType = false;
	}

	// 聚类取消
	cancel() {
		this.selectType = '';
		this.childVisible = false;
	}

	findIndex(x, arr, key) {
		return arr.findIndex((val, index) => {
			return x === val[key];
		});
	}

	getheatmapParams() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/cluster/heatmapConfig`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead')
				}
			})
			.subscribe(
				data => {
					if (data['status'] == '0') {
						let res = data['data'];
						this.expressData = res['expression'].map(val => {
							val['checked'] = false;
							return val;
						});

						if (this.expressData.length) {
							this.expressData[0]['checked'] = true;
							this.expressSelect = [this.expressData[0]];
						}
						this.expressUpload = res['exp_user'];

						this.diffData = res['diff'].map(val => {
							val['checked'] = false;
							return val;
						});
						if (this.diffData.length) {
							this.diffData[0]['checked'] = true;
							this.diffSelect = [this.diffData[0]];
						}
						this.diffUpload = res['dif_user'];

						this.geneType = res['verticalDefault'];
						this.geneType.forEach((val, index) => {
							val['checked'] = false;
						});

						this.customData = res['customData'].map(val => {
							val['checked'] = false;
							return val;
						});
						if (this.customData.length) {
							this.customData[0]['checked'] = true;
							this.customSelect = [this.customData[0]];
						}

						this.standList = res['standardization'];
						this.stand = this.standList[0];
					}
				},
				err => console.log(err),
				() => {
					this.doHeatmapAjax = true;
				}
			);
	}

	// 提交聚类重分析  需要生信重分析 需要1 不需要2
	heatmapConfirm(type) {
		// this.isSubmitReanalysis = true;
		// let tempChooseList = this[`${type}Select`].map((val) => {
		// 	let temp = {};
		// 	temp[val['category']] = val['name'];
		// 	return temp;
		// });
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');

		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: `heatmap${type}`,
					needReanalysis: 1,
					// chooseType: [ this.switchType(type) ],
					chooseList: this[`${type}Select`],
					verticalDefault: this.selectGeneType,
					choose:this.clusterByGeneType,
					...tableEntity,
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version')
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						this.selectType = '';
						this.childVisible = false;
						this.toolsService.hide();
						this.notify.blank('tips：', '聚类重分析提交成功', {
							nzStyle: { width: '200px' }
						});
					} else {
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	switchType(type) {
		switch (type) {
			case 'express':
				return 'expression';
			default:
				return type;
		}
	}

	// 获取多组学参数
	getmultiOmicsParams() {
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead')
				},
				url: `${config['javaPath']}/multiOmics/config`
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.multiOmicsData = data['data'];
						} else {
							this.multiOmicsData.length = 0;
						}
					} else {
						this.multiOmicsData.length = 0;
					}
				},
				err => {
					this.multiOmicsData.length = 0;
				},
				() => {
					this.doMultiOmicsAjax = true;
				}
			);
	}

	multiOmicsClick(item) {
		item['checked'] = !item['checked'];
		let index = this.multiOmicsSelect.findIndex((val, index) => {
			return val['key'] === item['key'];
		});
		if (item['checked']) {
			if (index == -1) this.multiOmicsSelect.push(item);
		} else {
			if (index != -1) this.multiOmicsSelect.splice(index, 1);
		}

		this.multiOmicsError = !this.multiOmicsSelect.length;
	}

	multiOmicsConfirm(type) {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: type,
					needReanalysis: 2,
					classInfo: this.multiOmicsSelect,
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-multiOmics/${this.toolsService.get('geneType')}/${
								data['data'][0]
							}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	getchiSquareParams() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/chiSquare/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead'),
					geneNum: this.toolsService.get('geneCount')
				}
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data']) {
							this.kaFunGroupSelect.length = 0;

							let m_list = data['data']['Classification'].map((v, index) => {
								// let status = index?false:true;
								// if(status)
								// this.kaFunGroupSelect.push({
								// 	name:v.name,
								// 	key:v.key,
								// 	category:v.category,
								// 	checked:true
								// });
								// return {
								// 	name:v.name,
								// 	key:v.key,
								// 	category:v.category,
								// 	checked:status
								// };
								this.kaFunGroupSelect.push({
									name: v.name,
									key: v.key,
									category: v.category,
									checked: true
								});
								return {
									name: v.name,
									key: v.key,
									category: v.category,
									checked: true
								};
							});

							this.kaFunDataName = data['data']['Data']; //data Name
							this.kaFunStatistics = data['data']['Statistics'];

							this.kaFunStatisticsName = this.kaFunStatistics.length
								? this.kaFunStatistics[0]
								: '';
							this.kaFunGroupData = m_list;
						} else {
							this.initKaFunData();
						}
					} else {
						this.initKaFunData();
					}
				},
				err => {
					this.initKaFunData();
				},
				() => {
					this.doKaFunAjax = true;
				}
			);
	}

	initKaFunData() {
		this.kaFunGroupData.length = 0;
		this.kaFunGroupSelect.length = 0;
	}

	// 卡方图参数选择
	kaFunClick(item) {
		let temp = this.kaFunGroupSelect;

		item['checked'] = !item['checked'];
		let index = temp.findIndex((val, index) => {
			return val['name'] === item['name'];
		});

		if (item['checked']) {
			if (index == -1) temp.push(item);
		} else {
			if (index != -1) temp.splice(index, 1);
		}

		this.kaFunGroupError = !this.kaFunGroupData.length;
	}

	onkaFunChange(value: any): void {
		console.log(value);
	}

	kaFunConfirm(reanalysisType) {
		if (this.kaFunGroupSelect.length < 2) {
			this.notify.blank('tips：', '请至少选择2个', {
				nzStyle: { width: '200px' }
			});
			return;
		}
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: reanalysisType,
					needReanalysis: 2,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					statisticData: this.kaFunDataName,
					statisticMethod: this.kaFunStatisticsName,
					classification: this.kaFunGroupSelect,
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-chiSquare/${this.toolsService.get('geneType')}/${
								data['data'][0]
							}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 折线图
	getlineParams() {
		// 获取折线图参数
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead')
				},
				url: `${config['javaPath']}/line/config`
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data']) {
							this.lineGroupSelect.length = 0;
							this.lineSampleSelect.length = 0;

							let group = data['data']['group'].map((v, index) => {
								let status = index ? false : true;
								v['checked'] = status;
								if (status) this.lineGroupSelect.push(v);
								return v;
							});

							let sample = data['data']['sample'].map((v, index) => {
								let status = index ? false : true;
								v['checked'] = status;
								if (status) this.lineSampleSelect.push(v);
								return v;
							});

							let custom = data['data']['userDefData'].map((v, index) => {
								let status = index ? false : true;
								v['checked'] = status;
								if (status) this.lineCustomSelect.push(v);
								return v;
							});

							this.lineCustomData = custom;
							this.lineGroupData = group;
							this.lineSampleData = sample;

							this.lineGroupError = !this.lineGroupSelect.length;
							this.lineSampleError = !this.lineSampleSelect.length;
							this.lineCustomError = !this.lineCustomSelect.length;
						} else {
							this.initLineData();
						}
					} else {
						this.initLineData();
					}
				},
				err => {
					this.initLineData();
				},
				() => {
					this.doLineAjax = true;
				}
			);
	}

	initLineData() {
		this.lineCustomData.length = 0;
		this.lineCustomSelect.length = 0;
		this.lineGroupData.length = 0;
		this.lineSampleData.length = 0;
		this.lineGroupSelect.length = 0;
		this.lineSampleSelect.length = 0;
	}

	// 折线图参数选择
	lineClick(type, item) {
		let temp = null;
		switch (type) {
			case 'group':
				temp = this.lineGroupSelect;
				break;
			case 'sample':
				temp = this.lineSampleSelect;
				break;
			case 'custom':
				temp = this.lineCustomSelect;
				break;
		}

		item['checked'] = !item['checked'];
		let index = temp.findIndex((val, index) => {
			return val['name'] === item['name'];
		});

		if (item['checked']) {
			if (index == -1) temp.push(item);
		} else {
			if (index != -1) temp.splice(index, 1);
		}

		this.lineGroupError = !this.lineGroupSelect.length;
		this.lineSampleError = !this.lineSampleSelect.length;
		this.lineCustomError = !this.lineCustomSelect.length;
	}

	// 提交折线图重分析
	lineConfirm(reanalysisType, selectType) {
		this.isSubmitReanalysis = true;
		let tempSelect = null;
		switch (selectType) {
			case 'group':
				tempSelect = this.lineGroupSelect;
				break;
			case 'sample':
				tempSelect = this.lineSampleSelect;
				break;
			case 'custom':
				tempSelect = this.lineCustomSelect;
				break;
		}

		// let tempChooseList = tempSelect.map((val) => {
		// 	let temp = {};
		// 	temp[val['category']] = val['name'];
		// 	return temp;
		// });

		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					reanalysisType: reanalysisType,
					needReanalysis: 2,
					// chooseType: [ 'expression' ],
					chooseList: tempSelect,
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-line/${this.toolsService.get('geneType')}/${
								data['data'][0]
							}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	//可变剪切提交
	relativeSpliceConfirm() {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');

		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'as',
					needReanalysis: 2,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-as/${this.toolsService.get('geneType')}/${
								data['data'][0]
							}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 网路图
	getnetParams() {
		this.netData = this.copy(this.storeService.getStore('relations'));
		this.netData.forEach((v, index) => {
			v['checked'] = index ? false : true;
		});
		this.netSelect.push(this.copy(this.netData[0]));
	}

	netClick(item) {
		item['checked'] = !item['checked'];

		if (item['checked']) {
			this.netSelect.length = 0;
			this.netData.forEach(v => {
				if (v['checked']) this.netSelect.push(this.copy(v));
			});
		} else {
			let index = this.netSelect.findIndex((v, index) => {
				return v['key'] === item['key'];
			});

			if (index != -1) {
				this.netSelect.splice(index, 1);
			}
		}
	}

	netConfirm() {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');

		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'net',
					needReanalysis: 2,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					netParams: this.netSelect.map(v => {
						v['limit'] = false;
						return v;
					}),
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-net/${this.toolsService.get('geneType')}/${
								data['data'][0]
							}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 关联网路图
	getlinkedNetworkParams() {
		this.relativeNetData = this.toolsService.get('tableEntity')['relations'];
		this.doRelativeNetAjax = true;
		this.relativeNetData.forEach((v, index) => {
			v['checked'] = index ? false : true;
		});
		this.relativeNetSelect.push(this.copy(this.relativeNetData[0]));

		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/linkedNetwork/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					tid: 'tid' in entity ? entity['tid'] : null,
					geneType: entity['geneType'],
					species: entity['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead'),
					relations: entity['relations']
				}
			})
			.subscribe(
				res => {
					if (res['status'] === '0') {
						if (!res['data'].length) {
							this.relativeNetData.length = 0;
							this.relativeNetSelect.length = 0;
							this.relativeNetError = true;
						} else {
							this.relativeNetData = res['data'];
							this.relativeNetData.forEach((v, index) => {
								v['checked'] = index ? false : true;
							});
							this.relativeNetSelect.push(this.copy(this.relativeNetData[0]));
							this.relativeNetError = false;
						}
					}
				},
				err => {
					this.relativeNetError = true;
				},
				() => {
					this.doRelativeNetAjax = true;
				}
			);
	}

	relativeNetClick(item) {
		item['checked'] = !item['checked'];

		if (item['checked']) {
			this.relativeNetSelect.length = 0;
			this.relativeNetData.forEach(v => {
				if (v['checked']) this.relativeNetSelect.push(this.copy(v));
			});
		} else {
			let index = this.relativeNetSelect.findIndex((v, index) => {
				return v['key'] === item['key'];
			});

			if (index != -1) {
				this.relativeNetSelect.splice(index, 1);
			}
		}
	}

	relativeNetConfirm() {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let entity = this.toolsService.get('tableEntity');
		entity['relations'] = this.relativeNetSelect;
		entity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'linkedNetwork',
					needReanalysis: 2,
					version: this.storeService.getStore('version'),
					geType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-linkedNetwork/${this.toolsService.get(
								'geneType'
							)}/${data['data'][0]}/${this.storeService.getStore('version')}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						newWindow.close();
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					newWindow.close();
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 关联聚类
	getheatmaprelationParams() {
		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/relationCluster/heatmapConfig`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					tid: 'tid' in entity ? entity['tid'] : null,
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead'),
					relations: this.toolsService.get('tableEntity')['relations']
				}
			})
			.subscribe(
				data => {
					if (data['status'] == '0') {
						this.heatmapReError = false;
						this.heatmapReStand = data['data']['standardization'];
						this.heatmapReGeneType = data['data']['verticalDefault'];
						this.heatmapReRelations = data['data']['relations'];
						if (this.heatmapReStand.length) {
							this.heatmapReSelectStand = this.heatmapReStand[0];
						}
						this.heatmapReRelations.forEach((v, index) => {
							v['checked'] = index ? false : true;
							if (!index)
								this.heatmapReSelectRelation.push(JSON.parse(JSON.stringify(v)));
						});
					} else {
						this.heatmapReError = 'error';
						this.initHeatmapRelationsData();
					}
				},
				err => {
					this.heatmapReError = 'error';
					this.initHeatmapRelationsData();
				},
				() => {
					this.doHeatmapRelationAjax = true;
				}
			);
	}

	initHeatmapRelationsData() {
		this.heatmapReStand.length = 0;
		this.heatmapReGeneType.length = 0;
		this.heatmapReRelations.length = 0;
		this.heatmapReSelectRelation.length = 0;
		this.heatmapReSelectGeneType.length = 0;
		this.heatmapReSelectStand = '';
	}

	// 关系选择
	handlerReRelationSelect(item) {
		this.heatmapReSelectRelation.length = 0;

		if (!item['checked']) {
			this.heatmapReRelations.forEach(v => (v['checked'] = false));
			item['checked'] = true;
			this.heatmapReSelectRelation.push(JSON.parse(JSON.stringify(item)));
		} else {
			item['checked'] = false;
		}

		this.heatmapReError = !this.heatmapReSelectRelation.length;
	}

	// 基因类型选择
	handlerReGeneSelect(item) {
		if (!item['checked']) {
			if (this.heatmapReSelectGeneType.length >= 2) {
				this.heatmapReGeneTypeError = true;
			} else {
				item['checked'] = true;
				this.heatmapReSelectGeneType.push(item);
				this.heatmapReGeneTypeError = false;
			}
		} else {
			item['checked'] = false;

			let index = this.heatmapReSelectGeneType.findIndex((val, index) => {
				return val['key'] === item['key'];
			});

			if (index != -1) this.heatmapReSelectGeneType.splice(index, 1);
			this.heatmapReGeneTypeError = !this.heatmapReSelectGeneType.length;
		}
	}

	heatmapRelationConfirm() {
		this.isSubmitReanalysis = true;
		let entity = this.toolsService.get('tableEntity');
		entity['relations'] = this.heatmapReSelectRelation;
		entity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'heatmaprelation',
					needReanalysis: 1,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity,
					standardization: this.heatmapReSelectStand,
					verticalDefault: this.heatmapReSelectGeneType
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.blank('tips：', '关联聚类重分析提交成功', {
								nzStyle: { width: '200px' }
							});
						} else {
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	getclassificationParams() {
		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/classification/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: entity['geneType'],
					species: entity['species'],
					version: this.storeService.getStore('version')
				}
			})
			.subscribe(
				res => {
					this.geneClassData.length = 0;
					this.geneClassSelect.length = 0;

					if (res['status'] == 0 && res['data'].length) {
						this.geneClassData = res['data'].map((v, index) => {
							let obj = {
								name: v,
								checked: index ? false : true
							};
							return obj;
						});
						this.geneClassSelect.push(this.geneClassData[0]);
						this.geneClassError = false;
					} else {
						this.geneClassError = true;
					}
				},
				error => {
					this.geneClassData.length = 0;
					this.geneClassSelect.length = 0;
					this.geneClassError = true;
				},
				() => {
					this.doGeneClassAjax = true;
				}
			);
	}

	handlerGeneClassSelect(klass) {
		if (klass['checked']) {
			klass['checked'] = false;
			let index = this.geneClassSelect.findIndex((val, index) => {
				return val['name'] === klass['name'];
			});

			if (index != -1) this.geneClassSelect.splice(index, 1);
		} else {
			this.geneClassSelect.forEach(v => (v['checked'] = false));
			klass['checked'] = true;
			this.geneClassSelect.length = 0;
			this.geneClassSelect.push(klass);
		}
	}

	geneClassConfirm() {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(
			`${window.location.href.split('report')[0]}report/reanalysis/loading`
		);
		let entity = this.toolsService.get('tableEntity');
		entity['relations'] = this.heatmapReSelectRelation;
		entity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'classification',
					needReanalysis: 2,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity,
					annotation: this.geneClassSelect[0]['name']
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${
								window.location.href.split('report')[0]
							}report/reanalysis/re-classification/${this.toolsService.get(
								'geneType'
							)}/${data['data'][0]}/${this.storeService.getStore('version')}/${
								this.geneClassSelect[0]['name']
							}`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.blank('tips：', '基因分类重分析提交成功', {
								nzStyle: { width: '200px' }
							});
						} else {
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	getenrichmentParams() {
		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/classification/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: entity['geneType'],
					species: entity['species'],
					version: this.storeService.getStore('version')
				}
			})
			.subscribe(
				res => {
					this.geneRichData.length = 0;
					this.geneRichSelect.length = 0;
					if (res['status'] == 0 && res['data'].length) {
						this.geneRichData = res['data'].map((v, index) => {
							let obj = {
								name: v,
								checked: index ? false : true
							};
							return obj;
						});
						this.geneRichSelect.push(this.geneRichData[0]);
						this.geneRichError = false;
					} else {
						this.geneRichError = true;
					}
				},
				error => {
					this.geneRichData.length = 0;
					this.geneRichSelect.length = 0;
					this.geneRichError = true;
				},
				() => {
					this.doGeneRichAjax = true;
				}
			);
	}

	handlerGeneRichSelect(rich) {
		if (rich['checked']) {
			rich['checked'] = false;
			let index = this.geneRichSelect.findIndex((val, index) => {
				return val['name'] === rich['name'];
			});

			if (index != -1) this.geneRichSelect.splice(index, 1);
		} else {
			this.geneRichSelect.forEach(v => (v['checked'] = false));
			rich['checked'] = true;
			this.geneRichSelect.length = 0;
			this.geneRichSelect.push(rich);
		}
	}

	geneRichConfirm() {
		this.isSubmitReanalysis = true;
		let entity = this.toolsService.get('tableEntity');
		entity['relations'] = this.heatmapReSelectRelation;
		entity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'classification',
					needReanalysis: 1,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity,
					annotation: this.geneRichSelect[0]['name']
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				data => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.blank('tips：', '基因富集重分析提交成功', {
								nzStyle: { width: '200px' }
							});
						} else {
							this.notify.blank('tips：', '重分析提交失败，请重试', {
								nzStyle: { width: '200px' }
							});
						}
					} else {
						this.notify.blank('tips：', '重分析提交失败，请重试', {
							nzStyle: { width: '200px' }
						});
					}
				},
				err => {
					this.notify.blank('tips：', '重分析提交失败，请重试', {
						nzStyle: { width: '200px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	handlerChildClose() {
		if (!this.isSubmitReanalysis) {
			this.selectType = '';
			this.childVisible = false;
		}
	}

	copy(object) {
		if (object instanceof Object) {
			return JSON.parse(JSON.stringify(object));
		} else if (object instanceof Array) {
			return [...object];
		} else {
			return object;
		}
	}
}
