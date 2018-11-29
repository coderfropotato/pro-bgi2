import { AjaxService } from './../../super/service/ajaxService';
import { StoreService } from './../../super/service/storeService';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import config from '../../../config';

@Component({
	selector: 'app-re-list',
	templateUrl: './re-list.component.html'
})
export class ReListComponent implements OnInit {
	analysisList: any[] = [];
	loading: boolean = false;
	constructor(
		private routes: ActivatedRoute,
		private router: Router,
		private storeService: StoreService,
		private translate: TranslateService,
		private ajaxService: AjaxService
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
				data: {
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
				}
			})
			.subscribe(
				(data) => {
                    if(data['status']==='0'){
                        this.analysisList = data['data']['list'];
                        console.log(this.analysisList)
                    }
				},
				(err) => {
					console.log(err);
				},
				() => {
					this.loading = false;
				}
			);
    }

    toDetail(data){
        // report/reanalysis/re-multiOmics
        this.router.navigateByUrl(`/report/reanalysis/re-${data['reanalysisType']}/${data['geneType']}/${data['tid']}`);
    }
}
