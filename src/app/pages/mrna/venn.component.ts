import { AjaxService } from 'src/app/super/service/ajaxService';
import { Component, OnInit } from "@angular/core";
import config from '../../../config';
declare const d3: any;
declare const Venn:any;
@Component({
    selector: "app-venn-component",
    templateUrl: "./venn.component.html",
    styles: []
})
export class VennComponent implements OnInit {
    // 图表切换
    tableUrl: string;
    chartUrl: string;
    tableEntity: object = {
        "LCID": sessionStorage.getItem("LCID"),
        "sample": "",
        "compare": ""
    };

    sampleList: string[] = [];
    compareList: string[] = [];

    chart: any;
    isMultiSelect: boolean;
    selectedData:object[]=[];

    // 大表
    pageEntity:object = {
        pageSize:10,
        pageIndex:1,
        addThead:[],
        searchList:[],
        rootSearchContentList:[],
        sortKey:"",
        sortValue:"",
        sample:["A1","B1"]
    }
    //url = `${config["javaPath"]}/DiffVenn/table`;
    //url = `${config["javaPath"]}/DiffVenn/table`;

    constructor(
        private ajaxService:AjaxService
    ) {}

    ngOnInit() {
        this.isMultiSelect = false;
        // this.tableUrl = `${config["javaPath"]}/DiffVenn/table`;
        // this.chartUrl = `${config["javaPath"]}/DiffVenn/graph`;

        // this.tableUrl = `${config["javaPath"]}/DiffVenn/table`;
        // this.chartUrl = `${config["javaPath"]}/Venn/diffGeneGraph`;

        this.sampleList = ["HBRR1", "HBRR2", "HBRR3", "HBRR4", "uBRR1", "uBRR2", "uBRR3", "uBRR4"];
        this.compareList = ["com1", "com2", "com3", "com4", "compare1", "compare2", "compare3", "compare4"];

        this.tableEntity['sample'] = this.sampleList[0];
        this.tableEntity["compare"] = this.compareList[0];

        this.getVennData();
    }

    // venn test
    getVennData() {
        this.ajaxService
            .getDeferData({
                url: `${config["javaPath"]}/Venn/diffGeneGraph`,
                data:{
                    "LCID": "demo3",
                    "compareGroup": [
                        "A1-vs-B1",
                        "A1-vs-C1",
                        "C2-vs-A2"
                    ],
                    "geneType": "transcript",
                    "species": "aisdb",
                    "diffThreshold": {
                        "PossionDis": {
                            "log2FC": 1,
                            "FDR": 0.001
                        }
                    }
                }
            })
            .subscribe(
                data => {
                    //console.log(data.data)
                    // if(data.data.length>5){
                    //     this.showUpSetR(data);
                    // }else{
                    //     this.drawVenn(data);
                    // }
                    this.showUpSetR(data);
                   
                },
                error => {
                    console.log(error);
                }
            );
    }

    drawVenn(data) {
        let tempA = data.data.bar.map(o=>{return{CompareGroup:o.name, Count:o.value}});
        let tempR = [];
        for (let index = 0; index < tempA.length; index++) {
            const element = tempA[index];
            let tempO = {
                result:element
            }
            tempR.push(tempO);
        }

        let oVenn = new Venn({ id: "chartId22122" })
            .config({
                data: tempR,
                compareGroup:  [
                    "A1-vs-B1",
                    "A1-vs-C1",
                    "C2-vs-A2"
                ]
            })
            .drawVenn();
    }

    multiSelectChange(){

    }

