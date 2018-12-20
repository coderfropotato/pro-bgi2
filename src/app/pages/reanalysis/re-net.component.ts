import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import {PromptService} from './../../super/service/promptService';
import { expand } from 'rxjs/operators';

declare const d3: any;
declare const $: any;

@Component({
  selector: 'app-re-net',
  templateUrl: './re-net.component.html',
  styles: []
})
export class ReNetComponent implements OnInit {

    @ViewChild('netChart') netChart;
    @ViewChild('left') left;
	@ViewChild('right') right;
	@ViewChild('func') func;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    //图
    chartUrl: string;
    chartEntity: object;
    chart:object;

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    nodeColorScale:any;

    // 选中的节点、线
    selectGeneList:string[] = []; // 选择的节点geneID
    selectLinkList:string[]=[]; // 选择的线ID
    selectedNodes:object[]=[]; //选中的节点
    selectedLinks:object[]=[];  //选择的线

    // 设置
    force:number=600; //斥力
    radian:number=10; //弧度
    symbolType:string='selected'; // gene symbol 显示: hidden all selected

    //serach
    allNodes:any[]=[];
    curSearchNode:string;

    // table
    setAddedThead :any= [];
    defaultEntity: object;
	defaultUrl: string;
	defaultTableId: string;
	defaultDefaultChecked: boolean;
	defaultCheckStatusInParams: boolean;
	defaultEmitBaseThead: boolean;

	extendEntity: object;
	extendUrl: string;
	extendTableId: string;
	extendDefaultChecked: boolean;
	extendCheckStatusInParams: boolean;
	extendEmitBaseThead: boolean;
	baseThead: any[] = [];
    applyOnceSearchParams: boolean;

    tableHeight = 0;
    first = true;
    switch = false;
    onlyTable:boolean = false;

    addColumnShow:boolean = false;
    showBackButton:boolean = false;


    // 路由参数
    tid:string = "df3017e1c1ab4acca8f92b336ebc921b";
    geneType:string = '';
    version:string = null;

