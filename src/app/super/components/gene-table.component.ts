import { ToolsService } from './../service/toolsService';
import { MessageService } from './../service/messageService';
import { Observable, fromEvent } from 'rxjs';
import { StoreService } from './../service/storeService';
import {
	Component,
	OnInit,
	Input,
	ViewChildren,
	TemplateRef,
	OnChanges,
	SimpleChanges,
	AfterViewChecked,
	AfterViewInit,
	AfterContentInit,
	ElementRef,
	ViewChild,
	Output,
	EventEmitter,
	ChangeDetectorRef
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GlobalService } from '../service/globalService';
import { LoadingService } from '../service/loadingService';
import { AjaxService } from '../service/ajaxService';
import { NzNotificationService } from 'ng-zorro-antd';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import config from '../../../config';

declare const $: any;
/**
 * @description gene 表
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class GeneTableComponent
 * @implements {OnInit}
 */
@Component({
	selector: 'app-geneTable',
	templateUrl: './gene-table.component.html'
})
export class GeneTableComponent implements OnInit, OnChanges {
	@Input() defaultChecked: boolean = false; // 基因表的默认选中还是不选中
	@Input() tableId: string; // 表的id
	@Input() url: string; // 表格的请求api
	@Input() pageEntity: object; // 表格的请求参数
	@Input() checkStatusInParams: boolean; // 是否把表的gene选中状态放在表的查询参数里面 默认false
	@Input() fileName: string; // 表格下载的名称?
	@Input() selectItems: TemplateRef<any>; // 表格模板插槽?
	@Input() tableHeight: number = 0; // 计算后的表格高度?
	@Input() tableType: string = 'common'; // 表的类型  普通 还是 transform
	@Input() emitBaseThead: boolean = false; // 是否发射表格数据 true的时候下一次请求发射表格数据 false不发射
	@Output() emitBaseTheadChange: EventEmitter<any> = new EventEmitter();
	@Output() baseTheadChange: EventEmitter<any> = new EventEmitter();

	// 无效参数
	// @Input() defaultMartix: boolean = false; // 是否默认是矩阵表  针对关联聚类/关联网络图  默认矩阵表 表格转换的默认表是矩阵 会把默认表加上mongoId

	@Input() applyOnceSearchParams: boolean = false;
	@Output() applyOnceSearchParamsChange: EventEmitter<any> = new EventEmitter();
	@Output() selectGeneCountChange: EventEmitter<any> = new EventEmitter();
	@Input() resetCheckGraph: boolean = false; // true的时候会重置checkGraph为false
	@Output() resetCheckGraphChange: EventEmitter<any> = new EventEmitter();
	@Input() computedScrollHeight: boolean = false; // 当表格容器高度不变 内部高度变化时  需要重新计算滚动高度
	@Output() computedScrollHeightChange: EventEmitter<any> = new EventEmitter();
	@Input() isKeggClass: boolean = false; // 区分是kegg的分类还是富集  过滤表头字段 用tid区分是报告还是小工具 isKeggClass 区分是kegg的分类还是富集
	@Input() tid: string = '';
	@Input() showFilterStatus: boolean = false; // 是否显示 表格是否通过外部操作更新
	@Output() saveGeneListSuccess: EventEmitter<any> = new EventEmitter(); // 成功保存基因集的时候 发出的事件
	@Output() syncRelative: EventEmitter<any> = new EventEmitter(); // 同步表头

	@Output() totalChange: EventEmitter<number> = new EventEmitter(); // total

	// 在kegg富集需要跳转map的时候用到  其他都为默认值空
	@Input() compareGroup: any = undefined; // 比较组
	@Input() reanalysisId: any = undefined; // 重分析id
    @Input() reanalysisDate: any = undefined; // 重分析时间
    @Input() isKeggRich:boolean = false; // 是否是kegg富集表

	@ViewChildren('child') children;
	count: number = 0; // 选中的基因个数
	mongoId: any = null;
	scroll: any = { x: '0', y: '0' };
	isLoading: boolean = true;
	checkStatus: boolean;
	beginFilterStatus: boolean = false;

	head: string[] = [];

	total = 1;
	dataSet = [];
	accuracy = -1;
	unionSearchConditionList: object[] = [];
	interSearchConditionList: object[] = [];
	sortMap: object = {};

	timer: any = null;

	tableEntity: object = {
		addThead: [],
		searchList: [],
		sortValue: null,
		sortKey: null,
		rootSearchContentList: [],
		pageIndex: 1,
		pageSize: 10
	};

	popoverText = '';
	popoverSearchType = '';
	filterHtmlString: object[] = [];
	interConditionHtmlString: object[] = [];
	unionConditionHtmlStirng: object[] = [];

	// 之前增加的头
	beforeAddThead: string[] = [];

	// 错误信息
	error: any = false;

	// 选中列
	key: any;
	selectMenu: Object[];
	allChecked: boolean;
	indeterminate: boolean;
	checked: any[] = [];
	unChecked: any[] = [];
	checkedMap: object = {};
	unCheckedMap: object = {};

	// 表头宽度
	totalWidth: string;
	widthConfig: string[];

	// 首列表头的left值
	colLeftConfig: string[];
	// 二级表头集合
	twoLevelHead: object[];
	twoLevelWidth: any[] = [];
	tbodyOutFirstCol: object[];
	// 一级筛选条件

	rootHtmlString: object[] = [];

	isFirst = true;
	firstColumnGene = [];
	matchAll: boolean = true;
	isErrorDelete: boolean = false;

	// 是否在保存基因集
	isSaveGeneList: boolean = false;
	validateForm: FormGroup;
	openSelect: boolean = false;
	labels: any[] = [];
	labelSelect: any[] = [];
	labelSelectError: boolean = false;
	delSelect: any[] = [];
	textareaMaxLen: number = 200;

