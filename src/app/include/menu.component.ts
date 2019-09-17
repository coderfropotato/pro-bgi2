import { PageModuleService } from './../super/service/pageModuleService';
import { Router } from "@angular/router";
import { GlobalService } from "../super/service/globalService";
import { Component, OnInit, Input, OnChanges, SimpleChanges } from "@angular/core";
import { StoreService } from '../super/service/storeService';
import { TranslateService } from "@ngx-translate/core";
import { AjaxService } from '../super/service/ajaxService';
import config from '../../config'
import { NzModalService } from 'ng-zorro-antd';
@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html",
    styles:[
        `
        .geneListUl{
            width:235px;
            height:314px;
            overflow:auto;
        }

        .nogeneList{
            width:235px;
            height:314px;
            border:none;
        }

        .nogeneList img{
            width: 230px;
            margin: 25px 0;
        }

        .geneListUl li{
            padding-left:20px;
        }
        
        .geneListUl li p{
            margin-bottom:0 !important;
            font-size:13px !important;
            line-height: 2;
        }

        .geneListUl li span{
            float: right;
            margin-top: -28px;
        }
        `
    ]
})
export class MenuComponent implements OnChanges,OnInit {
    list: any[];
    expandItem: any = [];
    expand: boolean = false;
    timer: any = null;
    delayTimer:any = null;
    index: number = 0;
    moduleSwitch:true;
    analysisList:object[]=[];
    intervalTimer:any=null;
    typeFlag: boolean=false;

    @Input() menu: object[];
    @Input() geneSwitch:boolean = true;
    @Input() showGeneList:boolean = true;
    @Input() type: string;

