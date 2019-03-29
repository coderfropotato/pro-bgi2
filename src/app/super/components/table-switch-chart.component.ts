import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
    ViewChildren
} from "@angular/core";
import { AjaxService } from "../../super/service/ajaxService";
import { MessageService } from "../service/messageService";
import { StoreService } from "./../service/storeService";
import { TranslateService } from "@ngx-translate/core";
import { GlobalService } from "../service/globalService";

declare const $: any;

@Component({
    selector: "app-table-switch-chart",
    templateUrl: "./table-switch-chart.component.html",
    styles: []
})
export class TableSwitchChartComponent implements OnInit {
    @ViewChild("tableContent") tableContent;
    @ViewChild("selectPanel") selectPanel;
    @ViewChild("tableChartContent") tableChartContent;
    @ViewChild("tableBottom") tableBottom;
    @ViewChildren("child") children;

    @Input() tableUrl: string; //表格api地址；
    @Input() chartUrl: string; //可选，图api地址；若存在表示图api与表api不一致，适用于图复杂（需要单独请求api）场景。

    @Input() apiEntity: object; //api请求参数

    @Input() isChartThenTable:boolean; //是否是图画完后再获取表数据

    @Input() isPaging: boolean; //表是否有分页
    @Input() isFilter:boolean; //表是否有筛选

    @Input() id: string; // 当前模块id

    @Input() chartId: string; // 当前图容器div的id
    @Input() chartName: any;

    @Input() isShowAccuracy: boolean; //可选，是否有精度下拉选择

    @Input() selectTemplate: TemplateRef<any>; //可选，下拉框模块

    @Input() setTemplate: TemplateRef<any>; //可选，设置模块

    @Input() otherRightTemplate: TemplateRef<any>; //可选，组件头部右方其他模块

    @Input() otherLeftTemplate: TemplateRef<any>; //可选，组件头部左方其他模块

    // 单、多选
    @Input() isHasMultiSelect: boolean; //可选，图是否有单选、多选
    @Input() isMultiSelect: boolean; //是否是多选 ；双向绑定:变量名x，fn命名规范xChange
    @Output() isMultiSelectChange: EventEmitter<any> = new EventEmitter(); //单、多选change
    @Output() multipleConfirmEmit: EventEmitter<any> = new EventEmitter(); //多选确定

    //画图
    @Output() drawChartEmit: EventEmitter<any> = new EventEmitter();

    // 是否flex布局
    @Input() flex: boolean;

    // 特殊图表
    @Input() isVennTable: boolean = false; // true：venn/unsetR图的表；false：是普通表

    //选择面板模块
    /**
     * selectPanelUrl 、selectPanelEntity 或 selectPanelData，二者选一传入；
        selectPanelUrl 、selectPanelEntity：选择面板需请求api获取，返回数据结构是object[]={type:'sample',data:['sample1','sample2']};
        selectPanelData：从本地直接拿到储存的数据，数据结构是object[]={type:'sample',data:['sample1','sample2']};
     */
    @Input() selectPanelUrl: string; //选择面板请求api的url
    @Input() selectPanelEntity: object; //请求api的参数

    @Input() selectPanelData: object[]; //选择面板的数据

    @Input() defaultSelectNum: number; //可选， 选择面板数据默认选中个数; 若不传或0则全不选; -1表示全选
    @Output() defaultSelectList: EventEmitter<any> = new EventEmitter(); //默认选中的数据

    @Output() selectConfirmEmit: EventEmitter<any> = new EventEmitter(); // 选择面板 确定

    // 设置
    @Input() defaultSetUrl: string;
    @Input() defaultSetEntity: object;
    @Output() defaultSet: EventEmitter<any> = new EventEmitter();

    @Input() setDataUrl: string;
    @Input() setDataEntity: object;
    @Input() localSetData:any;
    @Output() setData: EventEmitter<any> = new EventEmitter();

    // 刷新
    @Output() refresh: EventEmitter<any> = new EventEmitter();