	computedTimer = null;

	tableRelative: any[] = [];

	srcTotal: number = 0;
	pageSizeChangeFlag: boolean = false; // pagesize 改变的标志  pagesize改变的时候 需要保留之前选中的基因 在剩下的基因里做默认的选中
    theadInitTimer: any = null;
    setNameList:string[] = [];


	constructor(
		private translate: TranslateService,
		private globalService: GlobalService,
		private loadingService: LoadingService,
		private ajaxService: AjaxService,
		private storeService: StoreService,
		private el: ElementRef,
		private message: MessageService,
		private notify: NzNotificationService,
		private toolsService: ToolsService,
		private modalService: NzModalService,
		private fb: FormBuilder,
		private ref: ChangeDetectorRef
	) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	ngOnInit(): void {
		this.init();
		this.initFormValue();
	}

	// 页面加载完成的时候会把算好的 tableHeight传进来，触发changes 然后组件内部计算表格滚动区域的高度；
	ngOnChanges(change: SimpleChanges) {
		if (!('tableHeight' in change) && !this.tableHeight) {
			// 不传高度默认显示十条数据的高度 默认滚动高度388px
			this.scroll['y'] = '388px';
		}

		if ('tableHeight' in change && change['tableHeight']['currentValue']) {
			this.computedTbody(change['tableHeight']['currentValue']);
		}

		if (
			'computedScrollHeight' in change &&
			change['computedScrollHeight'] &&
			!change['computedScrollHeight'].firstChange
		) {
			if (this.computedTimer) clearTimeout(this.computedTimer);
			this.computedTbody(this.tableHeight);
			this.computedTimer = setTimeout(() => {
				this.computedScrollHeight = false;
				this.computedScrollHeightChange.emit(this.computedScrollHeight);
			}, 30);
		}
	}

	init() {
		this.checkStatus = this.defaultChecked;
		this.allChecked = this.checkStatus;
		this.indeterminate = false;
		this.selectMenu = [
			{
				text: '全选',
				onSelect: () => {
					this.globalCheckAll();
				}
			},
			{
				text: '反选',
				onSelect: () => {
					this.globalReverseCheck();
				}
			}
		];

		this.tableEntity['pageIndex'] = 1;
		this.tableEntity['pageSize'] = this.pageEntity['pageSize'] || 20;
		this.tableEntity['sortValue'] = null;
		this.tableEntity['sortKey'] = null;
		this.tableEntity['searchList'] = this.pageEntity['searchList'] || [];
		this.tableEntity['rootSearchContentList'] = this.pageEntity['rootSearchContentList'] || [];
		this.tableEntity['addThead'] = this.pageEntity['addThead'] || [];

		// 把其他的查询参数也放进去
		for (let name in this.pageEntity) {
			if (name in this.tableEntity) {
				continue;
			} else {
				this.tableEntity[name] = this.pageEntity[name];
			}
		}

		this.getRemoteData();
	}

	sort(key, value): void {
		this.initSortMap();
		this.sortMap[key] = value;

		// 取消排序
		if (value == null) {
			this.tableEntity['sortKey'] = null;
			this.tableEntity['sortValue'] = null;
		} else {
			// 有排序
			this.tableEntity['sortKey'] = key;
			this.tableEntity['sortValue'] = value;
		}
		this.getRemoteData();
	}

