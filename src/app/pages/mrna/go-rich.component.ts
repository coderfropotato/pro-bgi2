import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

declare const d4: any;
declare const d3: any;

@Component({
    selector: "app-goRich",
    templateUrl: "./go-rich.component.html"
})

export class GoRichComponent implements OnInit {
    @ViewChild('tableSwitchChart') tableSwitchChart;

    tableUrl: string;
    chartUrl: string;
    tableEntity: object = {
        "LCID": sessionStorage.getItem("LCID"),
        "sample": "",
        "compare": "",
        "samples": []
    };

    sampleList: string[] = [];
    compareList: string[] = [];

    chart: any;
    isMultiSelect: boolean;
    selectedData: object[] = [];

    color = 'red'; // 默认颜色
    legendIndex = 0; // 修改颜色的时候 需要保存点击的图例的索引 后面设置颜色会用到
    show = false;  // 是否显示颜色选择器

    selectPanelUrl: string;
    selectPanelEntity: object = {
        "LCID": sessionStorage.getItem("LCID")
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.isMultiSelect = false;
        this.tableUrl = "http://localhost:8086/tableSwitchChart";
        this.chartUrl = "http://localhost:8086/scatter";

        this.sampleList = ["HBRR1", "HBRR2", "HBRR3", "HBRR4", "uBRR1", "uBRR2", "uBRR3", "uBRR4"];
        this.compareList = ["com1", "com2", "com3", "com4", "compare1", "compare2", "compare3", "compare4"];

        this.tableEntity['sample'] = this.sampleList[0];
        this.tableEntity["compare"] = this.compareList[0];

        this.selectPanelUrl = 'http://localhost:8086/samples';
    }

    onSelectChange1() {
        this.tableSwitchChart.SelectChange('sample', this.tableEntity["sample"]);
    }

    onSelectChange2() {
        this.tableSwitchChart.SelectChange('compare', this.tableEntity["compare"]);
    }

    handlerColorChange(color) {
        this.chart.setColor(color, this.legendIndex);
        this.chart.redraw();
    }

    drawChart(data) {
        let config: object = {
            chart: {
                title: "散点图",
                dblclick: function (event) {
                    var name = prompt("请输入需要修改的标题", "");
                    if (name) {
                        this.setChartTitle(name);
                        this.updateTitle();
                    }
                },
                enableChartSelect: true,
                // selectedModule:"",
                onselect: (d) => {
                    this.selectedData = d;
                },
                el: "#chartId222",
                type: "scatter",
                width: 1000,
                height: 400,
                radius: 3,
                hoverRadius: 6,
                custom: ["height", "weight", "gender"],
                data: data
            },
            axis: {
                x: {
                    title: "Height(CM)",
                    dblclick: function (event) {
                        var name = prompt("请输入需要修改的标题", "");
                        if (name) {
                            this.setXTitle(name);
                            this.updateTitle();
                        }
                    }
                },
                y: {
                    title: "Weight(KG)",
                    dblclick: function (event) {
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
                    this.color = d3.select(d).attr('fill');
                    this.show = true;
                    this.legendIndex = index;
                }
            },
            tooltip: function (d) {
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
    }

    //默认选中数据
    defaultSelectList(data) {
        this.tableEntity['samples'] = data;
    }

    //选择面板 确定
    selectConfirm(data) {
        this.tableEntity['samples'] = data;
        this.tableSwitchChart.reGetData();
    }

}