    showUpSetR(data){
        // let selectBar = [];
        // let tempBar = data.data.bar;
        // for (let index = 0; index < tempBar.length; index++) {
        //     const element = tempBar[index].value;
        //     if(element!=0){
        //         selectBar.push(tempBar[index]);
        //     }
        // }

        let t_chartID = document.getElementById("chartId22122");
        let Div = document.createElement("div");
        Div.className ="mven_div";
        let str = "<svg id='svg' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'></svg>";
        Div.innerHTML=str;
        t_chartID.appendChild(Div);
        
        let List = {
            total:data.data.total,
            bar:data.data.bar
        };
        
        // console.log(selectBar)
        // console.log(data.data.bar)
        //左侧数据
        let total_name = [];
        let total_value = [];
        let total_lenght = List.total.length;
        for(let i = 0;i<List.total.length;i++){
            total_name.push(List.total[i].name);
            total_value.push(List.total[i].value);
        }
    
        //上侧数据
        let bar_name = [];
        let bar_value = [];
        let bar_length = List.bar.length;
        for(let i = 0;i<List.bar.length;i++){
            bar_name.push(List.bar[i].name);
            bar_value.push(List.bar[i].value);
        }
    
        let d3_xScale; //矩阵圆点的x轴
        let d3_yScale; //矩阵圆点的y轴
        let d3_rectWidth = 24; //柱子的宽度
        let d3_rectKong = 6; //柱子间的间宽
        let d3_xlength = bar_value.length;; //矩阵圆点的x轴有多少柱子
        let d3_ylength = total_value.length;; //矩阵圆点的y轴有多少柱子
        let d3_width = d3_rectWidth * d3_xlength + d3_rectKong*(d3_xlength+1);
        let d3_height = d3_rectWidth * d3_ylength + d3_rectKong*(d3_ylength+1);
    
        let nameList=[];
        let tempName={};
        let drawCircle = [];
        let tempThat;
        let tempP;
        let tempCricle;    //圆
    
        let svg_height = 300 + d3_height + 20 + 10 + 20 + 20;//计算最外层svg高度
        let svg_width = 320 + d3_width + 60 + 30 + 20 + 80; //计算最外层svg宽度

        let svg=d3.select("#svg").attr("width", svg_width).attr("height", svg_height);
    
        let tooltip = d3.select(".mven_div").append("div")
            .attr("class", "tooltip") //用于css设置类样式
            .attr("opacity", 0.0);
    
        drawSvg();
        drawSvg2();
        drawSvg3();
    
        function drawSvg() {
            let width = d3_width;
            let height = 300;
    
            //画布周边的空白
            let padding = { left: 60, right: 30, top: 20, bottom: 10 };
            let svg1 = d3.select("#svg")
                .append("svg")
                .attr("x", "320")
                .attr("y", "0")
                .attr('width', width)
                .attr('height', height);
            let xScale = d3.scaleBand()
                .domain(bar_name)
                .range([0, width - padding.left - padding.right]);
            let yScale = d3.scaleLinear()
                .domain([0, d3.max(bar_value)])
                .range([height - padding.bottom - padding.top, 0]);
    
            d3_xScale = xScale;
            let xAxis = d3.axisBottom(xScale)
            let yAxis = d3.axisLeft(yScale).ticks(5)
    
            let rects = svg1.selectAll('.MyRect')
                .data(bar_value)
                .enter()
                .append('g')
                .on("mouseover", function (d, i) {
                    //添加标签
                    svg.append("text")
                        .attr("id", "tooltip")
                        .attr("x", xScale(bar_name[i])- d3_rectKong)
                        .attr("y", yScale(d))
                        .attr("text-anchor", "middle")
                        .attr("font-family", "sans-setif")
                        .attr("font-size", "11px")
                        .attr("font-weight", "bold")
                        .attr("z-index",9999)
                        .attr("fill", "blue")
                        .text("数量为" + d);
    
                })
                .on("mouseout", function (d) {
                    d3.select("#tooltip").remove();
                })
                .on("click",function(d,i){
                    d3.selectAll('.MyRect').attr("fill","black");
                    d3.select(this).select(".MyRect").attr("fill","steelblue");
                });
    
            rects.append('rect')
                .attr('class', 'MyRect')
                .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                .attr('x', function (d, i) {
                    return xScale(bar_name[i]) + d3_rectKong;
                })
                .attr('y', function (d, i) {
                    return yScale(d);
                })
                .attr('width', d3_rectWidth - d3_rectKong * 2)
                .attr('height', function (d, i) {
                    return height - padding.bottom - padding.top - yScale(d);
                })
                .attr("fill","black")
                .attr("stroke-width",10)
                .attr("stroke","black")
                .attr("stroke-opacity",0);
                
    
            svg1.append('g')
                .attr('class', 'axis_x1')
                .attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")")
                .call(xAxis);
            svg1.append('g')
                .attr('class', 'axis_y1')
                .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                .call(yAxis);
        }
    
