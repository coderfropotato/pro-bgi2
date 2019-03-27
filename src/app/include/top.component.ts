import { LoadingService } from './../super/service/loadingService';
import { ToolsService } from './../super/service/toolsService';
import { StoreService } from '../super/service/storeService';
import { Component, OnInit, Input, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import config from '../../config';

declare const $: any;
declare const ActiveXObject: any;

@Component({
	selector: 'app-top',
	templateUrl: './top.component.html'
})
export class TopComponent implements OnInit{
	@ViewChild('reportContent') reportContent: ElementRef;
	@ViewChild('fullScreen') fullScreen;

	pageRoutes: string[];
	htmlString: string[] = [];
	browserLang: string;
	navigatedRoutes: Array<string> = [];
	themeColor: string = '#5278f8';
	isFull: boolean = false;
	LCID:string = '';
	showLogout:boolean = false;
	outTimer:any = null;

	@Input() pdf: boolean = true;
	@Input() analysis: boolean = true;
	@Input() upload: boolean = true;
	@Input() lang: boolean = true;
	@Output() logoClick: EventEmitter<any> = new EventEmitter();

	constructor(
		private el: ElementRef,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private router: Router,
		private storeService: StoreService,
        private toolService: ToolsService,
        private loading:LoadingService
	) {
		this.translate.addLangs([ 'zh', 'en' ]);
		this.translate.setDefaultLang('zh');
		this.browserLang = localStorage.getItem('lang') || config['lang']; // this.translate.getBrowserLang()
		this.translate.use(this.browserLang.match(/zh|en/) ? this.browserLang : 'zh');
		localStorage.setItem('lang', this.browserLang);
		this.storeService.setLang(this.browserLang);
	}

	ngOnInit(){
		this.LCID = sessionStorage.getItem('LCID');
	}

	changeLan() {
		if (this.browserLang == 'zh') {
			this.translate.use('en');
			this.browserLang = 'en';
		} else {
			this.translate.use('zh');
			this.browserLang = 'zh';
		}
		localStorage.setItem('lang', this.browserLang);
		this.storeService.setLang(this.browserLang);
	}

	analysisFn() {
		let url = `${location.href.substring(0, location.href.indexOf('/report'))}/report/reanalysis/index`;
		window.open(url);
	}

	uploadFn() {
		this.router.navigateByUrl(`/report/${sessionStorage.getItem('LCTYPE')}/upload`);
	}

	handlerLogoClick() {
		this.logoClick.emit();
	}

	handleFullScreenClick() {
		let el = document.documentElement;
		this.isFull = this.isFullscreen();
		if (!this.isFull) {
			let requestMethod =
				el['requestFullscreen'] ||
				el['webkitRequestFullScreen'] ||
				el['mozRequestFullScreen'] ||
				el['msRequestFullscreen'];
			if (requestMethod) {
				requestMethod.call(el);
			} else if (typeof window['ActiveXObject'] !== 'undefined') {
				let wscript = new ActiveXObject('WScript.Shell');
				if (wscript !== null) {
					wscript.SendKeys('{F11}');
				}
			}
			this.isFull = true;
		} else {
			let exitMethod =
				document['exitFullscreen'] ||
				document['webkitCancelFullScreen'] ||
				document['mozCancelFullScreen'] ||
				document['msExitFullscreen'];
			if (exitMethod) exitMethod.call(document);

			this.isFull = false;
		}
	}

	isFullscreen() {
		return (
			document['fullscreenElement'] ||
			document['msFullscreenElement'] ||
			document['mozFullScreenElement'] ||
			document['webkitFullscreenElement']
		);
	}

	handleColorChange(event) {
		let color = event.target.value;
		let style = $('head > style');
		let reg = new RegExp(this.themeColor, 'g');
		$.each(style, (index, val) => {
			$(val).html($(val).html().replace(reg, color));
		});
		this.themeColor = color;
	}

	handleSaveGeneListClick(){
		let href = `${location.href.split('/report')[0]}/report/gene-list/venn`;
		window.open(href)
	}

	handleShowLogout(){
		if(this.outTimer) clearTimeout(this.outTimer);
		this.showLogout = true;
	}

	handleHideLogout(){
		this.outTimer = setTimeout(()=>{
			this.showLogout = false;
		},300)
	}

	logout(){
		sessionStorage.clear();
		localStorage.removeItem('token');
		this.router.navigateByUrl(`/report/login`);
	}
}
