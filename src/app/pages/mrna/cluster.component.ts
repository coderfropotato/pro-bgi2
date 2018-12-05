import { Component, OnInit, ViewChild } from '@angular/core';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import { StoreService } from 'src/app/super/service/storeService';

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

    width: number;
    height: number;
    domainRange:number[]=[];
    yName:string;
    isCluster:boolean;
    verticalList:object[]=[];
    horizontalList:string[]=[];

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    gaugeColors:string[]=[];
    oLegendIndex:number=0;
    oColor:string;

    defaultSetUrl:string;
    defaultSetEntity:object;
    defaultSetData:any;

    constructor(
        private ajaxService: AjaxService,
        private globalService: GlobalService,
        private storeService:StoreService
    ) { }

    ngOnInit() {
        this.colors = ["#ff0000", "#ffffff", "#0070c0"];
        this.gaugeColors=this.storeService.getColors();

        this.defaultSetUrl=`${config['javaPath']}/Cluster/defaultSet`;
        this.defaultSetEntity={
            "tid": "20783e1576b84867aee1a63e22716fed"
        }

        this.chartUrl=`${config['javaPath']}/Cluster/clusterGraph`;
        this.chartEntity = {
            "LCID": this.storeService.getStore('LCID'), 
            "tid": "20783e1576b84867aee1a63e22716fed", 
            "isHorizontal": true,
            "verticalClassification": {},
            "horizontalClassification": []
        };
    }

    //设置 默认 
    apiEntityChange(data){
        let xNum=data.xNum;
        if (xNum <= 8) {
            this.width = 480;
        } else {
            let single_width = 60;
            this.width = single_width * xNum;
        }
        this.height=480;
        this.domainRange=[data.min,data.max];
        this.yName='hidden';
        this.isCluster=true;

        this.chartEntity['isHorizontal']=this.isCluster;

        data['verticalDefault'].forEach(d=>{
            this.chartEntity['verticalClassification'][d.key]=d['category'];
        })

        this.defaultSetData=data;
    }

    //设置 确定
    setConfirm(data){
        this.setChartSetEntity(data);
        this.clusterChart.reGetData();
    }

    setChartSetEntity(data){
        //图
        this.width=data.width;
        this.height=data.height;
        this.domainRange=data.domainRange;
        this.yName=data.yName;
        this.isCluster=data.isCluster;

        //请求参数
        this.chartEntity['isHorizontal']=data.isCluster;
        this.chartEntity['horizontalClassification']=data.horizontalList;
        this.chartEntity['verticalClassification']={};
        if(data['verticalList'].length){
            data['verticalList'].forEach(d=>{
                this.chartEntity['verticalClassification'][d.key]=d['category'];
            })
        }
    }

    //画图
    drawChart(data) {
        let that=this;

        d3.selectAll("#clusterChartDiv svg").remove();

        let colors = this.colors;
        //定义数据
        let leftLineData = data.left.line,
            topLineData = data.top.line,
            heatmapData = data.heatmaps,
            valuemax = this.domainRange[1],
            valuemin = this.domainRange[0];

        let topSimples=[];
        let topComplexes=[];
        if(data.top.simple && data.top.simple.length){
            topSimples=data.top.simple;
        }
        if(data.top.complex && data.top.complex.length){
            topComplexes=data.top.complex;
        }

        let leftSimples=[];
        let leftComplexes=[];
        if(data.left.simple && data.left.simple.length){
            leftSimples=data.left.simple;
        }
        if(data.left.complex && data.left.complex.length){
            leftComplexes=data.left.complex;
        }

        let legends=[];
        if(data.gauge && data.gauge.length){
            legends=data.gauge;
        }

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

        let space = 10;  //heatmap与周边的间距
        let small_space = 3;  //图例与热图右边文字间距

        //文字最长
        let max_x_textLength = d3.max(heatmapData, d=>d.name.length);

        let max_y_textLength = 0;
        if (this.yName !=='hidden') {
            max_y_textLength = d3.max(heatmapData[0].heatmap, d=>d.x.length);
        }

        //下边文字高度、右边文字的宽度
        let XtextHeight = max_x_textLength * 7;
        let YtextWidth = max_y_textLength * 7;

        //预留间距
        let margin = { top: 40, bottom: 20, left: 10, right: 40 };

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

        if (this.isCluster && isTopCluster) {
            topCluster_width = heatmap_width;
            topCluster_height = 60;
        }

        //top left rect width height
        let simpleRectWH=16,complexRectWH=6;
        
        // top
        let topSimpleHeight=topSimples.length*(simpleRectWH+small_space);
        let topComplexHeight=0;
        if(topComplexes.length){
            topComplexes.forEach(d=>{
                let curHeight=d.data.length*(complexRectWH+small_space);
                d.h=curHeight;
                topComplexHeight+=curHeight;
            });
        }
        let topColumnHeight=topSimpleHeight+topComplexHeight;

        //left
        let leftSimpleWidth=leftSimples.length*(simpleRectWH+small_space);
        let leftComplexWidth=0;
        if(leftComplexes.length){
            leftComplexes.forEach(d=>{
                let curWidth=d.data.length*(complexRectWH+small_space);
                d.h=curWidth;
                leftComplexWidth+=curWidth;
            });
        }
        let leftColumnWidth=leftSimpleWidth+leftComplexWidth;
        
        //热图区偏移
        let heatmap_x=margin.left+cluster_width+leftColumnWidth;
        let heatmap_y=margin.top+topCluster_height+topColumnHeight;

        //图例
        let gradientLegendWidth=legend_width+valuemax.toString().length*7;
        
        let legendColNumScale=d3.scaleLinear().domain([200, 2000]).range([8,80]);

        let OrdinalRectW=16,OrdinalRectH=16, // rect width height
        legend_chart_space = 24, //图例与图的距离
        legend_col_space = 30, //图例之间每列的距离
        text_space=5, //rect text space
        bottom_space=6; //rect 上下 space
        let legend_col_num = Math.floor(legendColNumScale(heatmap_height)); //每列个数
        let showMaxFontLenght=20; //图例最多显示20个字符
        let OrdinalLegendWidth=0;

        if(legends.length){
            let curTotalLen=0;
            let preLen=0;
            let legendTotalColNum=0; //图例总列数
            let legendTotalTextW=0; //所有文本宽度

            legends.forEach((d,i)=>{
                d.data.forEach((m,j)=>{
                    if(m===null){
                        d.data.splice(j,1);
                    }
                })
                let curLen=d.data.length;
                curTotalLen+=curLen;
                preLen=curTotalLen-curLen;
                d.colors=this.gaugeColors.slice(preLen,curTotalLen);
                d.scale=d3.scaleOrdinal().range(d.colors.map(m=>m)).domain(d.data.map(m=>m));

                d.chunks=this.chunk(d.data,legend_col_num);
                legendTotalColNum+=d.chunks.length;
                d.chunks.forEach((n)=>{
                    let maxTextLen=d3.max(n,x=>(x.length<=showMaxFontLenght) ? x.length*7 : (showMaxFontLenght+2)*7);
                    legendTotalTextW+=maxTextLen;
                })
            })
            OrdinalLegendWidth=legendTotalColNum*(OrdinalRectW+text_space+legend_col_space)+legendTotalTextW;
        }

        //svg总宽高
        let totalWidth = heatmap_x + heatmap_width + space + YtextWidth + space + gradientLegendWidth+legend_chart_space+ OrdinalLegendWidth+ margin.right,
            totalHeight = heatmap_y + heatmap_height + XtextHeight + margin.bottom;

        //x、y比例尺
        let xScale = d3.scaleBand()
            .range([0, heatmap_width])
            .domain(heatmapData.map(function (d) { return d.name; }));

        let yScale = d3.scaleBand()
            .range([0, heatmap_height])
            .domain(heatmapData[0].heatmap.map(function (d) { return d.x }));

        //定义图例比例尺
        let legend_yScale = d3.scaleLinear().range([legend_height, 0])
            .domain([valuemin, valuemax]).clamp(true).nice();

        let legend_yAxis = d3.axisRight(legend_yScale).tickSizeOuter(0).ticks(5); //设置Y轴

        //定义图例位置偏移
        let legendTrans_x = heatmap_x + heatmap_width + space + YtextWidth + space,
            legendTrans_y = heatmap_y;

        // left translate
        let topLine_x = heatmap_x + heatmap_width;

        //定义容器
        let svg = d3.select("#clusterChartDiv").append("svg").attr("width", totalWidth).attr("height", totalHeight);

        let body_g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let heatmap_g = body_g.append("g").attr("class", "heatmap")
            .attr("transform", "translate(" + (heatmap_x-margin.left) + "," + (heatmap_y-margin.top) + ")");

        let legend_g = svg.append("g").attr("class", "gradientLegend") //定义图例g
            .attr("transform", "translate(" + legendTrans_x + "," + legendTrans_y + ")");

        //title
        let title_y = margin.top / 2;
        svg.append("g")
            .attr("class", "heatmapTitle")
            .append("text")
            .attr("transform", "translate(" + ((heatmap_x+heatmap_width)-heatmap_width/2) + ", " + title_y + ")")
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
            })
            .text("差异基因表达量聚类热图");

        //top line
        if (this.isCluster && isTopCluster) {
            this._drawLine("topLine", topCluster_width, topCluster_height, body_g, topLine_x, 0, topLineData);
        }

        //top simple rect
        if(topSimples.length){
            let simple_g = body_g.append('g').attr('class','simpleRects').attr("transform",`translate(${heatmap_x-margin.left},${topCluster_height})`);
            for(let i=0;i<topSimples.length;i++){
                drawSimple(topSimples,i,simple_g,(d,j)=>j*single_rect_width,i*(simpleRectWH+small_space),single_rect_width,simpleRectWH,`translate(${heatmap_width+space},${i*(simpleRectWH+small_space)+simpleRectWH/2}) rotate(0)`);
            }
        }

        //top complex rect
        if(topComplexes.length){
            let complex_g=body_g.append('g').attr('class','complexRects').attr('transform',`translate(${heatmap_x-margin.left},${topCluster_height+topSimpleHeight})`);
            drawComplex(topComplexes,complex_g,k=>xScale(k.name),0,single_rect_width,complexRectWH,(d,i)=>`translate(0,${i*(complexRectWH+small_space)})`,d=>`translate(${heatmap_width+space},${d.h/2}) rotate(0)`);
        }

        //left line
        if (isLeftCluster) {
            this._drawLine("leftLine", cluster_height, cluster_width, body_g, 0, heatmap_y-margin.top, leftLineData);
        }

        //left simple rect
        if(leftSimples.length){
            let simple_g = body_g.append('g').attr('class','simpleRects').attr("transform",`translate(${cluster_width},${heatmap_y-margin.top})`);
            
            for(let i=0;i<leftSimples.length;i++){
                drawSimple(leftSimples,i,simple_g,i*(simpleRectWH+small_space),d=>yScale(d.name),simpleRectWH,single_rect_height,`translate(${i*(simpleRectWH+small_space)+simpleRectWH/2},${heatmap_height+space}) rotate(90)`);
            }
        }

        //left complex rect
        if(leftComplexes.length){
            let complex_g=body_g.append('g').attr('class','complexRects').attr('transform',`translate(${cluster_width+leftSimpleWidth},${heatmap_y-margin.top})`);
            drawComplex(leftComplexes,complex_g,0,k=>yScale(k.name),complexRectWH,single_rect_height,(d,i)=>`translate(${i*(complexRectWH+small_space)},0)`,d=>`translate(${d.h/2},${heatmap_height+space}) rotate(90)`);
        }

        //heatmap
        drawHeatmap(colors);

        // y text
        if (this.yName !=='hidden') {
            drawYText();
        }

        //Gradient legend
        drawGradientLegend(colors);

        //Ordinal legend
        drawOrdinalLegend();

        //交互
        heatmapInteract();

        //画top left simple column
        function drawSimple(data,i,g,x,y,width,height,transform){
            data.forEach(d=>{
                legends.forEach(m=>{
                    if(d.title===m.title){
                        d.scale=m.scale;
                    }
                })
            })

            let d=data[i];
            let simplePath_g = g.append("g");
            
            simplePath_g.selectAll(".rects")
                .data(d.data).enter()
                .append("rect")
                .attr('fill',m=> m.type===null ? "#000000" : d.scale(m.type))
                .attr('x',x)
                .attr('y',y)
                .attr("width",width)
                .attr("height",height)
                .on('mouseover',d=>{
                    let tipText = `type: ${d.type}<br> name:  ${d.name}`;
                    that.globalService.showPopOver(d3.event, tipText);
                })
                .on('mouseout',()=>{
                    that.globalService.hidePopOver();
                });

            simplePath_g.append('text')
                .style('font-size','14px')
                .style('text-anchor','start')
                .style('dominant-baseline','middle')
                .attr('transform',transform)
                .text(d.title)
        }

        //画top left complex column
        function drawComplex(data,g,x,y,width,height,transform,textTransform){
            data.forEach(d=>{
                legends.forEach(n=>{
                    if(d.title===n.title){
                        d.scale=n.scale;
                    }
                })

                d.data.forEach(m=>{
                    m.data.forEach(k=>{
                        k.type=m.type;
                        k.scale=d.scale;
                    })
                })
            })

            let complexPath_g =g.selectAll('g')
            .data(data).enter()
            .append('g').attr('transform',(d,i)=>`translate(${i*d.h},0)`);

            complexPath_g.selectAll('g')
                .data(d=>d.data).enter()
                .append('g')
                .attr('transform',transform)
                .on('mouseover',d=>{
                    let tipText = `type: ${d.type}`;
                    that.globalService.showPopOver(d3.event, tipText);
                })
                .on('mouseout',()=>{
                    that.globalService.hidePopOver();
                })
                .selectAll('rect')
                .data(m=>m.data).enter()
                .append('rect')
                .attr('x',x)
                .attr('y',y)
                .attr('fill',k=>k.type===null ? '#000000' : k.scale(k.type))
                .attr('width',width)
                .attr('height',height)

            complexPath_g.append('text')
                .style('text-anchor','start')
                .style('dominant-baseline','middle')
                .attr("transform",textTransform)
                .text(d=>d.title)
        }

        //画离散型图例
        function drawOrdinalLegend(){
            let olegend_x=heatmap_x + heatmap_width + space + YtextWidth + space + gradientLegendWidth+legend_chart_space;
            let olegend_y=margin.top+topCluster_height;
            let title_space=10;

            let legendWrap = svg.append("g").attr('class',"OrdinalLegend").attr('transform',`translate(${olegend_x},${olegend_y})`);
            legends.forEach(d=>{

                let curLegend= legendWrap.append('g').attr('class','oLegend');

                
                let sumWidth = 0,
                    sumBeforeWidth = 0;
                let widthArr = [];

                let legendGroup = curLegend.append('g').attr('transform',`translate(0,${title_space})`)
                    .selectAll(".legendGroup")
                    .data(d.chunks)
                    .enter()
                    .append("g")
                    .attr("class", "legendGroup")
                    .attr("index", function(d, i) {
                        return i;
                    })

                let series = legendGroup.selectAll(".boxSeries")
                    .data(m=>m)
                    .enter()
                    .append("g")
                    .attr("class", "boxSeries")

                series.append("rect")
                    .attr("fill",m=> m===null ? '#000000' : d.scale(m))
                    .attr("width", OrdinalRectW)
                    .attr("height", OrdinalRectH)
                    .style("cursor", "pointer")
                    // .on("mouseover", function() {
                    //     d3.select(this).append("title").text("单击修改颜色");
                    // })
                    // .on("mouseout", function() {
                    //     d3.select(this).select("title").remove();
                    // })
                    // .on("click", function(m, i) {
                    //     let oEvent = d3.event || event;
                    //     clearEventBubble(oEvent);

                    //     let select_index = Number($(this).parents('.legendGroup').attr("index"));
                    //     that.oLegendIndex = select_index * legend_col_num + i;
                    //     that.isShowColorPanel = true;
                    // });

                series.append("text")
                    .attr("font-size", "12px")
                    .attr("font-family", "Consolas, Monaco, monospace")
                    .attr("text-anchor", "right")
                    .attr("dominant-baseline", "middle")
                    .attr("transform", "translate(" + (OrdinalRectW + text_space) + "," + OrdinalRectH / 2 + ")")
                    .text(m=>(m.length<=showMaxFontLenght) ? m : m.substring(0,showMaxFontLenght)+'...')
                    .append('title').text(m=>m);

                d3.selectAll("g.legendGroup")
                    .attr("transform", function(d, i) {
                        let colWidth = d3.select(this).node().getBBox().width;
                        widthArr[i] = colWidth;
                        sumWidth += widthArr[i];
                        sumBeforeWidth = sumWidth - widthArr[widthArr.length - 1];
                        let x = sumBeforeWidth + i * legend_col_space;
                        return "translate(" + x + ",0)";
                    })
                    .selectAll("g.boxSeries")
                    .attr("transform", function(d, j) {
                        return "translate(0," + j * (OrdinalRectH + bottom_space) + ")";
                    })

                curLegend.append('text').attr('class','oLegendTitle')
                .style('font-size','14px')
                .style('text-anchor','start')
                
                .text(function(){
                    let textwidth=d.title.length *7+legend_col_space/2;
                    let colWidth=d3.select(this.parentNode).select('.legendGroup').node().getBBox().width;
                    if(textwidth <= colWidth){
                        return d.title;
                    }else{
                        let showNum=Math.ceil(colWidth/7);
                        if(showNum<d.title.length){
                            return d.title.substring(0,showNum) +'...';
                        }else{
                            return d.title;
                        }
                    }
                })
                .append('title').text(d.title)

            })

            d3.selectAll('.oLegend text.oLegendTitle')
            .attr('transform',function(){
                let x = d3.select(this.parentNode).select('.legendGroup').attr('transform');
                return x;
            })
            
        }

        //画热图
        function drawHeatmap(colors) {
            d3.selectAll(".heatmapRects").remove();
            //颜色比例尺
            let colorScale = d3.scaleLinear().domain([valuemax, (valuemin + valuemax) / 2, valuemin]).range(colors).interpolate(d3.interpolateRgb).clamp(true);
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
                    .style("text-anchor", "start")
                    .attr("transform", function () {
                        return "translate(" + (i * single_rect_width + single_rect_width / 2) + "," + (heatmap_height + space) + ") rotate(90)";
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
                down_x = downEvent.offsetX - heatmap_x;
                down_y = downEvent.offsetY - heatmap_y;
                //当前down索引
                let downIndex = getIndex(down_x, down_y);
                down_j = downIndex.y_index;
                clearEventBubble(downEvent);
            })

            big_rect.on("mousemove", function (ev) {
                let moveEvent = ev || d3.event;
                let x_dis = moveEvent.offsetX - heatmap_x;
                let y_dis = moveEvent.offsetY - heatmap_y;

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
                    let gene = (that.yName === 'symbol') ? d.symbol : d.x;
                    let tipText = `sample: ${heatmapData[i].name}<br> gene:  ${gene}<br> log2(fpkm+1): ${d.y}`;
                    that.globalService.showPopOver(d3.event, tipText);
                }
                clearEventBubble(moveEvent);
            });

            select_rect.on("mousemove", function (ev) {
                let moveSelectEvent = ev || d3.event;
                clearEventBubble(moveSelectEvent);
                let y_select_dis = moveSelectEvent.offsetY - heatmap_y;

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
                let up_x = upEvent.offsetX - heatmap_x;
                let up_y = upEvent.offsetY - heatmap_y;

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

            d3.select("#clusterChartDiv svg").on("mousedown", function () {
                select_rect.attr("width", 0).attr("height", 0);
                isMousedown = false;
            })

            d3.select("#clusterChartDiv svg").on("mouseup", function () {
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
                    return that.yName === 'symbol' ? d.symbol : d.x;
                })
                .attr("y", function (d, i) {
                    return i * single_rect_height + single_rect_height / 2;
                })
        }

        //画渐变式图例
        function drawGradientLegend(colors) {
            d3.selectAll(".gradientLegend defs").remove();
            d3.selectAll(".gradientLegend rect").remove();
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

        //点击渐变式图例改图颜色
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
            .on("mousedown", () => {
                let oEvent = d3.event || event;
                clearEventBubble(oEvent);
            })
            .on("mouseup",(d,i)=>{
                clearEventBubble(d3.event);
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
        let cluster = d3.cluster()
            .size([size1, size2])
            .separation(function () { return 1; });

        let cluster_g = gContainer.append("g").attr("class", type);
        if (type == "leftLine") {
            cluster_g.attr("transform", "translate(" + translateX + "," + translateY + ")");
        }

        if (type == "topLine") {
            cluster_g.attr("transform", "translate(" + translateX + "," + translateY + ") rotate(90)");
        }

        //根据数据建立模型
        let root = d3.hierarchy(data);
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

     // 数组分组
    chunk(array, size) {
        let length = array.length;

        //判断不是数组，或者size没有设置，size小于1，就返回空数组
        if (!length || !size || size < 1) {
            return [];
        }

        let index = 0; //用来表示切割元素的范围start
        let resIndex = 0; //用来递增表示输出数组的下标

        //根据length和size算出输出数组的长度，并且创建它。
        let result = new Array(Math.ceil(length / size));

        //循环
        while (index < length) {
            //循环过程中设置result[0]和result[1]的值。该值根据array.slice切割得到。
            result[resIndex++] = array.slice(index, (index += size))
        }

        //输出新数组
        return result;
    }

}
