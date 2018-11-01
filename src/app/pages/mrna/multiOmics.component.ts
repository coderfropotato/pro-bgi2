import { Component, OnInit } from '@angular/core'
import { AjaxService } from 'src/app/super/service/ajaxService';

declare const d3: any;

@Component({
    selector: 'app-multiOmics',
    templateUrl: './multiOmics.component.html'
})

export class multiOmicsComponent implements OnInit {
    isMultiSelect: boolean = false;
    selectedList: object[] = [];

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.getData();
    }

    getData() {
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
                },
                error => {
                    console.log(error);
                }
            )
    }

    drawChart(data) {
        d3.select("#multiOmicsSvg").selectAll("g").remove();

        let colors = ["#3195BC", "#FF6666", "#009e71", "#DBBBAF", "#A7BBC3", "#FF9896", "#F4CA60", "#6F74A5", "#E57066", "#C49C94", "#3b9b99", "#FACA0C", "#F3C9DD", "#0BBCD6"];

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
        let legendRectW = 12, // 小矩形宽
            legendRectH = 12; // 小矩形高
        let legend_chart_Space = 24, //图例与图距离
            legendBottom = 6, //图例上下之间的距离
            legend_text_space = 4; //图例矩形与文字之间的距离

        //根据每组柱子数量决定柱子宽度
        let widthScale = d3.scaleLinear().domain([1, 50]).range([30, 10]).clamp(true);

        //calculate min max
        let allXTexts = [];
        let allYColumn = [];

        let temp = 0
        column.forEach((d, i) => {
            let rectsLength = d.data.length;
            rectWidth = widthScale(rectsLength);
            eachTypeWidth = rectsLength * rectWidth + (rectsLength + 1) * rectSpace;

            temp += eachTypeWidth;
            width = temp + typeSpace * (columnLength - 1);
            height = width;

            d.transX = (temp - eachTypeWidth) + i * typeSpace;

            d.data.forEach(m => {
                m.w = rectWidth;
                m.type = d.type;
                allXTexts.push(m.x);
                allYColumn.push(m.y);
            })
        });

        eachChartHeight = (height - boxplotLength * chartSpace) / (boxplotLength + 1);

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

        console.log(column)
        // 比例尺
        let yColumnScale = d3.scaleLinear()
            .range([eachChartHeight, 0]).domain([0, yColumnMax]).nice();

        let yColumnAxis = d3.axisLeft(yColumnScale).ticks(5).tickFormat(d3.format("1"));

        let colorScale = d3.scaleOrdinal().range(colors.map(function (d) { return d })).domain(column.map(function (d) { return d.type }));

        // svg
        let svg = d3.select("#multiOmicsSvg").attr("width", totalWidth).attr("height", totalHeight);

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

        xAxisColumn.append("line")
            .attr("x1", width - 1)
            .attr("y1", 0)
            .attr("x2", width - 1)
            .attr("y2", 6)
            .style("stroke", "#000000");

        // column y
        column_g.append("g").attr("class", "yAxis-column").call(yColumnAxis);

        // column y text
        column_g.append("g").attr("class", "yText-column")
            .attr("transform", `translate(-40,${eachChartHeight / 2})`)
            .append("text").attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("transform",`rotate(-90)`)
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
            .style("fill", d => colorScale(d.type))

        columns.selectAll(".xAxisText")
            .data(d => d.data).enter()
            .append("text").attr("class", "xAxisText")
            .style("font-size", "12px")
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .attr("transform", (d, i) => `translate(${(i + 1) * rectSpace + i * d.w + d.w / 2},${eachChartHeight + 6}) rotate(-45)`)
            .text(d => d.x);

        // boxplot
        let boxplot_g = svg.selectAll(".boxplot")
            .data(boxplot).enter()
            .append("g").attr("class", "boxplot").attr("transform", (d, i) => `translate(${margin.left},${margin.top + (boxplotLength - 1 - i) * (eachChartHeight + chartSpace)})`)

    }

    single() {
        this.isMultiSelect = false;
    }

    multiple() {
        this.isMultiSelect = true;
    }

    comfirm() {
        console.log(this.selectedList);
    }

    //demo
    addX() {
        this.getDataX();
    }

    addY() {
        this.getDataY();
    }

    getDataX() {
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
                },
                error => {
                    console.log(error);
                }
            )
    }

    getDataY() {
        this.ajaxService
            .getDeferData(
                {
                    url: "http://localhost:8086/multiOmics",
                    data: {}
                }
            )
            .subscribe(
                (data: any) => {
                    this.drawChart(data);
                },
                error => {
                    console.log(error);
                }
            )
    }
}
