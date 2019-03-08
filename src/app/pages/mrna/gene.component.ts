import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from './../../super/service/promptService';
import config from '../../../config';

@Component({
	selector: 'app-gene-page',
	template: `<app-gene-component *ngIf="showModule" [defaultGeneType]="defaultGeneType">
                    <div *ngIf="rootGeneType===config['geneTypeAll']" class="gene-switch gene-switch-module" (click)="handlerSwitchChange()">
                        <span>{{defaultGeneType | translate}}</span><i class="iconfont icon-qiehuan"></i>
                    </div>
                    <div *ngIf="rootGeneType!==config['geneTypeAll']" class="gene-switch gene-switch-module nocursor">
                        <span>{{defaultGeneType | translate}}</span>
                    </div>
                </app-gene-component>`,
	styles: []
})
export class GenePage {
	private moduleRouteName: string = 'gene'; // 模块默认路由 通过路由名称查找菜单配置项（geneType）；
	config: object = config;
	rootGeneType: string = this.storeService.getStore('menuRouteMap')[this.moduleRouteName]['geneType']; // 来自菜单 可配置  all gene transcript
	defaultGeneType: string = this.rootGeneType === this.config['geneTypeAll']
		? this.config['geneTypeOfGene']
		: this.rootGeneType;
	showModule: boolean = true;

	constructor(private storeService: StoreService, private translate: TranslateService) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	handlerSwitchChange() {
		this.defaultGeneType =
			this.defaultGeneType === config['geneTypeOfGene']
				? config['geneTypeOfTranscript']
				: config['geneTypeOfGene'];
		this.showModule = false;
		setTimeout(() => {
			this.showModule = true;
		}, 30);
	}
}

@Component({
  selector: 'app-gene-component',
  templateUrl: './gene.component.html',
  styles: []
})
export class GeneComponent implements OnInit {
	@Input('defaultGeneType') defaultGeneType;

  inputValue: string; //搜索框输入值

  switch: string = 'left';
  tableHeight = 0;
  computedScrollHeight: boolean = false;

  icon_color: string = "gray";//默认是灰色
  radioValue: string = "or";//默认选择or

  selectPanelList: object []; //搜索范围数据
  selectedList: string[] = []; //选中的数据
  selectedAllList: string[] = []; //所有数据选中
  selectedListLength: number = 0; //选中数据的长度

  selectTarget: object []; //基因或者转录本
  selectTargetName: string;//初始化为基因

  fastSearchList: object[];//快捷操作选项

  searchBackList: string[] = [];//输入框返回结果

  	// 默认收起模块描述
	expandModuleDesc: boolean = false;
	// 默认收起自定义面板
	expandModuleSetting: boolean = false;
	// 默认收起搜索结果面板
	expandSearchList: boolean = false;

