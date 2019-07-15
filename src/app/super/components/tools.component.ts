import { StoreService } from './../service/storeService';
import { AjaxService } from './../service/ajaxService';
import { ToolsService } from './../service/toolsService';
import { Component, OnInit, Input, Output, OnChanges, AfterViewInit, SimpleChanges, EventEmitter } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import config from '../../../config';
import { IfStmt } from '@angular/compiler';
declare const $: any;
@Component({
	selector: 'app-tools',
	templateUrl: './tools.component.html',
	styles: [
		`
		.ant-btn:focus,.ant-btn:active{
			color:rgba(0, 0, 0, 0.65);
			border:1px solid #d9d9d9;
		}
		.ant-btn:nth-child(0) hover{
			color:#7da0ff;
			border:1px solid #7da0ff;
		}
		.ant-btn:nth-child(1) hover{
			color:#fff;
			border:1px solid #7da0ff;
		}
		`
	]
})
//color:#7da0ff;
export class ToolsComponent implements OnInit {
	// heatmap goRich keggRich goClass keggClass line net

	/*
        "heatmapRelation""关联聚类"
        "heatmapExpress""表达量聚类"
        "heatmapDiff" "差异聚类"
        "multiOmics" "多组学关联"
        "net" 普通网络图
        "netrelation" "关联网络图"
    */

	/*
        聚类，富集，KDA 需要生信重分析
    */

	toolList: object[] = [
		// { type: 'heatmap', name: '聚类重分析', desc: '横轴表示取log2后的差异倍数，即log2FoldChange。纵轴表示基因，默认配色下，色块的颜色越红表达量越高，颜色越蓝，表达量越低。', limit: [1,2000], category: 'common' },
		// { type: 'classification', name: '基因分类', desc: '将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。', limit: [1], category: 'common' },
		// { type: 'enrichment', name: '基因富集', desc: '将基因参与的KEGG代谢通路分为7个分支：细胞过程(Cellular Processes)、环境信息处理(Environmental Information Processing)、遗传信息处理(Genetic Information Processing)、人类疾病（Human Disease）（仅限动物）、代谢(Metabolism)、有机系统(Organismal Systems)、药物开发（Drug Development）。每一分支下进一步分类统计。下图是所选基因集的KEGG Pathway注释分类结果。', limit: [1], category: 'common' },
		// { type: 'net', name: '蛋白网络互作', desc: '图中的每个点代表一个基因，连线表示这两个基因间有互作关系。点的大小和颜色都表示互作连接数，点越大，连接数越多。颜色由蓝色到红色渐变，越红表示连接数越多。', limit: [1, 500], category: 'common' },
		// { type: 'line', name: '折线图', desc: '以折线图方式呈现数据', limit: [1, 100], category: 'common' },
		// { type: 'kda', name: 'KDA', desc: 'kda', limit: [1], category: 'common' },
		// { type: 'multiOmics', name: '多组学关联', desc: '多组学', limit: [1], category: 'common' },
		// { type: 'chiSquare', name: '卡方检测', desc: '卡方', limit: [40], category: 'common' },
		// { type: 'as', name: '可变剪切', desc: '可变剪切', limit: [1, 100], category: 'common' },
		// { type: 'linkedNetwork', name: '关联网络图', desc: '关联网络图', limit: [1, 500], category: 'relation' },
		// { type: 'heatmapRelation', name: '关联聚类热图', desc: '关联聚类热图', limit: [1, 2000], category: 'relation' }
	];
	desc: string = '';
	title: String = '';
	disabled: boolean = false;

	// 聚类参数
	heatmapData: any;
	heatmapSelectList: any[] = [];
	heatmapSelect: any = '';
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

	// KDA
	kdaKeyGeneCountRange: number[] = [1, 40, 10];
	kdaRelationGeneCountRange: number[] = [1, 50, 20];
	kdaPpiScore: any[] = [];
	kdaKeyRelationComposeMax: number = 400;
	ppiFlagKey: string = 'ppi';
	kdaError: boolean = false;

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
	netGeneType: string;
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
	reClusterByGeneType: boolean = false;

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

	//GSEA
	gaeaRange: number[] = [5, 10000];
	gseaMax: number = 500;
	gseaMin: number = 15;
	maxFlag: boolean = false;
	minFlag: boolean = false;

	radioValue: string = "A";
	radioAFlag: boolean = true;
	radioAFrist: string = "";
	radioASecond: string = "";

	radioBFlag: boolean = false;
	inputBFrist: string = "";//输入框
	selectBFristTag: any[] = [];
	inputBSecond: string = "";//输入框
	selectBSecondTag: any[] = [];

	gseaSample: any[] = [];
	gseaUser: any[] = [];
	gseaGroup: object = {};
	handleGroup: any[] = [];
	controlGroup: any[] = [];

	gseaGroup2: any[] = [];
	handleGroup2: any[] = [];
	controlGroup2: any[] = [];

