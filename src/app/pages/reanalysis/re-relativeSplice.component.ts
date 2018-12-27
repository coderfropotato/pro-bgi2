import { AddColumnService } from "./../../super/service/addColumnService";
import { StoreService } from "./../../super/service/storeService";
import { PageModuleService } from "./../../super/service/pageModuleService";
import { MessageService } from "./../../super/service/messageService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { GlobalService } from "src/app/super/service/globalService";
import config from "../../../config";
import { PromptService } from "./../../super/service/promptService";
import { ToolsService } from "./../../super/service/toolsService";

declare const d3: any;
declare const d4: any;
declare const $: any;

@Component({
    selector: "app-re-relativeSplice",
    templateUrl: "./re-relativeSplice.component.html",
    styles: []
})
export class RelativeSpliceComponent implements OnInit {
    @ViewChild("relativeSpliceChart") relativeSpliceChart;
    @ViewChild("left") left;
    @ViewChild("right") right;
    @ViewChild("func") func;
    @ViewChild("tableSwitchChart") tableSwitchChart;
    @ViewChild("transformTable") transformTable;
    @ViewChild("addColumn") addColumn;

    chartUrl: string;
    chartEntity: object;
    chart: any;

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
    first = true;
    switch = false;
    onlyTable: boolean = false;

    addColumnShow: boolean = false;
    showBackButton: boolean = false;

    // 路由参数
    tid: string = null;
    geneType: string = "";
    version: string = null;

    //参数
    k_degree: number;
    k_explain: string;
    k_pvalue: number;
    k_stat: number;

    singleMultiSelect: object = {}; //单选
    doubleMultiSelect: any[] = []; //多选

    colors: string[] = [];
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    isShowColorPanel: boolean = false;
    textContent: string = "可变剪切图";
    geneNum: number;

    selectPanelData: object[] = [];

    AS_type_list: string[] = [];    //--可变剪切组---的全部基因
    Group_All_List:string[] = [];   //除去--可变剪切组---的全部基因

    AS_type_select: string[] = [];
    group_select: string[] = [];

    selectConfirmData:string[] = []; //默认和确定时候的返回数据

    defaultSelectNum:number;

