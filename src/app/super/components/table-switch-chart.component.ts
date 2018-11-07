import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { AjaxService } from "../../super/service/ajaxService";

declare const $: any;

@Component({
    selector: 'app-table-switch-chart',
    templateUrl: './table-switch-chart.component.html',
    styles: []
})
export class TableSwitchChartComponent implements OnInit {
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
    @Output() isMultiSelectChange: EventEmitter<any> = new EventEmitter(); //单、多选change
    //多选确定
    @Output() multipleConfirmEmit: EventEmitter<any> = new EventEmitter();

    @Output() drawChartEmit: EventEmitter<any> = new EventEmitter();

    isShowTable: boolean = false;
    tableData: object;
    error: string;
    isLoading: boolean = false;

    accuracyList: object[] = [];
    accuracy: number = -1;

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
        if (!this.isOnlyChart && this.tableUrl) {
            this.getTableData();
        }
        if (this.chartUrl) {
            this.getChartData();
        }
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
        if (!this.isOnlyChart && this.tableUrl) {
            this.getTableData();
        }
        if (this.chartUrl) {
            this.getChartData();
        }
    }

}
