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
	@ViewChild('tableSwitchChart') tableSwitchChart;
    @ViewChild('transformTable') transformTable;
    @ViewChild('addColumn') addColumn;

    chartUrl: string;
    chartEntity: object;

    isShowColorPanel: boolean = false;
    legendIndex: number = 0; //当前点击图例的索引
    color: string; //当前选中的color
    colors: string[];

    gaugeColors:string[]=[];
    oLegendIndex:number=0;
    oColor:string;

    defaultSetUrl:string;
    defaultSetEntity:object;
    defaultSetData:any = null;

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

    addColumnShow:boolean = false;
    showBackButton:boolean = false;

    selectGeneList:[] = [];

    // 路由参数
    tid:string = null;
    geneType:string = '';
    version:string = null;

    // 网络图参数
    selectNodesList:any[] = [];
    showTextFlag:boolean = false;

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
        this.colors = ["#ff0000", "#ffffff", "#0070c0"];
        this.gaugeColors=this.storeService.getColors();

        this.defaultSetUrl=`${config['javaPath']}/Cluster/defaultSet`;
        this.defaultSetEntity={
            "tid": this.tid
        }

        this.chartUrl=`${config['javaPath']}/Cluster/clusterGraph`;
        this.chartEntity = {
            "LCID": this.storeService.getStore('LCID'),
            "tid": this.tid
        };

        // table
        this.first = true;
        this.applyOnceSearchParams = true;
        this.defaultUrl = `${config['javaPath']}/Cluster/getClusterGeneTable`;
        this.defaultEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            searchList: []
        };
        this.defaultTableId = 'default_re_net';
        this.defaultDefaultChecked = true;
        this.defaultEmitBaseThead = true;
        this.defaultCheckStatusInParams = true;

        this.extendUrl = `${config['javaPath']}/Cluster/getClusterGeneTable`;
        this.extendEntity = {
            LCID: sessionStorage.getItem('LCID'),
            tid:this.tid,
            pageIndex: 1, //分页
            pageSize: 20,
            mongoId: null,
            addThead: [], //扩展列
            transform: false, //是否转化（矩阵变化完成后，如果只筛选，就为false）
            matchAll: false,
            matrix: false, //是否转化。矩阵为matrix
            relations: [], //关系组（简写，索引最后一个字段）
            sortValue: null,
            sortKey: null, //排序
            reAnaly: false,
            geneType: this.geneType, //基因类型gene和transcript
            species: this.storeService.getStore('genome'), //物种
            version: this.version,
            searchList: []
        };
        this.extendTableId = 'extend_re_net';
        this.extendDefaultChecked = true;
        this.extendEmitBaseThead = true;
        this.extendCheckStatusInParams = false;

        let netData =  {
            nodes: [
                { geneID: "Adam", type: "mrna", linkNum: 20, selected: false, geneSymbol: "haha" },
                { geneID: "Bob", type: "mrna", linkNum: 30, selected: false, geneSymbol: "ha3ha" },
                { geneID: "Carrie", type: "lncRNA", linkNum: 40, selected: false, geneSymbol: "ha2h2a" },
                { geneID: "Donovan", type: "lncRNA", linkNum: 20, selected: false },
                { geneID: "Edward", type: "mrna", linkNum: 40, selected: false, geneSymbol: "hah2a" },
                { geneID: "Felicity", type: "mrna", linkNum: 30, selected: false, geneSymbol: "" },
                { geneID: "George", type: "lncRNA", linkNum: 30, selected: false },
                { geneID: "Hannah", type: "miRNA", linkNum: 15, selected: false },
                { geneID: "Iris", type: "other", linkNum: 20, selected: false },
                { geneID: "Jerry", type: "other", linkNum: 50, selected: false },
                { geneID: "SDA", type: "miRNA", linkNum: 15, selected: false },
                { geneID: "HanASDnah", type: "miRNA", linkNum: 15, selected: false },
                { geneID: "HaASDnnah", type: "miRNA", linkNum: 15, selected: false },
                { geneID: "HaFDDnnah", type: "lncRNA", linkNum: 15, selected: false },
                { geneID: "Hannah", type: "lncRNA", linkNum: 15, selected: false },
                { geneID: "HanAAnah", type: "mrna", linkNum: 15, selected: false },
                { geneID: "HannSSah", type: "mrna", linkNum: 15, selected: false },
                { geneID: "HaDFnnah", type: "mrna", linkNum: 15, selected: false },
                { geneID: "HaSnnD23ah", type: "miRNA", linkNum: 15, selected: false },
                { geneID: "HanASnah", type: "miRNA", linkNum: 15, selected: false },
            ],
            links: [
                { source: "Adam", target: "Bob",times:5 ,tempindex:0,type:"ppi",score:86,references:"文献信息"},
                { source: "Bob", target: "Adam" ,times:5,tempindex:1,type:"co-exp"},
                { source: "Adam", target: "Bob",times:5,tempindex:2 ,type:"ceRNA"},
                { source: "Adam", target: "Bob",times:5 ,tempindex:3,type:"rbp"},
                { source: "Adam", target: "Bob",times:5 ,tempindex:4,type:"target"},
                { source: "Felicity", target: "Carrie" ,times:4 ,tempindex:0},
                { source: "Felicity", target: "Carrie" ,times:4 ,tempindex:1 },
                { source: "Carrie", target: "Felicity"  ,times:4 ,tempindex:2},
                { source: "Carrie", target: "Felicity"  ,times:4 ,tempindex:3},
                { source: "Iris", target: "Hannah" },
                { source: "HaFDDnnah", target: "Iris" },
                { source: "Iris", target: "HaFDDnnah" },
                { source: "SDA", target: "HaFDDnnah" },
                { source: "Hannah", target: "HaSnnD23ah" },
                { source: "SDA", target: "Iris" },
                { source: "Hannah", target: "HanASDnah" },
                { source: "Iris", target: "Edward" },
                { source: "HanASnah", target: "HanASDnah" },
                { source: "HanASnah", target: "George" },
                { source: "SDA", target: "Iris" },
                { source: "Iris", target: "Adam" },
            ]
        };
        this.drawChart(netData);
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

    switchChange(status) {
		this.switch = status;
	}

	// 表格上方功能区 resize重新计算表格高度
	resize(event) {
        setTimeout(()=>{
            this.computedTableHeight();
        },30)
    }

    computedTableHeight() {
		try {
            this.tableHeight = this.right.nativeElement.offsetHeight - this.func.nativeElement.offsetHeight;
		} catch (error) {}
    }


    drawChart(dataset){
        let _this  = this;
        var svg = d3.select("#net").attr("width", 1000).attr("height", 800)
        var colorsArray = ["#FF8B8B", "#167C80", "#005397", "#FACA0C", "#F3C9DD", "#0BBCD6", "#BFB5D7", "#BEA1A5", "#0E38B1", "#A6CFE2", "#371722", "#C7C6C4", "#DABAAE", "#DB9AAD", "#F1C3B8", "#EF3E4A", "#C0C2CE", "#EEC0DB", "#B6CAC0", "#C5BEAA", "#FDF06F", "#EDB5BD", "#17C37B", "#2C3979", "#1B1D1C", "#E88565", "#FFEFE5", "#F4C7EE", "#77EEDF", "#E57066", "#FBFE56", "#A7BBC3", "#3C485E", "#055A5B", "#178E96", "#D3E8E1", "#CBA0AA", "#9C9CDD", "#20AD65", "#E75153", "#4F3A4B", "#112378", "#A82B35", "#FEDCCC", "#00B28B", "#9357A9", "#C6D7C7", "#B1FDEB", "#BEF6E9", "#776EA7", "#EAEAEA", "#EF303B", "#1812D6", "#FFFDE7", "#D1E9E3", "#7DE0E6", "#3A745F", "#CE7182", "#340B0B", "#F8EBEE", "#FF9966", "#002CFC", "#75FFC0", "#FB9B2A", "#FF8FA4", "#000000", "#083EA7", "#674B7C", "#19AAD1", "#12162D", "#121738", "#0C485E", "#FC3C2D", "#864BFF", "#EF5B09", "#97B8A3", "#FFD101", "#C26B6A", "#E3E3E3", "#FF4C06", "#CDFF06", "#0C485E", "#1F3B34", "#384D9D", "#E10000", "#F64A00", "#89937A", "#C39D63", "#00FDFF", "#B18AE0", "#96D0FF", "#3C225F", "#FF6B61", "#EEB200", "#F9F7E8", "#EED974", "#F0CF61", "#B7E3E4"];

        svg.selectAll("g").remove()

        //点击空白处，所有的node和link清除选中，下方的表格筛选条件还原(没写)


        var g = svg.call(
            d3.zoom()
                .scaleExtent([0.1, 10])
                .on("zoom", function () {
                    g.attr("transform",d3.event.transform);
                    console.log(d3.zoomIdentity)
                })
            )
            .on("dblclick.zoom", null).append("g")

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.geneID; }).iterations(4))
            .force('charge', d3.forceManyBody().strength(-1000))
            .force('center', d3.forceCenter(500, 400))
            .force("x", d3.forceX())
            .force("y", d3.forceY())

        //link hover 悬浮框，支持悬浮框内点击 文献（没写）
        var link = g.append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(dataset.links)
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('stroke', "#ddd")
            .attr('stroke-width', 2).attr("fill", "none")
            .on("click", function (d) {
                console.log(d)
            });


        // d3.symbol()生成不同形状，size函数可以定义大小
        //node hover 悬浮框，支持悬浮框内点击 geneID，查看基因详情页（没写）
        var g_node = g.append('g').attr("class", "nodes")
            .selectAll("g")
            .data(dataset.nodes)
            .enter().append("g")

        var node = g_node.append("path")
            .attr("class", "nodes")
            .attr("d", d3.symbol()
                .type(function (d, i) {
                    if (d.type == "mrna") { d3.select(this).attr("class", "mrna"); return d3.symbols[0] }  //圆 0
                    if (d.type == "miRNA") { d3.select(this).attr("class", "miRNA"); return d3.symbols[6] } //倒三角 6
                    if (d.type == "lncRNA") { d3.select(this).attr("class", "lncRNA"); return d3.symbols[2] } //菱形 2
                    if (d.type == "other") { d3.select(this).attr("class", "other"); return d3.symbols[5] } //三角 5
                })
                .size(function (d, i) {
                    return d.linkNum * 10 + 20
                })
            )
            .attr('fill', function (d) {
                return colorsArray[0];
            })
            .attr("cursor", "pointer")
        g_node.call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))

        var node_text = g_node.append("text")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function (d) {
                return d.geneID;
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("visibility", "hidden")

        //每次点击node，当前node的选中状态发生改变，且颜色发生改变（node选中给单独的一种颜色；选中后反选，node的颜色还原）
        //每次点击node，刷新下方表格（没写）

        node.on("click", function (d) {

            d.selected = !d.selected;

            //选中node加到list中，反选node中从list中去掉
            if (d.selected) {
                _this.selectNodesList.push(d);
            } else {
                var index = _this.selectNodesList.indexOf(d)
                _this.selectNodesList.splice(index, 1)
            }
            //颜色变化，反选需还原到初始颜色（没写）
            d3.select(this).attr('fill', function (d) {
                if (d.selected) {
                    return colorsArray[1]
                }
                return colorsArray[0];
            })
            event.stopPropagation();
            console.log(_this.selectNodesList)
        })




        simulation
            .nodes(dataset.nodes)
            .on('tick', ticked);

        simulation.force('link')
            .links(dataset.links);

        function ticked() {
            link.attr("d", function (d) {
                //基础偏移量
                var offsetBasic = 12;
                //中点
                var midpoint_x = (d.source.x + d.target.x) / 2;
                var midpoint_y = (d.source.y + d.target.y) / 2;
                //相对位置计算
                var dx = (d.target.x - d.source.x);
                var dy = (d.target.y - d.source.y);
                var normalise = Math.sqrt((dx * dx) + (dy * dy));

                //根据总条目和当前条目层次，计算offset。根据source和targe顺序计算符号
                // 总数 times   顺序 index
                //总条数为双数
                let a = parseInt('1');
                if(d.times && (d.times % 2 == 0)){
                    var offset =  (parseInt(''+d['tempindex'] / 2) + 0.5) * offsetBasic || offsetBasic
                    //同一位置反向
                    if(d['tempindex'] % 2 == 1){
                        offset =  offset*(-1)
                    }
                }
                //总条数为单数
                else{
                    var offset =  (parseInt(''+d['tempindex'] / 2) + (d['tempindex'] % 2)) * offsetBasic || 0
                    if(d['tempindex'] % 2 == 1){
                        offset =  offset*(-1)
                    }
                }
                //修正source target反序导致的位置统一
                if(d.source.geneID > d.target.geneID) {
                    offset = offset*(-1)
                }


                var offSetX = midpoint_x - offset * (dy / normalise);
                var offSetY = midpoint_y + offset * (dx / normalise);


                return "M" + d.source.x + "," + d.source.y +
                    "S" + offSetX + "," + offSetY +
                    " " + d.target.x + "," + d.target.y;
            })
            //node位置进行了修改
            g_node.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
        }

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

        //expand 点击 支持扩展，所有已选中node进行扩展一级。
        //选中的node集合不为空时，才能点击。
        d3.select("#expand").on("click", function () {
            //遍历link 扩展一次node  扩展完成后 更新nodelist
            // 本次扩展的nodeList
            var expandNodeList = [];
            // 扩展node

            link.each(function (d) {
                //link的起点在已选择的list中，终点不在已选择的list中，且不在临时扩展的list中。
                if ((_this.selectNodesList.indexOf(d.source) > -1) && (_this.selectNodesList.indexOf(d.target) == -1) && (expandNodeList.indexOf(d.target) == -1)) {
                    d.target.selected = true
                    expandNodeList.push(d.target)
                }
                if ((_this.selectNodesList.indexOf(d.target) > -1) && (_this.selectNodesList.indexOf(d.source) == -1) && (expandNodeList.indexOf(d.source) == -1)) {
                    d.source.selected = true
                    expandNodeList.push(d.source)
                }
            })
            if(expandNodeList.length == 0) return;
            //更新扩展selectNodesList
            _this.selectNodesList = [..._this.selectNodesList,...expandNodeList];
            // _this.selectNodesList.push.apply(_this.selectNodesList, expandNodeList)
            //更新颜色、获取List
            var geneList = [];
            node.each(function (d) {
                if (d.selected) {
                    d3.select(this).attr("fill", colorsArray[1])
                    geneList.push(d.geneID)
                }
            })

            console.log(_this.selectNodesList)
        })

        // show label
        d3.select("#name").on("click", function (d) {
            _this.showTextFlag = !_this.showTextFlag
            if (_this.showTextFlag) {
                node_text.attr("visibility", "show")
            } else {
                node_text.attr("visibility", "hidden")
            }
        })

    }

}