	gseaDataBase: any[] = []; //数据库
	radioDataBase: string = "A";
	baseFlag: boolean = true;
	baseFlag2: boolean = false;
	gseaDataBaseLeft: any[] = [];
	gseaDBLeftSelect: string = "";
	gseaDataBaseRight: any[] = [];
	gseaDBRightSelect: string = "";
	gseaDBRightSelectType: number = 0;
	//
	//type
	//db []

	gseaClassError: boolean = false;

	// 当前选择的重分析类型
	selectType: string = '';
	childVisible: boolean = false;
	isSubmitReanalysis: boolean = false; // 是否在提交重分析任务
	geneCount: number = 0;
	isRelation: boolean = false; // 是否是关联关系的表格
	relativeGeneCount: number = 0; // 关联的基因个数
	srcTotal: number = 0; // 表头基因个数

	constructor(
		public toolsService: ToolsService,
		private ajaxService: AjaxService,
		private storeService: StoreService,
		private notify: NzNotificationService,
		private translate: TranslateService
	) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	ngOnInit() {
		this.init();

		// 订阅打开抽屉
		// geneCount选中的基因个数,isRelation是否是关联表,relativeGeneCount(+),srcTotal
		this.toolsService.getOpen().subscribe((res) => {
			this.toolList = JSON.parse(sessionStorage.getItem('toolsInfo'))[
				this.toolsService.get('tableEntity')['geneType']
			];
			this.geneCount = res[0];
			this.isRelation = res[1];
			this.relativeGeneCount = res[2];
			this.srcTotal = res[3];
			this.formatTools();
		});
	}

	init() {
		this.desc = '';
		this.title = '';
		this.disabled = false;
		// 初始化聚类参数
		this.heatmapData = null;
		this.heatmapSelectList = [];
		this.heatmapSelect = '';

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

		// KDA参数
		this.kdaError = false;
		this.kdaKeyGeneCountRange = [1, 40, 10];
		this.kdaRelationGeneCountRange = [1, 50, 20];
		this.kdaPpiScore = [];

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
		this.reClusterByGeneType = false;

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

		//GSAE
		this.maxFlag = false;
		this.minFlag = false;

		this.radioValue = "A";
		this.radioAFlag = true;
		this.radioAFrist = "";
		this.radioASecond = "";

		this.radioBFlag = false;
		this.inputBFrist = "";
		this.selectBFristTag = [];
		this.inputBSecond = "";
		this.selectBSecondTag = [];

		this.gseaSample = [];
		this.gseaUser = [];
		this.gseaGroup = {};
		this.handleGroup = [];
		this.controlGroup = [];
		this.gseaDataBase = [];
		this.gseaDataBaseLeft = [];
		this.gseaDataBaseRight = [];

		this.radioDataBase ="A";

		this.gseaDBLeftSelect = "";
		this.gseaDBRightSelect = "";
		this.gseaDBRightSelectType = 0;

		this.handleGroup2 = [];
		this.controlGroup2 = [];

		this.gseaClassError = false;

		// 页面参数
		this.selectType = '';
		this.childVisible = false;
		this.isSubmitReanalysis = false;
	}