    //table chart show
    @Output() showChange: EventEmitter<any> = new EventEmitter();

    // 图类型 ,形如：{key:"bubble",value:"气泡图"}
    @Input() chartTypeData: any[];

    // 图说明
    @Input() isShowChartDesc:boolean=false; // 可选，默认隐藏
    @Input() chartDescTitle:string;  //可选， 说明字段标题； 默认是'图说明'
    @Input() chartDescContent:any;  //  说明的内容；传入此字段说明有图的说明
    // 表说明
    @Input() isShowTableDesc:boolean=false;
    @Input() tableDescTitle:string;
    @Input() tableDescContent:any;

    scroll: object = { x: "120%", y: "400px" };
    isShowTable: boolean = false;
    total: number = 1;
    tableData: any;
    chartData: any;
    tableError: string;
    chartError: string;
    isLoading: boolean = false;

    accuracyList: object[] = [];
    accuracy: number = -1;

    selectPanelList: object[] = []; //选择面板数据
    isHasSelectPanel: boolean;
    selectedList: string[] = []; //选中的数据
    isShowSelectPanel: boolean = false;
    confirmSelects: any[] = [];

    chartType: string;

    //筛选
    beginFilterStatus: boolean = false; //是否筛选
    filterHtmlString: object[] = []; //筛选条件面板数据
    twoLevelHead:any[]=[]; //二级表头（可能存在）
    widthConfig: string[]; // table col width config
    tbodyOutFirstCol:any[]=[]; // 除第一列以外的其他列数据
    sortMap: object = {}; //排序
    isErrorDelete:boolean = false;

    constructor(
        private ajaxService: AjaxService,
        private messageService: MessageService,
        private storeService: StoreService,
        private translate: TranslateService,
        private globalService:GlobalService
    ) {
        this.messageService.getResize().subscribe(res => {
            this.scrollHeight();
        });

        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        if (this.chartTypeData && this.chartTypeData.length) this.chartType = this.chartTypeData[0]["key"];

        if(this.isFilter && this.apiEntity){
            this.apiEntity['searchList']=[];
            this.apiEntity['sortKey']=null;
            this.apiEntity['sortValue']=null;
        }

        this.accuracyList = [
            {
                name: "精度：1位小数",
                value: 1
            },
            {
                name: "精度：2位小数",
                value: 2
            },
            {
                name: "精度：3位小数",
                value: 3
            },
            {
                name: "精度：4位小数",
                value: 4
            },
            {
                name: "精度：5位小数",
                value: 5
            },
            {
                name: "精度：6位小数",
                value: 6
            },
            {
                name: "精度：7位小数",
                value: 7
            },
            {
                name: "精度：全数据",
                value: -1
            }
        ];

        if(this.isChartThenTable){
            this.getChartData().then((data)=>{
                this.getTableData();
                this.isLoading=false;
            });
        }else{
            if(this.selectPanelData || this.selectPanelUrl || this.defaultSetUrl){
                if (this.selectPanelData) {
                    this.isHasSelectPanel = true;
                    this.calculateSelectPanelData(this.selectPanelData);
                } else if (this.selectPanelUrl) {
                    this.isHasSelectPanel = true;
                    this.getSelectPanelList();
                } else {
                    this.isHasSelectPanel = false;
                    this.reGetData();
                }

                if (this.defaultSetUrl) {
                    this.getDefaultSet();
                }else{
                    this.reGetData();
                }
            }else{
                this.reGetData();
            }
        }

        //设置中所需数据
        if (this.setDataUrl) {
            this.getSetData();
        }else if(this.localSetData){
            this.setData.emit(this.localSetData);
        }
    }

    // 点击筛选图标
    beginFilter() {
        this.beginFilterStatus = !this.beginFilterStatus;
        // 关闭筛选 重置筛选条件
        if (!this.beginFilterStatus) {
            this.apiEntity["searchList"].length=0;
            this.apiEntity['pageIndex']=1;
            this.classifySearchCondition();
            this.getTableDataThen();
        }
    }

