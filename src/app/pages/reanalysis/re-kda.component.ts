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
  selector: 'app-re-kda',
  templateUrl: './re-kda.component.html',
  styles: []
})
export class ReKdaComponent implements OnInit {

    @ViewChild('kdaChart') kdaChart;
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
    scores:any[]=[];
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
            this.storeService.setTid(this.tid);
        })
    }

    ngOnInit() {
        // chart
        this.colors = ["#ff0000","#0000ff", '#999999'];

        this.idReq=/[^a-zA-Z0-9\_\u4e00-\u9fa5]/gi;

        this.setDataUrl=`${config['javaPath']}/kda/getQuantity`;
        this.setDataEntity={
            "geneType": this.geneType,
            "genome":sessionStorage.getItem('genome'),
            "LCID": this.storeService.getStore('LCID')
        }

        this.defaultSetData={
            "force":50,
            "radian":10,
            "symbolType":"hidden",
            "value":{}
        }

         // add link
         this.scores=this.storeService.getStore('userRelation').score;
         this.scoreMin=this.scores[0];
         this.scoreMax=this.scores[1];
         this.curScore=this.scores[2];

        this.tableUrl=`${config['javaPath']}/kda/switchTable`;
        this.chartUrl=`${config['javaPath']}/kda/graph`;
        // this.chartUrl=`http://localhost:8086/kda`;
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
        this.defaultUrl = `${config['javaPath']}/kda/table`;
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
            rationAddThead:this.rationAddThead,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            sortThead:this.addColumn['sortThead'],
            searchList: []
        };
        this.defaultTableId = 'default_re_kda';
        this.defaultDefaultChecked = true;
        this.defaultEmitBaseThead = true;
        this.defaultCheckStatusInParams = true;

        this.extendUrl = `${config['javaPath']}/kda/table`;
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
            rationAddThead:this.rationAddThead,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            sortThead:this.addColumn['sortThead'],
            searchList: []
        };
        this.extendTableId = 'extend_re_kda';
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
			this.extendEntity['addThead'] = checkParams['tableEntity']['addThead'];
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
            this.transformTable._setExtendParamsWithoutRequest( 'addThead', checkParams['tableEntity']['addThead']);
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
            this.kdaChart.scrollHeight();
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
        d3.selectAll("#kdaChartDiv svg").remove();
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
        let colorArr = [["#D3D3D3", "#A9A9A9"]];
        let relationColors=[...relations];
        relationColors.forEach((d,i)=>{
            d.colors=[...colorArr[0]];
        })

        let netRelations=[];
        let linkRelations=[]; // 用于 link color 比例尺

        //数据
        let nodes=data.nodes,links=data.links;
        let values=data.value;
        let min=values[0],max=values[1];

        nodes.forEach(d => {
            if(!d.type){
                d.type='kda';
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


        this.allNodes=[...nodes];
        this.allLinks=[...links];

        //容器宽高
        let legendWidth=0, legendHeight=60;
        let width=800,height=600; //图主体
        let padding=20;


        let colors=this.colors;
        let colorsLen=colors.length;
        let nodetypes=['kda','initial','relation'];


        //大小
        let sizeScale=d3.scaleLinear()
            .range([40, 520])
            .domain([min, max]).clamp(true).nice();

        //颜色
        this.nodeColorScale=d3.scaleOrdinal()
            .range(colors)
            .domain(nodetypes);


        //图例svg
        let legendSvg=d3.select("#kdaChartDiv").append('svg').attr('id',"legendSvg");

        //svg
        let svg = d3.select("#kdaChartDiv").append('svg').attr("width", width).attr("height", height)
            .call(
                //缩放
                d3.zoom()
                    .scaleExtent([0.1, 10])
                    .on("zoom", function () {
                        g.attr("transform",d3.event.transform);
                    })
            )
            .on("dblclick.zoom", null);

        let g = svg.append("g");

        //力图
        let simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(d=> d.geneID).iterations(4))
            .force('charge', d3.forceManyBody().strength(-this.chartEntity['force']))
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
            .on("mouseover", m => {
                let referencesStr= m.references;
                let references=strSplit(referencesStr,';');

                let stsStr=m.sts;
                let stsArr=strSplit(stsStr,'+++');

                let text = `source：<a target='_blank' href='${this.geneDetailUrl}/${m.source.geneID}'>${m.source.geneID}</a><br>target：<a target='_blank' href='${this.geneDetailUrl}/${m.target.geneID}'>${m.target.geneID}</a><br>type：${m.type}<br>score：${m.score}`;
                if(references.length){
                    text=text+'<br>文献：';
                    references.forEach((r,j)=>{
                        let refStr;
                        if(stsArr.length){
                            refStr=`<a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/${r}'>${r}</a>，${stsArr[j]}<br>`;
                            text=text+refStr;
                        }else{
                            refStr=`<a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/${r}'>${r}</a>`;
                            text=text+refStr;
                            if(j!==references.length-1){
                                text=text+'，';
                            }
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

            function strSplit(str,mark){
                let arr=[];
                if(str){
                    if(str.indexOf(mark)!==-1){
                        arr= str.split(mark).filter(d=>d!=='NA');
                    }else{
                        if(str!=='NA'){
                            arr=[str];
                        }else{
                            arr.length=0;
                        }
                    }
                }
                return arr;
            }


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
                .type(d3.symbolCircle)
                .size(d=>sizeScale(d.value))
            )
            .attr('fill', d=>d.selected ? "#000000" : that.nodeColorScale(d.type))
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
                    d3.select(this).attr('fill',that.nodeColorScale(d.type));
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

        //node 颜色图例
        legendSvg.append("g")
            .attr("class", "legendNodeColor")
            .attr("transform", `translate(${padding},${padding})`);

        drawNodeColorScale();

        let legendNodeColorW=d3.select(".legendNodeColor").node().getBBox().width;

        legendWidth=padding+legendNodeColorW+padding;
        d3.select("#legendSvg").attr("width", legendWidth).attr("height", legendHeight).style('display','block').style('margin','0 auto');

        // svg 点击清空选择
        d3.selectAll("#kdaChartDiv svg").on('click',function(){
            that.clearSelected();
        })

        // node color legend
        function drawNodeColorScale(){

            var legendOrdinal = d3.legendColor()
                .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
                .orient("horizontal")
                .labels(['KDA','初始基因','关联基因'])
                .labelWrap(60)
                .shapePadding(60)
                .scale(that.nodeColorScale)
                .on("cellclick",function(d){
                    clearEventBubble(d3.event);

                    nodetypes.forEach((m,i)=>{
                        if(d===m){
                            that.color=colors[i];
                            that.legendIndex = i;
                        }
                    })

                    that.isShowColorPanel = true;
                });

            legendSvg.select(".legendNodeColor")
                .call(legendOrdinal);

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
        d3.selectAll('path.node').attr('fill',d=>this.nodeColorScale(d.type));
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
        d3.selectAll('path.node').attr('fill',d=>this.nodeColorScale(d.type));
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
                url: `${config['javaPath']}/kda/deleteLink`,
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
                        this.kdaChart.getTableDataThen();
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
    addLink(){
        this.isShowAddModal=true;
        this.curStartNode=null;
        this.curEndNode=null;
        this.curScore=this.scores[2];
    }

    addOk(){
        this.isShowAddModal=false;
        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/kda/addLink`,
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
                        this.kdaChart.getTableDataThen();
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
            this.kdaChart.redraw();
        }
    }

    // 设置 确定
    setConfirm(data){
        this.chartEntity["force"]=data['force'];
        this.chartEntity["radian"]=data['radian'];
        this.chartEntity["symbolType"]=data['symbolType'];
        this.chartEntity['quantity']=data.value;
        this.kdaChart.reGetData();

        this.rationAddThead.length = 0;
        if(!$.isEmptyObject(data.value))this.rationAddThead.push(data.value);
        this.chartBackStatus();
    }

}
