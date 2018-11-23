import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';

declare const d3: any;
declare const $: any;

@Component({
    selector: 'app-cluster',
    templateUrl: './cluster.component.html'
})

export class clusterComponent implements OnInit {
    @ViewChild('clusterChart') clusterChart;

    chartUrl: string;
    chartEntity: object;

    isShowName: boolean = true;
    isShowTopLine: boolean = true;
    width: number = 480;
    height: number = 480;

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    constructor(
        private ajaxService: AjaxService,
        private globalService: GlobalService
    ) { }

    ngOnInit() {
        this.colors = ["#ff0000", "#ffffff", "#0070c0"];
        this.chartUrl = 'http://localhost:8086/cluster';
        // this.chartUrl=`${config['javaPath']}/Cluster/clusterGraph`;
        this.chartEntity = {
            "LCID": sessionStorage.getItem('LCID'),
            "tid": "20783e1576b84867aee1a63e22716fed",
            "isHorizontal": false,
            "verticalClassification": {
                "gene_type": "gene",
                "Blood": "gene_exp_tcga_3.0"
            },
            "horizontalClassification": [
                "cellType",
                "time"
            ],
            "genome": "aisdb"
        }
    }

    drawChart(data) {
        console.log(data);
        let that=this;

        d3.selectAll("#clusterChartDiv svg").remove();

        let colors = this.colors;
        //定义数据
        let leftLineData = data.left.line,
            topLineData = data.top.line,
            heatmapData = data.heatmaps,
            valuemax = data.max,
            valuemin = data.min;

        let isTopCluster = true;
        let isLeftCluster = true;
        if ($.isEmptyObject(leftLineData)) {
            isLeftCluster = false;
        }
        if ($.isEmptyObject(topLineData)) {
            isTopCluster = false;
        }

        let heatmapData_len = heatmapData.length;
        let YgeneDataLen = heatmapData[0].heatmap.length;

        //定义图例的宽高
        let legend_width = 20;
        let legend_height = 180;

        //heatmap与右边文字的间距、图例与右边文字间距
        let space = 10;
        let legend_space = 5;

        //文字最长
        let max_x_textLength = d3.max(heatmapData, d=>d.name.length);

        let max_y_textLength = 0;
        if (this.isShowName) {
            max_y_textLength = d3.max(heatmapData[0].heatmap, d=>d.x.length);
        } else {
            max_y_textLength = space / 8;
        }

        //下边文字高度、右边文字的宽度
        let XtextHeight = max_x_textLength * 8;
        let YtextWidth = max_y_textLength * 8;

        //预留间距
        let margin = { top: 40, bottom: XtextHeight, left: 10, right: 40 };

        //定义热图宽高
        let heatmap_width = 0,
            heatmap_height = 0;

        //计算单个rect长和宽
        let single_rect_width = 0;
        let single_rect_height = 0;

        heatmap_width = this.width;
        single_rect_width = heatmap_width / heatmapData_len;

        heatmap_height = this.height;
        single_rect_height = heatmap_height / YgeneDataLen;

        //定义折线宽高
        let cluster_height = heatmap_height,
            cluster_width = 100;
        let topCluster_width = 0,
            topCluster_height = 0;

        if (this.isShowTopLine && isTopCluster) {
            topCluster_width = heatmap_width;
            topCluster_height = 60;
        }

        //svg总宽高
        let totalWidth = margin.left + cluster_width + space + heatmap_width + space + YtextWidth + legend_space + legend_width + margin.right,
            totalHeight = margin.top + topCluster_height + heatmap_height + margin.bottom;

        //x、y比例尺
        let xScale = d3.scaleBand()
            .range([0, heatmap_width])
            .domain(heatmapData.map(function (d) { return d.name; }));

        let yScale = d3.scaleBand()
            .range([0, heatmap_height])
            .domain(heatmapData[0].heatmap.map(function (d) { return d.x }));

            console.log(xScale('test1'),xScale('test2'),xScale('test3'));
            console.log(yScale('gene01'),yScale('gene02'),yScale('gene03'))

        //定义图例比例尺
        let legend_yScale = d3.scaleLinear().range([legend_height, 0])
            .domain([valuemin, valuemax]).clamp(true);

        let legend_yAxis = d3.axisRight(legend_yScale).tickSizeOuter(0).ticks(5); //设置Y轴

        //定义图例位置偏移
        let legendTrans_x = totalWidth - legend_width - margin.right,
            legendTrans_y = margin.top + topCluster_height;

        //定义容器
        let svg = d3.select("#clusterChartDiv").append("svg").attr("width", totalWidth).attr("height", totalHeight);

        let body_g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let heatmap_g = body_g.append("g").attr("class", "heatmap")
            .attr("transform", "translate(" + (cluster_width + space) + "," + topCluster_height + ")");

        let legend_g = svg.append("g").attr("class", "heatmapLegend") //定义图例g
            .attr("transform", "translate(" + legendTrans_x + "," + legendTrans_y + ")");

        //title
        let title_y = margin.top / 2;
        svg.append("g")
            .attr("class", "heatmapTitle")
            .append("text")
            .attr("transform", "translate(" + (totalWidth / 2) + ", " + title_y + ")")
            .text("差异基因表达量聚类热图")
            .attr("font-size", "18px")
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .on("dblclick", function () {
                let textNode = d3.select(this).node();
            })
            .on("mouseover", function () {
                d3.select(this).attr("fill", "#5378f8");
                d3.select(this).append("title").text("双击修改");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#000");
                d3.select(this).select("title").remove();
            });

        //top line
        if (this.isShowTopLine && isTopCluster) {
            let topLine_x = margin.left + cluster_width + heatmap_width;
            this._drawLine("topLine", topCluster_width, topCluster_height, body_g, topLine_x, 0, topLineData);
        }

        //left line
        if (isLeftCluster) {
            this._drawLine("leftLine", cluster_height, cluster_width, body_g, space, topCluster_height, leftLineData);
        }

        //heatmap
        drawHeatmap(colors);

        // y text
        if (this.isShowName) {
            drawYText();
        }

        //legend
        drawLegend(colors);

        //交互
        heatmapInteract();

        //画热图
        function drawHeatmap(colors) {
            d3.selectAll(".heatmapRects").remove();
            //颜色比例尺
            let colorScale = d3.scaleLinear().domain([valuemax, (valuemin + valuemax) / 2, valuemin]).range(colors).interpolate(d3.interpolateRgb);
            for (let i = 0; i < heatmapData_len; i++) {
                let rect_g = heatmap_g.append("g").attr("class", "heatmapRects");
                //画矩形
                rect_g.selectAll("rect")
                    .data(heatmapData[i].heatmap)
                    .enter()
                    .append("rect")
                    .attr("x", i * single_rect_width)
                    .attr("y",  (d, j)=>  j * single_rect_height )
                    .attr("width", single_rect_width)
                    .attr("height", single_rect_height)
                    .attr("fill", d=>(d.y === null) ? "#000000" : colorScale(d.y));

                //添加x轴的名称
                rect_g.append("text")
                    .style("font-family", "Consolas, Monaco, monospace")
                    .style("font-size", "12px")
                    .text(heatmapData[i].name)
                    .style("text-anchor", "middle")
                    .attr("transform", function () {
                        return "translate(" + (i * single_rect_width + single_rect_width / 2) + "," + (heatmap_height + 20) + ") rotate(90)";
                    })
            }
        }

        //热图交互
        function heatmapInteract() {
            //定义热图矩形交互
            let interact_g = heatmap_g.append("g");
            let big_rect = interact_g.append("rect")
                .attr("width", heatmap_width)
                .attr("height", heatmap_height)
                .style("cursor", "pointer")
                .attr("fill", "transparent");

            let select_rect = interact_g.append("rect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("fill", "#000000")
                .style("opacity", 0.4);

            let select_rw = heatmap_width,
                select_rh = 0;
            let trans_x = 0,
                trans_y = 0;
            let down_x = 0,
                down_y = 0;
            let isMousedown = false;
            let down_j;
            big_rect.on("mousedown", function (ev) {
                isMousedown = true;
                let downEvent = ev || d3.event;

                //当前down位置
                down_x = downEvent.offsetX - margin.left - cluster_width - space;
                down_y = downEvent.offsetY - margin.top - topCluster_height;
                //当前down索引
                let downIndex = getIndex(down_x, down_y);
                down_j = downIndex.y_index;
                clearEventBubble(downEvent);
            })

            big_rect.on("mousemove", function (ev) {
                let moveEvent = ev || d3.event;
                let x_dis = moveEvent.offsetX - margin.left - cluster_width - space;
                let y_dis = moveEvent.offsetY - margin.top - topCluster_height;

                if (isMousedown) {
                    select_rh = Math.abs(y_dis - down_y);
                    trans_y = d3.min([y_dis, down_y]);
                    select_rect.attr("width", select_rw).attr("height", select_rh).attr("x", trans_x).attr("y", trans_y);
                } else {
                    //当前move到的rect的索引
                    let index = getIndex(x_dis, y_dis);
                    let i = index.x_index,
                        j = index.y_index;
                    let d = heatmapData[i].heatmap[j];
                    let tipText = `sample: ${heatmapData[i].name}<br> gene:  ${d.x}<br> log2(fpkm+1): ${d.y}`;
                    that.globalService.showPopOver(d3.event, tipText);
                }
                clearEventBubble(moveEvent);
            });

            select_rect.on("mousemove", function (ev) {
                let moveSelectEvent = ev || d3.event;
                clearEventBubble(moveSelectEvent);
                let y_select_dis = moveSelectEvent.offsetY - margin.top - topCluster_height;

                if (isMousedown) {
                    select_rh = Math.abs(y_select_dis - down_y);
                    trans_y = d3.min([y_select_dis, down_y]);
                    select_rect.attr("width", select_rw).attr("height", select_rh).attr("x", trans_x).attr("y", trans_y);
                }
            })

            select_rect.on("mouseup", function (ev) {
                isMousedown = false;
                let upEvent = ev || d3.event;
                //当前up位置
                let up_x = upEvent.offsetX - margin.left - cluster_width - space;
                let up_y = upEvent.offsetY - margin.top - topCluster_height;

                //当前up索引
                let upIndex = getIndex(up_x, up_y);
                let up_j = upIndex.y_index;

                let geneId;
                if (down_j > up_j) {
                    geneId = heatmapData[0].heatmap.slice(up_j, down_j + 1);
                } else {
                    geneId = heatmapData[0].heatmap.slice(down_j, up_j + 1);
                }
                let resGeneId = [];
                geneId.forEach(function (val, index) {
                    resGeneId.push(val.x);
                });

                that.setGeneList(resGeneId);

                let high_j = d3.min([up_j, down_j]),
                    low_j = d3.max([up_j, down_j]);
                let highHeight = high_j * single_rect_height;
                let lowHeight = (low_j + 1) * single_rect_height;

                select_rh = Math.abs(lowHeight - highHeight);
                trans_y = d3.min([lowHeight, highHeight]);
                select_rect.attr("width", select_rw).attr("height", select_rh).attr("x", trans_x).attr("y", trans_y);

                clearEventBubble(upEvent);
            });

            big_rect.on("mouseup", function () {
                clearEventBubble(d3.event);
                select_rect.attr("width", 0).attr("height", 0);
                isMousedown = false;
            })

            big_rect.on("mouseout", function () {
                that.globalService.hidePopOver();
            });

            $("#cluster").on("mousedown", function () {
                select_rect.attr("width", 0).attr("height", 0);
                isMousedown = false;
            })

            $("#cluster").on("mouseup", function () {
                select_rect.attr("width", 0).attr("height", 0);
                isMousedown = false;
            })
        }

        //获取heatmap横纵索引
        function getIndex(x, y) {
            let rect_i = 0,
                rect_j = 0;

            for (let i = 0; i < heatmapData_len; i++) {
                if (i == heatmapData_len - 1) {
                    if (x >= xScale(heatmapData[i].name) && x <= heatmap_width) {
                        rect_i = heatmapData_len - 1;
                    }
                } else {
                    if (x >= xScale(heatmapData[i].name) && x <= xScale(heatmapData[i + 1].name)) {
                        rect_i = i;
                    }
                }

                let heatmap = heatmapData[i].heatmap;
                let heatmap_len = heatmap.length;

                for (let j = 0; j < heatmap_len; j++) {
                    if (j == heatmap_len - 1) {
                        if (y >= yScale(heatmap[j].x) && y <= heatmap_height) {
                            rect_j = heatmap_len - 1;
                        }
                    } else {
                        if (y >= yScale(heatmap[j].x) && y <= yScale(heatmap[j + 1].x)) {
                            rect_j = j;
                        }
                    }
                }
            }

            let indexObj = {
                "x_index": rect_i,
                "y_index": rect_j
            }
            return indexObj;

        }

        //阻止冒泡
        function clearEventBubble(evt) {
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.cancelBubble = true;
            }

            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }

        }