    // 删除某项筛选条件
    deleteFilterItem(item) {
        let filterObj = item.obj;
        if(this.tableError){
            this.isErrorDelete = true;
            // 没数据的时候 在表格筛选参数里找出当前的筛选条件删除 重新获取表格数据
            let index = this.apiEntity['searchList'].findIndex((val,i)=>{
                return (val['filterName'] === filterObj['filterName'] && val['filterType'] === filterObj['filterType'])
            })
            if(index!=-1) {
                this.apiEntity['searchList'].splice(index,1);
                this.apiEntity['pageIndex']=1;
                this.getTableDataThen();
            }
            this.filterHtmlString = this.globalService.transformFilter(this.apiEntity['searchList']);
        }else{
            this._deleteFilter(
                filterObj["filterName"],
                filterObj["filterNamezh"],
                filterObj["filterType"]
            );
        }
    }

    //筛选条件面板的数据
    classifySearchCondition() {
        if (this.apiEntity["searchList"].length) {
            this.filterHtmlString = this.globalService.transformFilter(this.apiEntity['searchList']);
        }else{
            this.filterHtmlString.length = 0;
        }

        // 每次分类筛选条件的时候 重新计算表格滚动区域高度
        setTimeout(() => {
            this.scrollHeight();
        }, 0);
    }

    //根据表头层级关系计算表头宽度
    computedTheadWidth(head): object {
        let defaultWidth = 12;
        let widthConfig = [];
        let twoLevelHead = [];
        let totalWidth: string;

        head.forEach(v => {
            let singleWidth = 0;
            if (v.children.length) {
                v["colspan"] = v.children.length;
                v["rowspan"] = 1;
                v.children.forEach(val => {
                    singleWidth = val.name.length * defaultWidth + 22;
                    widthConfig.push(singleWidth);
                    twoLevelHead.push(val);
                });
            } else {
                v["colspan"] = 1;
                v["rowspan"] = 2;
                singleWidth = defaultWidth * v.name.length + 22;
                widthConfig.push(singleWidth);
            }
        });
        let colLeftConfig: any[] = [];
        // 计算首列的left
        if (head[0]["children"].length) {
            head[0]["children"].forEach((v, i) => {
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
            widthConfig[i] += 29;   // 排序和筛选按钮的宽度
            widthConfig[i] += 'px';
        });
        colLeftConfig.map((v, i) => (colLeftConfig[i] += "px"));
        totalWidth = tempTotalWidth + "px";

        return { widthConfig, twoLevelHead, colLeftConfig, totalWidth };
    }

    // 根据表头生成sortmap
    generatorSortMap() {
        if ($.isEmptyObject(this.sortMap)) {
            this.tableData.baseThead.forEach(val => {
                this.sortMap[val["true_key"]] = null;
                if (val["children"].length) {
                    val["children"].forEach(
                        v => (this.sortMap[v["true_key"]] = null)
                    );
                }
            });
        } else {
            this.tableData.baseThead.forEach(val => {
                if (!this.sortMap[val["true_key"]]) {
                    this.sortMap[val["true_key"]] = null;
                    if (val["children"].length) {
                        val["children"].forEach(v => {
                            if (!this.sortMap[v["true_key"]]) {
                                this.sortMap[v["true_key"]] = null;
                            }
                        });
                    }
                }
            });
        }
    }

    //筛选 确定
    recive(argv) {
        if (!this.apiEntity["searchList"]) {
            this.apiEntity["searchList"] = [
                {
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4],
                    searchType:argv[5]
                }
            ];
        } else {
            var isIn = false;
            this.apiEntity["searchList"].forEach((val, index) => {
                if (val["filterName"] === argv[0]) {
                    this.apiEntity["searchList"][index] = {
                        filterName: argv[0],
                        filterNamezh: argv[1],
                        filterType: argv[2],
                        valueOne: argv[3],
                        valueTwo: argv[4],
                        searchType:argv[5]
                    };
                    isIn = true;
                }
            });

            if (!isIn)
                this.apiEntity["searchList"].push({
                    filterName: argv[0],
                    filterNamezh: argv[1],
                    filterType: argv[2],
                    valueOne: argv[3],
                    valueTwo: argv[4],
                    searchType:argv[5]
                });
        }
        // 每次筛选的时候 重置选中的集合
        this.apiEntity['pageIndex']=1;
        this.getTableDataThen();
        this.classifySearchCondition();
    }

