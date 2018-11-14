import { MessageService } from "./../../super/service/messageService";
import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { fromEvent } from "rxjs";
declare const $: any;
declare const d4: any;
@Component({
    selector: "app-layout1",
    templateUrl: "./layout1.component.html",
    styles: []
})
export class Layout1Component implements OnInit,AfterViewInit {
    // 表格高度相关
    @ViewChild("left") left;
    @ViewChild("right") right;
    @ViewChild("func") func;
    @ViewChild("tableSwitchChart") tableSwitchChart;

    switch: boolean = false;
    tableUrl: string;
    chartUrl: string;
    tableEntity: object = {
        LCID: sessionStorage.getItem("LCID"),
        sample: "",
        compare: ""
    };

    pageEntity: object = {
        pageSize: 20
    };

    sampleList: string[] = [];
    compareList: string[] = [];

    chart: any;
    isMultiSelect: boolean;
    selectedData: object[] = [];

    tableHeight = 0;
    color = "red"; // 默认颜色
    legendIndex = 0; // 修改颜色的时候 需要保存点击的图例的索引 后面设置颜色会用到
    show = false; // 是否显示颜色选择器
    constructor(private message: MessageService) {}

    ngOnInit() {
        this.isMultiSelect = false;
        this.tableUrl = "http://localhost:8086/tableSwitchChart";
        this.chartUrl = "http://localhost:8086/scatter";

        this.sampleList = [
            "HBRR1",
            "HBRR2",
            "HBRR3",
            "HBRR4",
            "uBRR1",
            "uBRR2",
            "uBRR3",
            "uBRR4"
        ];
        this.compareList = [
            "com1",
            "com2",
            "com3",
            "com4",
            "compare1",
            "compare2",
            "compare3",
            "compare4"
        ];

        this.tableEntity["sample"] = this.sampleList[0];
        this.tableEntity["compare"] = this.compareList[0];

        // 订阅windowResize 重新计算表格滚动高度
        this.message.getResize().subscribe(res => {
            if (res["message"] === "resize") this.computedTableHeight();
            // 基础图需要重画
            this.redrawChart(this.left.nativeElement.offsetWidth * 0.9);
        });
    }

    ngAfterViewInit(){
        setTimeout(()=>{
            this.computedTableHeight();
        },0)
    }

    handlerColorChange(color){
        this.chart.setColor(color, this.legendIndex);
        this.chart.redraw();
    }

    switchChange(status) {
        this.switch = status;
        // 基础图需要重画
        let timer = null;
        if(timer) clearTimeout(timer);
        timer = setTimeout(()=>{
            this.redrawChart(this.left.nativeElement.offsetWidth * 0.9);
        },300)
    }

    computedTableHeight() {
        this.tableHeight =
            this.right.nativeElement.offsetHeight -
            this.func.nativeElement.offsetHeight;
    }

    onSelectChange1() {
        this.tableSwitchChart.SelectChange(
            "sample",
            this.tableEntity["sample"]
        );
    }

    onSelectChange2() {
        this.tableSwitchChart.SelectChange(
            "compare",
            this.tableEntity["compare"]
        );
    }

    redrawChart(width,height?){

        this.isMultiSelect = false;
        this.chart.setChartSelectModule('single');

        let options = this.chart.getOptions();
        options['chart']['width'] = width;
        options['chart']['height'] = height || options['chart']['height'];
        this.chart.setOptions(options);
        this.chart.redraw();
    }

    drawChart(data) {
        let _self = this;
        let config: object = {
            chart: {
                title: "散点图",
                dblclick: function(event) {
                    var name = prompt("请输入需要修改的标题", "");
                    if (name) {
                        this.setChartTitle(name);
                        this.updateTitle();
                    }
                },
                enableChartSelect: true,
                // selectedModule:"",
                onselect: d => {
                    this.selectedData = d;
                },
                el: "#chartId222",
                type: "scatter",
                width: _self.left.nativeElement.offsetWidth * 0.9,
                height: 600,
                radius: 3,
                hoverRadius: 6,
                custom: ["height", "weight", "gender"],
                data: data
            },
            axis: {
                x: {
                    title: "Height(CM)",
                    dblclick: function(event) {
                        var name = prompt("请输入需要修改的标题", "");
                        if (name) {
                            this.setXTitle(name);
                            this.updateTitle();
                        }
                    }
                },
                y: {
                    title: "Weight(KG)",
                    dblclick: function(event) {
                        var name = prompt("请输入需要修改的标题", "");
                        if (name) {
                            this.setYTitle(name);
                            this.updateTitle();
                        }
                    }
                }
            },
            legend: {
                show: true,
                position: "right",
                data: ["female", "male"],
                dblclick: (d, index) => {
                    this.color = d[0].getAttribute("fill");
                    this.show = true;
                    this.legendIndex = index;
                }
            },
            tooltip: function(d) {
                return (
                    "<span>身高：" +
                    d.height +
                    "</span><br><span>体重：" +
                    d.weight +
                    "</span>"
                );
            }
        };

        this.chart = new d4().init(config);
    }

    //单、多选change
    multiSelectChange() {
        if (this.isMultiSelect) {
            this.chart.selectedModule = "multiple";
        } else {
            this.chart.selectedModule = "single";
        }
        this.chart.setChartSelectModule(this.chart.selectedModule);
    }

    //多选确定
    multipleConfirm() {
        console.log(this.selectedData);
    }
}
