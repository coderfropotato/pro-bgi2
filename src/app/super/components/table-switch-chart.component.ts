import { Component, OnInit, Input, ViewChild, TemplateRef, Output, EventEmitter, HostListener } from '@angular/core';
import { AjaxService } from "../../super/service/ajaxService";
import { MessageService } from '../service/messageService';

declare const $: any;

@Component({
    selector: 'app-table-switch-chart',
    templateUrl: './table-switch-chart.component.html',
    styles: []
})
export class TableSwitchChartComponent implements OnInit {
    @ViewChild("tableContent") tableContent;
    @ViewChild('selectPanel') selectPanel;
    @ViewChild('tableChartContent') tableChartContent;

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

    @Input() isVennTable:boolean=false;//为true时候venn/unsetR图的表，false时候是普通表
    // 双向绑定:变量名x，fn命名规范xChange
    @Input() isMultiSelect: boolean; //是否是多选
    @Output() isMultiSelectChange: EventEmitter<any> = new EventEmitter(); //单、多选change
    //多选确定
    @Output() multipleConfirmEmit: EventEmitter<any> = new EventEmitter();

    @Output() drawChartEmit: EventEmitter<any> = new EventEmitter();

    @Input() flex: boolean; // 是否flex布局

    /**
     * selectPanelUrl 、selectPanelEntity 或 selectPanelData，二者选一传入；
        selectPanelUrl 、selectPanelEntity：选择面板需请求api获取，返回数据结构是object[]={type:'sample',data:['sample1','sample2']};
        selectPanelData：从本地直接拿到储存的数据，数据结构是object[]={type:'sample',data:['sample1','sample2']};
     */
    @Input() selectPanelUrl: string;  //选择面板请求api的url
    @Input() selectPanelEntity: object;  //请求api的参数

    @Input() selectPanelData: object[]; //选择面板的数据

    @Input() defaultSelectNum: number; //可选， 选择面板数据默认选中个数; 若不传或0则全不选; -1表示全选
    @Output() defaultSelectList: EventEmitter<any> = new EventEmitter(); //默认选中的数据

    @Output() selectConfirmEmit: EventEmitter<any> = new EventEmitter(); // 选择面板 确定

    @Input() defaultSetUrl:string;
    @Input() defaultSetEntity:object;
    @Output() defaultSet:EventEmitter<any> = new EventEmitter();

    // 刷新
    @Output() refresh:EventEmitter<any> = new EventEmitter();

    scroll: object = { y: '400px' };
    isShowTable: boolean = false;
    tableData: any;
    chartData: any;
    error: string;
    isLoading: boolean = false;

    accuracyList: object[] = [];
    accuracy: number = -1;

    selectPanelList: object[] = [];  //选择面板数据
    isHasSelectPanel: boolean;
    selectedList: string[] = [];  //选中的数据

    constructor(
        private ajaxService: AjaxService,
        private messageService: MessageService
    ) {

        this.messageService.getResize().subscribe(res => {
            if (res["message"] === "resize") this.scrollHeight();
        });
    }

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

        if (this.selectPanelData) {
            this.isHasSelectPanel = true;
            this.calculateSelectPanelData(this.selectPanelData);
        } else if (this.selectPanelUrl && this.selectPanelEntity) {
            this.isHasSelectPanel = true;
            this.getSelectPanelList();
        } else {
            this.isHasSelectPanel = false;
            if(this.defaultSetUrl && this.defaultSetEntity){
                this.getDefaultSet();
            }else{
                this.reGetData();
            }
        }


    }

    //获取默认值
    getDefaultSet(){
        this.ajaxService
        .getDeferData({
            url:this.defaultSetUrl,
            data:this.defaultSetEntity
        })
        .subscribe(
            (data:any)=>{
                if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                    return;
                } else if (data.status === "-1") {
                    return;
                } else if (data.status === "-2") {
                    return;
                } else {
                    let defaultSetData=data.data;
                    this.defaultSet.emit(defaultSetData);
                    this.reGetData();
                }
            }
        )
    }


    // 初始化计算表滚动的高度
    ngAfterViewInit() {
        setTimeout(() => {
            this.scrollHeight();
        }, 200);
    }

    scrollHeight() {
        try {
            let tableChartContentH = this.tableChartContent.nativeElement.offsetHeight;
            let scrollH = (tableChartContentH - 38) + 'px';
            this.scroll['y'] = scrollH;
        } catch (error) {
        }
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
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.selectPanelList = [];
                    } else if (data.status != "0") {
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
        data.forEach(d => {
            this.selectPanelList.push({
                type: d['type'],
                data: []
            })
        });

        this.selectPanelList.forEach((d) => {
            data.forEach((m) => {
                if (d['type'] === m['type']) {
                    m.data.forEach((k) => {
                        d['data'].push({
                            name: k,
                            isChecked: false
                        })
                    })
                }
            })
        })

        if (this.defaultSelectNum) {
            if (this.defaultSelectNum === -1) { //全选
                this.selectPanelList.forEach(d => {
                    d['data'].forEach(m => {
                        m['isChecked'] = true;
                    })
                })
            } else {
                for (let i = 0; i < this.defaultSelectNum; i++) {
                    this.selectPanelList[0]['data'][i]['isChecked'] = true;
                }
            }
        }

        this.selectPanelList.forEach(d => {
            d['data'].forEach(m => {
                if (m['isChecked']) {
                    this.selectedList.push(m['name']);
                }
            })
        })

        this.defaultSelectList.emit(this.selectedList);
        this.reGetData();
    }

    //选择面板 选择
    selectClick(item) {
        item['isChecked'] = !item['isChecked'];

        this.selectedList = [];

        this.selectPanelList.forEach(d => {
            d['data'].forEach(m => {
                if (m['isChecked']) {
                    this.selectedList.push(m['name']);
                }
            })
        })
    }

    //选择面板 确定
    selectConfirm() {
        this.selectConfirmEmit.emit(this.selectedList);
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
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.error = "nodata";
                    } else if (data.status === "-1") {
                        this.error = "error";
                    } else if (data.status === "-2") {
                        this.error = "dataOver";
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
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.error = "nodata";
                    } else if (data.status === "-1") {
                        this.error = "error";
                    } else if (data.status === "-2") {
                        this.error = "dataOver";
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

    // 刷新
    handlerRefresh(){
        this.refresh.emit();
        if(!this.chartUrl || (this.chartUrl && this.isShowTable)){
            this.getTableData();
        }else if(this.chartUrl && !this.isShowTable){
            this.getChartData();
        }
    }
}