    //筛选 清空
    delete(argv) {
        if (this.apiEntity["searchList"].length) {
            this.apiEntity["searchList"].forEach((val, index) => {
                if (
                    val["filterName"] === argv[0] &&
                    val["filterNamezh"] === argv[1]
                ) {
                    this.apiEntity["searchList"].splice(index, 1);
                    this.classifySearchCondition();
                    this.apiEntity['pageIndex']=1;
                    this.getTableDataThen();
                    return;
                }
            });
        }
    }

    //筛选 清空（不重新发请求）
    deleteWithoutRequest(argv){
        if (this.apiEntity["searchList"].length) {
            this.apiEntity["searchList"].forEach((val, index) => {
                if (
                    val["filterName"] === argv[0] &&
                    val["filterNamezh"] === argv[1]
                ) {
                    this.apiEntity["searchList"].splice(index, 1);
                    this.classifySearchCondition();
                    // this.getTableData();
                    return;
                }
            });
        }
    }

    //排序
    sort(key, value): void {
        //重置排序
        this.tableData.baseThead.forEach(val => {
            this.sortMap[val["true_key"]] = null;
            if (val["children"].length) {
                val["children"].forEach(
                    v => (this.sortMap[v["true_key"]] = null)
                );
            }
        });

        this.sortMap[value] = key ;

        // 取消排序
        if (value == null) {
            this.apiEntity["sortKey"] = null;
            this.apiEntity["sortValue"] = null;
        } else {
            // 有排序
            this.apiEntity["sortKey"] = key;
            this.apiEntity["sortValue"] = value;
        }
        this.getTableDataThen();
    }

    //外部使用的fuction
    _deleteFilter(filterName, filterNamezh, filterType) {
        this.children._results.forEach(val => {
            if (
                val.pid === this.id &&
                val.filterName === filterName &&
                val.selectType === filterType &&
                val.filterNamezh === filterNamezh
            ) {
                val._outerDelete(filterName, filterNamezh, filterType);
            }
        });
    }

    _sort(filterName, sortMethod): void {
        this.sort(filterName, sortMethod);
    }

    _filter(
        filterName, filterNamezh, searchType, filterType, filterValueOne, filterValueTwo,
    ) {
        /* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        setTimeout(() => {
            if(this.children._results.length){
                this.children._results.forEach(val => {
                    if (val.pid === this.id && val.filterName === filterName) {
                        val._outerUpdate( filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType);// crossUnion
                        this.recive([ filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType]);  // crossUnion
                    }
                });
            }else{
                this.recive([ filterName, filterNamezh, filterType, filterValueOne, filterValueTwo, searchType  ]); // crossUnion
            }
        }, 30);
    }

    _filterWithoutRequest(filterName,
        filterNamezh,
        searchType,
        filterType,
        filterValueOne,
        filterValueTwo,
    ) {
        /* 向filter组件传递  tableId  filterName  filterType
         找匹配tableId的filter子组件，并更新筛选状态；
         手动调用本组件的 recive方法  模拟子组件发射的方法
         */
        // 没有打开筛选就打开
        if (!this.beginFilterStatus) this.beginFilterStatus = true;
        // 待筛选面板渲染完后找到匹配的筛选面板传数据
        if(this.children._results.length){
            setTimeout(() => {
                this.children._results.forEach(val => {
                    if (val.pid === this.id && val.filterName === filterName) {
                        val._outerUpdate(
                            filterName,
                            filterNamezh,
                            filterType,
                            filterValueOne,
                            filterValueTwo,
                            searchType
                        );

                        this.classifySearchCondition();
                    }
                });
            }, 30);
        }
    }

