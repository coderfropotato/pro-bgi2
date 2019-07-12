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
	@Input() help: boolean = true;
    @Input() disabledLogoClick:boolean = false;
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

		// 所有当前需要导出pdf的页面的路由  组合在一起导出
		if (this.pdf) {
			let prefix = `/report/${sessionStorage.getItem('LCTYPE')}/`;
			this.pageRoutes = [];
			this.storeService.getStore('menu').forEach((v) => {
				if (v['children'].length) {
					v['children'].forEach((val) => {
						if (val['isExport']) this.pageRoutes.push(prefix + val['url']);
					});
				}
			});
		}
	}

	// 获取各个路由需要导出模块的html，导出pdf；
	async exportPdf() {
        this.loading.open('body','正在导出pdf请稍后...')
		let _self = this;
		let count: number = 0;
		this.navigatedRoutes = this.storeService.getNavigatedRoutes();

		await asyncNavigatePage();

		async function asyncNavigatePage() {
			let pageUrl = _self.pageRoutes[count];
			_self.router.navigateByUrl(pageUrl);
			setTimeout(() => {
				// $('.content').css('page-break-before', 'always'); // 按模块分页
				_self.htmlString.push($('.report-content').html());
                count++;
                let flag = count === _self.pageRoutes.length;
				if (!flag) {
					(async () => {
						await asyncNavigatePage();
					})();
				}else{
                    _self.downloadPdf();
                }
			}, 10000);
		}
	}

	// download pdf orderby htmlstring
	downloadPdf() {
        document.body.style.overflow="auto";
        // $('.menu').remove();
        $('.top').css('opacity', 0);
        $('.report').css('height','auto');
        $('body').css('height','auto');
		$('html').css('overflow', 'auto');
        $('.report').html(this.htmlString.join(''));
        // $('.switch').remove();
		document.body.style.width = '1190pt';
        this.loading.close();

		document.title=`BGI_${this.LCID}_report.pdf`;
		window.print();
		window.location.reload();
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

	goHelp(){
		// let url = `${location.href.substring(0, location.href.indexOf('/report'))}/report/mrna/help`;
		// window.open(url);
		let href = `${location.href.split('/report')[0]}/report/mrna/help`;
		window.open(href)
	}

	handleLogoClick(){
        if(!this.disabledLogoClick){
            this.router.navigateByUrl(`/report/${sessionStorage.getItem('LCTYPE')}/${JSON.parse(sessionStorage.getItem('menu_list'))[0]['children'][0]['url']}`);
            this.logoClick.emit();
        }
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
		localStorage.removeItem('token_'+this.LCID);
		this.router.navigateByUrl(`/report/login`);
	}
}
