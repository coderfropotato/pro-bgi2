import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import config from '../../../config';
import {PromptService} from './../../super/service/promptService';

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

    tableUrl:string;

    setDataUrl:string;
    setDataEntity:object;
    setData:any;

    defaultSetData:any;

    isShowTable:boolean;

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    nodeColorScale:any; //节点比例尺

    idReq:any; //id 正则

    chartData:any;

    // 选中的节点、线
    selectGeneList:string[] = []; // 选中的节点geneID
    selectLinkList:string[]=[]; // 选中的线id
    selectedNodes:object[]=[]; //选中的节点
    selectedLinks:object[]=[];  //选中的线

    //serach
    allNodes:any[]=[];
    curSearchNode:string;

    allLinks:any[]=[];

    // delete link
    isShowDeleteModal:boolean=false;

    //add link
    isShowAddModal:boolean=false;
    curStartNode:string;
    curEndNode:string;
    curScore:number;
    scoreMin:number;
    scoreMax:number;

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
    switch:string = 'right';

    addColumnShow:boolean = false;
    showBackButton:boolean = false;

    // 路由参数
    tid:string = "";
    geneType:string = '';
    version:string = null;

    selectGeneCount:number = 0;
    computedScrollHeight:boolean = false;

    isEdit:string = 'false';
    rationAddThead:object[] = [];

    geneDetailUrl:string;

    constructor(
        private message: MessageService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		public storeService: StoreService,
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
            this.isEdit = params['params']['isEdit'];
            this.storeService.setTid(this.tid);
        })
    }

    ngOnInit() {
        // chart
        this.colors = ["#0000ff", "#ff0000"];

        this.idReq=/[^a-zA-Z0-9\_\u4e00-\u9fa5]/gi;

        this.setDataUrl=`${config['javaPath']}/net/getQuantity`;
        this.setDataEntity={
            "geneType": this.geneType,
            "genome":sessionStorage.getItem('genome'),
            "LCID": this.storeService.getStore('LCID')
        }

        this.defaultSetData={
            "force":100,
            "radian":10,
            "symbolType":"hidden",
            "value":{}
        }

        this.tableUrl=`${config['javaPath']}/net/switchTable`;
        this.chartUrl=`${config['javaPath']}/net/graph`;
        // this.chartUrl=`http://localhost:8086/net`;
        this.chartEntity = {
            "id": this.tid,
            "pageIndex": 1,
            "pageSize": 10,
            "force":this.defaultSetData['force'],
            "radian":this.defaultSetData['radian'],
            "symbolType":this.defaultSetData['symbolType'],
            "quantity":this.defaultSetData['value']
        };

        // table
        this.first = true;
        this.applyOnceSearchParams = true;
        this.defaultUrl = `${config['javaPath']}/net/table`;
        this.defaultEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            // matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            rationAddThead:this.rationAddThead,
            sortThead:this.addColumn['sortThead'],
            searchList: []
        };
        this.defaultTableId = 'default_re_net';
        this.defaultDefaultChecked = true;
        this.defaultEmitBaseThead = true;
        this.defaultCheckStatusInParams = true;

        this.extendUrl = `${config['javaPath']}/net/table`;
        this.extendEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            // matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            rationAddThead:this.rationAddThead,
            sortThead:this.addColumn['sortThead'],
            searchList: []
        };
        this.extendTableId = 'extend_re_net';
        this.extendDefaultChecked = true;
        this.extendEmitBaseThead = true;
        this.extendCheckStatusInParams = false;

        this.geneDetailUrl=`${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${this.storeService.getStore('genome')}/${this.geneType}`;

    }

    showChange(isshowtable){
        this.isShowTable=isshowtable;
    }

    ngAfterViewInit() {
		setTimeout(() => {
			this.computedTableHeight();
		}, 30);
    }

    handleSelectGeneCountChange(selectGeneCount){
        this.selectGeneCount = selectGeneCount;
    }

    toggle(status){
        this.addColumnShow = status;
    }

    // 表
    addThead(thead) {
        this.transformTable._initCheckStatus();

        this.transformTable._setParamsNoRequest('removeColumns', thead['remove']);
        this.transformTable._setParamsNoRequest('pageIndex',1);

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
        this.transformTable._initCheckStatus();
        this.transformTable._clearFilterWithoutRequest();
        if(!this.first){
            this.defaultEntity['addThead'] = [];
            this.defaultEntity['removeColumns'] = [];
            this.defaultEntity['rootSearchContentList'] = [];
            if(this.selectGeneList.length){
                this.defaultEntity['searchList'] = [
                    {"filterName":`${this.geneType}_id`,"filterNamezh":config[this.geneType],"searchType":"string","filterType":"$in","valueOne":this.selectGeneList.length>1?this.selectGeneList.join(','):this.selectGeneList[0],"valueTwo":null}
                ];
            }else{
                this.defaultEntity['searchList']= [] ;
            }
            this.first = true;
        }else{
            if(this.selectGeneList.length) {
                this.transformTable._filter(`${this.geneType}_id`,config[this.geneType],"string","$in",this.selectGeneList.length>1?this.selectGeneList.join(','):this.selectGeneList[0],null);
            }else{
                this.transformTable._deleteFilterWithoutRequest(`${this.geneType}_id`,config[this.geneType],"$in");
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

    computedTableHeight() {
		try {
            let h = this.tableHeight;
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight - config['layoutContentPadding'] * 2;
            if(this.tableHeight===h) this.computedScrollHeight = true;
		} catch (error) {}
    }

    // 图
    getSetData(data){
        this.setData=data;
    }

    //画图
    drawChart(data){
        d3.selectAll("#netChartDiv svg").remove();
        let that  = this;

        let isLinkNum;
        if($.isEmptyObject(this.chartEntity['quantity'])){
           isLinkNum=true;
        }else{
            isLinkNum=false;
        }

        //link弧度基础偏移量
        let offsetBasic = this.chartEntity['radian'];

        //关联关系
        let relations = [...this.storeService.getStore('relations')];
        let userRelation={...this.storeService.getStore("userRelation")};
        relations.push({...userRelation});
        let colorArr = [["#FFF1F0", "#CF1322"], ["#FFF7E6", "#FA8C15"], ["#FEFFE6", "#FADB14"], ["#F6FFED", "#52C41A"], ["#E7F7FF", "#1890FF"], ["#F9F0FF", "#712ED1"],["#FFF0F6","#F759AC"]];
        let relationColors=[...relations];
        relationColors.forEach((d,i)=>{
            d.colors=[...colorArr[i]];
        })

        let netRelations=[];
        let linkRelations=[]; // 用于 link color 比例尺

        //数据
        let nodes=data.nodes,links=data.links;
        let values=data.value;
        let min=values[0],max=values[1];

        nodes.forEach(d => {
            if(!d.type){
                d.type='mRNA';
            }
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

        // let arrows = [{ id: 'end-arrow', opacity: 1 }, { id: 'end-arrow-fade', opacity: 0.1 }]; //箭头

        this.allNodes=[...nodes];
        // add link
        if(this.allNodes.length && this.allNodes.length>1){
            this.curStartNode=this.allNodes[0]['geneID'];
            this.curEndNode=this.allNodes[1]['geneID'];
        }
        let scores=this.storeService.getStore('userRelation').score;
        this.scoreMin=scores[0];
        this.scoreMax=scores[1];
        this.curScore=scores[2];

        this.allLinks=[...links];

        //容器宽高
        let legendWidth=0, legendHeight=60;
        let width=800,height=600; //图主体
        let padding=20;

        let eachNodeLegendW=60,eachLegendH=20; //图例
        let eachLinkLegendW=40;

        let colors=this.colors;
        let colorsLen=colors.length;

        //node比例尺
        let typeArr=["mrna", "miRNA", "lncRNA", "other"];
        let circleShape=d3.symbol().type(d3.symbolCircle)(), // 圆
            yShape=d3.symbol().type(d3.symbolWye)(),  // Y
            diamondShape=d3.symbol().type(d3.symbolDiamond)(),  // 菱形
            triangleShape=d3.symbol().type(d3.symbolTriangle)();  // 三角形

        let shapeArr=[circleShape,yShape,diamondShape,triangleShape];

        let symbolArr=[d3.symbolCircle,d3.symbolWye,d3.symbolDiamond,d3.symbolTriangle];

        //形状（用于画node）
        let symbolScale= d3.scaleOrdinal()
            .domain(typeArr)
            .range(symbolArr);

        //大小
        let sizeScale=d3.scaleLinear()
            .range([40, 520])
            .domain([min, max]).clamp(true).nice();

        //颜色
        this.nodeColorScale=d3.scaleLinear()
            .range(colors)
            .domain([min,max]).clamp(true).nice();

        //形状 （用于画图例）
        let shapeLegendScale =  d3.scaleOrdinal()
            .domain(typeArr)
            .range(shapeArr);

        //图例svg
        let legendSvg=d3.select("#netChartDiv").append('svg').attr('id',"legendSvg");

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
        svg.append("defs")
            // .selectAll("marker")
            // .data(arrows).enter()
            .append("marker")
            .attr("id", "end-arrow")
            .attr("viewBox", '0 0 20 20')
            .attr("refX", 0)
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", 'M0,0 L0,10 L10,5 z')
            // .attr("opacity", d => d.opacity);

        let g = svg.append("g");

        //力图
        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d=> d.geneID).iterations(4))
            .force('charge', d3.forceManyBody().strength(-this.chartEntity['force']))
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
                let referencesStr= m.references;
                let references=[];
                if(referencesStr){
                    if(referencesStr.indexOf(';')!==-1){
                      let refs= referencesStr.split(';');

                      let rs1=[],rs2=[];

                      if(refs[0]!=='NA'){
                        rs1=refs[0].split(',');
                      }

                      if(refs[1]!=='NA'){
                        rs2=refs[1].split(',');
                      }

                      references=[...rs1,...rs2];
                    }else{
                        if(referencesStr!=='NA'){
                            references=referencesStr.split(',');
                        }else{
                            references.length=0;
                        }
                    }
                }

                let text = `source：<a target='_blank' href='${this.geneDetailUrl}/${m.source.geneID}'>${m.source.geneID}</a><br>target：<a target='_blank' href='${this.geneDetailUrl}/${m.target.geneID}'>${m.target.geneID}</a><br>type：${m.type}<br>score：${m.score}`;
                if(references.length){
                    text=text+'<br>文献：';
                    references.forEach((r,j)=>{
                       let refStr=`<a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/${r}'>${r}</a>`;
                       text=text+refStr;
                       if(j!==references.length-1){
                           text=text+'，';
                       }
                    })
                }
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
                    that.allLinks.forEach(m=>{
                        if(d.id===m.id){
                            m.selected=true;
                        }
                    })
                } else {
                    d3.select(this).attr('stroke',d.scale(d.score));
                    that.allLinks.forEach(m=>{
                        if(d.id===m.id){
                            m.selected=false;
                        }
                    })
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
            .attr('id',d=>"node"+d.geneID.replace(that.idReq,""))
            .attr("d",d3.symbol()
                .type(d=>symbolScale(d.type))
                .size(d=>sizeScale(d.value))
            )
            .attr('fill', d=>d.selected ? "#000000" : that.nodeColorScale(d.value))
            .attr("cursor", "pointer")
            .on("mouseover", m => {
                let value=isLinkNum ? 'node连接数' : that.chartEntity['quantity']['name'];
                let text = `geneID：<a target='_blank' href='${this.geneDetailUrl}/${m.geneID}'>${m.geneID}</a><br>type：${m.type}<br>${value}：${m.value}<br>geneSymbol：${m.symbol}`;
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
                    d3.select(this).attr('fill',"#000000");
                    that.selectedNodes.push(d);
                    that.allNodes.forEach(m=>{
                        if(d.geneID===m.geneID){
                            m.selected=true;
                        }
                    })
                } else {
                    d3.select(this).attr('fill',that.nodeColorScale(d.value));
                    that.allNodes.forEach(m=>{
                        if(d.geneID===m.geneID){
                            m.selected=false;
                        }
                    })
                }

                that.selectedNodes=that.selectedNodes.filter(k=>k['selected']===true);
                that.selectGeneList.length=0;
                that.selectedNodes.forEach(m=>{
                    that.selectGeneList.push(m['geneID']);
                })
                that.chartBackStatus();
            })

        g_node.call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))

        simulation
            .nodes(nodes)
            .on('tick', ticked);

        simulation
            .force('link')
            .links(links);

        //node text
        if(that.chartEntity['symbolType'] !=='hidden'){
            drawText();
        }

        //图例
        let legendTitleSpace=10;
        //node 形状
        legendSvg.append("g")
            .attr("class", "legendShape")
            .attr("transform", `translate(${padding*2}, ${padding})`);

        let legendShape = d3.legendSymbol()
            .scale(shapeLegendScale)
            .orient("horizontal")
            .labelWrap(30)
            .shapePadding(40);

        let legendShape_g= legendSvg.select(".legendShape")
            .call(legendShape);

        legendShape_g.selectAll('path.swatch').attr('fill','#ff8b8b');

        let legendShapeW=d3.select(".legendShape").node().getBBox().width;

        //node 颜色
        let legendNodeColor_g = legendSvg.append("g")
            .attr("class", "legendNodeColor")
            .attr("transform", `translate(${padding+legendShapeW+padding},${padding/2})`);

        drawNodeColorScale();

        // link 颜色
        let legendNodeColorW=d3.select(".legendNodeColor").node().getBBox().width;

        let legnedLinkColor_g=legendSvg.append("g")
            .attr('class','legendLinkColor')
            .attr('transform',`translate(${padding+legendShapeW+padding+legendNodeColorW+padding},${padding/2})`);

        drawLinkColorScale();

        let legendLinkColorW=d3.select(".legendLinkColor").node().getBBox().width;

        legendWidth=padding+legendShapeW+padding+legendNodeColorW+padding+legendLinkColorW+padding;
        d3.select("#legendSvg").attr("width", legendWidth).attr("height", legendHeight).style('display','block').style('margin','0 auto');

        // svg 点击清空选择
        d3.selectAll("#netChartDiv svg").on('click',function(){
           that.clearSelected();
        })

        // node color scale
        function drawNodeColorScale(){
            let nodeColorLegendW= colorsLen * eachNodeLegendW;
            //线性填充
            let linearGradient = legendNodeColor_g.append("defs")
                .append("linearGradient")
                .attr("id", "nodeColorLinear")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            for (let i = 0; i < colorsLen; i++) {
                linearGradient.append("stop")
                    .attr("offset", i * (100 / (colorsLen - 1)) + "%")
                    .style("stop-color", colors[i]);
            }

            //画图例矩形
            legendNodeColor_g.append("rect").attr("width", nodeColorLegendW).attr("height", eachLegendH)
                .attr("fill", "url(#" + linearGradient.attr("id") + ")");

            //画图例的轴
            let nodeColorLegendScale = d3.scaleLinear()
                .range([0, nodeColorLegendW])
                .domain([min, max]).clamp(true).nice();

            let nodeColorAxis = d3.axisBottom(nodeColorLegendScale).tickValues([min,(min+max)/2,max]); //设置Y轴
            legendNodeColor_g.append("g").attr("class", "nodeColorlegendAxis")
                .attr("transform", `translate(0,${eachLegendH})`)
                .call(nodeColorAxis);

            //图例 title
            legendNodeColor_g.append('text')
            .attr('font-family','Arial')
            .style('text-anchor','start')
            .style('dominant-baseline','middle')
            .attr('x',nodeColorLegendW+legendTitleSpace)
            .attr('y',eachLegendH/2)
            .text(isLinkNum ? 'node连接数' : that.chartEntity['quantity']['name']);

            //图例交互 修改颜色
          let legendClick_g =  legendNodeColor_g.append('g')
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    d3.select(this).append("title").text("单击修改颜色");
                })
                .on("mouseout", function () {
                    d3.select(this).select("title").remove();
                });

            legendClick_g.selectAll(".legnedClickRect")
                .data(colors).enter()
                .append('rect')
                .attr('fill',"transparent")
                .attr('transform',(d,i)=>`translate(${i*eachNodeLegendW},0)`)
                .attr("width", eachNodeLegendW).attr("height", eachLegendH)
                .on("click",(d,i)=>{
                    clearEventBubble(d3.event);
                    that.color=d;
                    that.legendIndex = i;
                    that.isShowColorPanel = true;
                });
        }

        // link color scale
        function drawLinkColorScale(){
            let sumLinkLegendW=0;
            linkRelations.forEach((d,i)=>{
                let legendW= d.colors.length * eachLinkLegendW;
                let curLinkLegendW = legendW + legendTitleSpace + d.type.length * 7;
                sumLinkLegendW +=curLinkLegendW;
                let preLinkLegendW=sumLinkLegendW-curLinkLegendW;

                let linkColor_g= legnedLinkColor_g.append('g').attr('class','linkColor')
                    .attr('transform',`translate(${preLinkLegendW+i*padding},0)`);

                //线性填充
                let linearGradient = linkColor_g.append("defs")
                    .append("linearGradient")
                    .attr("id", "colorLinear"+i)
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");

                for (let j = 0; j < d.colors.length; j++) {
                    linearGradient.append("stop")
                        .attr("offset", j * (100 / (d.colors.length - 1)) + "%")
                        .style("stop-color", d.colors[j]);
                }

                //画图例矩形
                linkColor_g.append("rect").attr("width", legendW).attr("height", eachLegendH)
                    .attr("fill", "url(#" + linearGradient.attr("id") + ")");

                //画图例的轴
                let linkColorLegendScale = d3.scaleLinear()
                    .range([0, legendW])
                    .domain([d.scores[0], d.scores[1]]).clamp(true).nice();

                let linkColorAxis = d3.axisBottom(linkColorLegendScale).tickValues([d.scores[0], d.scores[1]]); //设置Y轴
                linkColor_g.append("g").attr("class", "linkColorlegendAxis")
                    .attr("transform", `translate(0,${eachLegendH})`)
                    .call(linkColorAxis);

                //图例 title
                linkColor_g.append('text')
                .attr('font-family','Arial')
                .style('text-anchor','start')
                .style('dominant-baseline','middle')
                .attr('x',legendW+legendTitleSpace)
                .attr('y',eachLegendH/2)
                .text(d.type)
            })
        }

        // node name text
        function drawText(){
            let node_text= g_node.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5)
                .attr('font-family','Arial')

            if(that.chartEntity['symbolType']==='all'){
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
                //中点
                let midpoint_x = (d.source.x + d.target.x) / 2;
                let midpoint_y = (d.source.y + d.target.y) / 2;
                //相对位置计算
                let dx = d.target.x - d.source.x;
                let dy = d.target.y - d.source.y;
                let normalise = Math.sqrt((dx * dx) + (dy * dy));

                //根据同source、target的条目和当前条目顺序，计算offset。
                //根据source和target顺序计算符号
                // 总数 count   顺序 tempindex
                let offset;
                //总条数为双数
                if(d.count % 2 == 0){
                    offset = (Math.floor(d.tempindex / 2) + 0.5) * offsetBasic || offsetBasic;
                }
                //总条数为单数
                else{
                    offset = (Math.floor(d.tempindex / 2) + (d.tempindex % 2)) * offsetBasic || 0;
                }

                //同一位置反向
                if(d['tempindex'] % 2 == 1){
                    offset =  offset*(-1);
                }

                //修正source target反序导致的位置统一
                if(d.source.geneID > d.target.geneID) {
                    offset = offset*(-1);
                }

                let offSetX = normalise===0 ? midpoint_x : midpoint_x - offset * (dy / normalise);
                let offSetY = normalise===0 ? midpoint_y : midpoint_y + offset * (dx / normalise);

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

    }

    //清空所有的选择
    clearSelected(){
        d3.selectAll('path.node').attr('fill',d=>this.nodeColorScale(d.value));
        d3.selectAll('path.link').attr('stroke',d=>d.scale(d.score));
        this.selectedNodes.length=0;
        this.selectedLinks.length=0;
        this.selectGeneList.length=0;
        this.selectLinkList.length=0;
        this.curSearchNode=null;
        this.allNodes.forEach(m=>{
            m.selected=false;
        })
        this.allLinks.forEach(m=>{
            m.selected=false;
        })
        this.chartBackStatus();
    }

    //搜索 node
    searchNodeChange(){
        d3.selectAll('path.node').attr('fill',d=>this.nodeColorScale(d.value));
        d3.selectAll('path.link').attr('stroke',d=>d.scale(d.score));
        this.selectedNodes.length=0;
        this.selectedLinks.length=0;
        this.selectGeneList.length=0;
        this.selectLinkList.length=0;

        this.allLinks.forEach(m=>{
            m.selected=false;
        })

        d3.select("path#node"+this.curSearchNode.replace(this.idReq,"")).attr('fill',"#000000");
        this.allNodes.forEach(d=>{
            d.selected=false;
            if(d.geneID === this.curSearchNode){
                d.selected=true;
                this.selectedNodes.push(d);
            }
        })
        this.selectGeneList.push(this.curSearchNode);
        this.chartBackStatus();
    }

    // delete link
    deleteOk(){
        this.isShowDeleteModal=false;
        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/net/deleteLink`,
                data: {
                    "LCID": this.storeService.getStore('LCID'),
                    "id": this.tid,
                    "quantity":{},
                    "links":this.selectLinkList
                }
            })
            .subscribe(
                (data: any) => {
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        return;
                    } else if (data.status === "-1") {
                        return;
                    } else if (data.status === "-2") {
                        return;
                    } else {
                        this.chartData=data.data;
                        this.netChart.getTableDataThen();
                        this.clearSelected();
                        this.drawChart(data.data);
                    }
                },
                error => {
                    console.log(error);
                }
            )
    }

    deleteCancel(){
        this.isShowDeleteModal=false;
    }

    //add link
    addOk(){
        this.isShowAddModal=false;
        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/net/addLink`,
                data: {
                    "LCID": this.storeService.getStore('LCID'),
                    "id": this.tid,
                    "quantity":{},
                    "source":this.curStartNode,
                    "target":this.curEndNode,
                    "score":this.curScore
                }
            })
            .subscribe(
                (data: any) => {
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        return;
                    } else if (data.status === "-1") {
                        return;
                    } else if (data.status === "-2") {
                        return;
                    } else {
                        this.chartData=data.data;
                        this.netChart.getTableDataThen();
                        this.clearSelected();
                        this.drawChart(data.data);
                    }
                },
                error => {
                    console.log(error);
                }
            )
    }

    addCancel(){
        this.isShowAddModal=false;
    }

    // expand node
    expandNode(){
        let expandNodes=[];
        this.allLinks.forEach(d=> {
            if ((this.selectedNodes.indexOf(d.source) > -1) && (this.selectedNodes.indexOf(d.target) == -1) && (expandNodes.indexOf(d.target) == -1)) {
                d.target.selected=true;
                expandNodes.push(d.target);
            }
            if ((this.selectedNodes.indexOf(d.target) > -1) && (this.selectedNodes.indexOf(d.source) == -1) && (expandNodes.indexOf(d.source) == -1)) {
                d.source.selected=true;
                expandNodes.push(d.source);
            }
        })

        this.selectedNodes=[...this.selectedNodes,...expandNodes];
        this.selectGeneList.length=0;
        this.allNodes.forEach(d=> {
            if (d.selected) {
                d3.selectAll("path#node"+d.geneID.replace(this.idReq,"")).attr('fill',"#000000");
                this.selectGeneList.push(d.geneID);
            }
        })
        this.chartBackStatus();

    }

    //legend color change
    colorChange(color){
        this.color = color;
        this.colors.splice(this.legendIndex, 1, color);
        if(this.chartData){
            this.drawChart(this.chartData);
        }else{
            this.netChart.redraw();
        }
    }

    // 设置 确定
    setConfirm(data){
        this.chartEntity["force"]=data['force'];
        this.chartEntity["radian"]=data['radian'];
        this.chartEntity["symbolType"]=data['symbolType'];
        this.chartEntity['quantity']=data.value;
        this.netChart.reGetData();

        this.rationAddThead.length = 0;
        if(!$.isEmptyObject(data.value))this.rationAddThead.push(data.value);
        this.chartBackStatus();
    }

}