	// 获取表格数据
	getRemoteData(reset: boolean = false, cb: any = null): void {
		this.isLoading = true;

		if (reset) {
			this.tableEntity['pageIndex'] = 1;
		}

		if (this.checkStatusInParams) {
			this.tableEntity['checkStatus'] = this.checkStatus;
			this.tableEntity['checked'] = this.checked;
			this.tableEntity['unChecked'] = this.unChecked;
		}

		let ajaxConfig = {
			url: this.url,
			data: this.tableEntity
		};

		// 如果是转换表把上次的mongoid 放在下一次的参数里面
		// if (this.tableType === 'transform' && this.mongoId) this.tableEntity['mongoId'] = this.mongoId;
		// 如果默认表是矩阵表 需要一直把mongoId放在请求参数里
		// if (this.defaultMartix && this.mongoId) this.tableEntity['mongoId'] = this.mongoId;

		// date 2019.04.01 只要上一次返回了mongoId 就放在请求参数里 不然为null
		this.tableEntity['mongoId'] = this.mongoId;

		this.ajaxService.getDeferData(ajaxConfig).subscribe(
			(responseData: any) => {
				// 如果需要保存基因集合id 并且 返回值有id这个key （针对转换表) 就保存下来
				this.isLoading = false;
				if (
					responseData['status'] == '0' &&
					responseData['data']['baseThead'].length &&
					responseData['data']['rows'].length
				) {
					if (this.tableType === 'transform') {
						this.tableEntity['transform'] = false;
						this.tableEntity['matrix'] = true;
						// if(this.isFirst) this.applyOnceBeforeStatusThenReset();
					}

					// if ('mongoId' in responseData['data']) this.mongoId = responseData['data']['mongoId'];
					this.mongoId = 'mongoId' in responseData['data'] ? responseData['data']['mongoId'] : null;

					// if (!responseData.data['rows'].length) {
					// 	this.total = 0;
					// 	this.srcTotal = 0;
					//     this.error = 'nodata';
					//     this.totalChange.emit(this.total);
					// 	return;
					// }

					// 是否需要发射表头
					if (this.emitBaseThead) {
						this.emitBaseThead = false;
						this.emitBaseTheadChange.emit(this.emitBaseThead);
						this.baseTheadChange.emit({ baseThead: responseData['data']['baseThead'] });
					}

					this.error = '';
					let arr = [];
					this.head = responseData.data.baseThead;

					responseData.data.baseThead.slice(1).forEach((val) => {
						arr = val.children.length ? arr.concat(val.children) : arr.concat(val);
					});
					this.tbodyOutFirstCol = arr;
					let tempObj = this.computedTheadWidth(this.head);
					this.widthConfig = tempObj['widthConfig'];
					this.twoLevelHead = tempObj['twoLevelHead'];
					this.twoLevelWidth = tempObj['twoLevelWidth'];
					this.colLeftConfig = tempObj['colLeftConfig'];
					this.totalWidth = tempObj['totalWidth'];
					this.tableRelative = tempObj['tableRelative'];

					this.scroll['x'] = this.totalWidth;
					// 同步表个关系到外部组件
					this.syncRelative.emit(this.tableRelative);
					// 根据表头生成sortmap
					this.generatorSortMap();
					if (responseData.data.total != this.total) this.tableEntity['pageIndex'] = 1;
					this.total = responseData.data.total;
					this.totalChange.emit(this.total);

					this.srcTotal = responseData.data.srcTotal;
					this.dataSet = responseData.data.rows;
					// 标志key
					this.key = this.head[0]['children'].length
						? this.head[0]['children'][0]['true_key']
						: this.head[0]['true_key'];

					// 增加筛选状态key
					this.dataSet.forEach((val) => {
						if (!$.isEmptyObject(this.checkedMap) || !$.isEmptyObject(this.unCheckedMap)) {
							let allGeneMap = [ ...Object.keys(this.checkedMap), ...Object.keys(this.unCheckedMap) ];
							if (allGeneMap.includes(val[this.key])) {
								// 在map的基因给记录的状态
								val['checked'] = Object.keys(this.checkedMap).includes(val[this.key]);
							} else {
								// 找出不在map里记录的基因 给默认状态
								val['checked'] = this.checkStatus;
							}
						} else {
							val['checked'] = this.checkStatus;
						}

						// 根据当前基因的选中状态 用不同的map记录下来
						if (this.checkStatus && !Object.keys(this.unCheckedMap).includes(val[this.key])) {
							this.checkedMap[val[this.key]] = val;
						} else {
							if (!Object.keys(this.checkedMap).includes(val[this.key])) {
								this.unCheckedMap[val[this.key]] = val;
							}
						}

						// map去重
						if (!$.isEmptyObject(this.checkedMap) || !$.isEmptyObject(this.unCheckedMap)) {
							//  默认选中 就看未选中的列表里有没有当前项 有就变成未选中
							if (this.checkStatus) {
								if (!$.isEmptyObject(this.unCheckedMap)) {
									let unCheckedKeys = Object.keys(this.unCheckedMap);
									if (unCheckedKeys.includes(val[this.key])) {
										val['checked'] = false;
										delete this.checkedMap[val[this.key]];
									}
								}
							} else {
								// 默认不选中  就看选中的列表里有没有当前项 有就变成选中
								if (!$.isEmptyObject(this.checkedMap)) {
									let checkedKeys = Object.keys(this.checkedMap);
									if (checkedKeys.includes(val[this.key])) {
										val['checked'] = true;
										delete this.unCheckedMap[val[this.key]];
									}
								}
							}
						}
					});

					this.computedStatus();
					this.isFirst = false;

					if (this.isErrorDelete) {
						// 如果是在无数据或者系统错误的情况下 删除了筛选条件 表格获取数据初始化以后就需要重新应用之前的筛选状态
						setTimeout(() => {
							//如果表之前是错误的状态 筛选组件需要重新应用之前的状态
							this.tableEntity['searchList'].forEach((v) => {
								this._filterWithoutRequest(
									v['filterName'],
									v['filterNamezh'],
									v['searchType'],
									v['filterType'],
									v['valueOne'],
									v['valueTwo']
								);
							});
							this.classifySearchCondition();
							this.isErrorDelete = false;
						}, 30);
					}
				} else if (
					responseData['status'] == '0' &&
					(!responseData['data']['baseThead'].length || !responseData['data']['rows'].length)
				) {
					this.total = 0;
					this.srcTotal = 0;
					this.error = 'nodata';
					this.syncRelative.emit([]);
					this.totalChange.emit(this.total);
					this.mongoId = 'mongoId' in responseData['data'] ? responseData['data']['mongoId'] : null;

					if (this.emitBaseThead) {
						this.emitBaseThead = false;
						this.emitBaseTheadChange.emit(this.emitBaseThead);
						this.baseTheadChange.emit({ baseThead: [] });
					}
				} else {
					this.total = 0;
					this.srcTotal = 0;
					this.error = 'error';
					this.syncRelative.emit([]);
					this.totalChange.emit(this.total);

					if (this.emitBaseThead) {
						this.emitBaseThead = false;
						this.emitBaseTheadChange.emit(this.emitBaseThead);
						this.baseTheadChange.emit({ baseThead: [] });
					}
                }

                this.tableEntity['mongoId'] = this.mongoId;

				if (this.timer) clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this.computedTbody(this.tableHeight);
				}, 30);
			},
			(err) => {
				this.isLoading = false;
				this.total = 0;
				this.srcTotal = 0;
				this.syncRelative.emit([]);
				this.totalChange.emit(this.total);
			},
			() => {
				cb && cb();
				// if('matchAll' in this.tableEntity) this.tableEntity['matchAll'] = false;
				if (this.applyOnceSearchParams) {
					// 每次应用一次设置的查询参数 然后清空恢复默认，用自己的查询参数；
					this.tableEntity['searchList'] = [];
					this.tableEntity['rootSearchContentList'] = [];
					if ('leftChooseList' in this.tableEntity) this.tableEntity['leftChooseList'] = [];
					if ('upChooseLIst' in this.tableEntity) this.tableEntity['upChooseList'] = [];
					if ('compareGroup' in this.tableEntity) {
						if (typeof this.tableEntity['compareGroup'] === 'string') {
							this.tableEntity['compareGroup'] = '';
						} else if (typeof this.tableEntity['compareGroup'] === 'object') {
							this.tableEntity['compareGroup'] = [];
						}
					}
					if ('diffThreshold' in this.tableEntity) this.tableEntity['diffThreshold'] = {};
					if ('clickSearch' in this.tableEntity) this.tableEntity['clickSearch'] = false;
					this.applyOnceSearchParams = false;
					this.applyOnceSearchParamsChange.emit(this.applyOnceSearchParams);
				}

				// if (this.resetCheckGraph) {
				// 	if ('checkGraph' in this.tableEntity) this.tableEntity['checkGraph'] = false;
				// 	this.resetCheckGraph = false;
				// 	this.resetCheckGraphChange.emit(this.resetCheckGraph);
				// }

				if ('checkGraph' in this.tableEntity) {
					this.tableEntity['checkGraph'] = false;
				}

				// 针对返回默认表的时候  图上如果有需要筛选的条件  就需要默认表加载完成以后初始化表上的筛选
				if (this.tableEntity['searchList'].length) {
					this.tableEntity['searchList'].forEach((v) => {
						this._filterWithoutRequest(
							v['filterName'],
							v['filterNamezh'],
							v['searchType'],
							v['filterType'],
							v['valueOne'],
							v['valueTwo']
						);
					});
					this.classifySearchCondition();
                }
			}
		);
	}

	// 重置表格状态 回到初始状态
	initAllTableStatus() {
		this.tableEntity['pageIndex'] = 1;
		this.tableEntity['addThead'] = [];
		this.tableEntity['rootSearchContentList'] = [];
		this.tableEntity['searchList'] = [];
		this.interSearchConditionList = [];
		this.unionSearchConditionList = [];
		this.tableEntity['sortKey'] = null;
		this.tableEntity['sortValue'] = null;
		this.accuracy = -1;
		this.beginFilterStatus = false;
		this.interConditionHtmlString = this.globalService.transformFilter(this.interSearchConditionList);
		this.unionConditionHtmlStirng = this.globalService.transformFilter(this.unionSearchConditionList);
		this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);
		this.checkedMap = {};
		this.unCheckedMap = {};
		this.checked = [];
		this.unChecked = [];
		this.checkStatus = this.defaultChecked;

		if (this.tableType === 'transform') {
			this.tableEntity['transform'] = true;
			this.tableEntity['matrix'] = true;
			this.tableEntity['mongoId'] = this.mongoId;
		}
		this._clearFilterWithoutRequest();
		// if('matchAll' in this.tableEntity) this.tableEntity['matchAll'] = false;
	}

	matchAllFn() {
		if (this.tableType === 'transform') {
			if ('matchAll' in this.tableEntity) {
				this.tableEntity['matchAll'] = true;
				this.matchAll = false;
				this.getRemoteData();
			}
		}
	}

	// 选中框
	refreshStatus(status, d): void {
		if (status) {
			this.checkedMap[d[this.key]] = d;
			delete this.unCheckedMap[d[this.key]];
		} else {
			this.unCheckedMap[d[this.key]] = d;
			delete this.checkedMap[d[this.key]];
		}
		this.computedStatus();
	}

	// 计算表头checkbox选中状态
	computedStatus() {
		const allChecked = this.dataSet.every((val) => val.checked === true);
		const allUnChecked = this.dataSet.every((val) => !val.checked);

		this.allChecked = allChecked;
		this.indeterminate = !allChecked && !allUnChecked;
		this.getCollection();
	}

	// 当前页全选
	checkAll(value) {
		this.dataSet.forEach((val) => {
			val.checked = value;
			if (value) {
				this.checkedMap[val[this.key]] = val;
				delete this.unCheckedMap[val[this.key]];
			} else {
				this.unCheckedMap[val[this.key]] = val;
				delete this.checkedMap[val[this.key]];
			}
		});
		this.computedStatus();
	}

	// 反选
	reverseCheck() {
		this.dataSet.forEach((val) => {
			val.checked = !val.checked;
			if (val.checked) {
				this.checkedMap[val[this.key]] = val;
				delete this.unCheckedMap[val[this.key]];
			} else {
				this.unCheckedMap[val[this.key]] = val;
				delete this.checkedMap[val[this.key]];
			}
		});
		this.computedStatus();
	}

	// 全局全选
	globalCheckAll() {
		this.checkStatus = true;
		this.dataSet.forEach((val) => {
			val.checked = this.checkStatus;
			this.checkedMap[val[this.key]] = val;
			this.unCheckedMap = {};
		});
		this.computedStatus();
	}

	// 全局反选
	globalReverseCheck() {
		this.checkStatus = !this.checkStatus;
		this.dataSet.forEach((val) => {
			val.checked = !val.checked;
		});
		let temp = JSON.stringify(this.checkedMap);
		this.checkedMap = JSON.parse(JSON.stringify(this.unCheckedMap));
		this.unCheckedMap = JSON.parse(temp);
		this.computedStatus();
	}

	getCollection() {
		this.checked = Object.keys(this.checkedMap);
		this.unChecked = Object.keys(this.unCheckedMap);
		this.count = this.checkStatus ? this.total - this.unChecked.length : this.checked.length;
		this.selectGeneCountChange.emit(this.count);
	}

	/**
     * @description 外部初始化表内部选中状态
     * @author Yangwd<277637411@qq.com>
     * @date 2018-12-19
     * @memberof GeneTableComponent
     */
	_initCheckStatus() {
		this.checkedMap = {};
		this.unCheckedMap = {};
		this.checked = [];
		this.unChecked = [];
		this.checkStatus = this.defaultChecked;
	}

	// applyOnceBeforeStatusThenReset(){
	//     console.log('use itself');
	//     console.log(this.checked);
	//     if('checkStatus' in this.tableEntity) this.tableEntity['checkStatus'] = this.defaultChecked;
	//     if('checked' in this.tableEntity) this.tableEntity['checked'] = this.checked;
	//     if('unChecked' in this.tableEntity) this.tableEntity['unChecked'] = this.unChecked;
	// }

	// 重置排序状态
	initSortMap() {
		this.head.forEach((val) => {
			this.sortMap[val['true_key']] = null;
			if (val['children'].length) {
				val['children'].forEach((v) => (this.sortMap[v['true_key']] = null));
			}
		});
	}

	// 根据表头生成sortmap
	generatorSortMap() {
		if ($.isEmptyObject(this.sortMap)) {
			this.head.forEach((val) => {
				this.sortMap[val['true_key']] = null;
				if (val['children'].length) {
					val['children'].forEach((v) => (this.sortMap[v['true_key']] = null));
				}
			});
		} else {
			this.head.forEach((val) => {
				if (!this.sortMap[val['true_key']]) {
					this.sortMap[val['true_key']] = null;
					if (val['children'].length) {
						val['children'].forEach((v) => {
							if (!this.sortMap[v['true_key']]) {
								this.sortMap[v['true_key']] = null;
							}
						});
					}
				}
			});
		}
	}

	// 开始排序 显示筛选按钮
	beginFilter() {
		this.beginFilterStatus = !this.beginFilterStatus;
		// 关闭筛选 重置筛选条件
		if (!this.beginFilterStatus) {
			// 重置表格筛选
			this.tableEntity['searchList'] = [];
			this.classifySearchCondition();

			// 重置一级筛选
			this.tableEntity['rootSearchContentList'] = [];
			this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);

			this.getRemoteData(true);
		}
	}

	//添加搜索 收到参数 整理搜索条件
	recive(argv) {
		if (!this.tableEntity['searchList']) {
			this.tableEntity['searchList'] = [
				{
					filterName: argv[0],
					filterNamezh: argv[1],
					filterType: argv[2],
					valueOne: argv[3],
					valueTwo: argv[4],
					searchType: argv[5]
					// crossUnion: argv[5]
				}
			];
		} else {
			var isIn = false;
			this.tableEntity['searchList'].forEach((val, index) => {
				if (val['filterName'] === argv[0]) {
					this.tableEntity['searchList'][index] = {
						filterName: argv[0],
						filterNamezh: argv[1],
						filterType: argv[2],
						valueOne: argv[3],
						valueTwo: argv[4],
						searchType: argv[5]
						// crossUnion: argv[5]
					};
					isIn = true;
				}
			});

			if (!isIn)
				this.tableEntity['searchList'].push({
					filterName: argv[0],
					filterNamezh: argv[1],
					filterType: argv[2],
					valueOne: argv[3],
					valueTwo: argv[4],
					searchType: argv[5]
					// crossUnion: argv[5]
				});
		}
		// 每次筛选的时候 重置选中的集合
		this.checkStatus = this.defaultChecked;
		this.checkedMap = {};
		this.unCheckedMap = {};
		this.checked = [];
		this.unChecked = [];

		this.classifySearchCondition();
		this.getRemoteData(true);
		this.ref.markForCheck();
	}

	// 把筛选条件 按交并集归类
	classifySearchCondition() {
		this.unionSearchConditionList = [];
        this.interSearchConditionList = [];
		if (this.tableEntity['searchList'].length) {
			this.filterHtmlString = this.globalService.transformFilter(this.tableEntity['searchList']);
		} else {
			this.filterHtmlString.length = 0;
		}

		// 每次分类筛选条件的时候 重新计算表格滚动区域高度
		setTimeout(() => {
			this.computedTbody(this.tableHeight);
		}, 0);

		this.ref.markForCheck();
	}

	// 清空搜索
	// 筛选面板组件 发来的删除筛选字段的请求
	delete(argv) {
		if (this.tableEntity['searchList'].length) {
			this.tableEntity['searchList'].forEach((val, index) => {
				if (val['filterName'] === argv[0] && val['filterNamezh'] === argv[1]) {
					this.tableEntity['searchList'].splice(index, 1);
					this.classifySearchCondition();
					this.getRemoteData(true);
					return;
				}
			});
		}
	}

	deleteWithoutRequest(argv) {
		if (this.tableEntity['searchList'].length) {
			this.tableEntity['searchList'].forEach((val, index) => {
				if (val['filterName'] === argv[0] && val['filterNamezh'] === argv[1]) {
					this.tableEntity['searchList'].splice(index, 1);
					this.classifySearchCondition();
					// this.getRemoteData();
					return;
				}
			});
		}
	}

	// 表格单元格hover的时候 把单元格的值存起来 传到统一的ng-template里
	setPopoverText(text, type) {
		this.popoverText = text;
		this.popoverSearchType = type;
	}

	// 删除筛选条件
	deleteFilterItem(item) {
		let filterObj = item.obj;
		if (this.error) {
			this.isErrorDelete = true;
			// 没数据的时候 在表格筛选参数里找出当前的筛选条件删除 重新获取表格数据
			let index = this.tableEntity['searchList'].findIndex((val, i) => {
				return val['filterName'] === filterObj['filterName'] && val['filterType'] === filterObj['filterType'];
			});
			if (index != -1) {
				this.tableEntity['searchList'].splice(index, 1);
				this.getRemoteData(true);
			}
			this.filterHtmlString = this.globalService.transformFilter(this.tableEntity['searchList']);
		} else {
			this._deleteFilter(filterObj['filterName'], filterObj['filterNamezh'], filterObj['filterType']);
		}
	}

	// 删除一级筛选条件
	deleteRootFilterItem(item) {
		let filterObj = item.obj;
		this.tableEntity['rootSearchContentList'].forEach((val, index) => {
			if (
				val['filterName'] === filterObj['filterName'] &&
				val['filterNamezh'] === filterObj['filterNamezh'] &&
				val['filterType'] === filterObj['filterType']
			) {
				this.tableEntity['rootSearchContentList'].splice(index, 1);
				this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);
			}
		});
		this.getRemoteData();
	}

	// track by function
	identify(index, item) {
		return item['true_key'];
	}

	filterTrackByFn(index, item) {
		return item['beforeHtml'];
	}

	refresh() {
		if (this.tableType === 'transform') {
			this.tableEntity['mongoId'] = this.mongoId;
			this.tableEntity['transform'] = false;
			this.tableEntity['matrix'] = true;
		}
		this.getRemoteData();
	}

	/**
     * @description  根据表头层级关系计算表头宽度
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} head
     * @returns {object}
     * @memberof BigTableComponent
     */
	computedTheadWidth(head): object {
		let defaultWidth = 12;
		let widthConfig = [];
		let twoLevelHead = [];
		let twoLevelWidth = [];
		let totalWidth: string;
		let tableRelative = [];

		head.forEach((v) => {
			let singleWidth = 0;
			if (v.children.length) {
				v['colspan'] = v.children.length;
				v['rowspan'] = 1;
				v.children.forEach((val) => {
					singleWidth = val.name.length * defaultWidth + 22;
					widthConfig.push(singleWidth);
					twoLevelHead.push(val);
					twoLevelWidth.push(singleWidth + 'px');
				});
				tableRelative.push(v);
			} else {
				v['colspan'] = 1;
				v['rowspan'] = 2;
				singleWidth = defaultWidth * v.name.length + 22;
				widthConfig.push(singleWidth);
			}
		});
		widthConfig.unshift(61);
		let colLeftConfig: any[] = [];
		// 计算首列的left
		if (head[0]['children'].length) {
			head[0]['children'].forEach((v, i) => {
				let sunDis = 0;
				for (var k = 0; k < i + 1; k++) {
					sunDis += widthConfig[k];
				}
				colLeftConfig.push(sunDis);
			});
		} else {
			colLeftConfig.push(widthConfig[0]);
		}

		let tempTotalWidth = 0;
		widthConfig.map((v, i) => {
			tempTotalWidth += v;
			widthConfig[i] += 'px';
		});
		colLeftConfig.map((v, i) => (colLeftConfig[i] += 'px'));
		totalWidth = tempTotalWidth + 'px';

		return { widthConfig, twoLevelHead, twoLevelWidth, colLeftConfig, totalWidth, tableRelative };
	}

	computedTbody(tableHeight) {
		if (this.theadInitTimer) clearInterval(this.theadInitTimer);
		if (tableHeight && tableHeight > 0) {
			// 固定头的高度
			let head;
			this.theadInitTimer = setInterval(() => {
				head = $(`#${this.tableId} .ant-table-thead`).outerHeight();
				if (head) {
					clearInterval(this.theadInitTimer);
					// 分页的高度
					let bottom = $(`#${this.tableId} .table-bottom`).outerHeight();
					// 筛选条件的高度
					let filter = $(`#${this.tableId} .table-filter`).outerHeight();
					// 表头工具栏的高度
					let tools = $(`#${this.tableId} .table-thead`).outerHeight();
					// 首列gene的高度
					let res = tableHeight - head - bottom - filter - tools - 2;
					$(`#${this.tableId} .ant-table-body`).css('height', `${res}px`);
					this.scroll['y'] = `${res}px`;
				}
			}, 100);
		}
	}

	pageSizeChange() {
		this.tableEntity['pageIndex'] = 1;
		this.pageSizeChangeFlag = true;
		this.getRemoteData(true, () => {
			this.pageSizeChangeFlag = false;
		});
	}

	/**
     * @description 点击分析按钮
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-13
     * @memberof GeneTableComponent
     */
	analysis() {
		this.count = this.checkStatus ? this.total - this.unChecked.length : this.checked.length;
		if (!this.count) {
			this.notify.blank('tips：', '请选择需要分析的基因', {
				nzStyle: { width: '200px' },
				nzDuration: 2000
			});
		} else {
			let params = { srcTotal: this.srcTotal, ...this._getInnerStatusParams() };
			this.toolsService.showTools(this.total, params);
		}
	}

	/**
     * @description 保存基因集
     * @author Yangwd<277637411@qq.com>
     * @date 2018-12-14
     * @memberof GeneTableComponent
     */
	initFormValue() {
		// 数字 字母 下划线  不能以数字开头 30位  label 20
		// reg
		// name /^[a-zA-Z_][a-zA-Z0-9_]{0,29}$/
		// label /^[a-zA-Z_][a-zA-Z0-9_]{0,19}$/
		this.validateForm = this.fb.group({
			name: [ '', [ Validators.required, Validators.pattern('^[a-zA-Z_][a-zA-Z0-9_\.-]{0,29}$') ] ],
			label: [ null ],
			mark: [ '' ]
		});
		this.labelSelectError = false;
	}

	handleSelectChange() {
		var timer = null;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			if (!this.arrEquals(this.labelSelect, this.validateForm.value['label'].concat())) {
				let reg = /^[a-zA-Z_][a-zA-Z0-9_]{0,19}$/;
				this.delSelect.length = 0;
				this.labelSelect = [ ...this.validateForm.value['label'] ];

				this.validateForm.value['label'].forEach((v, i) => {
					if (!v.match(reg)) this.delSelect.push(...this.labelSelect.splice(i, 1));
				});

				this.validateForm.get('label').setValue([ ...this.labelSelect ]);

				this.labelSelectError = !!this.delSelect.length;
				// 关闭下拉选择框
				if (this.labelSelectError) this.openSelect = false;
				setTimeout(() => {
					this.labelSelectError = false;
				}, 3000);
			}
		}, 30);
	}

	saveGeneList() {
		let geneCount = this.checkStatus ? this.total - this.unChecked.length : this.checked.length;
		if (geneCount > 0) {
			this.initFormValue();
			this.isSaveGeneList = true;
			this.delSelect.length = 0;
			this.openSelect = false;
            this.getAllLabels();
            // this.getAllTags();
		} else {
			this.notify.blank('tips：', '请选择需要保存的基因', {
				nzStyle: { width: '200px' },
				nzDuration: 2000
			});
		}
	}

	getAllLabels() {
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/geneSet/existed`,
				data: {
					LCID: sessionStorage.getItem('LCID'),
					geneType: this._getInnerStatusParams()['tableEntity']['geneType']
				}
			})
			.subscribe((res) => {
				if (res['status'] == '0') {
					this.labels = res['data'];
				} else {
					this.labels = [];
				}
			});
    }

    getAllTags(){
        this.ajaxService.getDeferData({
            url:`${config['javaPath']}/geneSet/display`,
            data:{
                LCID: sessionStorage.getItem('LCID'),
                geneType: this._getInnerStatusParams()['tableEntity']['geneType']
            }
        }).subscribe(res=>{
            if(res['status']==0 && res['data'].length){
                this.setNameList = res['data'].map(v=>v['setName']);
            }else{
                this.setNameList.length = 0;
            }
        });
    }

	handleSaveGeneConfirm() {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}

		if (this.validateForm.controls['name']['valid'] && this.validateForm.controls['label']['valid']) {
			this.isSaveGeneList = false;
			let innerParams = JSON.parse(JSON.stringify(this._getInnerStatusParams()));
			let params = innerParams['tableEntity'];
			let mongoId = innerParams['mongoId'];
			let formValue = this.validateForm.value;

			params['mongoId'] = mongoId;
			params['checkStatus'] = innerParams['others']['checkStatus'];
			params['checked'] = innerParams['others']['excludeGeneList']['checked'];
			params['unChecked'] = innerParams['others']['excludeGeneList']['unChecked'];
			params['tags'] = formValue['label'] || [];
			params['setName'] = formValue['name'] || '';
			params['setAnnot'] = formValue['mark'] || '';
			params['saveGeneSet'] = true;

			this.ajaxService
				.getDeferData({
					url: this.url,
					data: params
				})
				.subscribe((res) => {
					let msg: string;
					if (res['status'] == 0) {
						msg = `${params['setName']} 保存成功`;
						this.notify.success('基因集', msg);

						this.saveGeneListSuccess.emit(params);
					} else {
						msg = `${params['setName']} ${res['message']}`;
						this.notify.warning('基因集保存失败', msg);
					}
				});
		}
	}

	handleSaveGeneCancel() {
		this.isSaveGeneList = false;
	}

	arrEquals(temp, arr): boolean {
		if (temp.length !== arr.length) return false;
		temp.forEach((v, i) => {
			if (v != arr[i]) return false;
		});
		return true;
	}

	// textarea 字符提示
	handleTextKeyUp() {
		let textLen = this.validateForm.value['mark'].length;
		if (textLen >= this.textareaMaxLen) {
			let str = this.validateForm.value['mark'];
			this.validateForm.get('mark').setValue(str.substring(0, this.textareaMaxLen));
		}
	}

	/**
     * @description 组件外设置内部查询参数 更新参数并发请求
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-19
     * @param {*} object
     * @memberof GeneTableComponent
     */
	_setParamsOfObject(object) {
		if (!$.isEmptyObject(object)) {
			for (let key in object) {
				this.tableEntity[key] = object[key];
			}
			this.getRemoteData();
		}
	}

	/**
     * @description  组件外设置内部查询参数 更新参数并发请求
     * @author Yangwd<277637411@qq.com>
     * @param {any} key
     * @param {any} value
     * @memberof GeneTableComponent
     */
	_setParamsOfEntity(key, value) {
		this.tableEntity[key] = value;
		this.getRemoteData();
	}

	/**
     * @description  组件外设置内部查询参数 更新参数不发请求
     * @author Yangwd<277637411@qq.com>
     * @param {any} key
     * @param {any} value
     * @memberof GeneTableComponent
     */
	_setParamsOfEntityWithoutRequest(key, value) {
		this.tableEntity[key] = value;
	}

	/**
     * @description 表格组件外部删除筛选条件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName
     * @param {*} filterNamezh
     * @param {*} filterType
     * @memberof BigTableComponent
     */
	_deleteFilter(filterName, filterNamezh, filterType) {
		this.children._results.forEach((val) => {
			if (
				val.pid === this.tableId &&
				val.filterName === filterName &&
				val.selectType === filterType &&
				val.filterNamezh === filterNamezh
			) {
				val._outerDelete(filterName, filterNamezh, filterType);
			}
		});
	}

	_deleteFilterWithoutRequest(filterName, filterNamezh, filterType) {
		this.children._results.forEach((val) => {
			if (
				val.pid === this.tableId &&
				val.filterName === filterName &&
				val.selectType === filterType &&
				val.filterNamezh === filterNamezh
			) {
				val._outerDeleteWithoutRequest(filterName, filterNamezh, filterType);
			}
		});
	}

	/**
     * @description 表格组件外部清空筛选条件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @memberof BigTableComponent
     */
	_clearFilter() {
		this.beginFilterStatus = false;
		this.tableEntity['searchList'] = [];
		this.classifySearchCondition();

		this.tableEntity['rootSearchContentList'] = [];
		this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);

		this.getRemoteData();
	}

	_clearFilterWithoutRequest() {
		this.beginFilterStatus = false;
		this.tableEntity['searchList'] = [];
		this.classifySearchCondition();

		this.tableEntity['rootSearchContentList'] = [];
		this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);
	}

	/**
     * @description 表格的顶层筛选
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @memberof BigTableComponent
     * 只需要塞进筛选条件 并且显示筛选条件
     */
	_rootFilter(filterName, filterNamezh, filterType, valueOne, valueTwo) {
		let obj = { filterName, filterNamezh, filterType, valueOne, valueTwo };
		for (let i = 0; i < this.tableEntity['rootSearchContentList'].length; i++) {
			if (this.tableEntity['rootSearchContentList'][i]['filterName'] === filterName) {
				this.tableEntity['rootSearchContentList'][i] = obj;
				this.getRemoteData();
				return;
			}
		}

		this.tableEntity['rootSearchContentList'].push(obj);
		this.rootHtmlString = this.globalService.transformRootFilter(this.tableEntity['rootSearchContentList']);
		this.getRemoteData();
	}

	/**
     * @description
     * 外部可通过此方法 进行筛选
     * 通过@ViewChild('child') child;this.child._filter()筛选
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName
     * @param {*} filterNamezh
     * @param {string} searchType
     * @param {*} filterType
     * @param {*} filterValueOne
     * @param {*} filterValueTwo
     * @memberof BigTableComponent
     */
	_filter(
		filterName,
		filterNamezh,
		searchType,
		filterType,
		filterValueOne,
		filterValueTwo
		// crossUnion
	) {
		/* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
		// 没有打开筛选就打开
		if (!this.beginFilterStatus) this.beginFilterStatus = true;
		// 待筛选面板渲染完后找到匹配的筛选面板传数据
		setTimeout(() => {
			if (this.children._results.length) {
				this.children._results.forEach((val) => {
					if (val.pid === this.tableId && val.filterName === filterName) {
						val._outerUpdate(
							filterName,
							filterNamezh,
							filterType,
							filterValueOne,
							filterValueTwo,
							searchType
						); // crossUnion
						this.recive([
							filterName,
							filterNamezh,
							filterType,
							filterValueOne,
							filterValueTwo,
							searchType
						]); // crossUnion
					}
				});
			} else {
				this.recive([ filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType ]); // crossUnion
			}
		}, 30);
	}

	_filterWithoutRequest(
		filterName,
		filterNamezh,
		searchType,
		filterType,
		filterValueOne,
		filterValueTwo
		// crossUnion
	) {
		/* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
		// 没有打开筛选就打开
		if (!this.beginFilterStatus) {
			this.beginFilterStatus = true;
		}
		setTimeout(() => {
			// 待筛选面板渲染完后找到匹配的筛选面板传数据
			if (this.children._results.length) {
				this.children._results.forEach((val) => {
					if (val.pid === this.tableId && val.filterName === filterName) {
						val._outerUpdate(
							filterName,
							filterNamezh,
							filterType,
							filterValueOne,
							filterValueTwo,
							searchType
							// crossUnion
						);

						// 不发请求不清空选中状态
						/*
                            this.checkStatus = this.defaultChecked;
                            this.checkedMap = {};
                            this.unCheckedMap = {};
                            this.checked = [];
                            this.unChecked = [];
                        */

						this.classifySearchCondition();
					}
				});
			}
		}, 30);
	}

	/**
     * @description 外部排序字段
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-09
     * @param {*} filterName string "name"
     * @param {*} sortMethod string "descend"
     * @memberof BigTableComponent
     */
	_sort(filterName, sortMethod): void {
		this.sort(filterName, sortMethod);
	}

	/**
     * @description 外部增删列   字段相同的列保留筛选条件
     * 永远都是覆盖参数的增删列
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-29
     * @param {string[]} addThead
     * @param {string} key
     * @memberof GeneTableComponent
     */
	_addThead(addThead: string[]) {
		this.tableEntity['addThead'] = addThead;
		this.deleteSearchListItemOrderByAddThead();
		this.beforeAddThead = this.tableEntity['addThead'].concat();
		this.getRemoteData();
	}

	_clearThead() {
		this.tableEntity['addThead'] = [];
		this.deleteSearchListItemOrderByAddThead();
		this.beforeAddThead = [];
		this.getRemoteData();
	}

	/**
     * @description 外部获取表格内部状态数据
     * @author Yangwd<277637411@qq.com>
     * @returns
     * @memberof GeneTableComponent
     */
	_getInnerStatusParams() {
		return JSON.parse(
			JSON.stringify({
				tableEntity: this.tableEntity,
				url: this.url,
				baseThead: this.head,
				others: {
					checkStatus: this.checkStatus,
					excludeGeneList: {
						checked: this.checked,
						unChecked: this.unChecked
					}
				},
				mongoId: this.mongoId || null
			})
		);
	}

	_getData() {
		this.getRemoteData();
	}

	deleteSearchListItemOrderByAddThead() {
		if (this.beforeAddThead) {
			this.beforeAddThead.forEach((val) => {
				if (!this.isInArr(val, this.tableEntity['addThead'], 'key')) {
					// 删除搜索条件
					this.tableEntity['searchList'].forEach((v, n) => {
						if (v['filterName'] === val['key']) {
							this.tableEntity['searchList'].splice(n, 1);
						}
					});
					// 删除排序
					if (this.tableEntity['sortKey'] === val['key']) {
						this.tableEntity['sortKey'] = null;
						this.tableEntity['sortValue'] = null;
						if (val['key'] in this.sortMap) {
							this.sortMap[val['key']] = null;
						}
					}
				}
			});
			this.classifySearchCondition();
		}
	}

	isInArr(x, arr, key?) {
		for (let i = 0; i < arr.length; i++) {
			if (key) {
				if (arr[i][key] === x[key]) return true;
			} else {
				if (arr[i] == x) return true;
			}
		}
		return false;
	}
}