    //图类型下拉change
    chartTypeChange() {
        this.drawChart(this.chartData, this.chartType);
    }

    //图表切换按钮
    chartBtnClick() {
        this.isShowTable = false;
        this.showChange.emit(this.isShowTable);
    }

    tableBtnClick() {
        let height = this.tableChartContent.nativeElement.offsetHeight;
        this.isShowTable = true;
        this.showChange.emit(this.isShowTable);
        setTimeout(() => {
            this.scrollHeight(height);
        }, 0);
    }

    //获取默认值
    getDefaultSet() {
        this.ajaxService
            .getDeferData({
                url: this.defaultSetUrl,
                data: this.defaultSetEntity
            })
            .subscribe((data: any) => {
                if (
                    data.status == "0" &&
                    (data.data.length == 0 || $.isEmptyObject(data.data))
                ) {
                    return;
                } else if (data.status == "-1") {
                    return;
                } else if (data.status == "-2") {
                    return;
                } else {
                    let defaultSetData = data.data;
                    this.defaultSet.emit(defaultSetData);
                    this.reGetData();
                }
            });
    }

    //获取设置中所需的数据
    getSetData() {
        this.ajaxService
            .getDeferData({
                url: this.setDataUrl,
                data: this.setDataEntity
            })
            .subscribe((data: any) => {
                if (
                    data.status == "0" &&
                    (data.data.length == 0 || $.isEmptyObject(data.data))
                ) {
                    return;
                } else if (data.status == "-1") {
                    return;
                } else if (data.status == "-2") {
                    return;
                } else {
                    let trueData = data.data;
                    this.setData.emit(trueData);
                }
            });
    }

    // 初始化计算表滚动的高度
    ngAfterViewInit() {
        setTimeout(() => {
            this.scrollHeight();
        }, 200);
    }

    scrollHeight(height = 0) {
        try {
            let tableChartContentH = height || this.tableChartContent.nativeElement.offsetHeight;
            let bottomPageH = this.tableBottom ? this.tableBottom.nativeElement.offsetHeight : 0;
            let scrollH: any = tableChartContentH - 38 - bottomPageH + "px";
            if (this.isPaging) {
                $(`#${this.id} .ant-table-body`).css("height", scrollH);
            }
            this.scroll["y"] = scrollH;
        } catch (error) {}
    }

    //获取选择面板数据
    getSelectPanelList() {
        this.ajaxService
            .getDeferData({
                url: this.selectPanelUrl,
                data: this.selectPanelEntity
            })
            .subscribe(
                (data: any) => {
                    if (
                        data.status == "0" &&
                        (data.data.length == 0 || $.isEmptyObject(data.data))
                    ) {
                        this.selectPanelList = [];
                    } else if (data.status != "0") {
                        this.selectPanelList = [];
                    } else {
                        let selects = data.data;
                        this.calculateSelectPanelData(selects);
                    }
                },
                error => {
                    this.tableError = error;
                    this.chartError = error;
                }
            );
    }

    //求 选择面板 使用的数据
    calculateSelectPanelData(data) {
        data.forEach(d => {
            this.selectPanelList.push({
                type: d["type"],
                data: []
            });
        });

        this.selectPanelList.forEach(d => {
            data.forEach(m => {
                if (d["type"] === m["type"]) {
                    m.data.forEach(k => {
                        d["data"].push({
                            name: k,
                            isChecked: false
                        });
                    });
                }
            });
        });

        if (this.defaultSelectNum) {
            if (this.defaultSelectNum === -1) {
                //全选
                this.selectPanelList.forEach(d => {
                    d["data"].forEach(m => {
                        m["isChecked"] = true;
                    });
                });
            } else {
                // for (let i = 0; i < this.defaultSelectNum; i++) {   //最初
                //     this.selectPanelList[0]['data'][i]['isChecked'] = true;
                // }

                let j = 0;
                this.selectPanelList.forEach(d => {
                    d["data"].forEach(m => {
                        if (j < this.defaultSelectNum) {
                            j++;
                            m["isChecked"] = true;
                        } else {
                            return;
                        }
                    });
                });
            }
        }

        this.selectPanelList.forEach(d => {
            d["data"].forEach(m => {
                if (m["isChecked"]) {
                    this.selectedList.push(m["name"]);
                }
            });
        });

        this.defaultSelectList.emit(this.selectedList);
        this.reGetData();
        this.confirmSelects = [...this.selectedList];
    }

