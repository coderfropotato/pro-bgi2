import { AjaxService } from './../../super/service/ajaxService';
import { StoreService } from './../../super/service/storeService';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import config from '../../../config';

@Component({
	selector: 'app-analysis-index',
	templateUrl: './index.component.html'
})
export class ReanalysisIndexComponent implements OnInit {
	analysisList: any[] = [];
	loading: boolean = true;
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

		this.getAnalysisList();
	}

	ngOnInit() {
		console.log();
	}

	getAnalysisList() {
		this.ajaxService
			.getDeferData({
				url: 'http://localhost:8086/analysis',
				data: {}
			})
			.subscribe(
				(data) => {
					this.analysisList = data['data']['rows'];
				},
				(err) => {
					console.log(err);
				},
				() => {
					this.loading = false;
				}
			);
	}
}