    constructor(
        private message: MessageService,
		private store: StoreService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
        private router: Router,
        private routes:ActivatedRoute,
        private promptService:PromptService
    ) {
        // 订阅windowResize 重新计算表格滚动高度
		this.message.getResize().subscribe((res) => {
			if (res['message'] === 'resize') this.computedTableHeight();
		});

		// 每次切换路由计算表格高度
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
                this.computedTableHeight();
            }
        });

        this.routes.paramMap.subscribe((params)=>{
            this.tid = params['params']['tid'];
            this.version = params['params']['version'];
            this.geneType = params['params']['geneType'];
            this.storeService.setTid(this.tid);
        })
    }

    ngOnInit() {
        // chart
        this.colors = ["#0000ff", "#ff0000"];

        // this.chartUrl=`${config['javaPath']}/net/graph`; 
        this.chartUrl=`http://localhost:8086/net`;
        this.chartEntity = {
            "id": this.tid,
            "quantity":{}
        };

        // table
        // this.first = true;
        // this.applyOnceSearchParams = true;
        // this.defaultUrl = `${config['javaPath']}/Cluster/getClusterGeneTable`;
        // this.defaultEntity = {
        //     LCID: sessionStorage.getItem('LCID'),
        //     tid:this.tid,
        //     pageIndex: 1, //分页
        //     pageSize: 20,
        //     mongoId: null,
        //     addThead: [], //扩展列
        //     transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
        //     matchAll: false,
        //     matrix: false, //是否转化。矩阵为matrix
        //     relations: [], //关系组（简写，索引最后一个字段）
        //     sortValue: null,
        //     sortKey: null, //排序
        //     reAnaly: false,
        //     geneType: this.geneType, //基因类型gene和transcript
        //     species: this.storeService.getStore('genome'), //物种
        //     version: this.version,
        //     searchList: []
        // };
        // this.defaultTableId = 'default_re_net';
        // this.defaultDefaultChecked = true;
        // this.defaultEmitBaseThead = true;
        // this.defaultCheckStatusInParams = true;

        // this.extendUrl = `${config['javaPath']}/Cluster/getClusterGeneTable`;
        // this.extendEntity = {
        //     LCID: sessionStorage.getItem('LCID'),
        //     tid:this.tid,
        //     pageIndex: 1, //分页
        //     pageSize: 20,
        //     mongoId: null,
        //     addThead: [], //扩展列
        //     transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
        //     matchAll: false,
        //     matrix: false, //是否转化。矩阵为matrix
        //     relations: [], //关系组（简写，索引最后一个字段）
        //     sortValue: null,
        //     sortKey: null, //排序
        //     reAnaly: false,
        //     geneType: this.geneType, //基因类型gene和transcript
        //     species: this.storeService.getStore('genome'), //物种
        //     version: this.version,
        //     searchList: []
        // };
        // this.extendTableId = 'extend_re_net';
        // this.extendDefaultChecked = true;
        // this.extendEmitBaseThead = true;
        // this.extendCheckStatusInParams = false;

    }

    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
    }

    toggle(status){
        this.addColumnShow = status;
    }

    // 表
    addThead(thead) {
		this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
		this.transformTable._addThead(thead['add']);
    }

    // 表格转换 确定
    // 转换之前需要把图的 参数保存下来  返回的时候应用
	confirm(relations) {
        this.showBackButton = true;
        this.extendEmitBaseThead = true;
		let checkParams = this.transformTable._getInnerParams();
		// 每次确定把之前的筛选参数放在下一次查询的请求参数里 请求完成自动清空上一次的请求参数，恢复默认；
		this.applyOnceSearchParams = true;
		if (this.first) {
            this.extendCheckStatusInParams = false;
			this.extendEntity['checkStatus'] = checkParams['others']['checkStatus'];
			this.extendEntity['unChecked'] = checkParams['others']['excludeGeneList']['unChecked'];
			this.extendEntity['checked'] = checkParams['others']['excludeGeneList']['checked'];
			this.extendEntity['mongoId'] = checkParams['mongoId'];
			this.extendEntity['searchList'] = checkParams['tableEntity']['searchList'];
            this.extendEntity['rootSearchContentList'] = checkParams['tableEntity']['rootSearchContentList'];
            this.extendEntity['relations'] = relations;
            this.extendEntity['transform'] = true;
            this.extendEntity['matrix'] = true;
            this.addColumn._clearThead();
			this.extendEntity['addThead'] = [];
			this.first = false;
		} else {
			this.transformTable._initTableStatus();
			this.extendCheckStatusInParams = false;
			this.transformTable._setExtendParamsWithoutRequest('checkStatus', checkParams['others']['checkStatus']);
			this.transformTable._setExtendParamsWithoutRequest( 'checked', checkParams['others']['excludeGeneList']['checked'].concat() );
			this.transformTable._setExtendParamsWithoutRequest( 'unChecked', checkParams['others']['excludeGeneList']['unChecked'].concat() );
			this.transformTable._setExtendParamsWithoutRequest('searchList', checkParams['tableEntity']['searchList']);
			this.transformTable._setExtendParamsWithoutRequest( 'rootSearchContentList', checkParams['tableEntity']['rootSearchContentList'] );
			this.transformTable._setExtendParamsWithoutRequest( 'relations',relations);
			this.transformTable._setExtendParamsWithoutRequest( 'transform',true);
			this.transformTable._setExtendParamsWithoutRequest( 'matrix',true);
            this.transformTable._setExtendParamsWithoutRequest( 'addThead', []);
            this.addColumn._clearThead();
			// 每次checkStatusInParams状态变完  再去获取数据
			setTimeout(() => {
				this.transformTable._getData();
			}, 30);
		}
		setTimeout(() => {
			this.extendCheckStatusInParams = true;
		}, 30);
	}

	back() {
        this.showBackButton = false;
        this.chartBackStatus();
    }

    handlerRefresh(){
        this.selectGeneList.length = 0;
        this.chartBackStatus();
    }

    chartBackStatus(){
        this.showBackButton = false;
        this.defaultEmitBaseThead = true;
        if(!this.first){
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            if(this.selectGeneList.length){
                this.defaultEntity['searchList'] = [
                    {"filterName":"gene_id","filterNamezh":"gene_id","searchType":"string","filterType":"$in","valueOne":this.selectGeneList.join(','),"valueTwo":null}
                ];
            }else{
                this.defaultEntity['searchList']= [] ;
            }
            this.first = true;
        }else{
            /*filterName, filterNamezh, filterType, filterValueOne, filterValueTwo*/
            if(this.selectGeneList.length) {
                this.transformTable._filter("gene_id","gene_id","string","$in",this.selectGeneList.join(','),null);
            }else{
                // this.transformTable._setParamsNoRequest('searchList',[]);
                this.transformTable._deleteFilterWithoutRequest("gene_id","gene_id","$in");
                this.transformTable._getData();
            }
        }
    }

	// 表格基础头改变  设置emitBaseThead为true的时候 表格下一次请求回来会把表头发出来 作为表格的基础表头传入增删列
	baseTheadChange(thead) {
		this.baseThead = thead['baseThead'].map((v) => v['true_key']);
    }

	// 表格上方功能区 resize重新计算表格高度
	resize(event) {
        setTimeout(()=>{
            this.computedTableHeight();
        },30)
    }

    // 切换左右布局 计算左右表格的滚动高度
	switchChange(status) {
        this.switch = status;
        setTimeout(()=>{
            this.netChart.scrollHeight();
            this.computedTableHeight();
        },320)
    }

	// 展开表icon 点击事件
    handleOnlyTable(){
        this.onlyTable = !this.onlyTable;
	}

	// 从布局切换发出的事件
	handlOnlyTableChange(status){
		this.onlyTable = status;
	}

    computedTableHeight() {
		try {
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - 24;
		} catch (error) {}
    }

    // 图

    //画图
    drawChart(data){
        d3.select("#netChartDiv svg").remove();
        let that  = this;
        this.allNodes=data.nodes;

        //关联关系
        let relations = this.storeService.getStore('relations');
        let colorArr = [["#FF8B8B", "#167C80"], ["#005397", "#FACA0C"], ["#F3C9DD", "#0BBCD6"], ["#BFB5D7", "#BEA1A5"], ["#0E38B1", "#A6CFE2"], ["#371722", "#C7C6C4"]];
        let relationColors=[...relations];
        relationColors.forEach((d,i)=>{
            d.colors=[...colorArr[i]];
        })
        
        let netRelations=[];
        let linkRelations=[];

        //数据
        let nodes=data.nodes,links=data.links;
        let values=data.value;
        let min=values[0],max=values[1];

        nodes.forEach(d => {
            d.selected=false;
            that.selectGeneList.forEach(m=>{
                if(d.geneID===m){
                    d.selected=true;
                }
            })
        });

        links.forEach(d=>{
            netRelations.push(d.type);
        })
        netRelations=Array.from(new Set(netRelations));

        netRelations.forEach(d=>{
            linkRelations.push({
                type:d
            })
        })

        linkRelations.forEach(d=>{
            relationColors.forEach(m=>{
                if(d.type===m.key){
                    d.scores=[m.score[0],m.score[1]];
                    d.colors=[...m.colors];
                    d.scale=d3.scaleLinear().domain(d.scores).range(d.colors).clamp(true).nice();
                }
            })
        })

        links.forEach(d=>{
            d.selected=false;
            linkRelations.forEach(m=>{
                if(d.type===m.type){
                    d.scale=m.scale;
                }
            })
        })

        let arrows = [{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }]; //箭头

        //容器宽高
        let width=700,height=700;
        
        let colors=this.colors;

        //node比例尺
        let typeArr=["mrna", "miRNA", "lncRNA", "other"];
        let circleShape=d3.symbol().type(d3.symbolCircle)(), // 圆
            yShape=d3.symbol().type(d3.symbolWye)(),  // Y
            diamondShape=d3.symbol().type(d3.symbolDiamond)(),  // 菱形
            triangleShape=d3.symbol().type(d3.symbolTriangle)();  // 三角形

        let shapeArr=[circleShape,yShape,diamondShape,triangleShape];

        let symbolArr=[d3.symbolCircle,d3.symbolWye,d3.symbolDiamond,d3.symbolTriangle];

        //形状
        let symbolScale= d3.scaleOrdinal()
            .domain(typeArr)
            .range(symbolArr);

        //大小
        let sizeScale=d3.scaleLinear()
            .range([min*10+20, max*10+20])
            .domain([min, max]).clamp(true).nice();

        //颜色
        this.nodeColorScale=d3.scaleLinear()
            .range(colors)
            .domain([min,max]).clamp(true).nice();

        // 图例比例尺
        //node 形状
        let shapeLegendScale =  d3.scaleOrdinal()
            .domain(typeArr)
            .range(shapeArr);

        //svg  点击空白处，所有的node和link清除选中
        let svg = d3.select("#netChartDiv").append('svg').attr("width", width).attr("height", height)
            .call(
                //缩放
                d3.zoom()
                    .scaleExtent([0.1, 10])
                    .on("zoom", function () {
                        g.attr("transform",d3.event.transform);
                    })
            )
            .on("dblclick.zoom", null);

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

        let g = svg .append("g");

        //力图
        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d=> d.geneID).iterations(4))
            .force('charge', d3.forceManyBody().strength(-this.force))
            // .force("collide", d3.forceCollide().radius(d => sizeScale(d.value)))  // 添加碰撞检测，使节点不重叠
            .force('center', d3.forceCenter(width/2, height/2))
            .force("x", d3.forceX())
            .force("y", d3.forceY())

        //link
        let link = g.append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', d=> d.scale(d.score))
            .attr('stroke-width', 2)
            .attr("fill", "none")
            .style('cursor','pointer')
            .attr("marker-end",d=> d.type==='target' ? 'url(#end-arrow)' :'')
            .on("mouseover", m => {
                let text = `source：${m.source.geneID}<br>target：${m.target.geneID}<br>type：${m.type}<br>score：${m.score}<br>文献：${m.references}`;
                this.globalService.showPopOver(d3.event, text);
            })
            .on("mouseout", () => {
                this.globalService.hidePopOver();
            })
            .on("click", function (d) {
                clearEventBubble(d3.event);
                d.selected = !d.selected;
    
                //选中link加到list中，反选link中从list中去掉
                if (d.selected) {
                    d3.select(this).attr('stroke',"#000000");
                    that.selectedLinks.push(d);
                } else {
                    d3.select(this).attr('stroke',d.scale(d.score));
                }

                that.selectedLinks=that.selectedLinks.filter(k=>k['selected']===true);
                that.selectLinkList.length=0;
                that.selectedLinks.forEach(m=>{
                    that.selectLinkList.push(m['id']);
                })
            });


        //node
        // d3.symbol().type(形状) 生成不同形状，size函数可以定义大小
        let g_node = g.append('g').attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g")

        let node = g_node.append("path")
            .attr('class',"node")
            .attr("d",d3.symbol()
                .type(d=>symbolScale(d.type))
                .size(d=>sizeScale(d.value))
            )
            .attr('fill', d=>d.selected ? "#167C80" : that.nodeColorScale(d.value))
            .attr("cursor", "pointer")
            .on("mouseover", m => {
                let text = `geneID：${m.geneID}<br>type：${m.type}<br>linkNum：${m.value}<br>geneSymbol：${m.symbol}`;
                this.globalService.showPopOver(d3.event, text);
            })
            .on("mouseout", () => {
                this.globalService.hidePopOver();
            })
            .on("click", function (d) {
                clearEventBubble(d3.event);
                d.selected = !d.selected;

                //选中node加到list中，反选node中从list中去掉
                if (d.selected) {
                    d3.select(this).attr('fill',"#167C80");
                    that.selectedNodes.push(d);
                } else {
                    d3.select(this).attr('fill',that.nodeColorScale(d.value));
                }

                that.selectedNodes=that.selectedNodes.filter(k=>k['selected']===true);
                that.selectGeneList.length=0;
                that.selectedNodes.forEach(m=>{
                    that.selectGeneList.push(m['geneID']);
                })
            })

        g_node.call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))


        simulation
            .nodes(nodes)
            .on('tick', ticked);

        simulation.force('link')
            .links(links);

        //node text
        if(that.symbolType !=='hidden'){
            drawText();
        }

        // svg 点击清空选择
        d3.select("#netChartDiv svg").on('click',function(){
            d3.selectAll('path.node').attr('fill',d=>that.nodeColorScale(d.value));
            d3.selectAll('path.link').attr('stroke',d=>d.scale(d.score));
            that.selectedNodes.length=0;
            that.selectedLinks.length=0;
            that.selectGeneList.length=0;
            that.selectLinkList.length=0;
        })

        function drawText(){
            let node_text= g_node.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)

            if(that.symbolType==='all'){
               node_text
                .text(function (d) {
                    return d.symbol;
                })
            }else{
                node_text
                .text(function (d) {
                    return d.selected ? d.symbol :'';
                })
            }
        }

        function ticked() {
            link.attr("d", function (d) {
                //基础偏移量
                let offsetBasic = that.radian;
                //中点
                let midpoint_x = (d.source.x + d.target.x) / 2;
                let midpoint_y = (d.source.y + d.target.y) / 2;
                //相对位置计算
                let dx = (d.target.x - d.source.x);
                let dy = (d.target.y - d.source.y);
                let normalise = Math.sqrt((dx * dx) + (dy * dy));

                //根据总条目和当前条目层次，计算offset。根据source和target顺序计算符号
                // 总数 count   顺序 tempindex
                let offset;
                if(d.count){
                    //总条数为双数
                    if(d.count % 2 == 0){
                       offset =  (parseInt(''+d['tempindex'] / 2) + 0.5) * offsetBasic || offsetBasic;
                        //同一位置反向
                        if(d['tempindex'] % 2 == 1){
                            offset =  offset*(-1);
                        }
                    }
                    //总条数为单数
                    else{
                       offset =  (parseInt(''+d['tempindex'] / 2) + (d['tempindex'] % 2)) * offsetBasic || 0;
                        if(d['tempindex'] % 2 == 1){
                            offset =  offset*(-1);
                        }
                    }
                }
                //修正source target反序导致的位置统一
                if(d.source.geneID > d.target.geneID) {
                    offset = offset*(-1);
                }

                let offSetX = midpoint_x - offset * (dy / normalise);
                let offSetY = midpoint_y + offset * (dx / normalise);

                return "M" + d.source.x + "," + d.source.y +
                    "S" + offSetX + "," + offSetY +
                    " " + d.target.x + "," + d.target.y;
            })
            //node位置进行了修改
            g_node.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        }

        // 拖拽
        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
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

        //expand 点击 支持扩展，所有已选中node进行扩展一级。
        d3.select("#expand").on("click", function () {
            // 本次扩展的nodeList
            let expandNodeList = [];
            // 扩展node
            link.each(function (d) {
                //link的起点在已选择的list中，终点不在已选择的list中，且不在临时扩展的list中。
                if ((that.selectGeneList.indexOf(d.source) > -1) && (that.selectGeneList.indexOf(d.target) == -1) && (expandNodeList.indexOf(d.target) == -1)) {
                    d.target.selected = true;
                    console.log(d)
                    expandNodeList.push(d.target.geneID);
                }
                if ((that.selectGeneList.indexOf(d.target) > -1) && (that.selectGeneList.indexOf(d.source) == -1) && (expandNodeList.indexOf(d.source) == -1)) {
                    d.source.selected = true;
                    console.log(d)
                    expandNodeList.push(d.source.geneID);
                }
            })

            console.log(expandNodeList)
            //更新扩展selectNodesList
            that.selectGeneList = [...that.selectGeneList,...expandNodeList];
            //更新颜色、获取List
            node.each(function (d) {
                if (d.selected) {
                    d3.select(this).attr("fill", "#167C80");
                }
            })

            console.log(that.selectGeneList)
        })

    }

    //搜索
    searchNodeChange(){
        d3.selectAll('path.node').attr('fill',d=>this.nodeColorScale(d.value));
        d3.selectAll('path.link').attr('stroke',d=>d.scale(d.score));
        this.selectedNodes.length=0;
        this.selectedLinks.length=0;
        this.selectGeneList.length=0;
        this.selectLinkList.length=0;
    }

    colorChange(color){
        console.log(color)
    }

}