        //画热图右边的文字名称
        function drawYText() {
            //添加heatmap的右边名称
            let y_texts = heatmap_g.append("g")
                .attr("transform", "translate(" + (heatmap_width + space) + ",0)")
                .selectAll("y_text")
                .data(heatmapData[0].heatmap)
                .enter()
                .append("text")
                .style("font-family", "Consolas, Monaco, monospace")
                .style("font-size", "12px")
                .style("dominant-baseline", "middle")
                .text(function (d) {
                    return d.x;
                })
                .attr("y", function (d, i) {
                    return i * single_rect_height + single_rect_height / 2;
                })
        }

        //画图例
        function drawLegend(colors) {
            d3.selectAll(".heatmapLegend defs").remove();
            d3.selectAll(".heatmapLegend rect").remove();
            //线性填充
            let linearGradient = legend_g.append("defs")
                .append("linearGradient")
                .attr("id", "heatmapLinear_Color")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%");

            for (let i = 0; i < colors.length; i++) {
                linearGradient.append("stop")
                    .attr("offset", i * 50 + "%")
                    .style("stop-color", colors[i]);
            }

            //画图例矩形
            legend_g.append("rect").attr("width", legend_width).attr("height", legend_height)
                .attr("fill", "url(#" + linearGradient.attr("id") + ")");
        }