	// geneCount选中的基因个数,isRelation是否是关联表,relativeGeneCount(+),srcTotal
	formatTools() {
		this.toolList.forEach((v) => {
			if (v['category'] === 'common') {
				if (v['limit'].length === 1) {
					v['disabled'] = this.geneCount >= v['limit'][0] ? false : true;
				} else {
					v['disabled'] = this.geneCount < v['limit'][0] || this.geneCount > v['limit'][1] ? true : false;
				}
			} else {
				if (!this.isRelation) {
					v['disabled'] = true;
				} else {
					// 关联聚类 srcTotal*
					if (v['type'] === 'heatmapRelation') {
						// 是否disabled
						let flag1 = false, // 关联的基因乘积是否满足条件
							flag2 = false;

						flag1 = this.srcTotal * this.geneCount > config['relationHeatmapLimit'] ? true : false;
						// 选择的基因数量是否满足条件
						flag2 = this.geneCount < v['limit'][0] || this.geneCount > v['limit'][1] ? true : false;
						v['disabled'] = flag1 || flag2;
					} else {
						// 其他关联 +
						if (v['limit'].length === 1) {
							v['disabled'] = this.relativeGeneCount >= v['limit'][0] ? false : true;
						} else {
							v['disabled'] =
								this.relativeGeneCount < v['limit'][0] || this.relativeGeneCount > v['limit'][1]
									? true
									: false;
						}
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
	 * @param {*} type 当前分类类型  用于设置错误信息
	 * @returns
	 * @memberof ToolsComponent
	 */
	handlerHeatmapSelect(target, type) {
		// 选中变为不选中
		if (target['checked']) {
			target['checked'] = false;
			let index = this.findIndex(target['name'], this[`${type}Select`], 'name');
			if (index != -1) this[`${type}Select`].splice(index, 1);
			this[`${type}Error`] = false;
		} else {
			// 不选中变为选中
			// 最多选择20个
			if (this[`${type}Select`].length >= 20) {
				this[`${type}Error`] = 'maxover';
				return;
			}
			this[`${type}Error`] = false;
			target['checked'] = true;
			this[`${type}Select`].push(target);
		}

		if (!this[`${type}Select`].length) this[`${type}Error`] = 'nodata';
	}

	// 基因分类选择 默认不选 只能选一个
	handlerGeneSelect(geneType) {
		// 选中变未选中
		if (geneType['checked']) {
			this.geneType.forEach((v) => (v['checked'] = false));
			let index = this.findIndex(geneType['name'], this.selectGeneType, 'name');
			if (index != -1) this.selectGeneType.splice(index, 1);
		} else {
			this.geneType.forEach((v) => (v['checked'] = false));
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
				(data) => {
					if (data['status'] == '0') {
						let res = data['data'];
						this.heatmapData = res;
						this.heatmapSelectList = res['field'];

						if (this.heatmapSelectList.length) {
							this.heatmapSelect = res['field'][0];
							this.expressData = res[this.heatmapSelect]['expression'].map((val) => {
								val['checked'] = false;
								return val;
							});
							if (this.expressData.length) {
								this.expressData[0]['checked'] = true;
								this.expressSelect = [this.expressData[0]];
							}

							this.expressUpload = res[this.heatmapSelect]['exp_user'];
						}

						this.diffData = res['diff'].map((val) => {
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

						this.customData = res['customData'].map((val) => {
							val['checked'] = false;
							return val;
						});
						if (this.customData.length) {
							this.customData[0]['checked'] = true;
							this.customSelect = [this.customData[0]];
						}

						this.standList = res['standardization'] || [];
						this.stand = this.standList[0]['key'];
					}
				},
				(err) => console.log(err),
				() => {
					this.doHeatmapAjax = true;
				}
			);
	}

	heatmapSelectChange() {
		this.expressData = this.heatmapData[this.heatmapSelect]['expression'].map((val) => {
			val['checked'] = false;
			return val;
		});

		if (this.expressData.length) {
			this.expressData[0]['checked'] = true;
			this.expressSelect = [this.expressData[0]];
		}

		this.expressUpload = this.heatmapData[this.heatmapSelect]['exp_user'];
	}

	// 提交聚类重分析  需要生信重分析 需要1 不需要2
	heatmapConfirm(type) {
		let trueType = '';
		switch (type) {
			case 'Express':
				trueType = 'express';
				break;
			case 'Diff':
				trueType = 'diff';
				break;
			case 'Custom':
				trueType = 'custom';
				break;
		}

		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');
		if (this.selectGeneType.length) this.selectGeneType[0]['choose'] = this.clusterByGeneType;
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: `heatmap${type}`,
					needReanalysis: 1,
					chooseList: this[`${trueType}Select`],
					verticalDefault: this.selectGeneType,
					...tableEntity,
					standardization: this.stand,
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.toolsService.get('tableEntity')['species'],
					version: this.storeService.getStore('version')
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						this.selectType = '';
						this.childVisible = false;
						this.toolsService.hide();
						this.notify.success('tips：', '任务提交成功。', {
							nzStyle: { width: '300px' }
						});
					} else if (data['status'] == '600012') {
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
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
				(data) => {
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
				(err) => {
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

		this.multiOmicsError = !this.multiOmicsSelect.length || this.multiOmicsSelect.length > 5;
	}

	multiOmicsConfirm(type) {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-multiOmics/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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
				(data) => {
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
								if (index < 2) {
									this.kaFunGroupSelect.push({
										name: v.name,
										key: v.key,
										category: v.category,
										checked: true
									});
								}
								return {
									name: v.name,
									key: v.key,
									category: v.category,
									checked: index < 2 ? true : false
								};
							});

							this.kaFunDataName = data['data']['Data']; //data Name
							this.kaFunStatistics = data['data']['Statistics'];

							this.kaFunStatisticsName = this.kaFunStatistics.length ? this.kaFunStatistics[0] : '';
							this.kaFunGroupData = m_list;
						} else {
							this.initKaFunData();
						}
					} else {
						this.initKaFunData();
					}
				},
				(err) => {
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
		if (this.kaFunGroupSelect.length != 2) {
			return;
		}

		this.kaFunGroupError = !this.kaFunGroupData.length;
	}

	onkaFunChange(value: any): void {
		// console.log(value);
	}

	// this.notify.blank('tips：', '请至少选择2个', {
	// 	nzStyle: { width: '220px' }
	// });
	kaFunConfirm(reanalysisType) {
		if (this.kaFunGroupSelect.length < 2) {
			this.notify.blank('tips：', '请至少选择2个', {
				nzStyle: { width: '300px' }
			});
			return;
		}
		this.isSubmitReanalysis = true;
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
					// statisticData: this.kaFunDataName,
					statisticMethod: this.kaFunStatisticsName,
					classification: this.kaFunGroupSelect,
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-chiSquare/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// KDA
	getkdaParams() {
		try {
			let relations = JSON.parse(sessionStorage.getItem('relations'));
			relations.forEach((v) => {
				if (v['key'] === this.ppiFlagKey) this.kdaPpiScore = v['score'];
			});
			if (this.kdaPpiScore.length) this.kdaError = false;
		} catch (error) {
			this.kdaError = true;
		}
	}

	/**
     * @description
     * @author Yangwd<277637411@qq.com>
     * @date 2019-03-11
     * @param {*} event
     * @param {*} type  relation / key
     * @memberof ToolsComponent
     */
	handleKdaSliderChange(event, type) {
		if (type === 'key') {
			let tempRelationGeneCountRange = Math.floor(this.kdaKeyRelationComposeMax / this.kdaKeyGeneCountRange[2]);
			if (this.kdaRelationGeneCountRange[2] > tempRelationGeneCountRange)
				this.kdaRelationGeneCountRange[2] = tempRelationGeneCountRange;
		} else {
			let tempKdaKeyGeneCountRange = Math.floor(
				this.kdaKeyRelationComposeMax / (this.kdaRelationGeneCountRange[2] + 1)
			);
			if (this.kdaKeyGeneCountRange[2] > tempKdaKeyGeneCountRange)
				this.kdaKeyGeneCountRange[2] = tempKdaKeyGeneCountRange;
		}
	}

	kdaConfirm(reanalysisType) {
		let tableEntity = this.toolsService.get('tableEntity');
		tableEntity['mongoId'] = this.toolsService.get('mongoId');
		this.ajaxService
			.getDeferData({
				data: {
					reanalysisType,
					needReanalysis: 1,
					kdaParam: {
						keyGeneNum: this.kdaKeyGeneCountRange[2],
						maxNum: this.kdaRelationGeneCountRange[2],
						minScore: this.kdaPpiScore[2]
					},
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.success('tips：', '任务提交成功。', {
								nzStyle: { width: '300px' }
							});
						} else {
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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
				(data) => {
					if (data['status'] === '0') {
						if (data['data']) {
							this.lineGroupSelect.length = 0;
							this.lineSampleSelect.length = 0;
							let activeIndex = [0, 1];

							let group = data['data']['group'].map((v, index) => {
								let status = !activeIndex.includes(index) ? false : true;
								v['checked'] = status;
								if (status) this.lineGroupSelect.push(v);
								return v;
							});

							let sample = data['data']['sample'].map((v, index) => {
								let status = !activeIndex.includes(index) ? false : true;
								v['checked'] = status;
								if (status) this.lineSampleSelect.push(v);
								return v;
							});

							let custom = data['data']['userDefData'].map((v, index) => {
								let status = !activeIndex.includes(index) ? false : true;
								v['checked'] = status;
								if (status) this.lineCustomSelect.push(v);
								return v;
							});

							this.lineCustomData = custom;
							this.lineGroupData = group;
							this.lineSampleData = sample;

							this.lineGroupError = this.lineGroupSelect.length < 2;
							this.lineSampleError = this.lineSampleSelect.length < 2;
							this.lineCustomError = this.lineCustomSelect.length < 2;
						} else {
							this.initLineData();
						}
					} else {
						this.initLineData();
					}
				},
				(err) => {
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

		this.lineGroupError = this.lineGroupSelect.length < 2;
		this.lineSampleError = this.lineSampleSelect.length < 2;
		this.lineCustomError = this.lineCustomSelect.length < 2;
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

		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-line/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-as/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 网路图
	getnetParams() {
		this.netGeneType = this.toolsService.get('tableEntity')['geneType'];
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
			this.netData.forEach((v) => {
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
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
					netParams: this.netSelect.map((v) => {
						v['limit'] = false;
						return v;
					}),
					...tableEntity
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-net/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 关联网络图
	getlinkedNetworkParams() {
		// 断开引用
		this.relativeNetData = JSON.parse(JSON.stringify(this.toolsService.get('tableEntity')['relations']));
		this.doRelativeNetAjax = true;

		this.relativeNetData.forEach((v, index) => {
			v['checked'] = index ? false : true;
		});
		this.relativeNetSelect.push(this.copy(this.relativeNetData[0]));

		let entity = this.toolsService.get('tableEntity');
		let tempGraphRelations = 'graphRelations' in entity && entity['graphRelations'].length ? entity['graphRelations'] : [];
		let tableRelations = entity['relations'].length ? entity['relations'] : [];
		let graphRelations = tempGraphRelations.map(v => {
			let obj = {
				key: v['relation'],
				name: v['relationName'],
				limit: v['limit'],
				max: v['max'],
				score: v['score']
			}

			return obj;
		})

		let allRelations = graphRelations.concat(tableRelations);
		let tempArr = [];

		for (let i = 0; i < allRelations.length; i++) {
			if (tempArr.includes(allRelations[i]['key'])) {
				allRelations.splice(i, 1);
				i--;
			} else {
				tempArr.push(allRelations[i]['key']);
			}
		}


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
					relations: allRelations
				}
			})
			.subscribe(
				(res) => {
					if (res['status'] === '0') {
						this.relativeNetData.length = 0;
						this.relativeNetSelect.length = 0;
						if (!res['data'].length) {
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
				(err) => {
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
			this.relativeNetData.forEach((v) => {
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
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-linkedNetwork/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
						} else {
							newWindow.close();
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						newWindow.close();
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						newWindow.close();
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					newWindow.close();
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
					});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}

	// 关联聚类
	getheatmapRelationParams() {
		// 图上的关系和表上的关系 组合起来 统一key 去重
		let entity = this.toolsService.get('tableEntity');
		let tempGraphRelations = 'graphRelations' in entity && entity['graphRelations'].length ? entity['graphRelations'] : [];
		let tableRelations = entity['relations'].length ? entity['relations'] : [];
		let graphRelations = tempGraphRelations.map(v => {
			let obj = {
				key: v['relation'],
				name: v['relationName'],
				limit: v['limit'],
				max: v['max'],
				score: v['score']
			}

			return obj;
		})

		let allRelations = graphRelations.concat(tableRelations);
		let tempArr = [];

		for (let i = 0; i < allRelations.length; i++) {
			if (tempArr.includes(allRelations[i]['key'])) {
				allRelations.splice(i, 1);
				i--;
			} else {
				tempArr.push(allRelations[i]['key']);
			}
		}

		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/relationCluster/heatmapConfig`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					tid: 'tid' in entity ? entity['tid'] : null,
					geneType: entity['geneType'],
					species: entity['species'],
					version: this.storeService.getStore('version'),
					baseThead: this.toolsService.get('baseThead'),
					relations: allRelations
				}
			})
			.subscribe(
				(data) => {
					if (data['status'] == '0') {
						this.heatmapReError = false;
						//this.heatmapReStand = data['data']['standardization'];
						this.heatmapReGeneType = data['data']['verticalDefault'];
						this.heatmapReRelations = data['data']['relations'];
						if (this.heatmapReStand.length) {
							this.heatmapReSelectStand = this.heatmapReStand[0];
						}
						this.heatmapReRelations.forEach((v, index) => {
							v['checked'] = index ? false : true;
							if (!index) this.heatmapReSelectRelation.push(JSON.parse(JSON.stringify(v)));
						});
					} else {
						this.heatmapReError = 'error';
						this.initHeatmapRelationsData();
					}
				},
				(err) => {
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
			this.heatmapReRelations.forEach((v) => (v['checked'] = false));
			item['checked'] = true;
			this.heatmapReSelectRelation.push(JSON.parse(JSON.stringify(item)));
		} else {
			item['checked'] = false;
		}

		this.heatmapReError = !this.heatmapReSelectRelation.length;
	}

	// 基因类型选择
	handlerReGeneSelect(item) {
		if (item['checked']) {
			this.heatmapReGeneType.forEach((v) => (v['checked'] = false));
			let index = this.findIndex(item['name'], this.heatmapReSelectGeneType, 'name');
			if (index != -1) this.heatmapReSelectGeneType.splice(index, 1);
		} else {
			this.heatmapReGeneType.forEach((v) => (v['checked'] = false));
			this.heatmapReSelectGeneType.length = 0;
			item['checked'] = true;
			this.heatmapReSelectGeneType.push(item);
		}
		this.reClusterByGeneType = false;
	}

	heatmapRelationConfirm() {
		this.isSubmitReanalysis = true;
		let entity = this.toolsService.get('tableEntity');
		entity['relations'] = this.heatmapReSelectRelation;
		entity['mongoId'] = this.toolsService.get('mongoId');
		if (this.heatmapReSelectGeneType.length) this.heatmapReSelectGeneType[0]['choose'] = this.reClusterByGeneType;
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					reanalysisType: 'heatmapRelation',
					needReanalysis: 1,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity,
					// standardization: this.heatmapReSelectStand,  // 去掉标准化
					verticalDefault: this.heatmapReSelectGeneType
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.success('tips：', '任务提交成功。', {
								nzStyle: { width: '300px' }
							});
						} else {
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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
				(res) => {
					this.geneClassData.length = 0;
					this.geneClassSelect.length = 0;

					if (res['status'] == 0 && res['data'].length) {
						res['data'].forEach((v, i) => {
							if (v['value'].length) {
								v['value'].forEach((val, index) => {
									val['checked'] = index || i ? false : true;
									if (!i && !index) this.geneClassSelect.push(val);
								});
							}
						});

						this.geneClassData = res['data'];
						this.geneClassError = false;
					} else {
						this.geneClassError = true;
					}
				},
				(error) => {
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
				return val['key'] === klass['key'];
			});

			if (index != -1) this.geneClassSelect.splice(index, 1);
		} else {
			this.geneClassSelect.forEach((v) => (v['checked'] = false));
			klass['checked'] = true;
			this.geneClassSelect.length = 0;
			this.geneClassSelect.push(klass);
		}
	}

	geneClassConfirm() {
		this.isSubmitReanalysis = true;
		let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
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
					annotation: this.geneClassSelect[0]
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							let href = `${window.location.href.split(
								'report'
							)[0]}report/reanalysis/re-classification/${this.toolsService.get('geneType')}/${data[
							'data'
							][0]}/${this.storeService.getStore('version')}/${this.geneClassSelect[0]['key']}/false`;
							newWindow.location.href = href;
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.success('tips：', '任务提交成功。', {
								nzStyle: { width: '300px' }
							});
						} else {
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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
				url: `${config['javaPath']}/enrichment/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: entity['geneType'],
					species: entity['species'],
					version: this.storeService.getStore('version')
				}
			})
			.subscribe(
				(res) => {
					this.geneRichData.length = 0;
					this.geneRichSelect.length = 0;
					if (res['status'] == 0 && res['data'].length) {
						res['data'].forEach((v, i) => {
							if (v['value'].length) {
								v['value'].forEach((val, index) => {
									val['checked'] = index || i ? false : true;
									if (!i && !index) this.geneRichSelect.push(val);
								});
							}
						});

						this.geneRichData = res['data'];
						this.geneRichError = false;
					} else {
						this.geneRichError = true;
					}
				},
				(error) => {
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
				return val['key'] === rich['key'];
			});

			if (index != -1) this.geneRichSelect.splice(index, 1);
		} else {
			this.geneRichSelect.forEach((v) => (v['checked'] = false));
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
					reanalysisType: 'enrichment',
					needReanalysis: 1,
					version: this.storeService.getStore('version'),
					geneType: this.toolsService.get('tableEntity')['geneType'],
					species: this.storeService.getStore('genome'),
					...entity,
					annotation: this.geneRichSelect[0]
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
						if (data['data'].length) {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.success('tips：', '任务提交成功。', {
								nzStyle: { width: '300px' }
							});
						} else {
							this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
								nzStyle: { width: '300px' }
							});
						}
					} else if (data['status'] == '600012') {
						this.notify.warning('tips：', `任务提交过于频繁，请等待 5s 后再提交请求`, {
							nzStyle: { width: '300px' }
						});
					} else {
						this.notify.warning('tips：', `任务提交失败 : ${data['message']}`, {
							nzStyle: { width: '300px' }
						});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`, {
						nzStyle: { width: '300px' }
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

	getgseaParams() {
		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/gsea/config`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: entity['geneType']
				}
			})
			.subscribe(
				(res) => {
					this.gseaClear();
					if (res['status'] == 0) {
						this.gseaSample = res['data']['sample'];
						this.gseaUser = res['data']['user'];
						this.gseaGroup = res['data']['group'];
						for (const key in this.gseaGroup) {
							this.handleGroup.push({
								value: key,
								flag: false
							});
							this.controlGroup.push({
								value: key,
								flag: false
							});
						}

						this.gseaGroup2 = [...this.gseaSample, ...this.gseaUser];
						console.log(this.gseaGroup2);

						this.gseaGroup2.forEach((d) => {

							this.controlGroup2.push({
								value: d["key"],
								flag: false
							});
							this.handleGroup2.push({
								value: d["key"],
								flag: false
							});
						});
						console.log(this.controlGroup2);
						console.log(this.handleGroup2);

						this.gseaDataBase = res['data']['dataBase'];
						this.gseaDataBase.forEach((data) => {
							if (data['type'] == 1 && data['db']) {
								data['db'].forEach((db) => {
									this.gseaDataBaseLeft.push({
										checked: false,
										name: db['name'],
										key: db['key']
									})
								})
							} else if (data['type'] == 2) {
								data['db'].forEach((db) => {
									let tempN = db["key"];
									let tempobj = [];
									if (db['value']) {
										db['value'].forEach((value) => {
											tempobj.push({
												checked: false,
												name: value['name'],
												key: value['key'],
												type: 2
											})
										});
										this.gseaDataBaseRight.push({
											key: tempN,
											value: tempobj
										})
									}
								})
							} else if (data['type'] == 3 && data['db'] && data['db'].length>0) {
								let tempN = '用户上传';
								let tempobj = [];
								data['db'].forEach((db) => {
									tempobj.push({
										checked: false,
										name: db['name'],
										key: db['key'],
										type: 3
									})
								})
								this.gseaDataBaseRight.push({
									key: tempN,
									value: tempobj
								})
							}
						})

						if(this.gseaDataBaseLeft.length<1){
							this.baseFlag = false;
							this.baseFlag2 = true;
						}
						// this.gseaDataBase = dataBase;
						// this.gseaDataBase[0]["db"].forEach((d) => {
						// 	this.gseaDataBaseLeft.push({
						// 		checked: false,
						// 		name: d
						// 	})
						// });
						// //this.gseaDataBaseRight = this.gseaDataBase[1]["db"];
						// this.gseaDataBase[1]["db"].forEach((d) => {
						// 	let tempN = d["key"];
						// 	let tempobj = [];
						// 	d["value"].forEach((m) => {
						// 		tempobj.push({
						// 			name: m,
						// 			checked: false
						// 		})
						// 	});
						// 	this.gseaDataBaseRight.push({
						// 		key: tempN,
						// 		value: tempobj
						// 	})

						// });
						// console.log(this.gseaSample);
						// console.log(this.gseaGroup);
						// console.log(this.handleGroup);
						// console.log(this.controlGroup);
						// console.log(this.gseaDataBase);
						this.gseaClassError = false;
					} else {
						this.gseaClassError = true;
					}
				},
				(error) => {
					this.gseaClear();
				},
				() => {
					//this.doGeneRichAjax = true;
				}
			);
	}

	gseaClear() {
		this.baseFlag = true;
		this.baseFlag2 = false;
		this.gseaSample.length = 0;
		this.gseaUser.length = 0;
		this.gseaGroup = {};
		this.gseaGroup2.length = 0;
		this.gseaDataBase.length = 0;
		this.gseaDataBaseLeft.length = 0;
		this.gseaDataBaseRight.length = 0;
		this.gseaDBLeftSelect = "";
		this.gseaDBRightSelect = "";
		this.gseaDBRightSelectType = 0;
		this.gseaClassError = true;
		this.selectBFristTag.length = 0;
		this.selectBSecondTag.length = 0;
		this.handleGroup.length = 0;
		this.controlGroup.length = 0;
		this.handleGroup2.length = 0;
		this.controlGroup2.length = 0;
	}

	gseaMaxChange(e) {
		if (e <= this.gseaMin) {
			this.maxFlag = true;
		} else {
			this.maxFlag = false;
		}
	}
	gseaMinChange(e) {
		if (e >= this.gseaMax) {
			this.minFlag = true;
		} else {
			this.minFlag = false;
		}
	}

	//选择样本
	geasTopRadioChange() {
		if (this.radioValue == "A") {
			this.radioAFlag = true;
			this.radioBFlag = false;
		} else if (this.radioValue == "B") {
			this.radioBFlag = true;
			this.radioAFlag = false;
		}
	}

	//选择数据库
	geasBottomRadioChange() {
		if (this.radioDataBase == "A") {
			this.baseFlag = true;
			this.baseFlag2 = false;
		} else if (this.radioDataBase == "B") {
			this.baseFlag2 = true;
			this.baseFlag = false;
		}
	}

	selectDataBaseLeft(item) {
		this.gseaDataBaseLeft.forEach((d) => {
			if (d.name == item.name) {
				if (item['checked']) {
					item['checked'] = false;
					this.gseaDBLeftSelect = "";
				} else {
					item['checked'] = true;
					this.gseaDBLeftSelect = item["key"]
				}
			} else {
				d["checked"] = false;
			}
		})


		//item['checked'] = !item['checked'];
		// let index = this.gseaDBLeftSelect.findIndex((val, index) => {
		// 	return val['name'] === item['name'];
		// });

		// if (item['checked']) {
		// 	if (index == -1) this.gseaDBLeftSelect.push(item);
		// } else {
		// 	if (index != -1) this.gseaDBLeftSelect.splice(index, 1);
		// }
		console.log(this.gseaDBLeftSelect)
	}

	selectDataBaseRight(item) {
		this.gseaDataBaseRight.forEach((d) => {
			d["value"].forEach((m) => {
				if (m.name == item.name) {
					if (item['checked']) {
						item['checked'] = false;
						this.gseaDBRightSelect = "";
						this.gseaDBRightSelectType = 0;
					} else {
						item['checked'] = true;
						this.gseaDBRightSelect = item["key"];
						this.gseaDBRightSelectType = item["type"];
					}
				} else {
					m["checked"] = false;
				}
			})
		});

		console.log(this.gseaDBRightSelect)
	}

	geasASelectChange() {
		this.handleGroup.forEach((d) => {
			if (d.value == this.radioASecond) {
				d.flag = true;
			} else {
				d.flag = false;
			}
		})
	}
	geasAFristSelectChange() {
		this.controlGroup.forEach((d) => {
			if (d.value == this.radioAFrist) {
				d.flag = true;
			} else {
				d.flag = false;
			}
		})
	}

	geasBSelectChange() {
		this.handleGroup2.forEach((m) => {
			m["flag"] = false;
		})
		this.selectBFristTag.forEach((d) => {
			this.handleGroup2.forEach((m) => {
				if (d == m["value"]) {
					m["flag"] = true;
				}
			})
		});
		console.log(this.handleGroup2);
	}

	geasBSecondSelectChange() {
		this.controlGroup2.forEach((m) => {
			m["flag"] = false;
		})
		this.selectBSecondTag.forEach((d) => {
			this.controlGroup2.forEach((m) => {
				if (d == m["value"]) {
					m["flag"] = true;
				}
			})
		});
		console.log(this.controlGroup2);
	}

	inputBFristChange(e) {
		console.log(e);

		let tempA = e.charCodeAt(0);
		if((tempA >= 65 && tempA <= 90) || (tempA >= 97 && tempA <= 122)){
			if(e.length>16){
				this.notify.warning('tips：', `组名最大长度为16个字符`,{
					nzStyle: { width: '300px' }
				});
				this.inputBFrist=e.substring(0,16);
			}else{
				this.inputBFrist=e;
			}
		}else{
			this.notify.warning('tips：', `组名必须是字母、数字、下划线中的一种或多种，第一个字符必须是字母`,{
				nzStyle: { width: '300px' }
			});
			this.inputBFrist = "";
		}

	}

	inputBSecondChange(e) {
		console.log(e);
		let tempA = e.charCodeAt(0);
		if((tempA >= 65 && tempA <= 90) || (tempA >= 97 && tempA <= 122)){
			if(e.length>16){
				this.notify.warning('tips：', `组名最大长度为16个字符`,{
					nzStyle: { width: '300px' }
				});
				this.inputBSecond=e.substring(0,16);
			}else{
				this.inputBSecond=e;
			}
		}else{
			this.notify.warning('tips：', `组名必须是字母、数字、下划线中的一种或多种，第一个字符必须是字母`,{
				nzStyle: { width: '300px' }
			});
			this.inputBSecond = "";
		}
	}

	//确定按钮
	gseaRichConfirm() {
		// let newWindow = window.open(`${window.location.href.split('report')[0]}report/reanalysis/loading`);
		// let href = `${window.location.href.split(
		// 	'report'
		// )[0]}report/reanalysis/re-gsea`;
		// newWindow.location.href = href;
		let tempcontrolGroup = {
			group:"",
			sample:[]
		};
		let temphandleGroup = {
			group:"",
			sample:[]
		};

		if(this.radioValue=="A"){
			if (this.radioASecond && this.radioAFrist) {
				for (const key in this.gseaGroup) {
					if (this.gseaGroup.hasOwnProperty(key)) {
						const element = this.gseaGroup[key];
						if(key == this.radioAFrist){
							temphandleGroup.group = this.radioAFrist;
							temphandleGroup.sample = element;
						}
						if(key == this.radioASecond){
							tempcontrolGroup.group = this.radioASecond;
							tempcontrolGroup.sample = element;
						}
					}
				}
			} else {
				this.notify.warning('tips：', `对照组和处理组不能为空`,{
					nzStyle: { width: '300px' }
				});
				return;
			}
			
		}else if(this.radioValue=="B"){
			if (this.inputBFrist && this.inputBSecond && this.selectBFristTag.length>0 && this.selectBSecondTag.length>0 && this.inputBFrist!=this.inputBSecond) {
				tempcontrolGroup.group = this.inputBFrist;
				this.selectBFristTag.forEach((d) => {
					this.gseaGroup2.forEach((m)=>{
						if(d == m["key"]){
							tempcontrolGroup["sample"].push(m);
						}
					})
				});

				temphandleGroup.group = this.inputBSecond;
				this.selectBSecondTag.forEach((d) => {
					this.gseaGroup2.forEach((m)=>{
						if(d == m["key"]){
							temphandleGroup["sample"].push(m);
						}
					})
				});
			} else {
				this.notify.warning('tips：', `对照组和处理组组名和选取内容不能为空,并且组名不能相等`,{
					nzStyle: { width: '300px' }
				});
				return;
			}
		}

		if(this.gseaMin>this.gseaMax){
			this.notify.warning('tips：', `最小值不能大于最大值`,{
				nzStyle: { width: '300px' }
			});
			return;
		}

		let tempObj = {
			type:0,
			db:""
		};

		if(this.radioDataBase=="A"){
			if(this.gseaDBLeftSelect){
				tempObj.type = 1;
				tempObj.db = this.gseaDBLeftSelect;
			}else{
				this.notify.warning('tips：', `请选择一个GESA MSigDB数据库`,{
					nzStyle: { width: '300px' }
				});
				return;
			}
		}else if(this.radioDataBase=="B"){
			if(this.gseaDBRightSelect){
				tempObj.type = this.gseaDBRightSelectType;
				tempObj.db = this.gseaDBRightSelect;
			}else{
				this.notify.warning('tips：', `请选择一个其他数据库`,{
					nzStyle: { width: '300px' }
				});
				return;
			}
			
		}

		this.isSubmitReanalysis = true;
		let entity = this.toolsService.get('tableEntity');
		this.ajaxService
			.getDeferData({
				data: {
					LCID: sessionStorage.getItem('LCID'),
					needReanalysis: 1,
					reanalysisType: "gsea",
					...entity,
					gseaParam: {
						treatGroup: temphandleGroup,
						controlGroup: tempcontrolGroup,
						maxSize: this.gseaMax, //最大值
						minSize: this.gseaMin,  //最小值
						dataBase: tempObj
					}
				},
				url: this.toolsService.get('tableUrl')
			})
			.subscribe(
				(data) => {
					if (data['status'] === '0') {
							this.selectType = '';
							this.childVisible = false;
							this.toolsService.hide();
							this.notify.success('tips：', '任务提交成功。',{
								nzStyle: { width: '300px' }
							});
					}
				},
				(err) => {
					this.notify.warning('tips：', `任务提交失败,请重试`,{
						nzStyle: { width: '300px' }
						});
				},
				() => {
					this.isSubmitReanalysis = false;
				}
			);
	}
}
