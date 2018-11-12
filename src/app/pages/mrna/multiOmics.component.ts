import { Component, OnInit, ViewChild } from '@angular/core'
import { AjaxService } from 'src/app/super/service/ajaxService';
import { GlobalService } from 'src/app/super/service/globalService';
import { LoadingService } from 'src/app/super/service/loadingService';

declare const d3: any;
declare const $: any;

@Component({
    selector: 'app-multiOmics',
    templateUrl: './multiOmics.component.html'
})

export class multiOmicsComponent implements OnInit {
    @ViewChild('multiOmicsChart') multiOmicsChart;

    isMultiSelect: boolean = false;
    selectedColumn: object[] = []; //选中的柱状图柱子
    selectedBox: object[] = [];  //选中的箱线图箱体

    colors: string[] = [];
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    isShowColorPanel: boolean = false;

    chartEntity: object;
    chartUrl: string;

    constructor(
        private ajaxService: AjaxService,
        private globalService: GlobalService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.colors = ["#3195BC", "#FF6666", "#009e71", "#FF9896", "#F4CA60", "#6F74A5", "#C49C94", "#3b9b99", "#FACA0C", "#F3C9DD"];
        this.chartEntity = {
            "LCID": sessionStorage.getItem('LCID')
        }
        this.chartUrl = "http://localhost:8086/multiOmics";
        // this.getData();
    }

    // getData() {
    //     this.loadingService.open("#multiOmics");
    //     this.ajaxService
    //         .getDeferData(
    //             {
    //                 url: "http://localhost:8086/multiOmics",
    //                 data: {}
    //             }
    //         )
    //         .subscribe(
    //             (data: any) => {
    //                 this.drawChart(data);
    //                 this.loadingService.close("#multiOmics");
    //             },
    //             error => {
    //                 this.loadingService.close("#multiOmics");
    //                 console.log(error);
    //             }
    //         )
    // }

    drawChart(data) {
        d3.select("#multiOmicsSvg svg").remove();
        let that = this;

        //data
        let column = data.column;
        let columnLength = column.length;
        let boxplot = [];
        if (data.boxplot && data.boxplot.length) {
            boxplot = data.boxplot;
        }
        let boxplotLength = boxplot.length;

        // set width height space
        let eachChartHeight = 0;  //每种图主体的height
        const chartSpace = 10;  // 每种图之间的间距
        let height = 0;   //总图主体的总高度
        let width = 0;  //总图主体的总宽度

        let eachTypeWidth = 0;  //每个图中每种类型的width
        const typeSpace = 10;  //图中每种类型的间距
        let rectWidth = 0;   //每个矩形width
        const rectSpace = 5;  // 每个矩形的间距

        // 图例
        let legendRectW = 16, // 小矩形宽
            legendRectH = 16; // 小矩形高
        let legend_chart_Space = 24, //图例与图距离
            legendBottom = 6, //图例上下之间的距离
            legend_text_space = 4; //图例矩形与文字之间的距离

        //根据每组柱子数量决定柱子宽度
        let widthScale = d3.scaleLinear().domain([1, 60]).range([50, 8]).clamp(true);

        //calculate min max
        let allXTexts = [];
        let allYColumn = [];

        let colors = [];
        let temp = 0
        column.forEach((d, i) => {
            colors.push(this.colors[i]);

            let rectsLength = d.data.length;
            rectWidth = widthScale(rectsLength);
            eachTypeWidth = rectsLength * rectWidth + (rectsLength + 1) * rectSpace;

            temp += eachTypeWidth;
            width = temp + typeSpace * (columnLength - 1);

            d.transX = (temp - eachTypeWidth) + i * typeSpace;
            d.w = rectWidth;

            d.data.forEach(m => {
                m.w = rectWidth;
                m.type = d.type;
                m['checked'] = false;
                allXTexts.push(m.x);
                allYColumn.push(m.y);
            })
        });

        height = width;

        //判断极值
        if (!boxplotLength) {
            if (height >= 600) {
                height = 600;
            }
        } else {
            if (height >= 1200) {
                height = 1200;
            }
        }

        eachChartHeight = (height - boxplotLength * chartSpace) / (boxplotLength + 1);

        //计算max
        let typeTextMax = d3.max(column, d => d.type.length);

        let xmaxLength = d3.max(allXTexts, d => d.length);

        let yColumnMax = d3.max(allYColumn, d => Math.ceil(d));

        let margin = {
            left: 50,
            right: 50,
            top: 50,
            bottom: xmaxLength * 4 + 20
        }

        let legendWidth = legendRectW + legend_text_space + typeTextMax * 7;

        // svg width height
        let totalWidth = margin.left + width + legend_chart_Space + legendWidth + margin.right,
            totalHeight = height + margin.top + margin.bottom;

        // 比例尺
        let yColumnScale = d3.scaleLinear()
            .range([eachChartHeight, 0]).domain([0, yColumnMax]).nice();

        let yColumnAxis = d3.axisLeft(yColumnScale).ticks(5).tickFormat(d3.format("1"));

        let colorScale = d3.scaleOrdinal().range(colors.map(function (d) { return d })).domain(column.map(function (d) { return d.type }));

        // svg
        let svg = d3.select("#multiOmicsSvg").append("svg").attr("width", totalWidth).attr("height", totalHeight);

        // column
        let column_g = svg.append("g").attr("class", "column").attr("transform", `translate(${margin.left},${margin.top + (eachChartHeight + chartSpace) * boxplotLength})`);

        // column x
        let xAxisColumn = column_g.append("g").attr("class", "xAxis-column")
            .attr("transform", `translate(0,${eachChartHeight})`);

        xAxisColumn.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width)
            .attr("y2", 0)
            .style("stroke", "#000000");

