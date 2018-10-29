import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/app/super/service/ajaxService";

declare const d3: any;

@Component({
    selector: 'app-net',
    templateUrl: './net.component.html'
})

export class netComponent implements OnInit {
    force: number;  //斥力
    isMultiSelect: boolean = false;
    selectedNodes: object[] = [];
    chartData: any;

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.force = 60;
        this.getData();
    }

    getData() {
        this.ajaxService
            .getDeferData(
                {
                    url: "http://localhost:8086/net",
                    data: {}
                }
            )
            .subscribe(
                (data: any) => {
                    this.chartData = data;
                    this.drawChart(data);
                },
                error => {
                    console.log(error);
                }
            )
    }

    drawChart(data) {
        d3.select("#netSvg").selectAll("g").remove();
        d3.select("#netSvg").selectAll("defs").remove();

        let that = this;
        const width = 960, height = 800;
        const svg = d3.select("svg#netSvg").attr("width", width).attr("height", height);

        let nodeColors = ["#0000ff", "#ff0000"];
        let nodeRadius = [3, 10];
        let lineColors = ["#ccc", "#000"];

        let nodes = data.nodes;
        let links = data.links;
        let arrows = [{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }];

        //node连接数
        for (let i = 0; i < nodes.length; i++) {
            let count = 0;
            if (links.length) {
                for (let j = 0; j < links.length; j++) {
                    if ((typeof links[j].source === "string") && (typeof links[j].target === "string")) {
                        if ((nodes[i].id === links[j].source) || (nodes[i].id === links[j].target)) {
                            count++;
                        }
                    } else {
                        if ((nodes[i].id === links[j].source.id) || (nodes[i].id === links[j].target.id)) {
                            count++;
                        }
                    }
                }
            }
            nodes[i].value = count;
            nodes[i].selected = false;
        }

        let maxValue = d3.max(nodes, d => d.value);

        //箭头
        svg.append("defs").selectAll("marker")
            .data(arrows).enter()
            .append("marker")
            .attr("id", d => d.id)
            .attr("viewBox", '0 0 10 10')
            .attr("refX", 20)
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", 'M0,0 L0,10 L10,5 z')
            .attr("opacity", d => d.opacity);

        //比例尺
        let nodeColorScale = d3.scaleLinear().domain([0, maxValue]).range(nodeColors).interpolate(d3.interpolateRgb);
        let radiuScale = d3.scaleLinear().domain([0, maxValue]).range(nodeRadius).clamp(true);
        let linkColorScale = d3.scaleLinear().domain([150, 1000]).range(lineColors).interpolate(d3.interpolateRgb);

        //创建一个力导向图的模拟器
        const simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id)) //基于它们之间的链接将节点拉到一起
            .force('charge', d3.forceManyBody().strength(-this.force)) //将节点分开以将它们分隔开
            .force("collide", d3.forceCollide().radius(d => radiuScale(d.value)))  // 添加一些碰撞检测，使它们不重叠。
            .force('center', d3.forceCenter(width / 2, height / 2)) //把它们画在空间的中心
            .force("x", d3.forceX())
            .force("y", d3.forceY());

        // add link
        let link = svg.append("g")
            .attr("class", "links")
            .selectAll(".link")
            .data(links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", d => linkColorScale(d.score))
            .attr("marker-end", 'url(#end-arrow)');

        //add brush
        let brush = svg.append("g").attr("class", "brush")
            .call(d3.brush()
                .extent([[0, 0], [width, height]])
                .on("start", brushStart)
                .on("brush", brushed)
                .on("end", brushEnd)
            );

        //add node
        let node = svg.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", d => radiuScale(d.value))
            .attr("fill", d => nodeColorScale(d.value))
            .on("mouseover", mouseOver(0.4))
            .on("mouseout", mouseOut)
            .on("click", function (d) {
                d3.event.stopPropagation();

                if (!that.isMultiSelect) {   // 单选
                    that.selectedNodes = [];
                    d3.select("#netSvg").selectAll(".node").classed("selected", false);
                    d3.select(this).classed("selected", true);
                    nodes.forEach(m => {
                        m.selected = false;
                    });
                    d.selected = true;
                    if (d.selected) {
                        that.selectedNodes.push(d);
                    }
                    console.log(that.selectedNodes);
                } else {  // 多选
                    d3.select(this).classed("selected", true);
                    d.selected = true;
                    if (d.selected) {
                        that.selectedNodes.push(d);
                    }
                }
            })
            .call(d3.drag()
                .on("start", dragStart)
                .on("drag", dragged)
                .on("end", dragEnd));

        //add nodes to simulation
        simulation.nodes(nodes).on("tick", ticked);
        //add links to simulation
        simulation.force("link").links(links); // .distance([10])：设置node距离

        function ticked() {
            link.attr("d", linkPos);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        //通过中间节点，绘制节点之间的曲线路径
        function linkPos(d) {
            let offset = 5;

            //中间点
            let midPoint_x = (d.source.x + d.target.x) / 2;
            let midPoint_y = (d.source.y + d.target.y) / 2;

            //两点x、y方向距离
            let dx = d.target.x - d.source.x;
            let dy = d.target.y - d.source.y;

            //两点直线距离
            let node_dis = Math.sqrt(dx * dx + dy * dy);

            let offsetX = midPoint_x + offset * (dy / node_dis);
            let offsetY = midPoint_y - offset * (dx / node_dis);

            return "M" + d.source.x + "," + d.source.y +
                "S" + offsetX + "," + offsetY +
                " " + d.target.x + "," + d.target.y;
        }

        //节点的链接
        let linkedByIndex = {};
        links.forEach(d => {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });

        //节点是否链接
        function isConnected(a, b) {
            return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index === b.index;
        }

        //node hover
        function mouseOver(opacity) {
            return d => {
                node.attr("fill-opacity", m => {
                    let curOpacity = isConnected(d, m) ? 1 : opacity;
                    return curOpacity;
                });

                node.attr("stroke-opacity", m => {
                    let curOpacity = isConnected(d, m) ? 1 : opacity;
                    return curOpacity;
                });

                link.attr("stroke-opacity", m => (m.source === d || m.target === d ? 1 : opacity));

                link.attr("stroke-width", m => (m.source === d || m.target === d ? 2 : 1));

                link.attr('marker-end', m => (m.source === d || m.target === d ? 'url(#end-arrow)' : 'url(#end-arrow-fade)'));
            }
        }

        function mouseOut() {
            node.attr("fill-opacity", 1);
            node.attr("stroke-opacity", 1);
            link.attr("stroke-opacity", 1);
            link.attr("stroke-width", 1);
            link.attr('marker-end', 'url(#end-arrow)');
        }

        //node 拖拽
        function dragStart(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragEnd(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // node 拖选
        function brushStart() {
            if (d3.event.sourceEvent.type != "end") {
                node.classed("selected", d => d.selected);
            }
        }

        function brushed() {
            if (d3.event.sourceEvent.type != "end") {
                let selection = d3.event.selection;
                if (that.isMultiSelect) {
                    node.classed("selected", d => {
                        return (selection != null
                            && selection[0][0] <= d.x && d.x <= selection[1][0]
                            && selection[0][1] <= d.y && d.y <= selection[1][1]) || d.selected;
                    })
                } else {
                    node.classed("selected", d => {
                        return (selection != null
                            && selection[0][0] <= d.x && d.x <= selection[1][0]
                            && selection[0][1] <= d.y && d.y <= selection[1][1]);
                    })
                }
            }
        }

        function brushEnd() {
            let selection = d3.event.selection;
            if (selection != null) {
                d3.select(this).call(d3.event.target.move, null);
                console.log(d3.select(".nodes").selectAll(".node.selected").nodes());
            }
        }

    }

    //点击“单选”
    single() {
        this.isMultiSelect = false;
        //清空选中的node
        d3.select("#netSvg").selectAll("circle.node").classed("selected", false);
        this.selectedNodes = [];

    }

    //点击“多选”
    multiple() {
        this.isMultiSelect = true;
        //清空选中的node
        d3.select("#netSvg").selectAll("circle.node").classed("selected", false);
        this.selectedNodes = [];
    }

    //点击“确定”
    comfirm() {
        console.log(this.selectedNodes);
    }
}
