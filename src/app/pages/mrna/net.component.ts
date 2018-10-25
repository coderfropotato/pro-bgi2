import { Component, OnInit } from "@angular/core";
import { AjaxService } from "src/app/super/service/ajaxService";

declare const d3: any;

@Component({
    selector: 'app-net',
    templateUrl: './net.component.html'
})

export class netComponent implements OnInit {
    force: number;
    isMultiSelect:boolean=false;
    selectedNodes:object[]=[];

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.force = 30;
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
                    this.drawChart(data);
                },
                error => {
                    console.log(error);
                }
            )
    }

    drawChart(data) {
        d3.select("#netSvg").selectAll("g").remove();

        let that=this;
        const width = 960, height = 800;
        const svg = d3.select("svg#netSvg").attr("width", width).attr("height", height);

        let nodeColors = ["#0000ff", "#ff0000"];
        let nodeRadius = [3, 10];
        let lineColors = ["#ccc", "#000"];

        let nodes = data.nodes;
        let links = data.links;
        let arrows = [{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }];

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

        //node连接数
        for (let i = 0; i < nodes.length; i++) {
            var count = 0;
            for (var j = 0; j < links.length; j++) {
                if (nodes[i].id === links[j].source || nodes[i].id === links[j].target) {
                    count++;
                }
            }
            nodes[i].value = count;
        }

        let maxValue = d3.max(nodes, d => d.value);

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
            .on("click",function(d){
                if(!that.isMultiSelect){   // 单选
                    that.selectedNodes=[];
                    d3.select("#netSvg").selectAll(".node").attr("stroke-width",null).attr("stroke",null);
                    d3.select(this).attr("stroke-width",2).attr("stroke","#000");
                    that.selectedNodes.push(d);
                }else{  // 多选
                    d3.select(this).attr("stroke-width",2).attr("stroke","#000");
                    that.selectedNodes.push(d);
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
            let offset = 30;

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
    }

    single(){
        this.isMultiSelect=false;
        d3.select("#netSvg").selectAll("circle.node").attr("stroke-width",null).attr("stroke",null);
        this.selectedNodes=[];
    }

    multiple(){
        this.isMultiSelect=true;
        d3.select("#netSvg").selectAll("circle.node").attr("stroke-width",null).attr("stroke",null);
        this.selectedNodes=[];
    }

    comfirm(){
        console.log(this.selectedNodes);
    }
}