        // xAxisColumn.append("line")
        // .attr("x1", width - 1)
        // .attr("y1", 0)
        // .attr("x2", width - 1)
        // .attr("y2", 6)
        // .style("stroke", "#000000");

        // column y
        column_g.append("g").attr("class", "yAxis-column").call(yColumnAxis);

        // column y title
        column_g.append("g").attr("class", "yText-column")
            .attr("transform", `translate(-40,${eachChartHeight / 2})`)
            .append("text").attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("transform", `rotate(-90)`)
            .text("Number")

        // column rect
        let columns = column_g.selectAll(".columns")
            .data(column).enter()
            .append("g").attr("class", "columns")
            .attr("transform", m => `translate(${m.transX},0)`);

        columns.selectAll(".columnRect")
            .data(d => d.data).enter()
            .append("rect").attr("class", "columnRect")
            .attr("transform", (d, i) => `translate(${(i + 1) * rectSpace + i * d.w},${yColumnScale(d.y)})`)
            .attr("width", d => d.w)
            .attr("height", d => yColumnScale(0) - yColumnScale(d.y))
            .attr("fill", d => colorScale(d.type))
            .style("cursor", "pointer")
            .on("mouseover", d => {
                this.globalService.showPopOver(d3.event, d.y);
            })
            .on("mouseout", () => {
                this.globalService.hidePopOver();
            })
            .on("click", function (d) {
                if (that.isMultiSelect) { //多选
                    d['checked'] = !d['checked'];
                    if (d['checked']) {
                        d3.select(this).style("fill", "#FF4C06");
                        that.selectedColumn.push(d);
                    } else {
                        d3.select(this).style("fill", colorScale(d.type));
                    }

                    that.selectedColumn.forEach((m, i) => {
                        if (!m['checked']) {
                            that.selectedColumn.splice(i, 1);
                        }
                    })

                } else {  //单选
                    that.selectedColumn = [];

                    d3.select("#multiOmicsSvg svg").selectAll(".columnRect").nodes().forEach(v => {
                        $(v).css("fill", $(v).attr("fill"));
                    })
                    d3.select("#multiOmicsSvg svg").selectAll(".boxplotRect").nodes().forEach(v => {
                        $(v).css("fill", $(v).attr("fill"));
                    })
                    d3.select(this).style("fill", "#FF4C06");

                    column.forEach(m => {
                        m.data.forEach(n => {
                            n['checked'] = false;
                        })
                    })

                    boxplot.forEach(a => {
                        a.data.forEach(b => {
                            b.boxList.forEach(c => {
                                c['checked'] = false;
                            })
                        })
                    })

                    d['checked'] = true;
                    that.selectedColumn.push(d);
                    console.log(that.selectedColumn);
                }
            })

        // column x text
        columns.selectAll(".xAxisText")
            .data(d => d.data).enter()
            .append("text").attr("class", "xAxisText")
            .style("font-size", "10px")
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("transform", (d, i) => `translate(${(i + 1) * rectSpace + i * d.w + d.w / 2},${eachChartHeight + 6}) rotate(-45)`)
            .text(d => d.x);

