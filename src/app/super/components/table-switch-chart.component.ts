import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
    HostListener
} from "@angular/core";
import { AjaxService } from "../../super/service/ajaxService";
import { MessageService } from "../service/messageService";
import { StoreService } from "./../service/storeService";
import { TranslateService } from "@ngx-translate/core";

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

    @Input() tableUrl: string; //表格api地址；
    @Input() chartUrl: string; //可选，图api地址；若存在表示图api与表api不一致，适用于图复杂（需要单独请求api）场景。

    @Input() apiEntity: object; //api请求参数

    @Input() isBigTable: boolean; //表是否为大表（有分页）

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
    @Input() chartDescContent:string;  //  说明的内容；传入此字段说明有图的说明
    // 表说明
    @Input() isShowTableDesc:boolean=false;
    @Input() tableDescTitle:string;
    @Input() tableDescContent:string;

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

    constructor(
        private ajaxService: AjaxService,
        private messageService: MessageService,
        private storeService: StoreService,
        private translate: TranslateService
    ) {
        this.messageService.getResize().subscribe(res => {
            this.scrollHeight();
        });

        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        if (this.chartTypeData && this.chartTypeData.length) this.chartType = this.chartTypeData[0]["key"];

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

        if (this.setDataUrl) {
            this.getSetData();
        }else if(this.localSetData){
            this.setData.emit(this.localSetData);
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
        this.isShowTable = true;
        this.showChange.emit(this.isShowTable);
        setTimeout(() => {
            this.scrollHeight();
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

    scrollHeight() {
        try {
            let tableChartContentH = this.tableChartContent.nativeElement .offsetHeight;
            let bottomPageH = this.tableBottom
                ? this.tableBottom.nativeElement.offsetHeight
                : 0;
            let scrollH: any = tableChartContentH - 38 - bottomPageH + "px";
            if (this.isBigTable) {
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
        this.isLoading = true;
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

                        if (this.tableData.total) {
                            this.total = this.tableData.total;
                        }
                    }
                    this.isLoading = false;
                },
                error => {
                    this.isLoading = false;
                    this.tableError = error;
                    if (!this.chartUrl) this.chartError = error;
                }
            );
    }

    pageSizeChange() {
        this.apiEntity["pageIndex"] = 1;
        this.getTableData();
    }

    /**
     * 获取图数据（复杂图的api与表api不是同一个）
     */
    getChartData() {
        this.isLoading = true;
        this.ajaxService
            .getDeferData({
                url: this.chartUrl,
                data: this.apiEntity
            })
            .subscribe(
                (data: any) => {
                    if (
                        data.status == "0" &&
                        (data.data.length == 0 || $.isEmptyObject(data.data))
                    ) {
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

                    this.isLoading = false;
                },
                error => {
                    this.isLoading = false;
                    this.chartError = error;
                }
            );
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
        if (type) {
            this.drawChartEmit.emit({
                data: data,
                type: type
            });
        } else {
            this.drawChartEmit.emit(data);
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
        if (this.tableUrl) {
            this.getTableData();
        }
        if (this.chartUrl) {
            this.getChartData();
        }
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
            this.getTableData();
        } else if (this.chartUrl && !this.isShowTable) {
            this.getChartData();
        }
    }
}