        function drawSvg2() {
            let width = 320;
            let height = d3_height;
    
            let min = d3.min(total_value);
            let max = d3.max(total_value);
            let padding = { left: 20, right: 80, top: 0, bottom: 20 };
    
            let svg2 = d3.select("#svg")
                .append("svg")
                .attr("x", "0")
                .attr("y", "300")
                .attr("width", width)
                .attr("height", height);
    
            let xScale = d3.scaleLinear()
                .domain([0, d3.max(total_value)])
                .range([width - padding.left - padding.right, 0]);
    
            let yScale = d3.scaleBand()
                .domain(total_name)
                .range([height - padding.top - padding.bottom, 0]);
    
    
            d3_yScale = yScale;
    
            let xAxis = d3.axisBottom(xScale).ticks(5)
            let yAxis = d3.axisRight(yScale)
    
            let rects = svg2.selectAll('MyRect2')
                .data(total_value)
                .enter()
                .append('g')
                .on("mouseover", function (d, i) {
                    svg.append("text")
                        .attr("id", "tooltip")
                        .attr("x", xScale(d)+60)
                        .attr("y", yScale(total_name[i]) + d3_rectKong)
                        .attr("text-anchor", "middle")
                        .attr("font-family", "sans-setif")
                        .attr("font-size", "11px")
                        .attr("font-weight", "bold")
                        .attr("fill", "blue")
                        .text("数量为" + d);
                })
                .on("mouseout", function (d) {
                    d3.select("#tooltip").remove();
                })
                .on("click",function(d,i){
                    d3.selectAll('.MyRect2').attr("fill","black");
                    d3.select(this).select(".MyRect2").attr("fill","steelblue");
                });
    
            rects.append("rect")
                .attr("class", "MyRect2")
                .attr("x", function (d, i) {
                    return xScale(d) + padding.left;
                })
                .attr("y", function (d, i) {
                    return yScale(total_name[i]) + d3_rectKong;
                })
                .attr("width", function (d, i) {
                    return width - padding.right - xScale(d) - padding.left;
                })
                .attr("height", function (d, i) {
                    return d3_rectWidth - d3_rectKong * 2;
                })
                .attr("fill","black")
                .attr("stroke-width",10)
                .attr("stroke","black")
                .attr("stroke-opacity",0);
    
            let texts = svg2.selectAll('text')
                        .data(total_name)
                        .enter()
                        .append('text')
                        .attr("class","MyText")
                        .attr("dx",function (d, i) {
                            return xScale(0)+padding.left+5;
                        })
                        .attr("dy",function (d, i) {
                            return yScale(total_name[i])+padding.bottom;
                        })
                        .text(function (d, i) {
                            return d;
                        })
                        .on("click",function(d,i){
                            //d3.select(this).style("fill", "red");
                            sortName(d,d3.select(this));                
                        });
    
            svg2.append("g").attr("class", "axis_x2").attr("transform", "translate(" + padding.left + "," + (height - padding.bottom) + ")").call(xAxis).selectAll("text")
            .attr("transform", "rotate(-10)");
            svg2.append("g").attr("class", "axis_y2").attr("transform", "translate(" + (width - padding.right) + "," + (padding.top) + ")").call(yAxis);
        }
    