        // boxplot
        if (boxplotLength) {
            boxplot.forEach((d, i) => {

                d.data.forEach(m => {

                    column.forEach(a => {
                        if (m.type === a.type) {
                            m.transX = a.transX;
                        }
                    })

                    m.boxList.forEach(t => {
                        t.type = m.type;
                        t['checked'] = false;
                        t.relation = d.relation;
                        column.forEach(b => {
                            if (t.type === b.type) {
                                t.w = b.w;
                            }
                        })

                    })
                })

                let boxplot_g = svg
                    .append("g").attr("class", "boxplot")
                    .attr("transform", `translate(${margin.left},${margin.top + (boxplotLength - 1 - i) * (eachChartHeight + chartSpace)})`);

                let yScaleBox = d3.scaleLinear().domain([0, d.yMax]).range([eachChartHeight, 0]).nice();
                let yAxisBox = d3.axisLeft(yScaleBox).ticks(5).tickFormat(d3.format("1"));

                // boxplot y
                boxplot_g.append("g").attr("class", "yAxis-boxplot").call(yAxisBox);

                // boxplot y title
                boxplot_g.append("g").attr("class", "yText-boxplot")
                    .attr("transform", `translate(-40,${eachChartHeight / 2})`)
                    .append("text").attr("font-size", "14px")
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .attr("transform", `rotate(-90)`)
                    .text(d.relation)

                // boxplot x
                let xAxisBox = boxplot_g.append("g").attr("class", "xAxis-boxplot")
                    .attr("transform", `translate(0,${eachChartHeight})`);

                xAxisBox.append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", width)
                    .attr("y2", 0)
                    .style("stroke", "#000000");

                //boxplots g
                let boxplots = boxplot_g.append("g").attr("class", "boxplots")
                    .selectAll(".typeBoxs")
                    .data(d.data).enter()
                    .append("g")
                    .attr("class", "typeBoxs")
                    .attr("transform", m => `translate(${m.transX},0)`)
                    .selectAll(".boxs")
                    .data(m => m.boxList).enter();

                // vertical line
                this._drawLline(boxplots, (k, i) => (i + 1) * rectSpace + i * k.w + k.w / 2, k => yScaleBox(k.box.high), (k, i) => (i + 1) * rectSpace + i * k.w + k.w / 2, k => yScaleBox(k.box.low));

                // high line
                this._drawLline(boxplots, (k, i) => (i + 1) * rectSpace + i * k.w + k.w / 4, k => yScaleBox(k.box.high), (k, i) => (i + 1) * rectSpace + i * k.w + 3 * k.w / 4, k => yScaleBox(k.box.high));

                // low line
                this._drawLline(boxplots, (k, i) => (i + 1) * rectSpace + i * k.w + k.w / 4, k => yScaleBox(k.box.low), (k, i) => (i + 1) * rectSpace + i * k.w + 3 * k.w / 4, k => yScaleBox(k.box.low));

                // rect
                boxplots
                    .append("rect")
                    .attr("class", "boxplotRect")
                    .attr("transform", (k, i) => `translate(${(i + 1) * rectSpace + i * k.w},${yScaleBox(k.box.y2)})`)
                    .attr("width", k => k.w)
                    .attr("height", k => Math.abs(yScaleBox(k.box.y2) - yScaleBox(k.box.y1)))
                    .attr("fill", k => colorScale(k.type))
                    .style("cursor", "pointer")
                    .on("mouseover", m => {
                        let text = `上限：${m.box.high}<br>上四分位数：${m.box.y2}<br>中位数：${m.box.median}<br>下四分位数：${m.box.y1}<br>下限：${m.box.low}`;
                        this.globalService.showPopOver(d3.event, text);
                    })
                    .on("mouseout", () => {
                        this.globalService.hidePopOver();
                    })
                    .on("click", function (m) {
                        if (that.isMultiSelect) { //多选
                            m['checked'] = !m['checked'];
                            if (m['checked']) {
                                d3.select(this).style("fill", "#FF4C06");
                                that.selectedBox.push(m);
                            } else {
                                d3.select(this).style("fill", colorScale(m.type));
                            }

                            that.selectedBox.forEach((n, k) => {
                                if (!n['checked']) {
                                    that.selectedBox.splice(k, 1);
                                }
                            })

                        } else {  //单选
                            that.selectedBox = [];

                            d3.select("#multiOmicsSvg svg").selectAll(".columnRect").nodes().forEach(v => {
                                $(v).css("fill", $(v).attr("fill"));
                            })
                            d3.select("#multiOmicsSvg svg").selectAll(".boxplotRect").nodes().forEach(v => {
                                $(v).css("fill", $(v).attr("fill"));
                            })
                            d3.select(this).style("fill", "#FF4C06");

                            column.forEach(k => {
                                k.data.forEach(n => {
                                    n['checked'] = false;
                                })
                            })
                            boxplot.forEach(a => {
                                a.data.forEach(b => {
                                    b.boxList.forEach(c => {
                                        c['checked'] = false;
                                    })
                                })
                            })
                            m['checked'] = true;
                            that.selectedBox.push(m);
                            console.log(that.selectedBox);
                        }
                    })

                //median line
                this._drawLline(boxplots, (k, i) => (i + 1) * rectSpace + i * k.w, k => yScaleBox(k.box.median), (k, i) => (i + 1) * rectSpace + i * k.w + k.w, k => yScaleBox(k.box.median));

                // scatter
                const radius = 3;
                boxplots.append("g").attr("class", "boxPoints")
                    .attr("transform", (k, i) => `translate(${(i + 1) * rectSpace + i * k.w + k.w / 2},0)`)
                    .selectAll(".allPoints")
                    .data(z => z.scatters).enter()
                    .append("circle")
                    .attr("r", radius)
                    .attr("fill", "#faca0c")
                    .attr("cx", 0)
                    .attr("cy", m => yScaleBox(m))
                    .on("mouseover", m => {
                        this.globalService.showPopOver(d3.event, m);
                    })
                    .on("mouseout", () => {
                        this.globalService.hidePopOver();
                    })

            })
        }