    constructor(
        private router: Router,
        private globalService: GlobalService,
        public pageModuleService:PageModuleService,
        public storeService: StoreService,
        private translate: TranslateService,
        private ajaxService:AjaxService,
        private modalService:NzModalService
        ) {
            let browserLang = this.storeService.getLang();
            this.translate.use(browserLang);
        }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["menu"].currentValue.length) {
            // 给所有的分类和页面加上active字段
            this.initMenuStatus();
            // 默认第0个激活
            changes["menu"].currentValue[0]["active"] = true;
            changes["menu"].currentValue[0]["children"][0]["active"] = true;
        }
    }

    ngOnInit(){
        this.getAnalysisList();
        console.log(this.type);
        if(this.type=="smallRNA"){
            this.typeFlag = true;
        }
        this.intervalTimer=null;
        this.intervalTimer=setInterval(()=>{
            this.getAnalysisList();
        },config['getAnalysisListCountInterval'])
    }

    // 初始化菜单状态
    initMenuStatus() {
        this.menu.forEach(val => {
            val["active"] = false;
            if (val["children"].length) {
                val["children"].forEach(v => {
                    v["active"] = false;
                });
            }
        });
    }

    moduleSwitchChange(status){
        this.pageModuleService.setModule(status?'gene':'iso');
    }

    rootMenuMouseEnter(){
        if(this.delayTimer) clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(()=>{
            this.expand = true;
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        },100)
    }

    rootMenuMouseLeave() {
        if(this.delayTimer) {
            clearTimeout(this.delayTimer);
            this.delayTimer = null;
        }
        clearTimeout(this.timer);
        this.timer = null;
        this.timer = setTimeout(() => {
            this.expand = false;
        }, 300);
    }

    menuMouseOver(menu, index) {
        if(this.delayTimer) return;
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null;
        }
        this.index = index;
        if(this.typeFlag){
            menu["children"].forEach((d) => {
                if(d.content.indexOf("差异基因") != -1){
                    d.content.replace('差异基因','差异表达小RNA的靶基因');
                }
            });
        }
        this.expandItem = menu["children"];
        this.expand=true;
    }

    subMenuMouseEnter() {
        if (this.timer) clearTimeout(this.timer);
    }

    subMenuMouseLeave() {
        this.expand = false;
    }

    jump(submenu) {
        this.initMenuStatus();
        console.log(this.storeService)
        submenu["active"] = true;
        this.menu[this.index]["active"] = true;
        this.router.navigateByUrl(`/report/mrna/${submenu["url"]}`);
        this.expand = false;
    }

    analysisFn() {
        let url = `${location.href.substring(
            0,
            location.href.indexOf("/report")
        )}/report/reanalysis/index`;
        window.open(url);
    }

    handleSaveGeneListClick(){
        let href = `${location.href.split('/report')[0]}/report/gene-list/venn`;
        window.open(href)
    }

    jumpToFirst(item,index){
        this.initMenuStatus();
        item["active"] = true;
        if(item['children'].length){
            item['children'][0]['active'] = true;
            this.router.navigateByUrl(`/report/mrna/${item['children'][0]["url"]}`);
            this.expand = false;
        }
    }

    goDetail(data){
        if(data.process==-1){
            return;
        }
		//错误状态，不执行以下程序
		if (data.process == 0){
			this.modalService.error({
				'nzTitle':'id：'+ data['_id'],
				'nzContent': data['explains'],
				'nzClosable':false
				});
			if (!data['isCheck']) {
				data['isCheck'] = true;
				this.checkAnalysis(data['_id']);
			}
			return;
		}
		let type = '';
		if (data['reanalysisType'].indexOf('heatmap') != -1) {
			if (data['reanalysisType'] != 'heatmapRelation') {
				type = 'heatmap';
			} else {
				type = 'heatmapRelation';
			}
		} else {
			type = data['reanalysisType'];
		}

		let href = location.href.split('/report');

		if (!data['isCheck']) {
			data['isCheck'] = true;
			this.checkAnalysis(data['_id']);
		}

		if (type === 'enrichment') {
			window.open(
				`${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']['key']}/${data['isEdited']}/${data['date'].substring(0,10)}`
			);
			// this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']}`);
		}
		else if (type === 'classification'){
			window.open(
				`${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']['key']}/${data['isEdited']}`
			);
		}
		else if (type === 'gsea'){
			//console.log(data["gseaParam"]["dataBase"]["db"]);
			window.open(
				`${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['gseaParam']['treatGroup']['group']}/
				${data['gseaParam']['controlGroup']['group']}/${data['date'].substring(0,10)}/${data["gseaParam"]["dataBase"]["db"]}`
			);
		}
		else {
			window.open(
				`${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['isEdited']}`
			);
			// this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}`);
		}
    }

    checkAnalysis(tid) {
		this.ajaxService.getDeferData({
			url: `${config['javaPath']}/reAnalysis/check`,
			data: {
				tid,
			}
		}).subscribe();
	}

    getAnalysisList(){
        this.ajaxService.getDeferData(
            {
                url:`${config['javaPath']}/reAnalysis/getReanalysisList`,
                data:{
                    LCID: sessionStorage.getItem('LCID'),
                    pageIndex: 1,
                    pageSize: 10,
                    searchContent: {
                        label: null,
                        timeStart: '',
                        timeEnd: '',
                        geneType: [],
                        reanalysisType: [],
                        status: []
                    }
                }
            }
        ).subscribe((data:any)=>{
            if(data.status=='0' && data['data']['sumCount']!==0){
                this.analysisList = data['data']['list'];
            }else{
                this.analysisList.length=0;
            }
        },err=>{
            this.analysisList.length=0;
            clearInterval(this.intervalTimer);
        })
    }

    /**
     * @description 外部重置路由激活状态
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-27
     * @memberof MenuComponent
     */
    public _resetRouteActiveStatus(){
        this.initMenuStatus();
    }

     /**
     * @description 外部重置路由到初始状态
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-27
     * @memberof MenuComponent
     */
    public _initRouteActiveStatus(){
        this.initMenuStatus();
        this.menu[0]['active'] = true;
        this.menu[0]['children'][0]['active'] = true;
    }
}
