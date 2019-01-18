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
export class TopComponent implements OnInit {
	@ViewChild('reportContent') reportContent: ElementRef;
	@ViewChild('fullScreen') fullScreen;

	pageRoutes: string[];
	htmlString: string[] = [];
	exportPdfFlag: any = false;
	browserLang: string;
    navigatedRoutes: Array<string> = [];
    themeColor:string = '#5278f8';

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
		private toolService: ToolsService
	) {
		this.translate.addLangs([ 'zh', 'en' ]);
		this.translate.setDefaultLang('zh');
		this.browserLang = sessionStorage.getItem('lang') || config['lang']; // this.translate.getBrowserLang()
		this.translate.use(this.browserLang.match(/zh|en/) ? this.browserLang : 'zh');
		sessionStorage.setItem('lang', this.browserLang);
		this.storeService.setLang(this.browserLang);
	}

	changeLan() {
		if (this.browserLang == 'zh') {
			this.translate.use('en');
			this.browserLang = 'en';
		} else {
			this.translate.use('zh');
			this.browserLang = 'zh';
		}
		sessionStorage.setItem('lang', this.browserLang);
		this.storeService.setLang(this.browserLang);
	}

	ngOnInit() {
		// 所有当前需要导出pdf的页面的路由  组合在一起导出
		this.pageRoutes = [ '/report/mrna/layout1', '/report/mrna/table' ];

		// 路由导航完成钩子 仅仅针对导出pdf的时候收集dom元素内容使用
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd && this.exportPdfFlag) {
				// 给一个导航完成跳转的时间
				setTimeout(() => {
					this.htmlString.push($('.report-content').html());
					if (this.exportPdfFlag === 'done') {
						this.downloadPdf(() => {
							this.exportPdfFlag = false;
						});
					}
				}, 1000);
			}
        });
	}

	// 获取各个路由需要导出模块的html，导出pdf；
	async exportPdf() {
		let _self = this;
		let count: number = 0;
		this.exportPdfFlag = true;
		this.navigatedRoutes = this.storeService.getNavigatedRoutes();
		$('body').css('overflow', 'unset');
		$('.menu').remove();
		$('.top').remove();

		if (this.route['_routerState'].snapshot.url === this.pageRoutes[0] && this.pageRoutes.length > 1) {
			this.htmlString = [ $('.report-content').html() ];
			count++;
		} else if (this.pageRoutes.length == 1) {
			this.htmlString = [ $('.report-content').html() ];
			this.downloadPdf(() => {
				this.exportPdfFlag = false;
			});
		} else {
			this.htmlString = [];
		}

		do {
			if (count === this.pageRoutes.length - 1) {
				await asyncNavigatePage(this.pageRoutes[count], true);
			} else {
				await asyncNavigatePage(this.pageRoutes[count]);
			}
			count++;
		} while (count < this.pageRoutes.length);

		// while (count < this.pageRoutes.length) {
		//     if (count === this.pageRoutes.length - 1) {
		//         await asyncNavigatePage(this.pageRoutes[count], true);
		//     } else {
		//         await asyncNavigatePage(this.pageRoutes[count]);
		//     }
		//     count++;
		// }

		async function asyncNavigatePage(pageUrl, flag = false) {
			// flag true表示最后一次导航马上要下载pdf
			return new Promise((resolve, reject) => {
				_self.router.navigateByUrl(pageUrl);
				// 之前导航过
				if (_self.navigatedRoutes.includes(pageUrl)) {
					setTimeout(() => {
						resolve();
					}, 1000);
				} else {
					// 初始化的页面要等待加载完成
					setTimeout(() => {
						resolve();
					}, 3000);
				}
				if (flag) _self.exportPdfFlag = 'done';
			});
		}
	}

	// download pdf orderby htmlstring
	downloadPdf(cb) {
		$('.report-wrap').html(`<div>${this.htmlString.join('')}</div>`);
		document.body.style.width = window.screen.width + 'px';

		window.print();
		window.location.reload();
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

		if (!this.isFullscreen()) {
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
		} else {
			let exitMethod =
				document['exitFullscreen'] ||
				document['webkitCancelFullScreen'] ||
				document['mozCancelFullScreen'] ||
				document['msExitFullscreen'];
			if (exitMethod) exitMethod.call(document);
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

    handleColorChange(event){
        let color = event.target.value;
        let style = $('head > style');
        let reg = new RegExp(this.themeColor,'g');
        $.each(style,(index,val)=>{
            $(val).html($(val).html().replace(reg,color))
        })
        this.themeColor = color;
    }
}