    //选择面板 选择
    selectClick(item) {
        item["isChecked"] = !item["isChecked"];

        this.selectedList = [];

        this.selectPanelList.forEach(d => {
            d["data"].forEach(m => {
                if (m["isChecked"]) {
                    this.selectedList.push(m["name"]);
                }
            });
        });
    }

    //选择面板 确定
    selectConfirm() {
        this.confirmSelects = [...this.selectedList];
        this.selectConfirmEmit.emit(this.selectedList);
        // this.isShowSelectPanel=false;
    }

    //显示隐藏选择面板
    showSelectPanel() {
        this.isShowSelectPanel = !this.isShowSelectPanel;
        this.selectPanelList.forEach(d => {
            d["data"].forEach(k => {
                k["isChecked"] = false;
                this.confirmSelects.forEach(m => {
                    if (k["name"] === m) {
                        k["isChecked"] = true;
                    }
                });
            });
        });

        setTimeout(() => {
            this.scrollHeight();
        }, 30);
    }

    /**
     * 获取表格数据
     */
   getTableData() {
    return new Promise((resolve, reject) => {
        this.isLoading=true;
        this.ajaxService
            .getDeferData({
                url: this.tableUrl,
                data: this.apiEntity
            })
            .subscribe(
                (data: any) => {
                    if (
                        data.status == "0" &&
                        (data.data.length == 0 ||
                            $.isEmptyObject(data.data) ||
                            ("rows" in data.data && !data.data["rows"].length))
                    ) {
                        this.tableError = "nodata";
                        if (!this.chartUrl) this.chartError = "nodata";
                    } else if (data.status == "-1") {
                        this.tableError = "error";
                        if (!this.chartUrl) this.chartError = "error";
                    } else if (data.status == "-2") {
                        this.tableError = "dataOver";
                        if (!this.chartUrl) this.chartError = "dataOver";
                    } else {
                        this.tableError = "";
                        this.tableData = data.data;

                        if (this.tableData.total) {
                            if (this.tableData.total != this.total){
                                this.apiEntity["pageIndex"] = 1;
                            }
                            this.total = this.tableData.total;
                        }

                        if(this.isFilter){
                            let arr=[];
                            this.tableData.baseThead.slice(1).forEach(val => {
                                arr = val.children.length
                                    ? arr.concat(val.children)
                                    : arr.concat(val);
                            });
                            this.tbodyOutFirstCol = arr;
                            let tempObj = this.computedTheadWidth(this.tableData.baseThead);
                            this.widthConfig = tempObj["widthConfig"];
                            this.twoLevelHead = tempObj["twoLevelHead"];
                            // 根据表头生成sortmap
                            this.generatorSortMap();

                            if(this.isErrorDelete){ // 如果是在无数据或者系统错误的情况下 删除了筛选条件 表格获取数据初始化以后就需要重新应用之前的筛选状态
                                setTimeout(()=>{
                                    //如果表之前是错误的状态 筛选组件需要重新应用之前的状态
                                    this.apiEntity['searchList'].forEach(v=>{
                                        this._filterWithoutRequest(v['filterName'],v['filterNamezh'],v['searchType'],v['filterType'],v['valueOne'],v['valueTwo'])
                                    })
                                    this.isErrorDelete = false;
                                },30)
                            }
                        }

                        if (!this.chartUrl) {
                            this.chartError = "";
                            this.chartData = data.data;
                            if (
                                this.chartTypeData &&
                                this.chartTypeData.length
                            ) {
                                this.drawChart(this.chartData, this.chartType);
                            } else {
                                this.drawChart(
                                    this.chartData,
                                    (this.chartType = null)
                                );
                            }
                        }

                    }
                   resolve(data);
                },
                error => {
                    this.tableError = error;
                    if (!this.chartUrl) {
                        this.chartError = error;
                    }
                    reject(error)
                }
            );
    })
    }