  constructor(
		private message: MessageService,
		private ajaxService: AjaxService,
		private globalService: GlobalService,
		private storeService: StoreService,
		public pageModuleService: PageModuleService,
		private translate: TranslateService,
		private promptService: PromptService,
		private addColumnService: AddColumnService,
		private router: Router
	) {
		// 订阅windowResize 重新计算表格滚动高度
		this.message.getResize().subscribe((res) => {
			if (res['message'] === 'resize') this.computedTableHeight();
		});

		// 每次切换路由计算表格高度
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) this.computedTableHeight();
		});
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

  ngOnInit() {
	  	this.getDefaultData();

		//基因表或者转录本表
		this.selectTarget = [
			{
				label:"基因",
				value:"基因",
				isChecked: false
			},
			{
				label:"转录本",
				value:"转录本",
				isChecked: false
			}
		];
		this.selectTargetName = this.selectTarget[0]["value"];

		//快速查询
		this.fastSearchList = [
			{
				name:"mrna",
				value:"mrna"
			},
			{
				name:"mrna",
				value:"mrna"
			},
		]

  }

	computedTableHeight() {
		try {
			let h = this.tableHeight;
			this.tableHeight = 0;
			if (this.tableHeight === h) this.computedScrollHeight = true;
		} catch (error) {}
  }
	
  	//是否折叠显示框
    moduleDescChange() {
		this.expandModuleDesc = !this.expandModuleDesc;
		// 重新计算表格切换组件表格的滚动高度
		// setTimeout(() => {
		// 	this.tableSwitchChart.scrollHeight();
		// }, 30);
	}

	moduleSetChange(){
		console.log(this.expandModuleSetting)
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//选择面板 选择
    selectClick(item) {
        item["isChecked"] = !item["isChecked"];
        this.selectedList = [];
        this.selectPanelList.forEach(d => {
			if (d["isChecked"]) {
				this.selectedList.push(d["key"]);
			}
		});
		
		if(this.selectedAllList.length == this.selectedList.length){
			this.icon_color = "blue";
		}else{
			this.icon_color = "gray";
		}
	}
	
	//基因，转录本切换
	selectTypeChange() {
		// 收起自定义面板
		this.expandModuleSetting  = false;
		// 收起搜索结果面板
		this.expandSearchList = false;
		console.log(this.selectTargetName);
	}

	//搜索按钮
	goSearch(){
		/*
			this.inputValue;
			this.radioValue;
			this.selectedList;
		*/
		console.log("我在搜索");
	}

	//输入数据，弹出面板
	inputChange(){
		console.log(this.inputValue);
		if(this.inputValue){
			this.getSearchback();
		}else{
			this.expandSearchList = false;
		}	
	}

	getSearchback(){
		this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/home/searchWord`,
                data: {
					content: this.inputValue
				}
            })
            .subscribe((data: any) => {
                if (
                    data.status == "0" &&
                    (data.data.length == 0 || $.isEmptyObject(data.data))
                ) {
                    return;
                } else if (data.status == "-1") {
                    return;
                } else if (data.status == "-2") {
                    return;
                } else {
					this.searchBackList = data['data'].data;
					this.expandModuleSetting  = false;
					this.expandSearchList = true;
                }
            });
		
	}
	//或且切换
	radioChange(){ //
		this.icon_color = "blue";
	}

	//下方取消按钮
	btnCancle(){ 
		this.icon_color = "gray";
		this.radioValue = "or";
		this.selectPanelList.forEach(d => {
				if (d["isChecked"]) {
					d["isChecked"] = false;
				}
		});
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//下方确定
	btnConfirm(){ 
		this.icon_color = "gray";
		console.log(this.radioValue);
		console.log(this.selectedList);
		this.expandModuleSetting = !this.expandModuleSetting;
	}

	//点击搜索返回面板其中一项
	searchBackSelect(item){
		this.inputValue = item;
		this.expandSearchList = false;
	}

	//最外层点击事件关闭弹出面板
	expandModuleDescClick(){
		var e =e||window.event;  //如果提供了事件对象，则这是一个非IE浏览器
		if(e.target.className=="gene_top_content"){
			e.preventDefault();
			// 收起自定义面板
			this.expandModuleSetting  = false;
			// 收起搜索结果面板
			this.expandSearchList = false;
		}
	}

	getDefaultData(){
		this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/home/searchHead`,
                data: {
					geneType: this.defaultGeneType,
					species: this.storeService.getStore('genome'), //物种
				}
            })
            .subscribe((data: any) => {
                if (
                    data.status == "0" &&
                    (data.data.length == 0 || $.isEmptyObject(data.data))
                ) {
                    return;
                } else if (data.status == "-1") {
                    return;
                } else if (data.status == "-2") {
                    return;
                } else {
					//console.log(data);
					for(var i = 0;i < data['data'].length;i++){
						data['data'][i]["isChecked"] = false;
					}
					this.selectPanelList = data["data"];
					this.selectedListLength = this.selectedList.length;
					this.selectPanelList.forEach(d => {
						this.selectedAllList.push(d["key"]);
					})
					console.log(this.selectPanelList)
                }
            });
	}
}
