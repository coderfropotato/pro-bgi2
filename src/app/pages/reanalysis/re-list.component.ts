import { AjaxService } from './../../super/service/ajaxService';
import { StoreService } from './../../super/service/storeService';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NzNotificationService } from "ng-zorro-antd";
import config from '../../../config';

@Component({
	selector: 'app-re-list',
	templateUrl: './re-list.component.html',
	styles:[]
})
export class ReListComponent implements OnInit {
	analysisList: any[] = [];
	loading: boolean = false;
	tableEntity:object = {
		LCID: sessionStorage.getItem('LCID'),
		pageIndex: 1,
		pageSize: 10,
		label: '',
		searchContent: {
			timeStart: '',
			timeEnd: '',
			reanalysisType: [],
			status: []
		}
	};
	total:number = 0;
	error:string = '';

	constructor(
		private routes: ActivatedRoute,
		private router: Router,
		private storeService: StoreService,
		private translate: TranslateService,
		private ajaxService: AjaxService,
		private notify:NzNotificationService
	) {
		let langs = [ 'zh', 'en' ];
		this.translate.addLangs(langs);
		this.translate.setDefaultLang('zh');
		let curLang = sessionStorage.getItem('lang');
		langs.includes(curLang) ? this.translate.use(curLang) : this.translate.use('zh');
	}

	ngOnInit() {
        this.getAnalysisList();
	}

	getAnalysisList() {
        this.loading = true;
		this.ajaxService
			.getDeferData({
				url: `${config['javaPath']}/reAnalysis/getReanalysisList`,
				data: this.tableEntity
			})
			.subscribe(
				(data) => {
                    if(data['status']==='0'){
						this.analysisList = data['data']['list'];
						this.total = data['data']['sumCount'];
						this.error = '';
                    }else{
						this.analysisList = [];
						this.total = 0;
						this.error ='nodata';
					}
				},
				(err) => {
					this.total = 0;
					this.error = 'error';
				},
				() => {
					this.loading = false;
				}
			);
    }

    toDetail(data){
		let type = '';
		if(data['reanalysisType'].indexOf('heatmap')!=-1){
			if(data['reanalysisType']!='heatmaprelation'){
				type = 'heatmap';
			}else{
				type = 'heatmaprelation';
			}
		}else{
			type = data['reanalysisType'];
		}

		// let href = location.href.split('/report');
		// window.open(`${href[0]}/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}`);

		if(type === 'classification'){
			this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}/${data['annotation']}`);
		}else{
			this.router.navigateByUrl(`/report/reanalysis/re-${type}/${data['geneType']}/${data['_id']}/${data['version']}`);
		}
	}
	
	handleDelete(data){
		this.ajaxService.getDeferData({
			url:`${config['javaPath']}/reAnalysis/deleteByTid`,
			data:{
				"LCID": "demo",
				"tid": data['_id']
			}
		}).subscribe((res)=>{
			if(res['status']==0){
				this.notify.success('Delete',`重分析任务 - ${data['nickname']} 删除成功`);
				this.tableEntity['pageIndex'] = 1;
				this.getAnalysisList();
			}else{
				this.notify.warning('Delete',`重分析任务 - ${data['nickname']} 删除失败`);
			}
		},error=>{
			console.log(error);
			this.notify.warning('Delete',`重分析任务 - ${data['nickname']} 删除失败`);
		})
	}
}