        function sortName(d,that){
            if(nameList.length==0){
                nameList.push(d);
                tempName[d] = true;
                that.style("fill", "red");
            }else{
                if(tempName[d]){
                    for(let i=0; i<nameList.length; i++) {
                        if(nameList[i] == d) {
                            nameList.splice(i, 1);
                            tempName[d] = false;
                            that.style("fill", "black");
                        }
                    }
                }else{
                    nameList.push(d);
                    tempName[d] = true;
                    that.style("fill", "red");
                }
            }
            
            nameToCircle(nameList);
        }
    
        function drawSvg3() {
            let width = d3_width;
            let height = d3_height;
    
            let svg3 = d3.select("#svg")
                .append("svg")
                .attr("x", "320")
                .attr("y", "300")
                .attr('width', width)
                .attr('height', height);
    
            tempThat = svg3;
    
            let xAxis = d3.axisBottom(d3_xScale);
            let yAxis = d3.axisRight(d3_yScale);
    
            let jsonCircles = [];
            let row = d3_xlength;
            let col = d3_ylength;
    
            for (let i = 0; i < row; i++) {
                let temp = {};
                for (let j = 0; j < col; j++) {
                    temp = {
                        "x_axis": 30 + d3_xScale(bar_name[i]) + d3_rectWidth / 2+30,
                        "y_axis": d3_yScale(total_name[j]) + d3_rectWidth / 2,
                        "r": d3_rectWidth/2,
                        "flag": threeC(total_name[j],bar_name[i])?true:false,
                        "color":threeC(total_name[j],bar_name[i])?"black":"gray",
                        "nameX":threeC(total_name[j],bar_name[i])?bar_name[i]:'',
                        "nameY":total_name[j],
                        "sort":sortC(bar_name[i])
                    };
                    jsonCircles.push(temp);
                }
            }
            
    
            drawCircle = jsonCircles;
    
            makeBaseCircle(jsonCircles,svg3); //造点 这时候包含点的颜色 添加圆 基本圆
    
            drawLine(sortArr(jsonCircles,'x_axis'),svg3,"black");//把x轴相同的分在一起 画线
    
            svg3.append("g").attr("class", "axis_xCircle").attr("transform", "translate(30,0)").call(xAxis);
            svg3.append("g").attr("class", "axis_yCircle").attr("transform", "translate(30,0)").call(yAxis);
        }
    
        function threeC(lis1,lis2){
            let m_flag = false;
            lis2=lis2.split("n");
            for (let index = 0; index < lis2.length; index++) {
                if(lis2[index]==lis1)
                m_flag = true;
            }
            return m_flag;
        }
        function sortC(lis2){
            return lis2.split("n").sort()
        }
        //造点 这时候包含点的颜色 添加圆 基本圆
        function makeBaseCircle(arr,svg_t) {
            svg_t.selectAll(".MyRect3").on("mouseover", function (d, i) {
                console.log(d3.select(this))
            })
            .on("mouseout", function (d) {
                console.log(d3.select(this));
            });
    
            svg_t.selectAll(".MyCircle") 
                .data(arr)
                .enter()
                .append("circle")
                .attr("class", "MyCircle")
                .attr("cx", function (d, i) {
                    return d["x_axis"];
                })
                .attr("cy", function (d, i) {
                    return d["y_axis"];
                })
                .attr("r", function (d, i) {
                    return d["r"] - d3_rectKong;
                })
                .style("fill", function (d) { 
                    return d.color; 
                })
            let tempList = sortArr(arr,'x_axis');
            for (let i = 0; i < tempList.length; i++) {
                svg_t.append('rect')
                    .attr('class', 'MyRect3')
                    .attr('x', tempList[i][0]["x_axis"]-d3_rectWidth/2+d3_rectKong)
                    .attr('y', function (d, i) {
                        return 0;
                    })
                    .attr('width', d3_rectWidth - d3_rectKong * 2)
                    .attr('height', function (d, i) {
                        return d3_height;
                    })
                    .attr('opacity', 0);
            }
        }
    