    constructor(
        private message: MessageService,
        private store: StoreService,
        private ajaxService: AjaxService,
        private globalService: GlobalService,
        private storeService: StoreService,
        public pageModuleService: PageModuleService,
        private router: Router,
        private routes: ActivatedRoute,
        private promptService: PromptService,
        public toolsService: ToolsService,
        private addColumnService: AddColumnService
    ) {
        // 订阅windowResize 重新计算表格滚动高度
        this.message.getResize().subscribe(res => {
            if (res["message"] === "resize") this.computedTableHeight();
        });

        // 每次切换路由计算表格高度
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.computedTableHeight();
            }
        });

        this.routes.paramMap.subscribe(params => {
            this.tid = params["params"]["tid"];
            this.version = params["params"]["version"];
            this.geneType = params["params"]["geneType"];
            this.storeService.setTid(this.tid);
        });
    }

    ngOnInit() {
        (async () => {
            try {
                let a = await this.getRelativeSpliceParams();

                this.chartUrl = `${config["javaPath"]}/alternativeSplice/graph`;
                this.chartEntity = {
                    LCID: sessionStorage.getItem("LCID"),
                    tid: '7fc7bf9c6db34fc0b042efc40a4db779',
                    version: this.version,
                    geneType: this.geneType,
                    species: this.storeService.getStore("genome"),
                    AS_type: this.AS_type_select,
                    //Group: this.group_select
                    Group: ['B1-vs-C1']
                };

                this.colors = ["#4575B4", "#FEF6B2", "#D9352A"];

                // this.chartEntity = {B1-vs-C1
                //     LCID: sessionStorage.getItem('LCID'),
                //     tid:this.tid,
                //     pageIndex: 1,
                //     pageSize: 100000,
                //     mongoId: null,
                //     addThead: [],
                //     transform: false,
                //     matchAll: false,
                //     matrix: false,
                //     sortValue: null,
                //     sortKey: null,
                //     reAnaly: false,
                //     rootSearchContentList:[],
                //     geneType: this.geneType,
                //     species: this.storeService.getStore('genome'),
                //     version: this.version,
                //     searchList: []
                // };

                // table
                this.first = true;
                this.applyOnceSearchParams = true;
                this.defaultUrl = `${config["javaPath"]}/chiSquare/table`;
                this.defaultEntity = {
                    LCID: sessionStorage.getItem("LCID"),
                    tid: this.tid,
                    pageIndex: 1, //分页
                    pageSize: 20,
                    mongoId: null,
                    addThead: [], //扩展列
                    transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
                    matchAll: false,
                    matrix: false, //是否转化。矩阵为matrix
                    sortValue: null,
                    sortKey: null, //排序
                    reAnaly: false,
                    rootSearchContentList: [],
                    geneType: this.geneType, //基因类型gene和transcript
                    species: this.storeService.getStore("genome"), //物种
                    version: this.version,
                    searchList: [],
                    sortThead: this.addColumnService["sortThead"]
                };
                this.defaultTableId = "default_kafun";
                this.defaultDefaultChecked = true;
                this.defaultEmitBaseThead = true;
                this.defaultCheckStatusInParams = true;

                this.extendUrl = `${config["javaPath"]}/chiSquare/table`;
                this.extendEntity = {
                    LCID: sessionStorage.getItem("LCID"),
                    tid: this.tid,
                    pageIndex: 1, //分页
                    pageSize: 20,
                    mongoId: null,
                    addThead: [], //扩展列
                    transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
                    matchAll: false,
                    matrix: false, //是否转化。矩阵为matrix
                    sortValue: null,
                    sortKey: null, //排序
                    reAnaly: false,
                    rootSearchContentList: [],
                    geneType: this.geneType, //基因类型gene和transcript
                    species: this.storeService.getStore("genome"), //物种
                    version: this.version,
                    searchList: [],
                    sortThead: this.addColumnService["sortThead"]
                };
                this.extendTableId = "extend_kafun";
                this.extendDefaultChecked = true;
                this.extendEmitBaseThead = true;
                this.extendCheckStatusInParams = false;
            } catch (error) {}
        })();
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.computedTableHeight();
        }, 30);
    }

    toggle(status) {
        this.addColumnShow = status;
    }

    // 表
    addThead(thead) {
        this.transformTable._initCheckStatus();

        this.transformTable._setParamsNoRequest(
            "removeColumns",
            thead["remove"]
        );
        this.transformTable._setParamsNoRequest("pageIndex", 1);

        this.transformTable._addThead(thead["add"]);
    }

    // 表格转换 确定
    // 转换之前需要把图的 参数保存下来  返回的时候应用
    confirm(relations) {
        this.showBackButton = true;
        // this.defaultEmitBaseThead = true;
        this.extendEmitBaseThead = true;
        let checkParams = this.transformTable._getInnerParams();
        // 每次确定把之前的筛选参数放在下一次查询的请求参数里 请求完成自动清空上一次的请求参数，恢复默认；
        this.applyOnceSearchParams = true;
        if (this.first) {
            this.extendCheckStatusInParams = false;
            this.extendEntity["checkStatus"] =
                checkParams["others"]["checkStatus"];
            this.extendEntity["unChecked"] =
                checkParams["others"]["excludeGeneList"]["unChecked"];
            this.extendEntity["checked"] =
                checkParams["others"]["excludeGeneList"]["checked"];
            this.extendEntity["mongoId"] = checkParams["mongoId"];
            this.extendEntity["searchList"] =
                checkParams["tableEntity"]["searchList"];
            this.extendEntity["rootSearchContentList"] =
                checkParams["tableEntity"]["rootSearchContentList"];
            this.extendEntity["relations"] = relations;
            this.extendEntity["transform"] = true;
            this.extendEntity["matrix"] = true;
            this.addColumn._clearThead();
            this.extendEntity["addThead"] = [];
            this.first = false;
        } else {
            this.transformTable._initTableStatus();
            this.extendCheckStatusInParams = false;
            this.transformTable._setExtendParamsWithoutRequest(
                "checkStatus",
                checkParams["others"]["checkStatus"]
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "checked",
                checkParams["others"]["excludeGeneList"]["checked"].concat()
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "unChecked",
                checkParams["others"]["excludeGeneList"]["unChecked"].concat()
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "searchList",
                checkParams["tableEntity"]["searchList"]
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "rootSearchContentList",
                checkParams["tableEntity"]["rootSearchContentList"]
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "relations",
                relations
            );
            this.transformTable._setExtendParamsWithoutRequest(
                "transform",
                true
            );
            this.transformTable._setExtendParamsWithoutRequest("matrix", true);
            this.transformTable._setExtendParamsWithoutRequest("addThead", []);
            this.addColumn._clearThead();
            // 每次checkStatusInParams状态变完  再去获取数据
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
        this.chartBackStatus();
    }

    chartBackStatus() {
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        this.transformTable._initCheckStatus();
        // 清空表的筛选
        this.transformTable._clearFilterWithoutRequest();
        if (!this.first) {
            this.defaultEntity["pageIndex"] = 1;
            this.defaultEntity["addThead"] = [];
            this.defaultEntity["removeColumns"] = [];
            this.defaultEntity["rootSearchContentList"] = [];
            this.defaultEntity["searchList"] = [];
            this.first = true;
        } else {
            this.transformTable._setParamsNoRequest("pageIndex", 1);
            this.transformTable._getData();
        }
    }

    // 表格基础头改变  设置emitBaseThead为true的时候 表格下一次请求回来会把表头发出来 作为表格的基础表头传入增删列
    baseTheadChange(thead) {
        this.baseThead = thead["baseThead"].map(v => v["true_key"]);
    }

    // 表格上方功能区 resize重新计算表格高度
    resize(event) {
        setTimeout(() => {
            this.computedTableHeight();
        }, 30);
    }

    // 切换左右布局 计算左右表格的滚动高度
    switchChange(status) {
        this.switch = status;
        setTimeout(() => {
            this.relativeSpliceChart.scrollHeight();
            this.computedTableHeight();
        }, 320);
    }

    // 展开表icon 点击事件
    handleOnlyTable() {
        this.onlyTable = !this.onlyTable;
    }

    // 从布局切换发出的事件
    handlOnlyTableChange(status) {
        this.onlyTable = status;
    }

    computedTableHeight() {
        try {
            this.tableHeight =
                this.right.nativeElement.offsetHeight -
                this.func.nativeElement.offsetHeight -
                24;
        } catch (error) {}
    }

    async getRelativeSpliceParams() {
        return new Promise((resolve, reject) => {
            this.ajaxService
                .getDeferData({
                    url: `${config["javaPath"]}/alternativeSplice/config`,
                    data: {
                        LCID: this.storeService.getStore("LCID"),
                        geneType: this.geneType,
                        species: this.storeService.getStore("genome"),
                        version: this.version
                    }
                })
                .subscribe(
                    (data: any) => {
                        if (data.status === "0" &&(data.data.length == 0 ||$.isEmptyObject(data.data))
                        ) {
                            console.log("nodata");
                        } else if (data.status === "-1") {
                            console.log("error");
                        } else if (data.status === "-2") {
                            console.log("dataOver");
                        } else {
                            this.AS_type_list = data["data"].AS_type;

                            this.Group_All_List = [
                                ...data["data"].diff,
                                ...data["data"].group,
                                ...data["data"].sample
                            ];

                            this.defaultSelectNum = this.AS_type_list.length+1;
                            this.selectPanelData = [
                                {
                                    type: "可变剪切类型",
                                    data: this.AS_type_list
                                },
                                {
                                    type: "选择组",
                                    data: data["data"].diff
                                },
                                {
                                    type: "",
                                    data: [...data["data"].group,...data["data"].sample]
                                }
                            ];
                            resolve("success");
                        }
                    },
                    error => {
                        reject("error");
                    }
                );
        });
    }

    //数据筛选，默认选的数组要进行筛选
    doWithDatas(){
        this.selectConfirmData.forEach((d) => {
            this.AS_type_list.forEach((m) => {
                if (d === m) {
                    this.AS_type_select.push(m)
                }
            })
            this.Group_All_List.forEach((m) => {
                if (d === m) {
                    this.group_select.push(m)
                }
            })
        })
        // console.log(this.AS_type_select)
        // console.log(this.group_select)
    }

    //图二次更新
    updateRelativeSplice() {
        this.doubleMultiSelect.length = 0;
        this.singleMultiSelect = {};

        this.relativeSpliceChart.reGetData();
    }

    //单选
    doSingleData() {
        console.log(this.singleMultiSelect);
    }

    //多选确定时候,提交的数据
    multipleConfirm() {}

    //选择面板 确定筛选的数据
    selectConfirm(data) {
        this.selectConfirmData = data;
        this.doWithDatas();
    }

    //选择面板，默认选中数据
    defaultSelectList(data) {
        this.selectConfirmData = data;
        this.doWithDatas();
    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.relativeSpliceChart.redraw();
    }

    //画图
    drawChart(data) {
        //console.log(data)
        let that = this;
        // data: {diff: ["A1-vs-B1", "A1-vs-C1", "B1-vs-C1", "B2-vs-A2", "C2-vs-A2", "C2-vs-B2"],…}
        // AS_type: ["SE", "RI", "A3SS", "A5SS", "MXE"]
        // diff: ["A1-vs-B1", "A1-vs-C1", "B1-vs-C1", "B2-vs-A2", "C2-vs-A2", "C2-vs-B2"]
        // group: ["A", "B", "C"]
        // sample: ["A1", "B1", "C1", "A2", "B2", "C2"]

        let tempData = [
            {
                AS_type: "SE",
                Group: "B1-vs-C1",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11105,
                x_site: 2519.146,
                y_site: 0.972
            },
            {
                AS_type: "A3SS",
                Group: "A1-vs-B1",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11005,
                x_site: 3519.146,
                y_site: 0.872
            },
            {
                AS_type: "RI",
                Group: "A1-vs-C1",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11505,
                x_site: 4519.146,
                y_site: 0.772
            },
            {
                AS_type: "RI",
                Group: "A1-vs-C1",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11505,
                x_site: 4519.146,
                y_site: 0.880
            },
            {
                AS_type: "A5SS",
                Group: "B2-vs-A2",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11305,
                x_site: 5519.146,
                y_site: 0.672
            },
            {
                AS_type: "RI",
                Group: "C2-vs-A2",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 11605,
                x_site: 6519.146,
                y_site: 0.572
            },
            {
                AS_type: "SE",
                Group: "C2-vs-B2",
                LCID: "demo",
                st_gene_id: "STgene0008752",
                unique: 12005,
                x_site: 7519.146,
                y_site: 0.472
            }
        ]

        let x_value = [];
        let y_value = [];

        tempData.forEach((d) => {
            x_value.push(d.x_site);
            y_value.push(d.y_site);
        });

        x_value = Array.from(new Set(x_value));
        y_value = Array.from(new Set(y_value));

        // console.log(x_value)
        // console.log(y_value)

        let t_chartID = document.getElementById('relativeSpliceDiv');
		let str = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
            <style>

                .titleText{
                    font-size：16px;
                }
            </style>
        </svg>`;
        t_chartID.innerHTML = str;

        let top_title = 30;//上侧标题
        let bottom_xlength = 20; //下侧x轴高度
        let bottom_UTR_CDS = 60; //下侧UTR_CDS高度

        let left_title = 20;//左侧标题
        let left_ylength = 30;//左侧y轴
        let right_name_length=getNameLength(this.selectConfirmData)+30;

        let rect_length ={  //矩形宽高
            x:50,
            y:40
        }

        let xAxis_length = x_value.length*rect_length.x;
        let yAxis_length = y_value.length*rect_length.y;

        let svg_width = left_title + left_ylength + xAxis_length + right_name_length; //计算最外层svg宽度
        let svg_height = top_title + yAxis_length + bottom_xlength + bottom_UTR_CDS; //计算最外层svg高度

        let svg = d3.select('#svg') //最外层svg
                .attr('width', svg_width)
                .attr('height', svg_height)
                .on('click', function(d) {

                },false);
     
        let temp_add_width = 10;
        let temp_x_width = xAxis_length + left_ylength + temp_add_width;
        let temp_y_width = yAxis_length + bottom_xlength + temp_add_width;

        let colors=[ "rgb(153, 107, 195)", "rgb(56, 106, 197)", "rgb(93, 199, 76)", "rgb(223, 199, 31)", "rgb(234, 118, 47)"];

        draw_x_y_axis();
        drawRightTopLegend();
        drawRightBottomLegend();
        drawCenter();
    
        function draw_x_y_axis(){
            
            let svg1 = svg
                .append('g')
                .attr('transform', 'translate(' + left_title + ',' + top_title + ')')
                .append('svg')
                .attr('width', temp_x_width)
                .attr('height', temp_y_width)
                .attr('class', 'svg1');

            let xScale = d3
				.scaleLinear()
				.domain([ d3.min(x_value), d3.max(x_value) ])
                .range([ 0 , xAxis_length ])
                .nice().clamp(true);
            let yScale = d3
				.scaleLinear()
				.domain([ d3.max(y_value), d3.min(y_value) ])
                .range([ 0 , yAxis_length ])
                .nice().clamp(true);
                
            let xAxis = d3.axisBottom(xScale).ticks(5);
            let yAxis = d3.axisLeft(yScale).ticks(5);

            svg1.append('g')
                .attr('class', 'axis_x1')
                .attr('transform', 'translate(' + left_ylength + ',' + (yAxis_length + temp_add_width) + ')')
                .call(xAxis);
            svg1.append('g')
                .attr('class', 'axis_y1')
                .attr('transform', 'translate(' + left_ylength + ',' + temp_add_width + ')')
                .call(yAxis);
        }

        function drawRightTopLegend(){

            let padding_left = temp_x_width + left_title+10;

            let r_legend = svg
                .append('g')
                .attr('class','toplegend')
                .attr('transform', 'translate(' + padding_left + ',' + top_title + ')');

            let triangleU = d3.symbol().type(d3.symbolTriangle)(),
                circle = d3.symbol().type(d3.symbolCircle)(),
                cross = d3.symbol().type(d3.symbolCross)(),
                diamond = d3.symbol().type(d3.symbolDiamond)(),
                star = d3.symbol().type(d3.symbolStar)();

            let temp_symbol = [triangleU,circle,cross,diamond,star];
            let temp_symbol_select = [];
            let temp_symbol_length = that.AS_type_select.length;
            let j = 0;

            temp_symbol.forEach(element => {
                if(j < temp_symbol_length){
                    temp_symbol_select.push(temp_symbol[j]);
                    j++;
                }
            });

            var symbolScale =  d3.scaleOrdinal()
            .domain(that.AS_type_select)
            .range(temp_symbol_select);

            r_legend.append("g")
            .attr("class", "legendSymbol")
            .attr("transform", "translate(0, 0)");

            var legendPath = d3.legendSymbol()
            .scale(symbolScale)
            .orient("vertical")
            .labelWrap(right_name_length)
            .labelOffset(0)
            .shapePadding(5)
            .title("Type")
            .titleWidth(right_name_length)
            .on("cellclick", function(d){alert("clicked " + d);});

            r_legend.select(".legendSymbol").call(legendPath);
        }

        function drawRightBottomLegend(){

            let padding_left = temp_x_width + left_title+10;
            let padding_top = 140 + top_title +10;

            let circle = d3.symbol().type(d3.symbolCircle)();

            let temp_symbol_select = [];
            let temp_symbol_length = that.group_select.length;
            let j = 0;

            colors.forEach(element => {
                if(j < temp_symbol_length){
                    temp_symbol_select.push(colors[j]);
                    j++;
                }
            });

            let r_legend_bottom = svg
                .append('g')
                .attr('transform', 'translate(' + padding_left + ',' + padding_top + ')');

            r_legend_bottom.append('text').attr("class","titleText").attr('dx', '0').attr('dy', '0').text("Group");

            var ordinal = d3.scaleOrdinal()
            .domain(that.group_select)
            .range(temp_symbol_select);
            
            r_legend_bottom.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(4,20)");
            
            var legendOrdinal = d3.legendColor()
            .shape("path", circle)
            .labelOffset(5)
            .shapePadding(5)
            // .cellFilter(function(d){ return d.label !== "e" })
            .scale(ordinal);
            
            r_legend_bottom.select(".legendOrdinal")
            .call(legendOrdinal);
        }

        function drawCenter(){
            console.log(tempData);

            // 0:
            // AS_type: "SE"
            // Group: "B1-vs-C1"
            // LCID: "demo"
            // st_gene_id: "STgene0008752"
            // unique: 11105
            // x_site: 2519.146
            // y_site: 0.972
            // __proto__: Object
            // 1: {AS_type: "A3SS", Group: "A1-vs-B1", LCID: "demo", st_gene_id: "STgene0008752", unique: 11005, …}
            // 2: {AS_type: "RI", Group: "A1-vs-C1", LCID: "demo", st_gene_id: "STgene0008752", unique: 11505, …}
            // 3: {AS_type: "RI", Group: "A1-vs-C1", LCID: "demo", st_gene_id: "STgene0008752", unique: 11505, …}
            // 4: {AS_type: "A5SS", Group: "B2-vs-A2", LCID: "demo", st_gene_id: "STgene0008752", unique: 11305, …}
            // 5: {AS_type: "RI", Group: "C2-vs-A2", LCID: "demo", st_gene_id: "STgene0008752", unique: 11605, …}
            // 6: {AS_type: "SE", Group: "C2-vs-B2", LCID: "demo", st_gene_id: "STgene0008752", unique: 12005, …}

            // 默认用图例数组
            var categoryList = that.group_select;
            // 颜色比例尺
            var z = d3.scaleOrdinal().domain(categoryList).range(colors.slice(0, categoryList.length));

            

        }

        function uniq(array){
            let temp = [];
            let index = [];
            let l = array.length;
            for(let i = 0; i < l; i++) {
                for(let j = i + 1; j < l; j++){
                    if (array[i] === array[j]){
                        i++;
                        j = i;
                    }
                }
                temp.push(array[i]);
                index.push(i);
            }
            return temp;
        }

        function getNameLength(k_dataName){
            //计算左侧最大的名字长度
            let k_name_max = [];
            for (let i = 0; i < k_dataName.length; i++) {
                k_name_max.push(getBLen(k_dataName[i]));
            }

            let max_name = Math.max.apply(null, k_name_max);
            let target_name = '';
            for (let i = 0; i < k_name_max.length; i++) {
                if (max_name == k_name_max[i]) {
                    target_name = k_dataName[i];
                    break;
                }
            }
            let oSvg = d3.select('#relativeSpliceDiv').append('svg');
            let mText = oSvg.append('text').text(target_name).attr('class', 'mText');
            let name_length = mText.nodes()[0].getBBox().width;
            oSvg.remove();

            return name_length;
        }

        function getBLen(str) {
            if (str == null) return 0;
            if (typeof str != 'string') {
                str += '';
            }
            return str.replace(/[^\x00-\xff]/g, '01').length;
        }
    }
}