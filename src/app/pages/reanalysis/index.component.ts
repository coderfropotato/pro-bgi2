import { AddColumnService } from './../../super/service/addColumnService';
// import { OuterDataBaseService } from './../../super/service/outerDataBaseService';
import { AjaxService } from './../../super/service/ajaxService';
import { StoreService } from './../../super/service/storeService';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router,NavigationEnd,NavigationStart } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from "ngx-spinner";
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import config from '../../../config';

declare const $:any;

@Component({
	selector: 'app-analysis-index',
	templateUrl: './index.component.html'
})
export class ReanalysisIndexComponent implements OnInit {
    ready:boolean = false;
    getUnReadAnalysisCountTimer:any = null;
    menuList:any[] = [];

	constructor(
        private router:Router,
        private routes:ActivatedRoute,
        private ajaxService:AjaxService,
        public storeService:StoreService,
        private addColumnService:AddColumnService,
        // private outerDataBaseService:OuterDataBaseService,
        private ngxSpinnerService:NgxSpinnerService,
        private modalService:NzModalService
    ) {
        this.routes.paramMap.subscribe((params)=>{
            this.storeService.setTid(null);
        })
    }

    ngOnInit() {
        this.ngxSpinnerService.show();
        (async () => {
            try {
                await this.getLcInfo();
                // await this.getClassRichConfig();

                this.getUnReadAnalysisCount();
                this.ready = true;
                setTimeout(() => {
                    this.ngxSpinnerService.hide();
                }, 300);
            } catch (error) {
                // this.ngxSpinnerService.hide();
                // let tpl = this.modalService.error({
                //     nzTitle: '系统错误',
                //     nzContent: '缺少必要信息，请重新登录',
                //     nzClosable: false,
                //     nzOnCancel:()=>{
                //         tpl.destroy();
                //     },
                //     nzOnOk: () => {
                //         this.router.navigate([`/report/login`])
                //     }
                //   });
            }
        })();
    }

    async getLcInfo() {
        return new Promise((resolve, reject) => {
            this.ajaxService
                .getDeferData({
                    url: `${config["javaPath"]}/LCINFO/${sessionStorage.getItem(
                        "LCID"
                    )}`
                })
                .subscribe(
                    data => {
                        if (data["status"] === "0") {
                            for (let key in data["data"]) {
                                this.storeService.setStore(
                                    key,
                                    data["data"][key]
                                );
                                if(typeof data["data"][key]!=='object'){
                                    sessionStorage.setItem(key,data["data"][key]);
                                }else{
                                    sessionStorage.setItem(key,JSON.stringify(data["data"][key]));
                                }
                            }
                        }
                        resolve("success");
                    },
                    () => reject("error")
                );
        });
    }

    getUnReadAnalysisCount(){
		let getCount = ()=>{
			this.ajaxService.getDeferData({
				data: {
					LCID:sessionStorage.getItem('LCID')
				},
				url: `${config['javaPath']}/reAnalysis/count`
			}).subscribe(data=>{
				if(data['status']==0) this.storeService.setStore('analysisCount',data['data'][0]);
			},error=>{
                clearInterval(this.getUnReadAnalysisCountTimer);
            })
		}

		getCount();

		this.getUnReadAnalysisCountTimer = setInterval(()=>{
			getCount();
		},config['getAnalysisCountInterval'])
	}

    // 获取分类 富集下拉列表数据
    // async getClassRichConfig(){
    //     return new Promise((resolve,reject)=>{
    //         this.ajaxService
    //             .getDeferData({
    //                 url: `${config["javaPath"]}/classification/config`,
    //                 data:{
    //                     LCID:sessionStorage.getItem('LCID'),
    //                     species: this.storeService.getStore('genome'),
    //                     version: this.storeService.getStore('version')
    //                 }
    //             })
    //             .subscribe(
    //                 data => {
    //                     console.log(data);
    //                     if (data["status"] == "0" && !$.isEmptyObject(data['data'])) {
    //                        this.storeService.setStore('geneClassRichConfig',data['data']);
    //                        sessionStorage.setItem('geneClassRichConfig',JSON.stringify(data['data']));
    //                        resolve("success");
    //                     }else{
    //                         resolve("error");
    //                     }
    //                 },
    //                 () => reject("error")
    //             );
    //     })
    // }

    // async getAddThead() {
    //     return new Promise((resolve, reject) => {
    //         let LCID = sessionStorage.getItem("LCID");
    //         this.ajaxService
    //             .getDeferData({
    //                 data: {},
    //                 url: `${config['javaPath']}/addColumn/${LCID}`
    //             })
    //             .subscribe(
    //                 data => {
    //                     if(data['status']==='0'){
    //                         let d = data['data'];
    //                         // let outerFlag = "006";
    //                         // let outerDataBase;

    //                         d.forEach((val,index)=>{
    //                             if(val['category']===config['outerDataBaseIndex']){
    //                                 // outerDataBase = d.splice(index,1)[0];
    //                                 val['children'].forEach(v=>{
    //                                     if(!('children' in v)) v['children'] = [];
    //                                     v['modalVisible'] = false;
    //                                     v['children'].forEach(item=>{
    //                                         this.initTreeData(item['treeData']);
    //                                     })
    //                                 })
    //                             }
    //                         })

    //                         // this.storeService.setThead(d);
    //                         this.addColumnService.set(d);
    //                         // outerDataBase['children'].forEach(v=>{
    //                         //     v['children'].forEach((val,index)=>{
    //                         //         val['generatedThead'] = [];
    //                         //         this.initTreeData(val['treeData']);
    //                         //     })
    //                         // });
    //                         // this.outerDataBaseService.set(outerDataBase);
    //                         resolve("success");
    //                     }else{
    //                         reject('error');
    //                     }
    //                 },
    //                 () => reject("error")
    //             );
    //     });
    // }

    // 初始化 增删列树节点数据
    initTreeData(treeData){
        if (!treeData || !treeData.length) return;
        let stack = [];
        for (var i = 0, len = treeData.length; i < len; i++) {
            stack.push(treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();

            if(item['isRoot']) item['isExpand'] = true;
            item['isExpand'] = true;
            item['isChecked'] = false;
            item['disabled'] = false;

            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

    // toAnalysisList(){
    //     this.router.navigateByUrl('/report/reanalysis/index');
    // }

    // handlerLogoClick(){
    //     this.toAnalysisList();
    // }
}