    getTableDataThen(){
        //获取数据后关闭加载状态
        this.getTableData().then((data)=>{
            this.isLoading=false;
        })
    }

    //分页
    pageIndexChange(){
        this.getTableDataThen();
    }

    pageSizeChange() {
        this.apiEntity["pageIndex"] = 1;
        this.getTableDataThen();
    }

    /**
     * 获取图数据（复杂图的api与表api不是同一个）
     */
    getChartData() {
       return new Promise((resolve,reject)=>{
           this.isLoading=true;
           this.ajaxService
               .getDeferData({
                   url: this.chartUrl,
                   data: this.apiEntity
               })
               .subscribe(
                   (data: any) => {
                       if ( data.status == "0" && (data.data.length == 0 || $.isEmptyObject(data.data)) ) {
                           this.chartError = "nodata";
                       } else if (data.status == "0" && "flag" in data["data"]) {
                               if (!data["data"]["flag"]) {
                                   this.chartError = "curNodata";
                               } else {
                                   this.getChartThen(data);
                               }
                       } else if (data.status == "-1") {
                           this.chartError = "error";
                       } else if (data.status == "-2") {
                           this.chartError = "dataOver";
                       } else {
                               this.getChartThen(data);
                       }

                       resolve(data);
                   },
                   error => {
                       this.chartError = error;
                       reject(error)
                   }
               );
       })
    }

    getChartThen(data) {
        this.chartError = "";
        this.chartData = data.data;
        if (this.chartTypeData && this.chartTypeData.length) {
            this.drawChart(this.chartData, this.chartType);
        } else {
            this.drawChart(this.chartData, (this.chartType = null));
        }

    }

    drawChart(data, type) {
        let then = ()=>{
            if (type) {
                this.drawChartEmit.emit({
                    data: data,
                    type: type
                });
            } else {
                this.drawChartEmit.emit(data);
            }
        }
        if(document.querySelector(`#${this.chartId}`)){
            then();
        }else{
            let timer = null;
            clearInterval(timer);
            timer = setInterval(()=>{
                if(document.querySelector(`#${this.chartId}`)){
                    then();
                    clearInterval(timer);
                }
            },100)
        }
    }

    redraw() {
        if (this.chartTypeData && this.chartTypeData.length) {
            this.drawChart(this.chartData, this.chartType);
        } else {
            this.drawChart(this.chartData, (this.chartType = null));
        }
    }

    reGetData() {
        let promise1,promise2;
        if (this.tableUrl) {
            promise1 = this.getTableData();
        }
        if (this.chartUrl) {
            promise2 = this.getChartData();
        }

        Promise.all([promise1,promise2]).then(arr=>{
            this.isLoading=false;
        },err=>{
            console.log(err);
        })
     }

    //单多选按钮改变状态时的事件：获取当前状态（单/多选）
    getSelectModule() {
        this.isMultiSelectChange.emit(this.isMultiSelect);
    }

    //多选确定
    multipleConfirm() {
        this.multipleConfirmEmit.emit();
    }

    //下拉框change
    SelectChange(key, value) {
        this.apiEntity[key] = value;
        this.reGetData();
    }

    // 刷新
    handlerRefresh() {
        this.refresh.emit();
        if (!this.chartUrl || (this.chartUrl && this.isShowTable)) {
            this.getTableDataThen();
        } else if (this.chartUrl && !this.isShowTable) {
            this.getChartData().then((data)=>{
                this.isLoading=false;
            });
        }
    }
}
