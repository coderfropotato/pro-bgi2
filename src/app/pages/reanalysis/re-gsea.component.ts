import {AddColumnService} from './../../super/service/addColumnService';
import {StoreService} from './../../super/service/storeService';
import {PageModuleService} from './../../super/service/pageModuleService';
import {MessageService} from './../../super/service/messageService';
import {AjaxService} from 'src/app/super/service/ajaxService';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {GlobalService} from 'src/app/super/service/globalService';
import config from '../../../config';
import {PromptService} from './../../super/service/promptService';

declare const d3: any;
declare const gooalD3: any;
declare const $: any;

@Component({
    selector: 'app-re-gsea',
    templateUrl: './re-gsea.component.html',
    styles: []
})
export class ReGseaComponent implements OnInit {
    @ViewChild('switchChart') switchChart;
    @ViewChild('left') left;
    @ViewChild('leftBottom') leftBottom;
    @ViewChild('bigTable') bigTable;
    @ViewChild('right') right;
    @ViewChild('func') func;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    // 默认显示表
    expandModuleTable: boolean = true;

    bigtableUrl: string;

    chartUrl: string;
    chartEntity: object;

    chart: any;

    //column
    show: boolean = false;
    legendIndex: number = 0; //热图图例 当前点击图例的索引
    color: string; //当前选中的color
    colors: string[]; // 普通图例 colors
    gcolors: string[]; // 热图图例 colors
    isGradient: boolean;

    isShowTable: boolean;

    visible: boolean = false;

    checkedData: any = [];
    checkedDrawGeneList: any = [];

    // table
    defaultEntity: object;
    defaultUrl: string;
    defaultTableId: string;
    defaultDefaultChecked: boolean;
    defaultCheckStatusInParams: boolean;
    defaultEmitBaseThead: boolean;

    extendEntity: object;
    extendUrl: string;
    extendTableId: string;
    extendDefaultChecked: boolean;
    extendCheckStatusInParams: boolean;
    extendEmitBaseThead: boolean;
    baseThead: any[] = [];
    applyOnceSearchParams: boolean;

    tableHeight = 0;
    leftTableHeight = 0;
    first = true;
    switch = 'right';

    addColumnShow: boolean = false;
    showBackButton: boolean = false;

    // 路由参数
    tid: string = null;
    geneType: string = 'gene';
    version: string = null;
    date: string = null;

    computedScrollHeight: boolean = false;
    leftComputedScrollHeight: boolean = false;

    selectedVal: string = 'go_cfp_term_level_2';
    annotation: string = '';
    selectData: any = [];

    resetCheckGraph: boolean;

    isMultipleSelect: boolean = false;

    selectArray: object[] = [];
    // 图上选择的数据
    selectGeneList: string[] = [];

    graphTitle: string = null;

