import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { AjaxService } from "../../super/service/ajaxService";

declare const $: any;

@Component({
    selector: 'app-table-switch-chart',
    templateUrl: './table-switch-chart.component.html',
    styles: [
        `
        .textError{
            color:"red";
            font-size:14px;
        }
        `
    ]
})
export class TableSwitchChartComponent implements OnInit {
    @ViewChild("tableContent") tableContent;

    @Input() isOnlyChart: boolean; //可选，此组件是否只存在图；true：图，false：图+表
    @Input() tableUrl: string;  //表格api地址；isOnlyChart=true时可不传
    @Input() chartUrl: string; //可选，图api地址；若存在表示图api与表api不一致，适用于图复杂（需要单独请求api）场景。isOnlyChart=true则为必选。

    @Input() apiEntity: object;  //api请求参数

    @Input() id: string;

    @Input() chartId: string;
    @Input() chartName: any;

    @Input() isShowAccuracy: boolean; //可选，是否有精度下拉选择

    @Input() selectTemplate: TemplateRef<any>; //可选，下拉框模块

    @Input() setTemplate: TemplateRef<any>; //可选，设置模块

    @Input() isHasMultiSelect: boolean; //可选，图是否有单选、多选
    // 双向绑定:变量名x，fn命名规范xChange
    @Input() isMultiSelect: boolean; //是否是多选
    @Input() flex: boolean; // 是否flex布局
    @Output() isMultiSelectChange: EventEmitter<any> = new EventEmitter(); //单、多选change
    //多选确定
    @Output() multipleConfirmEmit: EventEmitter<any> = new EventEmitter();

    @Output() drawChartEmit: EventEmitter<any> = new EventEmitter();

    /**
     * selectPanelUrl 、selectPanelEntity 或 selectPanelData，二者选一；
        selectPanelUrl 、selectPanelEntity：选择面板需请求api获取，返回数据结构是string[];
        selectPanelData：从local或session中直接拿到储存的数据，数据结构是string[];
     */
    @Input() selectPanelUrl: string;  //可选，选择面板请求api的url
    @Input() selectPanelEntity: object;  //可选，参数
    @Input() selectPanelData: string[]; //可选，选择面板的数据
    @Input() defaultSelectNum: number; //可选， 选择面板 默认选中个数
    @Output() selectConfirmEmit:EventEmitter<any> = new EventEmitter(); // 选择面板 确定

    scroll: object = { y: '400px' };
    isShowTable: boolean = false;
    tableData: any;
    chartData: any;
    error: string;
    isLoading: boolean = false;

    accuracyList: object[] = [];
    accuracy: number = -1;

    selectPanelList: object[] = [];
    isHasSelectPanel: boolean;
    selectedList: string[] = [];

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
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

        this.reGetData();

        if (this.selectPanelData) {
            this.isHasSelectPanel = true;
            this.calculateSelectPanelData(this.selectPanelData);
        } else if (this.selectPanelUrl && this.selectPanelEntity) {
            this.isHasSelectPanel = true;
            this.getSelectPanelList();
        } else {
            this.isHasSelectPanel = false;
        }

    }

    // 初始化计算表滚动的高度
    ngAfterViewInit() {
        setTimeout(() => {
            this.scroll["y"] = (this.tableContent.nativeElement.offsetHeight - 37) + 'px';
        }, 200);
    }

    //获取选择面板数据
    getSelectPanelList() {
        this.ajaxService
            .getDeferData(
                {
                    url: this.selectPanelUrl,
                    data: this.selectPanelEntity
                }
            )
            .subscribe(
                (data: any) => {
                    if (data.data.length == 0 || $.isEmptyObject(data.data)) {
                        this.selectPanelList = [];
                    } else if (data.status != 0) {
                        this.selectPanelList = [];
                    } else {
                        let selects = data.data;
                        this.calculateSelectPanelData(selects);
                    }

                },
                error => {
                    this.error = error;
                }
            )
    }

    //求 选择面板 使用的数据
    calculateSelectPanelData(data) {
        if (this.defaultSelectNum) {
            for (let i = 0; i < this.defaultSelectNum; i++) {
                this.selectPanelList[i]['isChecked'] = true;
            }
        }else{
            data.forEach(d => {
                this.selectPanelList.push({
                    name: d,
                    isChecked: false
                })
            });

        }
    }

    //选择面板 选择
    selectClick(item) {
        item['isChecked'] = !item['isChecked'];
        if (item['isChecked']) {
            this.selectedList.push(item);
        }
    }

    //选择面板 确定
    selectConfirm() {
        this.selectConfirmEmit.emit();
    }

    /**
     * 获取表格数据
     */
    getTableData() {
        this.isLoading = true;
        this.ajaxService
            .getDeferData(
                {
                    url: this.tableUrl,
                    data: this.apiEntity
                }
            )
            .subscribe(
                (data: any) => {
                    if (data.data.length == 0 || $.isEmptyObject(data.data)) {
                        this.error = "nodata";
                    } else if (data.status != 0) {
                        this.error = "error";
                    } else {
                        this.error = "";
                        this.tableData = data.data;
                        if (!this.chartUrl) {
                            this.chartData = data.data;
                            this.drawChart(data.data);
                        }
                    }
                    this.isLoading = false;

                },
                error => {
                    this.isLoading = false;
                    this.error = error;
                }
            )
    }

    /**
     * 获取图数据（复杂图的api与表api不是同一个）
     */
    getChartData() {
        this.isLoading = true;
        this.ajaxService
            .getDeferData(
                {
                    url: this.chartUrl,
                    data: this.apiEntity
                }
            )
            .subscribe(
                (data: any) => {
                    if (data.data.length == 0 || $.isEmptyObject(data.data)) {
                        this.error = "nodata";
                    } else if (data.status != 0) {
                        this.error = "error";
                    } else {
                        this.error = "";
                        this.chartData = data.data;
                        this.drawChart(data.data);
                    }
                    this.isLoading = false;
                },
                error => {
                    this.isLoading = false;
                    this.error = error;
                }
            )
    }

    drawChart(data) {
        this.drawChartEmit.emit(data);
    }

    redraw() {
        this.drawChart(this.chartData);
    }

    reGetData() {
        if (!this.isOnlyChart && this.tableUrl) {
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
}