        //选择后画圆
        function selectBaseCircle2(arr,targetArr,num){
            let tempA = [];
            for (let index = 0; index < arr.length; index++) {
                if(targetArr.toString()==arr[index].sort.toString()){
                    if(arr[index].flag){
                        arr[index].color="red";
                        tempA.push(arr[index]);
                    }
                    
                }
                
            }
    
            return tempA;
        }  
        
        //画线第1步
        function drawLine(targetGroup,svg_f,color){
            let temp = [];
            let tempThatone = svg_f.append("g")
            //     .on("mouseover", function (d, i) {
            //         d3.select(this).select(".MyRect3").attr("fill","red");
            //     })
            //     .on("mouseout", function (d) {
            //         d3.select(this).select(".MyRect3").attr("fill","none")
            //     });
    
            let line = d3.line()
                    .x(function (d) { return d.x_axis; })
                    .y(function (d) { return d.y_axis; });
            
            for (let i = 0; i < targetGroup.length; i++) {
                for(let j=0;j<targetGroup[i].length;j++){
                    if(targetGroup[i][j].flag){
                        temp.push(targetGroup[i][j]);
                    }
                }
                let tempArr=secondArr(targetGroup[i]);  //画线2 把每组中要画的点提取到一起
    
                let path = tempThatone.append('path')
                    .attr('class', 'line')
                    .attr('d', line(tempArr))
                    .attr("stroke", "black")
                    .attr("stroke-width", 3);
            }
        }
        
        //选择名字画线第2步
        function drawLine2(targetGroup,svg_s,color,num){
            
            //let tempArr=secondArr(targetGroup);
            if(targetGroup.length>1){
                let line = d3.line()
                    .x(function (d) { return d.x_axis; })
                    .y(function (d) { return d.y_axis; });
                
                tempP = svg_s.append('path')
                    .attr('class', 'line')
                    .attr('d', line(targetGroup))
                    .attr("stroke", color)
                    .attr("stroke-width", 3);
            }
    
            tempCricle = svg_s.selectAll('.MyCircle2')
                    .data(targetGroup)
                    .enter()
                    .append('circle')
                    .attr('class', 'MyCircle2')
                    .attr('cx', function (d, i) {
                        return d["x_axis"];
                    })
                    .attr('cy', function (d, i) {
                        return d["y_axis"];
                    })
                    .attr('r', function (d, i) {
                        return d["r"] - d3_rectKong;
                    })
                    .style("fill", function (d) { 
                        return d.color; 
                    });
        }
    
        //画线2 把每组中要画的点提取到一起
        function secondArr(arr) {
            let tempArr = [];
            for(let i=0;i<arr.length;i++){
                if(arr[i].flag ==true){
                    tempArr.push(arr[i]);
                }
            }
            return tempArr;
        }
    
        //把x轴相同的分在一起
        function sortArr(arr, str) {
            let _arr = [],
                _t = [],
                // 临时的变量
                _tmp;
    
            // 按照特定的参数将数组排序将具有相同值得排在一起
            arr = arr.sort(function (a, b) {
                let s = a[str],
                    t = b[str];
                return s < t ? -1 : 1;
            });
    
            if (arr.length) {
                _tmp = arr[0][str];
            }
            // console.log( arr );
            // 将相同类别的对象添加到统一个数组
            for (let i in arr) {
                //console.log( _tmp);
                if (arr[i][str] === _tmp) {
                    //console.log(_tmp)
                    _t.push(arr[i]);
                } else {
                    _tmp = arr[i][str];
                    _arr.push(_t);
                    _t = [arr[i]];
                }
            }
            // 将最后的内容推出新数组
            _arr.push(_t);
            return _arr;
        }
    
        function nameToCircle(nameList){
            if(tempCricle != undefined){
                tempCricle.remove();
            }
            if(tempP != undefined)
            {
                tempP.remove();
            }
    
            let tempdata=selectBaseCircle2(drawCircle,nameList.sort(),nameList.length);
            drawLine2(tempdata,tempThat,"red",5);//把x轴相同的分在一起 画线
        }

    }
}