        //图例
        let legend_g = svg.append("g").attr("class", "legend")
            .attr("transform", `translate(${margin.left + width + legend_chart_Space},${margin.top + height / 2})`);

        // legend rect
        legend_g.selectAll(".legendRects")
            .data(column).enter()
            .append("rect")
            .attr("y", (d, i) => i * (legendBottom + legendRectH))
            .attr("width", legendRectW)
            .attr("height", legendRectH)
            .attr("fill", d => colorScale(d.type))
            .style("cursor", "pointer")
            .on("click", (d, i) => {
                this.color = colorScale(d.type);
                this.isShowColorPanel = true;
                this.legendIndex = i;
                console.log(this.isShowColorPanel);
            })

        // legend text
        legend_g
            .selectAll(".legendTexts")
            .data(column).enter()
            .append("text")
            .style("text-anchor", "start")
            .style("dominant-baseline", "middle")
            .style("font-size", "12px")
            .attr("x", legend_text_space + legendRectW)
            .attr("y", (d, i) => i * (legendBottom + legendRectH) + legendRectH / 2)
            .text(d => d.type)
    }

    //画线
    _drawLline(g, x1, y1, x2, y2) {
        g.append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#000000")
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2);
    }

    // single() {
    //     this.isMultiSelect = false;
    //     this.selectedColumn = [];
    //     this.selectedBox = [];
    //     this.drawChart(this.chartData);
    // }

    // multiple() {
    //     this.isMultiSelect = true;
    //     this.selectedColumn = [];
    //     this.selectedBox = [];
    //     this.drawChart(this.chartData);
    // }

    //单、多选change
    multiSelectChange() {
        this.selectedColumn = [];
        this.selectedBox = [];
        this.multiOmicsChart.redraw();
    }

    multipleConfirm() {
        console.log(this.selectedColumn);
        console.log(this.selectedBox);
    }

    colorChange(color) {
        this.color = color;
        this.colors.splice(this.legendIndex, 1, color);
        this.multiOmicsChart.redraw();
    }

    //demo
    getDataX() {
        this.loadingService.open("#multiOmics");
        this.ajaxService
            .getDeferData(
                {
                    url: "http://localhost:8086/multiOmicsX",
                    data: {}
                }
            )
            .subscribe(
                (data: any) => {
                    this.drawChart(data);
                    this.loadingService.close("#multiOmics");
                },
                error => {
                    this.loadingService.close("#multiOmics");
                    console.log(error);
                }
            )
    }

    getDataY() {
        this.loadingService.open("#multiOmics");
        this.ajaxService
            .getDeferData(
                {
                    url: "http://localhost:8086/multiOmicsY",
                    data: {}
                }
            )
            .subscribe(
                (data: any) => {
                    this.drawChart(data);
                    this.loadingService.close("#multiOmics");
                },
                error => {
                    this.loadingService.close("#multiOmics");
                    console.log(error);
                }
            )
    }
}
