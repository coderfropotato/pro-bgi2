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

    selectArray: object[] = [];

    defaultSelectNum:number;

    selectUniqueList:string[] = [];

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
                    //tid: '7fc7bf9c6db34fc0b042efc40a4db779',
                    // tid:"f888468806f644ccaac2afed5d424f00",
                    tid:this.tid,
                    version: this.version,
                    geneType: this.geneType,
                    species: this.storeService.getStore("genome"),
                    AS_type: this.AS_type_select,
                    Group: this.group_select
                    //Group: ['B1-vs-C1']
                };

                //console.log(this.storeService.colors)

                //this.colors=[ "rgb(153, 107, 195)", "rgb(56, 106, 197)", "rgb(93, 199, 76)", "rgb(223, 199, 31)", "rgb(234, 118, 47)"];
                this.colors = this.storeService.colors;

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
                    rootSearchContentList: [],
                    geneType: this.geneType, //基因类型gene和transcript
                    species: this.storeService.getStore("genome"), //物种
                    version: this.version,
                    searchList: [],
                    sortThead: this.addColumnService["sortThead"],
                    AS_type: this.AS_type_select,
                    Group: this.group_select
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
                    rootSearchContentList: [],
                    geneType: this.geneType, //基因类型gene和transcript
                    species: this.storeService.getStore("genome"), //物种
                    version: this.version,
                    searchList: [],
                    sortThead: this.addColumnService["sortThead"],
                    AS_type: this.AS_type_select,
                    Group: this.group_select
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
        if(!this.first){
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            this.defaultEntity['pageIndex'] = 1;
            this.defaultEntity["addThead"] = [];
            // that.transformTable._filter('unique', "unique", "double","$in", d['unique'],null)
            if(this.selectUniqueList.length){
                this.defaultEntity['searchList'] = [
                    {"filterName":"unique","filterNamezh":"unique","searchType":"double","filterType":"$in","valueOne":this.selectUniqueList.join(','),"valueTwo":null}
                ];
            }else{
                this.defaultEntity['searchList']= [] ;
            }
            this.first = true;
        }else{
            this.transformTable._setParamsNoRequest('pageIndex',1);
            if(this.selectUniqueList.length) {
                this.transformTable._filter('unique', "unique", "double","$in",this.selectUniqueList.join(','),null);
            }else{
                this.transformTable._deleteFilterWithoutRequest("unique","unique","$in");
                this.transformTable._getData();
            }
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

    //框选确定时候,提交的数据
    boxSelectConfirm() {
        //console.log(this.selectArray);
        let tempArray = [];
        this.selectArray.forEach((d) => {
            tempArray.push(d["__data__"])
        });
        console.log(tempArray);
        // 筛选表格
        let gene = tempArray.map(v=>v['unique']);
        this.selectUniqueList.length = 0;
        this.selectUniqueList.push(...gene);
        if(this.selectUniqueList.length){
            this.transformTable._filter('unique', "unique", "double","$in", this.selectUniqueList.join(','),null)
        }else{
            this.transformTable._deleteFilter("unique","unique","$in");
        }
    }

    //选择面板 确定筛选的数据
    selectConfirm(data) {
        this.selectConfirmData = data;
        this.doSplitData();
        this.chartEntity['AS_type'] = this.AS_type_select;
        this.chartEntity['Group'] = this.group_select;
        this.updateRelativeSplice();

    }

    //把数据进行分类
    doSplitData(){
        this.AS_type_select.length = 0;
        this.group_select.length = 0;
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
        console.log(this.AS_type_select)
        console.log(this.group_select)
    }

    //选择面板，默认选中数据
    defaultSelectList(data) {
        this.selectConfirmData = data;
        this.doSplitData();
    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.relativeSpliceChart.redraw();
    }

    //画图
    drawChart(data) {
        let that = this;

        if(data.length == 0){
            return;
        }
        let tempData = data.asGraph;
        let tempSetting = data.as_region;

        tempData.forEach((d) => {
            d.x = 0;
            d.y = 0;
            d.selected = false;
        });

        

        let x_value = [];
        let y_value = [];

        tempData.forEach((d) => {
            x_value.push(d.x_site);
            y_value.push(d.y_site);
        });

        x_value = Array.from(new Set(x_value));
        y_value = Array.from(new Set(y_value));



        let t_chartID = document.getElementById('relativeSpliceDiv');
		let str = `<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
            <style>

                .titleText{
                    font-size：16px;
                }
            </style>
        </svg>`;
        t_chartID.innerHTML = str;

        let symbolScale = null;
        let svg1 = null;
        let xScale = null;
        let yScale = null;
        let rect2 = null;
        let node = null;

        let top_title = 30;//上侧标题
        let bottom_xlength = 20; //下侧x轴高度
        let bottom_UTR_CDS = 60; //下侧UTR_CDS高度

        let left_title = 20;//左侧标题
        let left_ylength = 30;//左侧y轴
        let right_name_length=getNameLength(this.selectConfirmData)+30;

        // let rect_length ={  //矩形宽高
        //     x:50,
        //     y:40
        // }

        // let xAxis_length = x_value.length*rect_length.x;
        // let yAxis_length = y_value.length*rect_length.y;
        let xAxis_length = 320;
        let yAxis_length = 300;

        let svg_width = left_title + left_ylength + xAxis_length + right_name_length*2; //计算最外层svg宽度
        let svg_height = top_title + yAxis_length + bottom_xlength + bottom_UTR_CDS; //计算最外层svg高度

        let svg = d3.select('#svg') //最外层svg
                .attr('width', svg_width)
                .attr('height', svg_height)
                .on('click', function(d) {
                    
                    that.updateRelativeSplice();
                    that.chartBackStatus();
                },false);
     
        let temp_add_width = 10;
        let temp_x_width = xAxis_length + left_ylength + temp_add_width;
        let temp_y_width = yAxis_length + bottom_xlength + temp_add_width;

        draw_x_y_axis();
        drawRightTopLegend();
        drawRightBottomLegend();
        drawCenter();
        drawBottomLegend();
    
        function draw_x_y_axis(){
            
            svg1 = svg
                .append('g')
                .attr('transform', 'translate(' + left_title + ',' + top_title + ')')
                .attr('class', 'svg1');

            xScale = d3
				.scaleLinear()
				.domain([ tempSetting.x_axis.start , tempSetting.x_axis.end ])
                .range([ 0 , xAxis_length ])
                .nice().clamp(true);
            yScale = d3
				.scaleLinear()
                .domain([ tempSetting.y_axis.end , tempSetting.y_axis.start ])
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

            symbolScale =  d3.scaleOrdinal().domain(that.AS_type_select).range(temp_symbol_select);

            r_legend.append("g")
            .attr("class", "legendSymbol")
            .attr("transform", "translate(0, 0)");

            let legendPath = d3.legendSymbol()
            .scale(symbolScale)
            .orient("vertical")
            .labelWrap(right_name_length)
            .labelOffset(0)
            .shapePadding(5)
            .title("Type")
            .titleWidth(right_name_length)
            //.on("cellover", function(d){alert("clicked " + d);})
            .on("cellclick", function(d){alert("clicked " + d);});

            r_legend.select(".legendSymbol").call(legendPath);
        }

        function drawRightBottomLegend(){

            // let padding_left = temp_x_width + left_title+10;
            // let padding_top = 140 + top_title +10;
            let padding_left = temp_x_width + left_title + right_name_length;

            let circle = d3.symbol().type(d3.symbolCircle)();

            let temp_symbol_select = [];
            let temp_symbol_length = that.group_select.length;
            let j = 0;

            that.colors.forEach(element => {
                if(j < temp_symbol_length){
                    temp_symbol_select.push(that.colors[j]);
                    j++;
                }
            });

            let r_legend_bottom = svg
                .append('g')
                .attr('transform', 'translate(' + padding_left + ',' + top_title + ')')
                .attr('width',right_name_length)
                .attr('height',yAxis_length)
                ;

            r_legend_bottom.append('text').attr("class","titleText").attr('dx', '0').attr('dy', '0').text("Group");

            let ordinal = d3.scaleOrdinal()
            .domain(that.group_select)
            .range(temp_symbol_select);
            
            r_legend_bottom.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(4,20)");
            
            let legendOrdinal = d3.legendColor()
            .shape("path", circle)
            .labelOffset(5)
            .shapePadding(5)
            // .cellFilter(function(d){ return d.label !== "e" })
            .scale(ordinal);
            
            r_legend_bottom.select(".legendOrdinal")
            .call(legendOrdinal);
        }

        function drawCenter(){

            let svg2 = svg1.append("g").attr('transform', 'translate(' + (left_ylength) + ',' + temp_add_width + ')');

            let brush = svg2.append("g").attr("class", "brush")
            .call(d3.brush()
                .extent([[0, 0], [xAxis_length, yAxis_length]])
                .on("start", brushStart)
                .on("brush", brushed)
                .on("end", brushEnd)
            );

            tempData.forEach((d) => {
                d.x = xScale(d['x_site'])+left_ylength;
                d.y = yScale(d['y_site'])+temp_add_width;
            });

            // 默认用图例数组
            let categoryList = that.group_select;
            // 颜色比例尺
            let z = d3.scaleOrdinal().domain(categoryList).range(that.colors.slice(0, categoryList.length));

            //temp_symbol
            node = svg1.selectAll('.mynode')
            .data(tempData)
            .enter()
            .append('path')
            .attr('transform', function(d,i){
                return 'translate(' + d['x'] + ',' + d['y'] + ')'
            })
            .attr("d",function(d,i){
                return symbolScale(d["AS_type"])
            })
            .attr("class","mynode")
            .attr("fill", function(d, i) {
                return z(d['Group']);
            })
            .on("mouseover", function(d) {
                // let tipText = `x: ${d.x_site}
                //             <br> y:  ${d.y_site}
                //             <br> AS_type:  ${d.AS_type}
                //             <br> Group:  ${d.Group}
                //             <br> st_gene_id:  ${d.st_gene_id}
                //             <br> unique:  ${d.unique}
                //             <br> x_calculate: ${d.x}
                //             <br> y_calculate:  ${d.y}
                //             `;
                let tipText = `AS_type:  ${d.AS_type}
                            <br> Group:  ${d.Group}
                            <br> st_gene_id:  ${d.st_gene_id}
                            <br> unique:  ${d.unique}`;
                that.globalService.showPopOver(d3.event, tipText);
            })
            .on("mouseout", function(d) {
                that.globalService.hidePopOver();
            })
            .on('click', function(d) {
                let event = d3.event;
                    event.stopPropagation();
                    console.log(event)

                // 筛选表格
                that.selectUniqueList.length = 0;
                that.selectUniqueList.push(d['unique']);
                that.transformTable._filter('unique', "unique", "double","$in", d['unique'],null);
                console.log(d);
            })

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
                //console.log(d3.event)
                node.classed("selected", d => {
                    return (selection != null
                        && selection[0][0] <= (d.x - left_ylength) && (d.x - left_ylength) <= selection[1][0]
                        && selection[0][1] <= (d.y - temp_add_width) && (d.y - temp_add_width) <= selection[1][1]);
                })
            }
        }

        function brushEnd() {
            let selection = d3.event.selection;
            if (selection != null) {
                d3.select(this).call(d3.event.target.move, null);
                //console.log(d3.selectAll(".mynode.selected").nodes());
                that.selectArray = d3.selectAll(".mynode.selected").nodes();
                that.boxSelectConfirm();
            }
        }

        function drawBottomLegend(){
            // let top_title = 30;//上侧标题
            // let bottom_xlength = 20; //下侧x轴高度
            // let bottom_UTR_CDS = 60; //下侧UTR_CDS高度

            let u_padding = top_title + bottom_xlength + yAxis_length+20;
            let g_UTR = svg
                .append('g')
                .attr('transform', 'translate(' + (left_title+left_ylength) + ',' + u_padding + ')')
                .attr('class', 'utr')
                .attr("height",bottom_UTR_CDS)
                ;
            
            let sum = tempSetting.utr_3.end - tempSetting.utr_5.start;
            let utr_5_scale = (tempSetting.utr_5.end-tempSetting.utr_5.start)/sum;
            let utr_3_scale = (tempSetting.utr_3.end-tempSetting.utr_3.start)/sum;
            let cds_scale = (tempSetting.cds.end-tempSetting.cds.start)/sum;

            g_UTR.append('rect')
            .attr('class', 'MyRect')
            .attr('width',xAxis_length*utr_5_scale)
            .attr('height',16)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .attr('fill','black')
        
            g_UTR.append('rect')
            .attr('class', 'MyRect')
            .attr('width',xAxis_length*cds_scale)
            .attr('height',6)
            .attr('transform', 'translate(' + xAxis_length/5 + ',' + 5 + ')')
            .attr('fill','black')
            .attr('opacity',0.5)
            
            g_UTR.append('rect')
            .attr('class', 'MyRect')
            .attr('width',xAxis_length*utr_3_scale)
            .attr('height',16)
            .attr('transform', 'translate(' + xAxis_length*4/5 + ',' + 0 + ')')
            .attr('fill','black')

            g_UTR.append('text')
            .attr('class', 'MyText')
            .attr('dx', function(d, i) {
                return 10;
            })
            .attr('dy', function(d, i) {
                return 30;
            })
            .text("5'-UTR")

            g_UTR.append('text')
            .attr('class', 'MyText')
            .attr('dx', function(d, i) {
                return 270;
            })
            .attr('dy', function(d, i) {
                return 30;
            })
            .text("3'-UTR")
            
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

        function pauseEvent(e){
            if(e.stopPropagation) e.stopPropagation();
            if(e.preventDefault) e.preventDefault();
            e.cancelBubble=true;
            e.returnValue=false;
            return false;
        }
    }
}