    constructor(
        private message: MessageService,
        private ajaxService: AjaxService,
        private globalService: GlobalService,
        public storeService: StoreService,
        public pageModuleService: PageModuleService,
        private router: Router,
        private routes: ActivatedRoute,
        private promptService: PromptService,
        private addColumnService: AddColumnService
    ) {
        // 订阅windowResize 重新计算表格滚动高度
        this.message.getResize().subscribe((res) => {
            if (res['message'] === 'resize') this.computedTableHeight();
        });

        // 每次切换路由计算表格高度
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.computedTableHeight();
            }
        });

        this.routes.paramMap.subscribe((params) => {
            this.tid = params['params']['tid'];
            this.version = params['params']['version'];
            this.geneType = params['params']['geneType'];
            this.annotation = params['params']['annotation'];
            this.date = params['params']['date'];

            this.storeService.setTid(this.tid);
        })
    }

    ngOnInit() {
        this.gcolors = ["#0070c0", "#ff0000"];
        this.colors = ["#0F0", "#0F0F0F", "gray"];
        (async () => {
            this.bigtableUrl = `${config['javaPath']}/enrichment/generalTable`;
            this.chartUrl = `${config['javaPath']}/enrichment/graph`;
            this.chartEntity = {
                LCID: this.storeService.getStore('LCID'),
                enrichmentType: this.annotation,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                checkedClassifyType: 'go_f_term_level_2',
                checkedClassifyList: [],
                searchList: [],
                pageIndex: 1,
                pageSize: 20,
                sortKey: null,
                sortValue: null,
                tid: this.tid,
                version: this.storeService.getStore('version')
            };

            this.first = true;
            this.resetCheckGraph = true;
            this.applyOnceSearchParams = true;
            this.defaultUrl = `${config['javaPath']}/enrichment/table`;
            this.defaultEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid: this.tid,
                enrichmentType: this.annotation,
                pageIndex: 1,
                pageSize: 20,
                mongoId: null,
                addThead: [],
                transform: false,
                matrix: false,
                relations: [],
                sortValue: null,
                sortKey: null,
                reAnaly: false,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.version,
                searchList: [],
                checkedClassifyType: this.selectedVal,
                checkedClassifyList: this.selectGeneList,
                checkGraph: true,
                sortThead: this.addColumn['sortThead'],
                removeColumns: []
            };
            this.defaultTableId = 'default_rich';
            this.defaultDefaultChecked = true;
            this.defaultEmitBaseThead = true;
            this.defaultCheckStatusInParams = true;

            this.extendUrl = `${config['javaPath']}/enrichment/table`;
            this.extendEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid: this.tid,
                enrichmentType: this.annotation,
                pageIndex: 1,
                pageSize: 20,
                mongoId: null,
                addThead: [],
                transform: false,
                matchAll: false,
                matrix: false,
                relations: [],
                sortValue: null,
                sortKey: null,
                reAnaly: false,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.version,
                searchList: [],
                checkedClassifyType: this.selectedVal,
                checkedClassifyList: this.selectGeneList,
                checkGraph: true,
                sortThead: this.addColumn['sortThead'],
                removeColumns: []
            };
            this.extendTableId = 'extend_rich';
            this.extendDefaultChecked = true;
            this.extendEmitBaseThead = true;
            this.extendCheckStatusInParams = false;
        })()
    }

    moduleTableChange() {
        this.expandModuleTable = !this.expandModuleTable;
        // 重新计算表格切换组件表格的滚动高度
        setTimeout(() => {
            this.switchChart.scrollHeight();
        }, 30);
    }


    showChange(isshowtable) {
        this.isShowTable = isshowtable;
    }

    checkedChange(data) {
        this.checkedData = [...data[1]];
        this._sortArr(this.annotation + '_qvalue', this.checkedData);
        this.checkedDrawGeneList.length = 0;
        this.checkedData.forEach(d => {
            let geneid = d[this.annotation + "_term"] ? d[this.annotation + "_term"] : d[this.annotation + "_term_id"];
            this.checkedDrawGeneList.push(geneid);
        })

    }

    //排序
    _sortArr(key, arr) {
        arr.sort(function (a, b) {
            return a[key] - b[key];
        })
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.computedTableHeight();
        }, 30);
    }

    handleSelectGeneCountChange(selectGeneCount) {
    }

    toggle(status) {
        this.addColumnShow = status;
    }

    // 表
    addThead(thead) {
        this.transformTable._initCheckStatus();

        this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
        this.transformTable._setParamsNoRequest('pageIndex', 1);

        this.transformTable._addThead(thead['add']);
    }

    // 表格转换 确定
    // 转换之前需要把图的 参数保存下来  返回的时候应用
    confirm(relations) {
        this.showBackButton = true;
        this.extendEmitBaseThead = true;
        let checkParams = this.transformTable._getInnerParams();
        this.applyOnceSearchParams = true;
        if (this.first) {
            this.extendCheckStatusInParams = false;
            this.extendEntity['checkStatus'] = checkParams['others']['checkStatus'];
            this.extendEntity['unChecked'] = checkParams['others']['excludeGeneList']['unChecked'];
            this.extendEntity['checked'] = checkParams['others']['excludeGeneList']['checked'];
            this.extendEntity['mongoId'] = checkParams['mongoId'];
            this.extendEntity['searchList'] = checkParams['tableEntity']['searchList'];
            this.extendEntity['rootSearchContentList'] = checkParams['tableEntity']['rootSearchContentList'];
            this.extendEntity['relations'] = relations;
            this.extendEntity['transform'] = true;
            this.extendEntity['matrix'] = true;
            this.extendEntity['checkGraph'] = false;
            this.extendEntity['checkedClassifyType'] = checkParams['tableEntity']['checkedClassifyType'];
            this.extendEntity['checkedClassifyList'] = checkParams['tableEntity']['checkedClassifyList'];
            this.addColumn._clearThead();
            this.extendEntity['addThead'] = checkParams['tableEntity']['addThead'];
            this.first = false;
        } else {
            this.transformTable._initTableStatus();
            this.extendCheckStatusInParams = false;
            this.transformTable._setExtendParamsWithoutRequest('checkStatus', checkParams['others']['checkStatus']);
            this.transformTable._setExtendParamsWithoutRequest('checked', checkParams['others']['excludeGeneList']['checked'].concat());
            this.transformTable._setExtendParamsWithoutRequest('unChecked', checkParams['others']['excludeGeneList']['unChecked'].concat());
            this.transformTable._setExtendParamsWithoutRequest('searchList', checkParams['tableEntity']['searchList']);
            this.transformTable._setExtendParamsWithoutRequest('rootSearchContentList', checkParams['tableEntity']['rootSearchContentList']);
            this.transformTable._setExtendParamsWithoutRequest('checkedClassifyType', checkParams['tableEntity']['checkedClassifyType']);
            this.transformTable._setExtendParamsWithoutRequest('checkedClassifyList', checkParams['tableEntity']['checkedClassifyList']);
            this.transformTable._setExtendParamsWithoutRequest('relations', relations);
            this.transformTable._setExtendParamsWithoutRequest('transform', true);
            this.transformTable._setExtendParamsWithoutRequest('matrix', true);
            this.transformTable._setExtendParamsWithoutRequest('checkGraph', false);
            this.transformTable._setExtendParamsWithoutRequest('addThead', checkParams['tableEntity']['addThead']);
            this.addColumn._clearThead();
            setTimeout(() => {
                this.transformTable._getData();
            }, 30);
        }
        setTimeout(() => {
            this.extendCheckStatusInParams = true;
        }, 30);
    }

    back() {
        this.showBackButton = false;
    }

    handlerRefresh() {
        this.selectGeneList.length = 0;
        // this.chartBackStatus();
    }


    // 表格基础头改变  设置emitBaseThead为true的时候 表格下一次请求回来会把表头发出来 作为表格的基础表头传入增删列
    baseTheadChange(thead) {
        this.baseThead = thead['baseThead'].map((v) => v['true_key']);
    }

    // 表格上方功能区 resize重新计算表格高度
    resize(event) {
        setTimeout(() => {
            this.computedTableHeight();
        }, 30)
    }

    // 切换左右布局 计算左右表格的滚动高度
    switchChange(status) {
        this.switch = status;
        setTimeout(() => {
            try {
                this.switchChart.scrollHeight();
            } catch (e) {
            }
            this.computedTableHeight();
        }, 320)
    }

    computedTableHeight() {
        try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2;
            if (this.tableHeight === h) this.computedScrollHeight = true;

            let l = this.leftTableHeight;
            this.leftTableHeight = this.leftBottom.nativeElement.offsetHeight - 24;
            if (this.leftTableHeight === l) this.leftComputedScrollHeight = true;
        } catch (error) {
        }
    }

    //画图
    drawChart(data) {
        document.getElementById('re-gsea').innerHTML = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
    <style>
        svg {
            background: #EEE;
        }

        .top-text {
            font: 18px solid bold;
            text-anchor: middle;
            text-align: center;
        }

        .line-chart, .point {
            fill: none;
            stroke-width: 2;
        }

        .axis {
            font-size: 10px;
            stroke-width: 1;
            fill: none;
            stroke: rgb(136, 136, 136);
        }

        .axis text {
            stroke: rgba(32, 32, 32, .1);
        }

        .horizonLine {
            stroke-width: .4;
            fill: none;
            stroke: rgb(15, 15, 15);
        }

        .axis-line {
            stroke: #111
        }

        .axis-title {
            user-select: none;
        }
    </style>
     </svg>`;
        let that = this;

        data = {
            "line": {
                "data": [{
                    "PROBE": "G9606_5775",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 59,
                    "RANK METRIC SCORE": 2.474874258041382,
                    "RUNNING ES": 0.02599405,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3037",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 870,
                    "RANK METRIC SCORE": 1.2500436305999756,
                    "RUNNING ES": 0.019177184,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_20097",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 1575,
                    "RANK METRIC SCORE": 1.0251798629760742,
                    "RUNNING ES": 0.012571443,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_1361",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 1645,
                    "RANK METRIC SCORE": 1.0103629827499392,
                    "RUNNING ES": 0.022035227999999997,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_10663",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 1774,
                    "RANK METRIC SCORE": 0.9814986586570741,
                    "RUNNING ES": 0.02966988,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2935",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 1991,
                    "RANK METRIC SCORE": 0.935072898864746,
                    "RUNNING ES": 0.034538843,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_16657",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 2228,
                    "RANK METRIC SCORE": 0.8929417133331299,
                    "RUNNING ES": 0.038428307,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3066",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 2279,
                    "RANK METRIC SCORE": 0.8839356303215027,
                    "RUNNING ES": 0.046972892999999995,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_11589",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 2289,
                    "RANK METRIC SCORE": 0.8815426826477051,
                    "RUNNING ES": 0.05653908,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3639",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 2306,
                    "RANK METRIC SCORE": 0.8797399997711182,
                    "RUNNING ES": 0.06590628,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_31781",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 2826,
                    "RANK METRIC SCORE": 0.8084092736244202,
                    "RUNNING ES": 0.061621286,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_33867",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3466,
                    "RANK METRIC SCORE": 0.7317352294921875,
                    "RUNNING ES": 0.05341636,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_809",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3483,
                    "RANK METRIC SCORE": 0.7298973798751831,
                    "RUNNING ES": 0.06111841,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_1072",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3592,
                    "RANK METRIC SCORE": 0.7167551517486572,
                    "RUNNING ES": 0.06632237,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_349",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3701,
                    "RANK METRIC SCORE": 0.7064346075057983,
                    "RUNNING ES": 0.07141165,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_5094",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3793,
                    "RANK METRIC SCORE": 0.6969643831253052,
                    "RUNNING ES": 0.0768303,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_734",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 3871,
                    "RANK METRIC SCORE": 0.6885543465614319,
                    "RUNNING ES": 0.08251341,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_12209",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 4740,
                    "RANK METRIC SCORE": 0.615906834602356,
                    "RUNNING ES": 0.06716679,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_11755",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 5053,
                    "RANK METRIC SCORE": 0.5902515053749084,
                    "RUNNING ES": 0.06574958,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4714",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 5065,
                    "RANK METRIC SCORE": 0.5895850658416748,
                    "RUNNING ES": 0.07202021,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_25834",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 5979,
                    "RANK METRIC SCORE": 0.5276156067848206,
                    "RUNNING ES": 0.054541985999999994,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_5911",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 6205,
                    "RANK METRIC SCORE": 0.5124858021736145,
                    "RUNNING ES": 0.054484795999999995,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4831",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 6401,
                    "RANK METRIC SCORE": 0.500444233417511,
                    "RUNNING ES": 0.05506076,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_8304",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 6901,
                    "RANK METRIC SCORE": 0.4690973460674286,
                    "RUNNING ES": 0.047516424,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_9943",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 6970,
                    "RANK METRIC SCORE": 0.46481668949127203,
                    "RUNNING ES": 0.050943308,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_15623",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 7692,
                    "RANK METRIC SCORE": 0.4276434183120728,
                    "RUNNING ES": 0.037262734,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_13546",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 8274,
                    "RANK METRIC SCORE": 0.3981394171714783,
                    "RUNNING ES": 0.026833482000000002,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2225",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 8669,
                    "RANK METRIC SCORE": 0.3776233494281769,
                    "RUNNING ES": 0.02095702,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_27074",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 8835,
                    "RANK METRIC SCORE": 0.3704167008399963,
                    "RUNNING ES": 0.020855000000000002,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2664",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 8870,
                    "RANK METRIC SCORE": 0.3685259222984314,
                    "RUNNING ES": 0.02408107,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_27172",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 8958,
                    "RANK METRIC SCORE": 0.3639739155769348,
                    "RUNNING ES": 0.025901575,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_7935",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 9900,
                    "RANK METRIC SCORE": 0.31960901618003845,
                    "RUNNING ES": 0.005396013000000001,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_23530",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 10586,
                    "RANK METRIC SCORE": 0.291253924369812,
                    "RUNNING ES": -0.008879846,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_16945",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 10868,
                    "RANK METRIC SCORE": 0.28505977988243103,
                    "RUNNING ES": -0.01289602,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4481",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 11217,
                    "RANK METRIC SCORE": 0.27005380392074585,
                    "RUNNING ES": -0.018791849,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_1786",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 11803,
                    "RANK METRIC SCORE": 0.247881680727005,
                    "RUNNING ES": -0.030993124,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_24705",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 12782,
                    "RANK METRIC SCORE": 0.21271584928035736,
                    "RUNNING ES": -0.053632482999999995,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_12700",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 13185,
                    "RANK METRIC SCORE": 0.20130905508995056,
                    "RUNNING ES": -0.06167279,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_5231",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 13629,
                    "RANK METRIC SCORE": 0.18658676743507385,
                    "RUNNING ES": -0.07092489,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_12618",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 13847,
                    "RANK METRIC SCORE": 0.1794152706861496,
                    "RUNNING ES": -0.07447886,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_22118",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 13942,
                    "RANK METRIC SCORE": 0.1753837913274765,
                    "RUNNING ES": -0.07493305,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_305",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 15684,
                    "RANK METRIC SCORE": 0.12564212083816528,
                    "RUNNING ES": -0.11804661,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_9636",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 16004,
                    "RANK METRIC SCORE": 0.1189817562699318,
                    "RUNNING ES": -0.124879844,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3640",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 17435,
                    "RANK METRIC SCORE": 0.08358658850193024,
                    "RUNNING ES": -0.16050984,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2830",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 17436,
                    "RANK METRIC SCORE": 0.08349773287773132,
                    "RUNNING ES": -0.15958196,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_6346",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 18308,
                    "RANK METRIC SCORE": 0.05861210078001022,
                    "RUNNING ES": -0.1811983,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4987",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 18475,
                    "RANK METRIC SCORE": 0.052027124911546714,
                    "RUNNING ES": -0.18486403,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_7630",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 18603,
                    "RANK METRIC SCORE": 0.04676668718457222,
                    "RUNNING ES": -0.18759117,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_27493",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 19054,
                    "RANK METRIC SCORE": 0.02857140079140663,
                    "RUNNING ES": -0.19877820000000002,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_18327",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 19259,
                    "RANK METRIC SCORE": 0.020268818363547325,
                    "RUNNING ES": -0.20376836,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_16251",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 19410,
                    "RANK METRIC SCORE": 0.014028137549757956,
                    "RUNNING ES": -0.2074473,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_416",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 20619,
                    "RANK METRIC SCORE": -0.006356494966894388,
                    "RUNNING ES": -0.23825996,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_14649",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 20805,
                    "RANK METRIC SCORE": -0.016783541068434715,
                    "RUNNING ES": -0.2428031,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_22897",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 20824,
                    "RANK METRIC SCORE": -0.017601199448108673,
                    "RUNNING ES": -0.24306768,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_18791",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 21040,
                    "RANK METRIC SCORE": -0.02863823994994164,
                    "RUNNING ES": -0.24824604,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4858",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 21319,
                    "RANK METRIC SCORE": -0.04347822070121765,
                    "RUNNING ES": -0.25487015,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_11900",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 21883,
                    "RANK METRIC SCORE": -0.07037185877561569,
                    "RUNNING ES": -0.26848158,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2710",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 23911,
                    "RANK METRIC SCORE": -0.12136351317167282,
                    "RUNNING ES": -0.31895447,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_7971",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24301,
                    "RANK METRIC SCORE": -0.1327534317970276,
                    "RUNNING ES": -0.32742426,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3189",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24530,
                    "RANK METRIC SCORE": -0.14082902669906616,
                    "RUNNING ES": -0.33168823,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_21395",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24544,
                    "RANK METRIC SCORE": -0.14120662212371826,
                    "RUNNING ES": -0.3304514,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_8762",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24753,
                    "RANK METRIC SCORE": -0.14833949506282804,
                    "RUNNING ES": -0.3341206,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_25508",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24842,
                    "RANK METRIC SCORE": -0.1493230015039444,
                    "RUNNING ES": -0.33471102,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_24979",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24896,
                    "RANK METRIC SCORE": -0.1515151411294937,
                    "RUNNING ES": -0.33438227,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_21321",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 24911,
                    "RANK METRIC SCORE": -0.15233474969863892,
                    "RUNNING ES": -0.33304733,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4152",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 25308,
                    "RANK METRIC SCORE": -0.16487102210521698,
                    "RUNNING ES": -0.34133917,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_14212",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 25347,
                    "RANK METRIC SCORE": -0.16573888063430786,
                    "RUNNING ES": -0.34046885,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_703",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 25617,
                    "RANK METRIC SCORE": -0.17314353585243225,
                    "RUNNING ES": -0.34542194,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_25471",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 25991,
                    "RANK METRIC SCORE": -0.1834717839956284,
                    "RUNNING ES": -0.35291907,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_17168",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 26106,
                    "RANK METRIC SCORE": -0.18821318447589874,
                    "RUNNING ES": -0.353742,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3282",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 26434,
                    "RANK METRIC SCORE": -0.19732858240604398,
                    "RUNNING ES": -0.35990912,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_13097",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 26957,
                    "RANK METRIC SCORE": -0.2147040963172913,
                    "RUNNING ES": -0.37086844,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_993",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 27122,
                    "RANK METRIC SCORE": -0.2211225926876068,
                    "RUNNING ES": -0.37260395,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_26006",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 27164,
                    "RANK METRIC SCORE": -0.22218482196331024,
                    "RUNNING ES": -0.37118307,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_32825",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 27557,
                    "RANK METRIC SCORE": -0.23757742345333102,
                    "RUNNING ES": -0.3785647,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_1445",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 27962,
                    "RANK METRIC SCORE": -0.2528489828109741,
                    "RUNNING ES": -0.3860834,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_29536",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 28007,
                    "RANK METRIC SCORE": -0.25421541929244995,
                    "RUNNING ES": -0.38438326,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_9036",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 28044,
                    "RANK METRIC SCORE": -0.2559638321399689,
                    "RUNNING ES": -0.3824592,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_4957",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 28315,
                    "RANK METRIC SCORE": -0.2656895816326141,
                    "RUNNING ES": -0.3864094,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_28293",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 28477,
                    "RANK METRIC SCORE": -0.27297672629356384,
                    "RUNNING ES": -0.38749197,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_13620",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 29067,
                    "RANK METRIC SCORE": -0.29323604702949524,
                    "RUNNING ES": -0.39929152,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_24914",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 29950,
                    "RANK METRIC SCORE": -0.33484041690826416,
                    "RUNNING ES": -0.41811943,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2476",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 29994,
                    "RANK METRIC SCORE": -0.3374186158180237,
                    "RUNNING ES": -0.41546914,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_13929",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 30482,
                    "RANK METRIC SCORE": -0.35955363512039185,
                    "RUNNING ES": -0.42392399999999997,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_5935",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 30610,
                    "RANK METRIC SCORE": -0.3655532896518707,
                    "RUNNING ES": -0.42310858,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3399",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 31063,
                    "RANK METRIC SCORE": -0.3860228955745697,
                    "RUNNING ES": -0.4303745,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_30642",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 31158,
                    "RANK METRIC SCORE": -0.3920697569847107,
                    "RUNNING ES": -0.42842075,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_2057",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 31216,
                    "RANK METRIC SCORE": -0.39525362849235535,
                    "RUNNING ES": -0.42548567,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_3564",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 31589,
                    "RANK METRIC SCORE": -0.41410091519355774,
                    "RUNNING ES": -0.43039432,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_18031",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 31619,
                    "RANK METRIC SCORE": -0.4159466326236725,
                    "RUNNING ES": -0.42651346,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_15411",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 32137,
                    "RANK METRIC SCORE": -0.4436278641223908,
                    "RUNNING ES": -0.43480100000000005,
                    "CORE ENRICHMENT": "No"
                }, {
                    "PROBE": "G9606_10909",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33056,
                    "RANK METRIC SCORE": -0.5015743374824524,
                    "RUNNING ES": -0.45269644,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_23684",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33159,
                    "RANK METRIC SCORE": -0.5079966783523561,
                    "RUNNING ES": -0.44965896,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_2183",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33207,
                    "RANK METRIC SCORE": -0.5104424953460693,
                    "RUNNING ES": -0.44518816,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_737",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33230,
                    "RANK METRIC SCORE": -0.5115219354629517,
                    "RUNNING ES": -0.44006625,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_830",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33446,
                    "RANK METRIC SCORE": -0.5263961553573608,
                    "RUNNING ES": -0.4397132,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_13138",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33451,
                    "RANK METRIC SCORE": -0.5268689393997192,
                    "RUNNING ES": -0.43396056,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_14377",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33519,
                    "RANK METRIC SCORE": -0.5309991836547852,
                    "RUNNING ES": -0.42977265,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_11857",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33567,
                    "RANK METRIC SCORE": -0.5340877175331116,
                    "RUNNING ES": -0.42503908,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_417",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33626,
                    "RANK METRIC SCORE": -0.5384119749069214,
                    "RUNNING ES": -0.4205387,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_2087",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33697,
                    "RANK METRIC SCORE": -0.5433509349822998,
                    "RUNNING ES": -0.41629022,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_12706",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33837,
                    "RANK METRIC SCORE": -0.552931010723114,
                    "RUNNING ES": -0.41369933,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_8181",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 33923,
                    "RANK METRIC SCORE": -0.5586516857147217,
                    "RUNNING ES": -0.4096643,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_5314",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34004,
                    "RANK METRIC SCORE": -0.5646336078643799,
                    "RUNNING ES": -0.40543497,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_11116",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34369,
                    "RANK METRIC SCORE": -0.5893740057945251,
                    "RUNNING ES": -0.40819135,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_19254",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34454,
                    "RANK METRIC SCORE": -0.5957676768302917,
                    "RUNNING ES": -0.40371832,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_9160",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34461,
                    "RANK METRIC SCORE": -0.5963699221611023,
                    "RUNNING ES": -0.39724445,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_8995",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34746,
                    "RANK METRIC SCORE": -0.6185895800590515,
                    "RUNNING ES": -0.39763093,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_11943",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34879,
                    "RANK METRIC SCORE": -0.6304755210876465,
                    "RUNNING ES": -0.39399934,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_10460",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34885,
                    "RANK METRIC SCORE": -0.6309148073196411,
                    "RUNNING ES": -0.38711601,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_57",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34935,
                    "RANK METRIC SCORE": -0.6349064111709595,
                    "RUNNING ES": -0.38131323,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_13729",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 34948,
                    "RANK METRIC SCORE": -0.6357741951942444,
                    "RUNNING ES": -0.3745549,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_29699",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35031,
                    "RANK METRIC SCORE": -0.6425278782844543,
                    "RUNNING ES": -0.36951107,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_3398",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35134,
                    "RANK METRIC SCORE": -0.651627779006958,
                    "RUNNING ES": -0.36487746,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_9106",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35159,
                    "RANK METRIC SCORE": -0.6530475020408629,
                    "RUNNING ES": -0.35823396,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_4376",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35168,
                    "RANK METRIC SCORE": -0.6537781357765198,
                    "RUNNING ES": -0.35117325,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_11798",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35288,
                    "RANK METRIC SCORE": -0.6666081547737122,
                    "RUNNING ES": -0.34680778,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_1925",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35455,
                    "RANK METRIC SCORE": -0.6848620772361755,
                    "RUNNING ES": -0.34344104,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_5127",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35520,
                    "RANK METRIC SCORE": -0.6933361887931824,
                    "RUNNING ES": -0.33737245,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_4132",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35546,
                    "RANK METRIC SCORE": -0.6957741975784302,
                    "RUNNING ES": -0.33027968,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_17050",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35610,
                    "RANK METRIC SCORE": -0.7014778256416321,
                    "RUNNING ES": -0.32409504,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_15714",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35651,
                    "RANK METRIC SCORE": -0.7058752179145813,
                    "RUNNING ES": -0.31727353,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_96",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35834,
                    "RANK METRIC SCORE": -0.7248271107673645,
                    "RUNNING ES": -0.31387170000000003,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_23003",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35892,
                    "RANK METRIC SCORE": -0.7313463091850281,
                    "RUNNING ES": -0.30720174,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_10350",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35927,
                    "RANK METRIC SCORE": -0.7360825538635254,
                    "RUNNING ES": -0.29989114,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_12372",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 35989,
                    "RANK METRIC SCORE": -0.7450597882270813,
                    "RUNNING ES": -0.29317108,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_1086",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36231,
                    "RANK METRIC SCORE": -0.7721489071846008,
                    "RUNNING ES": -0.29075176,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_8502",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36288,
                    "RANK METRIC SCORE": -0.7796390056610107,
                    "RUNNING ES": -0.2835196,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_10206",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36331,
                    "RANK METRIC SCORE": -0.7846854925155641,
                    "RUNNING ES": -0.27587340000000005,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_958",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36660,
                    "RANK METRIC SCORE": -0.8303043842315674,
                    "RUNNING ES": -0.27503204,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_13817",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36679,
                    "RANK METRIC SCORE": -0.8329849243164062,
                    "RUNNING ES": -0.26623556,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_2810",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36717,
                    "RANK METRIC SCORE": -0.8364312648773193,
                    "RUNNING ES": -0.25788649999999996,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_17847",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36729,
                    "RANK METRIC SCORE": -0.8379374146461487,
                    "RUNNING ES": -0.24885602,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_13798",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 36749,
                    "RANK METRIC SCORE": -0.8405892848968506,
                    "RUNNING ES": -0.24000059,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_8185",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37044,
                    "RANK METRIC SCORE": -0.8779576420783997,
                    "RUNNING ES": -0.23776045,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_1834",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37301,
                    "RANK METRIC SCORE": -0.9252938628196716,
                    "RUNNING ES": -0.23402278,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_5570",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37385,
                    "RANK METRIC SCORE": -0.9407461285591124,
                    "RUNNING ES": -0.22569054,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_27085",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37656,
                    "RANK METRIC SCORE": -0.995262324810028,
                    "RUNNING ES": -0.22153327,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_14638",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37741,
                    "RANK METRIC SCORE": -1.0164111852645874,
                    "RUNNING ES": -0.21238574,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_20575",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 37958,
                    "RANK METRIC SCORE": -1.0738272666931152,
                    "RUNNING ES": -0.20597486,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_12918",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38003,
                    "RANK METRIC SCORE": -1.0891090631484983,
                    "RUNNING ES": -0.19499685,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_14780",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38006,
                    "RANK METRIC SCORE": -1.0892916917800903,
                    "RUNNING ES": -0.18294306,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_3093",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38059,
                    "RANK METRIC SCORE": -1.101332426071167,
                    "RUNNING ES": -0.17203374,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_20711",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38089,
                    "RANK METRIC SCORE": -1.1108180284500122,
                    "RUNNING ES": -0.16043101,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_13132",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38108,
                    "RANK METRIC SCORE": -1.1148998737335205,
                    "RUNNING ES": -0.14850170000000001,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_34482",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38135,
                    "RANK METRIC SCORE": -1.1224679946899414,
                    "RUNNING ES": -0.13669279999999998,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_26813",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38219,
                    "RANK METRIC SCORE": -1.1465541124343872,
                    "RUNNING ES": -0.12607349999999998,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_28910",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38282,
                    "RANK METRIC SCORE": -1.1601794958114624,
                    "RUNNING ES": -0.11476589,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_3425",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38666,
                    "RANK METRIC SCORE": -1.3532449007034302,
                    "RUNNING ES": -0.10951939,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_14505",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38696,
                    "RANK METRIC SCORE": -1.3855422735214231,
                    "RUNNING ES": -0.09486374,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_24998",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38791,
                    "RANK METRIC SCORE": -1.4659978151321411,
                    "RUNNING ES": -0.080975786,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_9272",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38831,
                    "RANK METRIC SCORE": -1.499489188194275,
                    "RUNNING ES": -0.06530954,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_31997",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38956,
                    "RANK METRIC SCORE": -1.6109739542007446,
                    "RUNNING ES": -0.05057748,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_16951",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 38986,
                    "RANK METRIC SCORE": -1.6537941694259644,
                    "RUNNING ES": -0.032940842000000005,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_7091",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 39003,
                    "RANK METRIC SCORE": -1.6774672269821167,
                    "RUNNING ES": -0.014708778999999998,
                    "CORE ENRICHMENT": "Yes"
                }, {
                    "PROBE": "G9606_6294",
                    "GENE SYMBOL": NaN,
                    "RANK IN GENE LIST": 39129,
                    "RANK METRIC SCORE": -1.9355692863464355,
                    "RUNNING ES": 0.0036048286,
                    "CORE ENRICHMENT": "Yes"
                }], "xMax": 39129
            },
            "heatmap": [1.42, 1.2, 1.07, 0.98, 0.9, 0.84, 0.79, 0.74, 0.7, 0.66, 0.63, 0.6, 0.57, 0.54, 0.52, 0.49, 0.47, 0.45, 0.43, 0.41, 0.39, 0.37, 0.35, 0.33, 0.31, 0.3, 0.28, 0.27, 0.25, 0.24, 0.22, 0.21, 0.2, 0.19, 0.17, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.1, 0.09, 0.08, 0.07, 0.06, 0.04, 0.03, 0.01, 0.0, 0.0, 0.0, -0.02, -0.04, -0.06, -0.07, -0.08, -0.09, -0.1, -0.11, -0.12, -0.14, -0.15, -0.16, -0.17, -0.18, -0.19, -0.21, -0.22, -0.24, -0.25, -0.27, -0.28, -0.3, -0.31, -0.33, -0.35, -0.37, -0.39, -0.41, -0.43, -0.45, -0.48, -0.5, -0.53, -0.55, -0.58, -0.61, -0.64, -0.68, -0.73, -0.77, -0.83, -0.88, -0.95, -1.04, -1.15, -1.33, -1.73, -1.96],
            "histogram": {
                "data": [4.459401000000001, 2.6041338, 2.3457765999999998, 2.1372151, 2.0, 1.9158356, 1.8069943, 1.7409124, 1.6844198000000001, 1.6405177, 1.5827824, 1.5392703, 1.5, 1.4674329, 1.4378176999999999, 1.4100326, 1.390059, 1.3609858999999997, 1.3364512, 1.3161492, 1.2939085, 1.2733836, 1.2526534, 1.2303106000000001, 1.2151684999999999, 1.1995753999999998, 1.1831313, 1.1659051999999999, 1.1547005, 1.1468581, 1.1329578000000002, 1.1203889, 1.1065753999999999, 1.0933857, 1.0828749, 1.0713075, 1.0609562, 1.0549136000000001, 1.0398021000000002, 1.0330014, 1.0266393, 1.0174, 1.0092642, 1.0004731, 0.99165696, 0.9825894000000001, 0.97378623, 0.9643804, 0.95852894, 0.9501748999999999, 0.9413575999999999, 0.93264276, 0.9246639999999999, 0.91765714, 0.9106831, 0.90144116, 0.89682746, 0.8915518, 0.8840863999999999, 0.87873167, 0.8737864, 0.86694336, 0.86595696, 0.85918623, 0.85234904, 0.84605986, 0.84187275, 0.8343048000000001, 0.82939327, 0.8249921999999998, 0.81871605, 0.8126722, 0.80830747, 0.80414164, 0.79906315, 0.79321665, 0.78933007, 0.7835425, 0.77777785, 0.77387077, 0.76980036, 0.76455647, 0.7599431, 0.75612855, 0.75215787, 0.7487701999999999, 0.7427756, 0.73852545, 0.73271143, 0.72769344, 0.7219399000000001, 0.71870095, 0.71446216, 0.71125335, 0.70734394, 0.70327514, 0.6997201, 0.6952438, 0.692487, 0.6870177, 0.6832548, 0.6803897, 0.67784375, 0.6723071, 0.6679151999999999, 0.6644495, 0.6616759, 0.65832704, 0.65471673, 0.65225184, 0.6485051, 0.64575136, 0.6429331, 0.64000005, 0.6372869000000001, 0.63388336, 0.6312803000000001, 0.628116, 0.6243516, 0.6213744999999999, 0.61880213, 0.6148779000000001, 0.6111111, 0.60836023, 0.60576653, 0.6017677, 0.5981861999999999, 0.5944053, 0.5918908, 0.58958507, 0.5864812, 0.5833975, 0.58042777, 0.57735026, 0.57735026, 0.57647043, 0.5734869, 0.57036513, 0.5673188, 0.56460345, 0.5618055000000001, 0.5590029000000001, 0.5559313, 0.55281615, 0.54975843, 0.5469421, 0.54333353, 0.5412659000000001, 0.5391638000000001, 0.53675276, 0.5342625, 0.5312824, 0.5284858, 0.5263079, 0.5232558, 0.5201558, 0.5171003, 0.5145199, 0.5124981, 0.5094267, 0.50692225, 0.50500745, 0.50217503, 0.50044423, 0.49839038, 0.49490893, 0.49211368, 0.48963076, 0.48718527, 0.48482013, 0.48247853, 0.48004124, 0.47772384, 0.4750875, 0.47394425, 0.47089934, 0.46892559999999994, 0.46645649999999994, 0.4636767, 0.46188019999999996, 0.45982274, 0.45682096, 0.45454547, 0.45233887, 0.45047653, 0.44880703, 0.4462371, 0.44442603, 0.4424825, 0.4408207, 0.43848506, 0.43664384, 0.43452890000000005, 0.43298212, 0.4315291, 0.42884055, 0.42741337, 0.42486793, 0.42264974, 0.42264974, 0.42066082, 0.41846797, 0.41557, 0.4131362, 0.41169932, 0.4096192, 0.40792263, 0.405904, 0.40366504, 0.4019256, 0.3996389, 0.39687186, 0.39409120000000003, 0.39228034, 0.38980517, 0.38765370000000005, 0.38572675, 0.38490018, 0.38283455, 0.38055897, 0.37897247, 0.37691507, 0.37544477, 0.37333879999999997, 0.3723841, 0.3704167, 0.36823496, 0.36635548, 0.36413625, 0.3622285, 0.36013624, 0.35874438, 0.35684666, 0.35476979999999997, 0.3529111, 0.35086858, 0.34927496, 0.34805387, 0.34641016, 0.3444525, 0.34247854, 0.340909, 0.33885909999999997, 0.33635023, 0.33452547, 0.33320746, 0.33185843, 0.3299091, 0.32732683, 0.32606936, 0.3236217, 0.32178122, 0.31975448, 0.31782746, 0.316725, 0.31550083, 0.31341872, 0.31203735, 0.31034115, 0.30898848, 0.30717662, 0.3057625, 0.30378368, 0.30237174, 0.30123833, 0.2993074, 0.29806957, 0.29624355, 0.29422864, 0.2926415, 0.29037379999999996, 0.28867516, 0.28867513, 0.28867513, 0.28867513, 0.28800008, 0.2859793, 0.28466818, 0.28324902, 0.28138527, 0.27944398, 0.27747193, 0.27612406, 0.27426553, 0.27266273, 0.27117956, 0.26961282, 0.26796153, 0.2667175, 0.2650012, 0.26373017, 0.2628433, 0.26090208, 0.25925925, 0.25807065, 0.25612596, 0.25444257, 0.252891, 0.25124705, 0.24970774, 0.24851678, 0.24754049, 0.24743582, 0.24605684, 0.24409978, 0.24240763, 0.24100003, 0.23923808, 0.2380828, 0.23629205, 0.23465717, 0.23277117, 0.23094009999999998, 0.23037513, 0.22887687, 0.22727683, 0.22591966, 0.22424926, 0.22326358, 0.2220578, 0.22078669, 0.21877356, 0.21790320000000002, 0.21692742, 0.21543542, 0.2134967, 0.212387, 0.21132487, 0.21132487, 0.21042339999999998, 0.20901766, 0.2072104, 0.20583831, 0.20452558, 0.20426323, 0.20269112, 0.20081748, 0.19874483, 0.19741839, 0.19623284, 0.19417479999999998, 0.19270054, 0.19245009, 0.19245009, 0.19073707, 0.19006123, 0.18879926, 0.18666211, 0.18489207, 0.18362059, 0.18241349, 0.18208511, 0.18083388, 0.17858216, 0.1769229, 0.17541779999999998, 0.17445764, 0.17375018, 0.17270832, 0.17100316, 0.1696542, 0.16808997, 0.16617465, 0.16605687, 0.16460364, 0.16284274, 0.16138689, 0.15995856, 0.1585386, 0.15754394, 0.15754394, 0.15745917, 0.15599407, 0.15470053, 0.15363123, 0.15193428, 0.14945646, 0.14854315, 0.14854315, 0.14786227, 0.14594242, 0.14484356, 0.14433753, 0.14237806, 0.14087313, 0.13914794, 0.13914794, 0.13914794, 0.13887939, 0.13738053, 0.13541815, 0.13372776, 0.13240711, 0.13141713, 0.13043478, 0.1293318, 0.1293318, 0.1293318, 0.12752007, 0.12605551, 0.124274895, 0.12322814, 0.121285655, 0.11977129, 0.11906580000000001, 0.11906580000000001, 0.11906580000000001, 0.11906580000000001, 0.11825917, 0.11628611, 0.11547005, 0.11514683, 0.113102034, 0.110991366, 0.10921358, 0.10831829, 0.10831829, 0.10831829, 0.10831829, 0.10725150000000001, 0.105494104, 0.10362719999999999, 0.10226279, 0.10051167, 0.09915902, 0.09725945, 0.09705459, 0.09705459, 0.09705459, 0.09705459, 0.0969466, 0.09523809, 0.09325162, 0.09202997, 0.091331445, 0.090876736, 0.08880307, 0.0874038, 0.08627743, 0.08523659, 0.08523659, 0.08523659, 0.08523659, 0.08523659, 0.08349773, 0.08247861, 0.08176318, 0.08005655, 0.07854493, 0.077212684, 0.07603881, 0.07449628, 0.07282233, 0.07282233, 0.07282233, 0.07282233, 0.07282233, 0.07282233, 0.072671786, 0.07102472, 0.069165535, 0.06738932, 0.065700494, 0.06415004, 0.062595055, 0.060682945, 0.058886174000000006, 0.05746099, 0.055856228, 0.053948185999999995, 0.05248638, 0.051050507, 0.04987649, 0.04815069, 0.04603495, 0.04462698, 0.043668165999999994, 0.042179704000000005, 0.040341083, 0.03849001, 0.037398852, 0.03525533, 0.033784483, 0.032405086, 0.030479614, 0.029035209, 0.027522964, 0.025776193, 0.02387969, 0.02274804, 0.020851526000000002, 0.019202801999999998, 0.01775933, 0.016006442, 0.014249129, 0.012632144, 0.011283396999999999, 0.00888233, 0.007270958, 0.005574064300000001, 0.0032365115000000002, 4.391148e-08, 1.7030281e-08, 8.556802e-09, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0997337e-08, -1.792331e-08, -5.612964e-08, -0.003080712, -0.0062729153, -0.0076275123, -0.010952013, -0.013182671000000002, -0.015081575, -0.017142842, -0.01873876, -0.020986551000000003, -0.023409332999999997, -0.025395775, -0.027020832999999998, -0.02908803, -0.030386847999999998, -0.03333339, -0.03529444, -0.036978368, -0.038894534, -0.040960275, -0.04374999, -0.04504507, -0.047157067999999996, -0.04952802, -0.05139091, -0.052926175, -0.0546613, -0.056890357, -0.058801014000000006, -0.060713574000000006, -0.06271958, -0.06453597, -0.06639002, -0.06834412, -0.06990882, -0.071905114, -0.07282233, -0.07282233, -0.07282233, -0.07282233, -0.07282233, -0.07358274599999999, -0.07528568, -0.07639235, -0.07759097, -0.07921419, -0.08094859, -0.08247861, -0.083827354, -0.08523659, -0.08523659, -0.08523659, -0.08523659, -0.08599706, -0.08798827, -0.08982041, -0.090909086, -0.09202997, -0.09316649, -0.09467743, -0.096307546, -0.09705459, -0.09705459, -0.09705459, -0.09780563, -0.09942309, -0.100874305, -0.102629945, -0.10368688, -0.10566835, -0.10721757, -0.10831829, -0.10831829, -0.10831829, -0.10831829, -0.10962817, -0.111828394, -0.11383344, -0.11547005, -0.11566785, -0.117339425, -0.11847665, -0.11906580000000001, -0.11906580000000001, -0.11950619999999999, -0.12001092, -0.12187341, -0.12346741, -0.124673866, -0.1264625, -0.12820515, -0.1293318, -0.1293318, -0.12957604, -0.13120288, -0.13188131, -0.13275467, -0.13431837, -0.13642745, -0.13856407, -0.13914794, -0.13929695, -0.14120662, -0.14240699, -0.14433756, -0.14458449, -0.14564466, -0.14788252, -0.14854315, -0.14854315, -0.14991565, -0.15164421, -0.15337424, -0.15470053, -0.15579292, -0.15745917, -0.15754394, -0.15769947, -0.15906219, -0.1611691, -0.16271688, -0.1642688, -0.16496198, -0.16617465, -0.16617465, -0.16666666, -0.16916025, -0.17002477, -0.17110781, -0.17243539, -0.17385826, -0.17445764, -0.1752989, -0.1767964, -0.17857143, -0.18031862, -0.18139665, -0.18241349, -0.18241349, -0.18367347, -0.18516387, -0.18691038, -0.18853647, -0.19006123, -0.19061585, -0.19245009, -0.19245009, -0.19245009, -0.1937391, -0.19526838, -0.19709885, -0.19741839, -0.19850117, -0.2, -0.20180228, -0.20401335, -0.20452558, -0.20588037, -0.20779121, -0.20961243, -0.21132486, -0.21132487, -0.211966, -0.21380737, -0.21569888, -0.21668798, -0.21790320000000002, -0.21919405, -0.22148375, -0.22282968, -0.22424926, -0.22572248, -0.2278455, -0.22935778, -0.23052704, -0.23104344, -0.23320805, -0.23499581, -0.23642576, -0.23786236, -0.23923765, -0.24116428, -0.2420701, -0.24437933, -0.2459295, -0.24714638, -0.24754049, -0.24897175, -0.2505786, -0.2526707, -0.25403413, -0.25578809999999996, -0.2573754, -0.25826445, -0.25925925, -0.26183670000000003, -0.26308754, -0.2637947, -0.26567727, -0.2679492, -0.26931936, -0.27162975, -0.27276418, -0.27497187, -0.2762475, -0.27796566, -0.27953863, -0.2816717, -0.28312165, -0.28524426, -0.28663212, -0.28839982, -0.28867513, -0.28867513, -0.28867513, -0.28908320000000004, -0.29094177, -0.29271203, -0.2945165, -0.29697729999999994, -0.29862943, -0.30056435, -0.3020237, -0.30312407, -0.30510917, -0.30700170000000004, -0.30881020000000003, -0.30984107, -0.31170866, -0.31382427, -0.31547242, -0.316725, -0.31935808, -0.32127917, -0.32329175, -0.32573634, -0.32749918, -0.32968134, -0.3315155, -0.33349407, -0.33558568, -0.33788379999999996, -0.3392637, -0.34103742, -0.34313715, -0.34476107, -0.34641016, -0.34787914, -0.3496152, -0.35110667, -0.35317459999999995, -0.35529247, -0.3571901, -0.3591457, -0.36098105, -0.36306109999999997, -0.36464235, -0.36630014, -0.36779824, -0.36973107, -0.3717287, -0.3734134, -0.37534386, -0.37739182, -0.37936413, -0.38129967, -0.38292596, -0.38490018, -0.3860229, -0.3885221, -0.39091718, -0.39320642, -0.39548436, -0.39740562, -0.39930743, -0.40153602, -0.40358344, -0.40542406, -0.40761012, -0.4098361, -0.4118011, -0.41307452, -0.41553295, -0.41797159999999994, -0.42131355, -0.42264974, -0.42372885, -0.42566347, -0.42793426, -0.42962268, -0.43207186, -0.43373668, -0.43630433, -0.43882429999999994, -0.44058502, -0.44280943, -0.44499642, -0.4469575, -0.44938275, -0.45186624, -0.45410448, -0.45761840000000004, -0.46056655, -0.46338502, -0.46548048, -0.46794300000000005, -0.47129384, -0.4735795, -0.4750875, -0.47691047, -0.48035982, -0.48326778, -0.48594654, -0.48828542, -0.49105358, -0.49303475, -0.49555156, -0.4981508, -0.50038207, -0.50215495, -0.5044547, -0.5072715999999999, -0.5094433, -0.5113139, -0.51339537, -0.51643133, -0.51858157, -0.52188694, -0.5243857, -0.5270695, -0.52948195, -0.5318439, -0.53476477, -0.53780705, -0.53994197, -0.54316056, -0.5451199000000001, -0.5485302, -0.5511176999999999, -0.5537459, -0.5563769000000001, -0.5591254, -0.5616129, -0.56494534, -0.5685954000000001, -0.57173884, -0.5744653000000001, -0.57735026, -0.57735026, -0.5792624, -0.58234656, -0.58568096, -0.5887882, -0.5919896, -0.5946916, -0.5982463000000001, -0.60145724, -0.60477006, -0.6069654999999999, -0.6103263000000001, -0.6133829000000001, -0.6163341, -0.61880213, -0.6222146, -0.6257626000000001, -0.6298680999999999, -0.6332701999999999, -0.63586944, -0.63960695, -0.6423667, -0.6463441999999999, -0.6488983, -0.65225184, -0.65609646, -0.66022325, -0.6639311999999999, -0.6689181, -0.67379713, -0.6777167, -0.6815376999999999, -0.6852754, -0.6908850000000001, -0.69532317, -0.6985321999999999, -0.70251906, -0.70716995, -0.7120158000000001, -0.7150032, -0.7185375, -0.72281694, -0.72767717, -0.7314729999999999, -0.7362661, -0.74214417, -0.74703103, -0.7519358, -0.75581396, -0.75998616, -0.7650155, -0.76980036, -0.77395433, -0.77915376, -0.7838996, -0.7887092, -0.7939198000000001, -0.799968, -0.80496335, -0.81035227, -0.81641585, -0.82158595, -0.82691044, -0.8329849, -0.83662903, -0.84231377, -0.8476104999999999, -0.8540798000000001, -0.8577276, -0.8633075000000001, -0.8660254000000001, -0.87219614, -0.877193, -0.88234246, -0.8904993, -0.8961839, -0.90304834, -0.9112756999999999, -0.91937196, -0.92592597, -0.93378204, -0.9407460999999999, -0.94818604, -0.9578386000000001, -0.9646366, -0.97101533, -0.98038816, -0.9881004000000001, -0.9972863000000001, -1.0067184, -1.015384, -1.0259463, -1.0339274, -1.0461613, -1.0566243, -1.0672656999999999, -1.080938, -1.0911481, -1.100252, -1.1117052, -1.1203889, -1.1308101000000002, -1.1423246999999999, -1.1547005, -1.1615252, -1.1827657, -1.1990055, -1.2203405, -1.2369573, -1.2525263999999998, -1.2727411, -1.2965219, -1.3155668, -1.3392966999999998, -1.3668591, -1.4027749, -1.4340005, -1.4706563, -1.5030675, -1.5399466, -1.5726892, -1.610974, -1.6642526000000002, -1.7192862000000002, -1.782517, -1.8747716, -2.0377126, -2.2434824, -2.550157],
                "positive_num": 19765
            },
            "controlGroup": "controlGroup",
            "treatGroup": "treatGroup",
            "title": "GO_RUFFLE"
        };
        let line_data = data["line"]["data"],
            line_x_key = "RANK IN GENE LIST",
            line_y_key = "RUNNING ES";

        let title;
        if (that.graphTitle === null) {
            title = `Enrichment plot: ${data.title}`;
        } else {
            title = that.graphTitle;
        }
        let chartConfig = {
                axis: {
                    x: {
                        title: "Rank in Ordered Dataset",
                    },
                    y: {
                        title: "Enrichment score (ES)",
                    },
                    y1: {
                        title: 'Ranked list metric (log2_Ratio_of_Classes)',
                    }
                },
                legend: [
                    {
                        title: "Enrichment Profile",
                        click: (d, index) => {
                            that.color = d3.select(d).attr('fill');
                            that.show = true;
                            that.legendIndex = index;
                            that.isGradient = false;
                        }
                    },
                    {
                        title: "Hits",
                        click: (d, index) => {
                            that.color = d3.select(d).attr('fill');
                            that.show = true;
                            that.legendIndex = index;
                            that.isGradient = false;
                        }
                    },
                    {
                        title: "Ranking metric scores",
                        click: (d, index) => {
                            that.color = d3.select(d).attr('fill');
                            that.show = true;
                            that.legendIndex = index;
                            that.isGradient = false;
                        }
                    }
                ]
            };
        chartConfig.legend.forEach((v, i) => {
            v['color'] = that.colors[i];
            return v;
        });


        let legendWidth = 200, // 图例宽度
            width = 1050,
            height = 550,
            chartPadding = {top: 40, left: 60, right: 10, bottom: 80},

            topHeight = height * 0.3,
            secondHeight = height * 0.14,
            colorHeight = secondHeight * .75;


        let xMax = data["line"]["xMax"] || d3.max(line_data, m => m[line_x_key]),
            scoreMin = d3.min(line_data, d => d[line_y_key]),
            scoreMax = d3.max(line_data, d => d[line_y_key]);

        // x轴  y轴
        let xScale = d3.scaleLinear()
                .domain([0, xMax])
                .range([0, width - chartPadding.left - chartPadding.right]).nice(),
            yScale = d3.scaleLinear()
                .domain([scoreMax, scoreMin])
                .range([0, topHeight]).nice();
        line_data.forEach(m => {
            m.x = xScale(m[line_x_key]);
            m.y = yScale(m[line_y_key]);
        });

        // 刻度最大值
        let xScaleTickMax = xScale(xScale.invert(width - chartPadding.left - chartPadding.right)),
            yScaleTickMin = yScale(yScale.invert(topHeight)),
            secondPaddingTop = chartPadding.top + yScaleTickMin;
        let horizonLinePath = d3.line(),
            // 竖线图 node
            node = null;

        // 画布
        let svg = d3.select("#svg")
            .attr("width", width + legendWidth)
            .attr("height", height);


        // 填充白色背景
        svg.append("rect")
            .attr("fill", "white")
            .attr("x", chartPadding.left)
            .attr("y", chartPadding.top)
            .attr("width", width - chartPadding.left - chartPadding.right)
            .attr("height", height - chartPadding.top - chartPadding.bottom);


        // 标题
        drawTitle();
        // 图区域1 -> 折线图
        drawLineChart();
        // 坐标轴
        drawAxis();
        // 图区域2 -> 画竖线
        drawSecondLineChart();
        // 热图
        drawHeatMap();
        // 柱状图
        drawHistogram();
        // draw axis title
        drawXAxisTitle();
        drawYAxisTitle();
        drawY1AxisTitle();
        // 渐变图例
        drawGradientLegend(data["heatmap"], width + 10, 10);
        // legend
        drawLegend(width + 10, 100);


        function drawSecondLineChart() {
            let class_name = 'vertical-line';
            let before = svg.select(`.${class_name}`);
            if (before.nodes().length) before.remove();

            let svg2 = svg.append("g")
                .attr("id", "secondArea").attr("transform", "translate(" + chartPadding.left + "," + secondPaddingTop + ")");

            let brush = svg2.append("g").attr("class", "brush")
                .call(d3.brush()
                    .extent([[-5, 4], [xScaleTickMax, secondHeight - 4]])
                    .on("start", brushStart)
                    .on("brush", brushed)
                    .on("end", brushEnd)
                );

            node = svg.selectAll(`.${class_name}`)
                .data(line_data)
                .enter()
                .append("path")
                .attr("d", d => horizonLinePath([
                    [d.x, secondHeight],
                    [d.x, 4]
                ]))
                .attr("transform", "translate(" + chartPadding.left + "," + secondPaddingTop + ")")
                .attr("class", class_name)
                .style("stroke", chartConfig.legend[1]['color'])
                .on('click', d => {
                    that.selectGeneList = [d["PROBE"]];
                    console.log("hit click second vertical line", that.selectGeneList);
                    that.doTableStatementFilter();
                })
                .on('mouseover', d => that.globalService.showPopOver(d3.event, buildLineChartHover(d)))
                .on('mouseout', () => that.globalService.hidePopOver());
            node.transition()
                .duration(1200);
        }

        function drawHistogram() {
            let class_name = 'histogram';
            let before = svg.select(`.${class_name}`);
            if (before.nodes().length) before.remove();

            const histogram_data = data["histogram"]["data"],
                postive_num = data["histogram"]["positive_num"],
                offset = xScaleTickMax / histogram_data.length;

            let histogramScale = d3.scaleLinear()
                .domain([d3.max(histogram_data), d3.min(histogram_data)])
                .range([height - topHeight - secondHeight - chartPadding.top + 40, height - chartPadding.bottom - 40]).nice();

            let histogramAxis = d3.axisLeft()
                .scale(histogramScale);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + chartPadding.left + "," + 0 + ")")
                .call(histogramAxis);

            const h_y = histogramScale(0);

            svg.selectAll(`.${class_name}`).data(histogram_data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => chartPadding.left + offset * (i + 1))
                .attr("y", d => {
                    let _ = histogramScale(d);
                    return _ > h_y ? h_y : _;
                })
                .attr("width", offset)
                .attr("height", d => {
                    let _ = histogramScale(d);
                    return _ > h_y ? _ - h_y : h_y - _;
                })
                .attr("fill", chartConfig.legend.length > 1 ? chartConfig.legend[2]['color'] : "#C0C0C0")
                .attr("class", class_name)
                .on('mouseover', d => that.globalService.showPopOver(d3.event, buildHistogramHover(d)))
                .on('mouseout', d => that.globalService.hidePopOver());


            function computeFirstLowerZeroOffset() {
                for (let i = 0; i < histogram_data.length; i++) {
                    if (histogram_data[i] <= 0) return offset * i;
                }
            }

            let firstLowerZeroOffset = computeFirstLowerZeroOffset();

            svg.data([[
                [0, topHeight + secondHeight + chartPadding.top],
                [0, height - chartPadding.bottom]
            ]]).append('path').attr('d', d => horizonLinePath(d))
                .style("stroke", "black").style("stroke-dasharray", "5, 5").style("font-size", "4px")
                .attr("transform", "translate(" + (chartPadding.left + firstLowerZeroOffset) + "," + 0 + ")");

            svg.append('text').attr('font-size', 12).attr('text-anchor', 'middle')
                .attr("transform", "translate(" + (chartPadding.left + firstLowerZeroOffset) + "," + 0 + ")")
                .attr('x', -5).attr('y', histogramScale(0) + 5).attr('dx', 0).attr('dy', '1em').text(`Zero cross at ${postive_num}`)
                .style('user-select', 'none');

            function drawLines() {
                let class_name = 'horizon-line';
                let before = svg.select(`.${class_name}`);
                if (before.nodes().length) before.remove();


                let lines = [
                    [
                        // 图1 -> 折线图 纵坐标为0 轴线
                        [0, yScale(0)],
                        [xScaleTickMax, yScale(0)]
                    ],
                    [
                        // 图1 -> 折线图 图区域的底部 分割线
                        [0, yScaleTickMin],
                        [xScaleTickMax, yScaleTickMin]
                    ],
                    [
                        // 图3 -> 热图 start 轴线
                        [0, yScaleTickMin + colorHeight],
                        [xScaleTickMax, yScaleTickMin + colorHeight]
                    ],
                    [
                        // 图3 -> 热图 end 轴线
                        [0, yScaleTickMin + secondHeight],
                        [xScaleTickMax, yScaleTickMin + secondHeight]
                    ],
                    [
                        // 图4 -> 柱状图 纵坐标为0 轴线
                        [0, h_y - chartPadding.top],
                        [xScaleTickMax, h_y - chartPadding.top]
                    ],
                    [
                        // y轴 底侧线 补充 y轴线
                        [0.5, yScaleTickMin],
                        [0.5, height - chartPadding.bottom - chartPadding.top]
                    ],
                ];

                svg.selectAll(`.${class_name}`)
                    .data(lines)
                    .enter()
                    .append("path")
                    .attr("d", d => horizonLinePath(d))
                    .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                    .attr("class", (d, i) => {
                        switch (i) {
                            case lines.length - 1:
                                return "axis-line";
                            default:
                                return "horizonLine";
                        }
                    });
            }

            drawLines();
        }

        function drawHeatMap() {
            let class_name = 'heatmap';
            let before = svg.select(`.${class_name}`);
            if (before.nodes().length) before.remove();

            const heatmap_data = data["heatmap"];

            let colorScale = d3.scaleLinear()
                .domain([d3.min(heatmap_data), d3.max(heatmap_data)])
                .range(that.gcolors)
                .interpolate(d3.interpolateRgb)
                .clamp(true);

            const offset = xScaleTickMax / heatmap_data.length;
            svg.selectAll(`.${class_name}`)
                .data(heatmap_data)
                .enter()
                .append("rect")
                .attr("x", (d, i) => offset * i)
                .attr("y", 0)
                .attr("width", offset)
                .attr("height", secondHeight * .25)
                .attr("transform", "translate(" + chartPadding.left + "," + (secondPaddingTop + colorHeight) + ")")
                .attr("fill", d => colorScale(d))
                .attr("class", "mt-rect");
        }

        function drawLineChart() {
            // hover Yes 部分

            let firstYesElementIndex;
            for (let i = 0; i < line_data.length; i++) {
                if (line_data[i]["CORE ENRICHMENT"] === "Yes") {
                    firstYesElementIndex = i;
                    break
                }
            }

            const hoverX = xScale(line_data[firstYesElementIndex][line_x_key]);
            let yesAreaXStart = chartPadding.left + hoverX,
                yesAreaWidth = xScaleTickMax - hoverX,
                yesAreaYStart = chartPadding.top;
            svg.append("rect")
                .attr("fill", "white")
                .attr("x", yesAreaXStart)
                .attr("y", yesAreaYStart)
                .attr("width", yesAreaWidth)
                .attr("height", topHeight)
                .attr("id", "yes-area");


            let class_name = 'line-chart';
            let beforeTitle = svg.select(`.${class_name}`);
            if (beforeTitle.nodes().length) beforeTitle.remove();

            let topLinePath = d3.line()
                .x(d => d.x)
                .y(d => d.y);
            svg.selectAll(`.${class_name}`)
                .data(line_data)
                .enter()
                .append("path")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .attr("d", topLinePath(line_data))
                .attr("class", class_name)
                .style("stroke", chartConfig.legend[0]['color']);

            svg.append('g').attr('class', 'point')
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .selectAll('circle')
                .data(line_data)
                .enter()
                .append('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('data-x', d => d[line_x_key])
                .attr('data-y', d => d[line_y_key])
                .attr('r', 0)
                .style("fill", chartConfig.legend[0]['color'])
                .on('mouseover', d => {
                    d3.select(this).transition().attr('r', 4);
                    that.globalService.showPopOver(d3.event, buildLineChartHover(d));
                })
                .on('mouseout', d => {
                    d3.select(this).transition().attr('r', 2);
                    that.globalService.hidePopOver();
                })
                .on('click', d => {
                    that.selectGeneList = [d["PROBE"]];
                    console.log("hit click point", that.selectGeneList);
                    that.doTableStatementFilter();
                })
                .transition()
                .duration(1200)
                .attr('r', 2);

            // absMaxY 找出 y 值 绝对值最大的点
            let c_name = 'abs-max-score';
            let before_abs = svg.select(`.${c_name}`);
            if (before_abs.nodes().length) before_abs.remove();

            let abs_ret = findMaxElementInAbs(line_data.map(m => m[line_y_key]));
            let abs_y = yScale(abs_ret[0]),
                show_text = line_data[abs_ret[1]][line_x_key],
                abs_x = xScale(show_text);

            // 绝对值 grid 线
            svg.selectAll(`.${c_name}`)
                .data([
                    [[0, abs_y], [abs_x, abs_y]],
                    [[abs_x, abs_y], [abs_x, topHeight]]
                ])
                .enter().append('path').attr('d', d => horizonLinePath(d))
                .style("stroke", "#ccc").style("stroke-dasharray", "5, 5").style("font-size", "4px")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")");
            svg.append('text').attr('font-size', 12).attr('text-anchor', 'middle')
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .attr('x', abs_x).attr('y', abs_y + 2).attr('dx', 0).attr('dy', '1em').text(show_text)
                .style('user-select', 'none');
            // .attr('fill', chartConfig.legend[0].color);

            // 实时监听鼠标移动，然后更改 yes-area
            let flag = false, // 是否在 yes 矩形区域内
                status = false; // 当前status
            // console.log('debug', document.getElementById('yes-area').getBoundingClientRect(), yesAreaRect['y'], yesAreaYEnd);
            d3.select(window).on("mousemove", function () {
                let yesAreaRect = document.getElementById('yes-area').getBoundingClientRect(),
                    yesAreaXEnd = yesAreaRect['x'] + yesAreaRect['width'],
                    yesAreaYEnd = yesAreaRect['y'] + yesAreaRect['height'];
                flag = (d3.event.pageX >= yesAreaRect['x'] && d3.event.pageX <= yesAreaXEnd) &&
                    (d3.event.pageY >= yesAreaRect['y'] && d3.event.pageY <= yesAreaYEnd);
                // console.log('info pageX||', d3.event.pageX, '||', d3.event.pageY, `||flag ${d3.event.pageX} >= ${yesAreaRect['x']} && ${d3.event.pageX} <= ${yesAreaXEnd}:`,
                //     (d3.event.pageX >= yesAreaRect['x'] && d3.event.pageX <= yesAreaXEnd),
                //     `||flag ${d3.event.pageY} >= ${yesAreaRect['y']} && ${d3.event.pageY} <= ${yesAreaYEnd}:`,
                //     (d3.event.pageY >= yesAreaRect['y'] && d3.event.pageY <= yesAreaYEnd));

                if (!status && flag) {
                    d3.select('#yes-area').attr('fill', '#FFCCCC');
                    status = true;
                }
                if (status && !flag) {
                    d3.select('#yes-area').attr('fill', 'white');
                    status = false;
                }
            })
        }

        function drawTitle() {
            let axis = "chart";
            let beforeTitle = svg.select(`.${axis}-title`);
            if (beforeTitle.nodes().length) beforeTitle.remove();

            // apply position
            let xTitle = svg.append("g").attr("class", `${axis}-title axis-title`);
            xTitle.attr("transform", "translate(" + (chartPadding.left + width / 2 - 20) + "," + (10) + ")");
            let xTitleText = xTitle
                .append("text")
                .text(title).attr("class", "top-text");

            xTitleText.attr("dy", 4)
                .style("font-size", 16)
                .style("font-family", 'Arial')
                .attr("dominant-baseline", axis === 'x' ? "initial" : "central")
                .attr("text-anchor", "middle")
                .style("cursor", "pointer")
                .on("dblclick", function () {
                    let name = prompt("请输入需要修改的标题", title);
                    if (name) {
                        updateTitle("title", name);
                    }
                });
        }

        function drawAxis() {
            let xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(Math.ceil(xMax / 2500)),
                yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(Math.ceil(scoreMax - scoreMin / 0.05));

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + chartPadding.left + "," +
                    (height - chartPadding.bottom) + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + chartPadding.left + "," + chartPadding.top + ")")
                .call(yAxis);
        }

        function drawXAxisTitle() {
            let axis = "x";
            let beforeTitle = svg.select(`.${axis}-title`);
            if (beforeTitle.nodes().length) beforeTitle.remove();

            // apply position
            let xTitle = svg.append("g").attr("class", `${axis}-title axis-title`);
            xTitle.attr("transform", "translate(" + (chartPadding.left + width / 2 - 20) + "," + (height - chartPadding.bottom + 40) + ")");
            let xTitleText = xTitle.append("text").text(chartConfig.axis.x.title);

            xTitleText.attr("dy", 4)
                .style("font-size", 16)
                .style("font-family", 'Arial')
                .attr("dominant-baseline", axis === 'x' ? "initial" : "central")
                .attr("text-anchor", "middle")
                .on("mouseover", function () {
                    chartConfig.axis[axis].mouseover && chartConfig.axis[axis].mouseover.call(this, d3.event, xTitle);
                })
                .on("mouseout", function () {
                    chartConfig.axis[axis].mouseout && chartConfig.axis[axis].mouseout.call(this, d3.event, xTitle);
                })
                .on("click", function () {
                    chartConfig.axis[axis].click &&
                    chartConfig.axis[axis].click.call(this, d3.event);
                })
                .on("dblclick", function () {
                    chartConfig.axis[axis].dblclick && chartConfig.axis[axis].dblclick.call(this, d3.event);
                });
        }

        function drawYAxisTitle() {
            let axis = "y";
            let beforeTitle = svg.select(`.${axis}-title`);
            if (beforeTitle.nodes().length) beforeTitle.remove();

            // apply position
            let xTitle = svg.append("g").attr("class", `${axis}-title axis-title`);
            xTitle.attr("transform", "translate(" + (chartPadding.left / 6) + "," + (chartPadding.top * 3 + 5) + ")");
            let xTitleText = xTitle.append("text").text(chartConfig.axis.y.title);

            xTitleText.attr("dy", 4)
                .style("font-size", 12)
                .style("font-family", 'Arial')
                .attr("transform", "rotate(-90)")
                .attr("dominant-baseline", 'hanging')
                .attr("text-anchor", "middle")
                .on("mouseover", function () {
                    chartConfig.axis[axis].mouseover && chartConfig.axis[axis].mouseover.call(this, d3.event, xTitle);
                })
                .on("mouseout", function () {
                    chartConfig.axis[axis].mouseout && chartConfig.axis[axis].mouseout.call(this, d3.event, xTitle);
                })
                .on("click", function () {
                    chartConfig.axis[axis].click && chartConfig.axis[axis].click.call(this, d3.event);
                })
                .on("dblclick", function () {
                    chartConfig.axis[axis].dblclick && chartConfig.axis[axis].dblclick.call(this, d3.event);
                });
        }

        function drawY1AxisTitle() {
            let axis = "y1";
            let beforeTitle = svg.select(`.${axis}-title`);
            if (beforeTitle.nodes().length) beforeTitle.remove();

            // apply position
            let xTitle = svg.append("g").attr("class", `${axis}-title axis-title`).attr("transform", "rotate(-90)");
            // xTitle.attr("transform", "translate(" + (chartPadding.left - 22) + "," + (440) + ")");
            let xTitleText = xTitle.append("text").text(chartConfig.axis.y1.title);

            xTitleText.attr("dy", 4)
                .style("font-size", 12)
                .style("font-family", 'Arial')

                .attr("transform", "translate(" + (-(height - chartPadding.bottom - chartPadding.top - 5)) + "," + 10 + ")")
                .attr("dominant-baseline", 'hanging')
                .attr("text-anchor", "middle")
                .on("mouseover", function () {
                    chartConfig.axis[axis].mouseover && chartConfig.axis[axis].mouseover.call(this, d3.event, xTitle);
                })
                .on("mouseout", function () {
                    chartConfig.axis[axis].mouseout && chartConfig.axis[axis].mouseout.call(this, d3.event, xTitle);
                })
                .on("click", function () {
                    chartConfig.axis[axis].click && chartConfig.axis[axis].click.call(this, d3.event);
                })
                .on("dblclick", function () {
                    chartConfig.axis[axis].dblclick && chartConfig.axis[axis].dblclick.call(this, d3.event);
                });
        }

        function updateTitle(type, value) {
            switch (type) {
                case "title":
                    title = value;
                    drawTitle();
                    that.graphTitle = value;
                    break;
            }
        }

        function findMaxElementInAbs(arr) {
            let abs = null, raw = null, index = null;
            for (let a = 0; a < arr.length; a++) {
                let number = Math.abs(arr[a]);
                if (abs === null || number > abs || (number === abs && arr[a] > raw)) {
                    [abs, raw, index] = [number, arr[a], a];
                }
            }
            return [raw, index];
        }

        function buildLineChartHover(ele) {
            return `
                Gene ID:${ele["PROBE"]}<br>
                Gene Symbol:${ele["GENE SYMBOL"]}<br>
                RANK IN GENE LIST:${ele[line_x_key]}<br>
                RANK METRIC SCORE:${ele["RANK METRIC SCORE"]}<br>
                RUNNING ES:${ele[line_y_key]}<br>
                CORE ENRICHMENT:y:${ele["CORE ENRICHMENT"]}`;
        }

        function buildHistogramHover(ele) {
            if (ele > 0) {
                return `'${data["controlGroup"]}'(positively correlated)；${ele}`
            } else if (ele < 0) {
                return `'${data["controlGroup"]}'(negatively correlated)；${ele}`
            }
            return `no correlated；${ele}`
        }

        function drawLegend(x, y) {
            let legend_g = null;
            let timer = null;
            let that = this;


            let class_name = 'legend';
            let before = svg.select(`.${class_name}`);
            if (before.nodes().length) before.remove();

            legend_g = svg.append('g').attr('class', class_name)
                .attr('transform', "translate(" + x + "," + y + ")");

            chartConfig.legend.forEach((val, index) => {
                y += 20;

                let curLegend = legend_g.append('g').attr('class', 'legend-' + (index + 1))
                    .attr('transform', "translate(0," + (y + chartPadding.top * 2) + ")");

                let rect = curLegend.selectAll('.legend-rect')
                    .data([val])
                    .enter()
                    .append('rect')
                    .attr('y', 0)
                    .attr('x', 0)
                    .attr('width', 14)
                    .attr('height', 14)
                    .attr('fill', d => d.color)
                    .on("click", function (d, i) {
                        clearEventBubble(d3.event);
                        timer && clearTimeout(timer);
                        let _self = this;
                        timer = setTimeout(function () {
                            chartConfig.legend[index].click && chartConfig.legend[index].click.call(chartConfig, d3.select(_self).node(), index);
                        }, 300);
                    });

                if ('click' in chartConfig.legend[index]) {
                    rect.style('cursor', 'pointer').style('user-select', 'none');
                }

                curLegend.selectAll('text')
                    .data([val])
                    .enter()
                    .append('text')
                    .attr('y', 0)
                    .attr('x', (d, i) => {
                        return i * (4 + 14)
                    })
                    .style('font-size', 14)
                    .style('font-family', 'Arial')
                    .attr('text-anchor', 'start')
                    .attr('dominant-baseline', 'middle')
                    .attr('dx', 14 + 4)
                    .attr('dy', 14 / 2)
                    .text(d => ('' + d.title).length > 40 ? (('' + d.title).substring(0, 40 - 1) + '...') : d.title);
            });
        }

        //阻止冒泡
        function clearEventBubble(evt) {
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.cancelBubble = true;
            }

            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        }

        function drawGradientLegend(legendData, x, y) {

            //画图例
            let legend_g = svg.append("g")
                .attr("class", "gsea_gradient_legend")
                .attr('transform', "translate(" + x + "," + (y + chartPadding.top * 2) + ")");

            let legend_w = 20,
                legend_h = 180;

            //画图例
            d3.selectAll(".gsea_gradient_legend defs").remove();
            d3.selectAll(".gsea_gradient_legend rect.legend_rect").remove();
            //线性填充
            let linearGradient = legend_g.append("defs")
                .append("linearGradient")
                .attr("id", "sampleCorrelate_Color")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%");

            for (let i = 0; i < that.gcolors.length; i++) {
                linearGradient.append("stop")
                    .attr("offset", i * 50 + "%")
                    .style("stop-color", that.gcolors[i]);
            }

            //画图例矩形
            legend_g.append("rect").attr("width", legend_w).attr("height", legend_h).attr("class", "legend_rect")
                .attr("fill", "url(#" + linearGradient.attr("id") + ")");


            //点击图例改图颜色
            let legendClickRect_h = legend_h / that.gcolors.length,
                legendClick_g = svg.append("g").attr("transform", "translate(" + x + "," + (y + chartPadding.top * 2) + ")")
                .style("cursor", "pointer")
                .on("mouseover", function() {
                    d3.select(this).append("title").text("单击修改颜色");
                })
                .on("mouseout", function() {
                    d3.select(this).select("title").remove();
                });
            legendClick_g.selectAll(".legendClick_Rect")
                .data(that.gcolors)
                .enter()
                .append("rect")
                .attr("width", legend_w)
                .attr("height", legendClickRect_h)
                .attr("y", function(d, i) {
                    return i * legendClickRect_h;
                })
                .attr("fill", "transparent")
                .on("click", function(d, i) {
                    clearEventBubble(d3.event);
                    that.legendIndex = i;
                    that.isGradient = true;
                    that.color = d;
                    that.show = true;
                });

            let valuemin = d3.min(legendData),
                valuemax = d3.max(legendData),
                legendScale = d3.scaleLinear().range([0, legend_h]).domain([valuemin, valuemax]).nice().clamp(true);
            let legendAxis = d3.axisRight(legendScale).tickSizeOuter(0).ticks(5);
            //画图例轴
            legend_g.append("g")
                .attr("transform", "translate(" + legend_w + ",0)")
                .call(legendAxis);

            d3.selectAll(".gsea_gradient_legend .tick text")
                .attr("font-size", "12px");
        }

        // node 拖选
        function brushStart() {
            if (d3.event.sourceEvent.type != "end") {
                node.classed("selected", d => d.selected);
            }
        }

        function brushed() {
            if (d3.event.sourceEvent.type != "end") {
                let selection = d3.event.selection;
                node.classed("selected", d => {
                    return selection != null && selection[0][0] <= d.x && d.x <= selection[1][0];
                })
            }
        }

        function brushEnd() {
            let selection = d3.event.selection;
            if (selection != null) {
                d3.select(this).call(d3.event.target.move, null);
                that.selectArray = d3.selectAll(".vertical-line.selected").nodes();
                that.boxSelectConfirm();
                console.log("hit brush", that.selectGeneList);
                that.doTableStatementFilter();
            }
        }

    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        if (this.isGradient) {
            // 渐变图例
            this.gcolors.splice(this.legendIndex, 1, curColor);
        } else {
            // 普通图例
            this.colors.splice(this.legendIndex, 1, curColor);
        }

        this.drawChart(null);
    }

    //框选确定时候,提交的数据
    boxSelectConfirm() {
        this.selectGeneList = [];
        this.selectArray.forEach((d) => {
            this.selectGeneList.push(d["__data__"]['PROBE'])
        });
    }

    doTableStatementFilter() {
        // 筛选表格
        if (this.selectGeneList.length) {
            this.bigTable._filter('gene_id', config['gene_id'], "string", "$in", this.selectGeneList.join(','), null)
            console.log(111, 'hit filter table')

        } else {
            this.bigTable._deleteFilter("gene_id", config["gene_id"], "$in");
            console.log(222, 'hit delete in filter table')
        }
    }
}
