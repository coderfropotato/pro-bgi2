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
import { IfStmt } from '@angular/compiler';

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

    generalUrl: string;
    generalEntity: object;

    chart: any;

    //column
    show: boolean = false;
    legendIndex: number = 0; //热图图例 当前点击图例的索引
    color: string; //当前选中的color
    colors: string[]; // 普通图例 colors
    gcolors: string[]; // 热图图例 colors
    isGradient: boolean;

    visible: boolean = false;

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
    controlGroup: string = null;
    treatGroup: string = null;
    date: string = null;
    dbtype: string = null;
    dbtypeNumber: number = 0;
    dbtypeUrl: string = null;

    selectGeneCount: number = 0;
    computedScrollHeight: boolean = false;
    leftComputedScrollHeight: boolean = false;

    // 所有的组对应的 tableNames
    selectData: string[] = [];
    groupData: object;

    resetCheckGraph: boolean;

    isMultipleSelect: boolean = false;

    selectArray: object[] = [];
    // 图上选择的数据
    selectGeneList: string[] = [];

    group: string = ""; // 图上表 的选项 比较组 or 参考组
    termId: string = null; // 初始 null，点击 图上表 的 GS DETAIL 会记录该值.
    graphTitle: string = null; // 记录 图的标题更改前的 old val

    switchValue: string = "A";
    gseaFileUrl: string;

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
            this.treatGroup = params['params']['treatGroup'];   //处理组表
            this.controlGroup = params['params']['controlGroup']; //对照组表
            this.date = params['params']['date'];
            this.dbtype = params['params']['dbtype'];
            this.gseaFileUrl = `/re_analyze_result/${config['pathwayURL']}/${this.date}/${
                sessionStorage.getItem('LCID')}_${this.tid}/gsea_xls/GSEA_parameters.xls`;
        });

        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/gsea/groupData`,
                data: {
                    LCID: sessionStorage.getItem('LCID'),
                    tid: this.tid,
                    species: this.storeService.getStore('genome')
                }
            })
            .subscribe(
                (res) => {
                    if (res['data'] && !$.isEmptyObject(res['data'])) {

                        this.groupData = res['data'];

                        for (const key in res['data']) {
                            if(key == this.group){
                                this.selectData = this.groupData[key];
                            }
                        }
                        this.selectData = this.groupData[this.group];
                        this.termId = this.selectData.length ? this.selectData[0] : null;
                    }
                },
            );
    }

    ngOnInit() {
        (async () => {
            this.getDBtypeUrl();
            this.group = this.treatGroup;
            this.restoreChartAttr();
            this.bigtableUrl = `${config['javaPath']}/gsea/table`;
            this.chartUrl = `${config['javaPath']}/gsea/graph`;
            this.chartEntity = {
                group: this.group,
                termId: this.termId,
                LCID: this.storeService.getStore('LCID'),
                tid: this.tid,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.storeService.getStore('version')
            };

            this.first = true;
            this.resetCheckGraph = true;
            this.applyOnceSearchParams = true;
            this.defaultUrl = `${config['javaPath']}/gsea/table`;
            this.defaultEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid: this.tid,
                termId: this.termId,
                group: this.group,
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
                checkGraph: true,
                sortThead: this.addColumn['sortThead'],
                removeColumns: []
            };
            this.defaultTableId = 'default_gsea';
            this.defaultDefaultChecked = true;
            this.defaultEmitBaseThead = true;
            this.defaultCheckStatusInParams = true;

            this.extendUrl = `${config['javaPath']}/gsea/table`;
            this.extendEntity = {
                LCID: sessionStorage.getItem('LCID'),
                tid: this.tid,
                termId: this.termId,
                group: this.group,
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
                checkGraph: true,
                sortThead: this.addColumn['sortThead'],
                removeColumns: []
            };
            this.extendTableId = 'gsea_table';
            this.extendDefaultChecked = true;
            this.extendEmitBaseThead = true;
            this.extendCheckStatusInParams = false;


            this.generalUrl = `${config['javaPath']}/gsea/graphTable`;
            this.generalEntity = {
                termId: this.termId,
                group:this.group,
                searchList: [],
                sortValue: null,
                sortKey: null,
                pageIndex: 1,
                pageSize: 20,
                LCID: sessionStorage.getItem('LCID'),
                tid: this.tid,
                geneType: this.geneType,
                species: this.storeService.getStore('genome'),
                version: this.version,
            }
        })();
    }

    getDBtypeUrl(){
        this.dbtype=this.dbtype.toUpperCase();
        
        if(this.dbtype =="PFAM"){
            this.dbtypeUrl = `http://pfam.xfam.org/family/`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="REACTOME"){
            this.dbtypeUrl = `https://reactome.org/`;
            this.dbtypeNumber = 2;
        }
        if(this.dbtype =="COG"){
            this.dbtypeUrl = `ftp://ftp.ncbi.nih.gov/pub/COG/COG2014/static/byCOG`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="EGGNOG"){
            this.dbtypeUrl = `http://eggnogdb.embl.de/#/app/home`;
            this.dbtypeNumber = 2;
        }
        if(this.dbtype =="TF"){
            if(sessionStorage.getItem('species_kingdom') == 'animal'){
                this.dbtypeUrl = `http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=`;
            }else{
                this.dbtypeUrl = `http://planttfdb.cbi.pku.edu.cn/family.php?fam=`;
            }
            this.dbtypeNumber = 1;
            // 动物：http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/tf_summary?family=[替换内容]
            // 植物：
            // http://planttfdb.cbi.pku.edu.cn/family.php?fam=[替换内容]
            // 根据info中的species_kingdom 的值判断  animal/plant/fungi/other
            
        }
        if(this.dbtype =="TF_COFACTORS"){
            this.dbtypeUrl = `http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/`;
            this.dbtypeNumber = 2;
        }
        if(this.dbtype =="GO_F" || this.dbtype =="GO_P" || this.dbtype =="GO_C"){
            this.dbtypeUrl = `http://bioinfo.life.hust.edu.cn/AnimalTFDB/#!/`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="INTERPRO"){
            this.dbtypeUrl = `https://www.ebi.ac.uk/interpro/entry/`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="KEGG_DISEASE"){
            this.dbtypeUrl = `https://www.kegg.jp/dbget-bin/www_bget?ds:`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="KEGG_MODULE"){
            this.dbtypeUrl = `https://www.kegg.jp/kegg-bin/show_module?`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="KEGG_PATHWAY"){
            this.dbtypeUrl = `https://www.kegg.jp/dbget-bin/www_bget?map`;
            this.dbtypeNumber = 1;
        }
        if(this.dbtype =="KEGG_REACTION"){
            this.dbtypeUrl = `https://www.kegg.jp/dbget-bin/www_bget?rn:`;
            this.dbtypeNumber = 1;
        }
        
        if(
            this.dbtype =="MSIGDB_ARCHIVED_C5_BP"||
            this.dbtype =="MSIGDB_ARCHIVED_C5_CC"||
            this.dbtype =="MSIGDB_ARCHIVED_C5_MF"||
            this.dbtype =="MSIGDB_C1"||
            this.dbtype =="MSIGDB_C2_CGP"||
            this.dbtype =="MSIGDB_C2_CP_BIOCARTA"||
            this.dbtype =="MSIGDB_C2_CP_KEGG"||
            this.dbtype =="MSIGDB_C2_CP_REACTOME"||
            this.dbtype =="MSIGDB_C2_CP"||
            this.dbtype =="MSIGDB_C3_MIR"||
            this.dbtype =="MSIGDB_C3_TFT"||
            this.dbtype =="MSIGDB_C4_CGN"||
            this.dbtype =="MSIGDB_C4_CM"||
            this.dbtype =="MSIGDB_C5_BP"||
            this.dbtype =="MSIGDB_C5_CC"||
            this.dbtype =="MSIGDB_C5_MF"||
            this.dbtype =="MSIGDB_C6"||
            this.dbtype =="MSIGDB_C7"||
            this.dbtype =="MSIGDB_H"
        ){
            this.dbtypeUrl = `http://software.broadinstitute.org/gsea/msigdb/cards/`;
            this.dbtypeNumber = 1;
        }
        //this.dbtypeUrl
    }

    moduleTableChange() {
        this.expandModuleTable = !this.expandModuleTable;
        // 重新计算表格切换组件表格的滚动高度
        setTimeout(() => {
            this.switchChart.scrollHeight();
        }, 30);
    }

    handleSelectChange() {
        this.chartEntity['termId'] = this.termId;
        this.chartEntity['group'] = this.group;
        this.chartBackStatus();

        this.selectGeneList.length = 0;
        this.restoreChartAttr();
        this.switchChart.reGetData();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.computedTableHeight();
        }, 30);
    }

    handleSelectGeneCountChange(selectGeneCount) {
        this.selectGeneCount = selectGeneCount;
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
            this.extendEntity['group'] = checkParams['tableEntity']['group'];
            this.extendEntity['termId'] = checkParams['tableEntity']['termId'];
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
            this.transformTable._setExtendParamsWithoutRequest('group', checkParams['tableEntity']['group']);
            this.transformTable._setExtendParamsWithoutRequest('termId', checkParams['tableEntity']['termId']);
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
        this.chartBackStatus();
    }

    handlerRefresh() {
        this.selectGeneList.length = 0;
        this.restoreChartAttr();
        this.switchChart.redraw();
    }

    chartBackStatus() {
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        this.transformTable._initCheckStatus();
        this.transformTable._clearFilterWithoutRequest();
        this.resetCheckGraph = true;

        if (!this.first) {
            this.defaultEntity['checkGraph'] = true;
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            this.defaultEntity['pageIndex'] = 1;
            this.defaultEntity['termId'] = this.termId;
            this.defaultEntity['group'] = this.group;
            this.first = true;
        } else {
            this.transformTable._setParamsNoRequest('checkGraph', true);
            this.transformTable._setParamsNoRequest('pageIndex', 1);
            this.transformTable._setParamsNoRequest('termId', this.termId);
            this.transformTable._setParamsNoRequest('group', this.group);
            this.transformTable._getData();
        }
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
        document.getElementById('reGseaChartDiv').innerHTML = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
        <style>
        svg {
             padding: 10px 10px 0;
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
                    that.selectGeneList = [d["gene_id"]];
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

            let firstYesElementIndex, yesAreaWidth;
            for (let i = 0; i < line_data.length; i++) {
                if (line_data[i]["CORE ENRICHMENT"] === "Yes") {
                    firstYesElementIndex = i;
                    break
                }
            }


            const hoverX = xScale(line_data[firstYesElementIndex][line_x_key]);

            if (firstYesElementIndex === 0) {
                for (let i = firstYesElementIndex; i < line_data.length; i++) {
                    if (line_data[i]["CORE ENRICHMENT"] !== "Yes") {
                        yesAreaWidth = xScale(line_data[i][line_x_key]) - hoverX;
                        break
                    }
                }
            } else {
                yesAreaWidth = xScaleTickMax - hoverX;
            }
            let yesAreaXStart = chartPadding.left + hoverX,
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
                .on('mouseover', function (d) {
                    d3.select(this).transition().attr('r', 4);
                    that.globalService.showPopOver(d3.event, buildLineChartHover(d));
                })
                .on('mouseout', function (d) {
                    d3.select(this).transition().attr('r', 2);
                    that.globalService.hidePopOver();
                })
                .on('click', d => {
                    that.selectGeneList = [d["gene_id"]];
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
            d3.select(window).on("mousemove", function () {
                let yesAreaRect = document.getElementById('yes-area').getBoundingClientRect(),
                    yesAreaXEnd = yesAreaRect['x'] + yesAreaRect['width'],
                    yesAreaYEnd = yesAreaRect['y'] + yesAreaRect['height'];
                flag = (d3.event.pageX >= yesAreaRect['x'] && d3.event.pageX <= yesAreaXEnd) &&
                    (d3.event.pageY >= yesAreaRect['y'] && d3.event.pageY <= yesAreaYEnd);

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
                Gene ID: ${ele["gene_id"]}<br>
                Gene Symbol: ${ele["gene_symbol"] || 'NA'}<br>
                RANK IN GENE LIST: ${ele[line_x_key]}<br>
                RANK METRIC SCORE: ${ele["RANK METRIC SCORE"]}<br>
                RUNNING ES: ${ele[line_y_key]}<br>
                CORE ENRICHMENT:y: ${ele["CORE ENRICHMENT"]}`;
        }

        function buildHistogramHover(ele) {
            if (ele > 0) {
                return `'${that.controlGroup}'(positively correlated): ${ele}`
            } else if (ele < 0) {
                return `'${that.treatGroup}'(negatively correlated): ${ele}`
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
                    .on("mouseover", function () {
                        d3.select(this).append("title").text("单击修改颜色");
                    })
                    .on("mouseout", function () {
                        d3.select(this).select("title").remove();
                    });
            legendClick_g.selectAll(".legendClick_Rect")
                .data(that.gcolors)
                .enter()
                .append("rect")
                .attr("width", legend_w)
                .attr("height", legendClickRect_h)
                .attr("y", function (d, i) {
                    return i * legendClickRect_h;
                })
                .attr("fill", "transparent")
                .on("click", function (d, i) {
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
        this.switchChart.redraw();
    }

    //框选确定时候,提交的数据
    boxSelectConfirm() {
        this.selectGeneList = [];
        this.selectArray.forEach((d) => {
            this.selectGeneList.push(d["__data__"]['gene_id'])
        });
    }

    doTableStatementFilter() {
        // 筛选表格
        if (this.selectGeneList.length) {
            this.transformTable._filter(`${this.geneType}_id`,config[this.geneType], "string", "$in", this.selectGeneList.join(','), null)

        } else {
            this.transformTable._deleteFilter(`${this.geneType}_id`,config[this.geneType], "$in");
        }
    }

    restoreChartAttr() {
        this.graphTitle=null;
        this.gcolors = ["#0070c0", "#ff0000"];
        this.colors = ["#0F0", "#0F0F0F", "gray"];
    }

    moduleSwitchChange(e){
        console.log(e);
        if(e=="A"){
            this.group = this.treatGroup;
        }else if(e="B"){
            this.group = this.controlGroup;
        }
        this.switchValue = e;
        this.generalEntity['group'] = this.group;
        this.bigTable._setParamsOfEntity('group',this.group);

        this.selectData = this.groupData[this.group];
        this.termId = this.selectData.length ? this.selectData[0] : null;
        this.handleSelectChange();
    }

    gseaCheckedChange(e){
        console.log(e);
        this.termId = e["NAME"];
        this.handleSelectChange();
    }
}