        //点击图例改图颜色
        let legendClickRect_h = legend_height / colors.length;
        let legendClick_g = svg.append("g")
            .attr("transform", "translate(" + legendTrans_x + "," + legendTrans_y + ")")
            .style("cursor", "pointer")
            .on("mouseover", function () {
                d3.select(this).append("title").text("单击修改颜色");
            })
            .on("mouseout", function () {
                d3.select(this).select("title").remove();
            });
        legendClick_g.selectAll(".legendClick_Rect")
            .data(colors)
            .enter()
            .append("rect")
            .attr("width", legend_width)
            .attr("height", legendClickRect_h)
            .attr("y", function (d, i) {
                return i * legendClickRect_h;
            })
            .attr("fill", "transparent")
            .on("click", (d, i) => {
                let oEvent = d3.event || event;
                oEvent.stopPropagation();

                this.legendIndex = i;
                this.isShowColorPanel = true;
            });

        //画图例的轴
        legend_g.append("g").attr("class", "heatmap_Axis")
            .attr("transform", "translate(" + legend_width + ",0)")
            .call(legend_yAxis);

        d3.selectAll(".heatmap_Axis .tick text")
            .attr("font-size", "12px");
    }

    //画聚类折线图
    _drawLine(type, size1, size2, gContainer, translateX, translateY, data) {
        var cluster = d3.cluster()
            .size([size1, size2])
            .separation(function () { return 1; });

        var cluster_g = gContainer.append("g").attr("class", type);
        if (type == "leftLine") {
            cluster_g.attr("transform", "translate(" + translateX + "," + translateY + ")");
        }

        if (type == "topLine") {
            cluster_g.attr("transform", "translate(" + translateX + "," + translateY + ") rotate(90)");
        }

        //根据数据建立模型
        var root = d3.hierarchy(data);
        cluster(root);

        cluster_g.selectAll("path")
            .data(root.links())
            .enter().append("path")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke", "#000000")
            .attr("d", this._elbow);
    }

    _elbow(d, i) {
        return "M" + d.source.y + "," + d.source.x +
            "V" + d.target.x + "H" + d.target.y;
    }

    //color change 回调函数
    colorChange(curColor) {
        this.color = curColor;
        this.colors.splice(this.legendIndex, 1, curColor);
        this.clusterChart.redraw();
    }

    setGeneList(geneList) {
        console.log(geneList);
    }
}
