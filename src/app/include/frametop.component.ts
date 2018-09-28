import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

declare const $:any;

@Component({
    selector: 'app-frametop',
    templateUrl: './frametop.component.html',
    styleUrls: ['./frametop.component.css']
})
export class FrametopComponent implements OnInit {
    @ViewChild('reportContent') reportContent: ElementRef;

    pageRoutes: string[];
    htmlString: string[] = [];
    exportPdfFlag: any = false;
    browserLang: string;

    constructor(
        private el: ElementRef,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private router: Router
    ) { 
        this.translate.addLangs(['zh', 'en']);
        this.translate.setDefaultLang('zh');
        this.browserLang = this.translate.getBrowserLang();
        this.translate.use(this.browserLang.match(/zh|en/) ? this.browserLang : 'zh');
    }

    changeLan() {
        if (this.browserLang == 'zh') {
            this.translate.use('en');
            this.browserLang = 'en';
        } else {
            this.translate.use('zh');
            this.browserLang = 'zh';
        }
    }

    ngOnInit() {
        // 所有当前需要导出pdf的页面的路由  组合在一起导出
        this.pageRoutes = [
            '/report/mrna/cxzk1',
            '/report/mrna/cxzk2'
        ];

        // 路由导航完成钩子 仅仅针对导出pdf的时候收集dom元素内容使用
        this.router.events
            .subscribe((event) => {
                if (event instanceof NavigationEnd && this.exportPdfFlag) {
                    // 给一个导航完成跳转的时间
                    setTimeout(() => {
                        this.htmlString.push($('.report-content').html());
                        if (this.exportPdfFlag === 'done') {
                            this.downloadPdf(() => {
                                this.exportPdfFlag = false;
                            });
                        }
                    }, 300)
                }
            });
    }

    // 获取各个路由需要导出模块的html，导出pdf；
    async exportPdf() {
        let _this = this;
        let count: number = 0;
        this.exportPdfFlag = true;

        if (this.route['_routerState'].snapshot.url === this.pageRoutes[0]) {
            this.htmlString = [$('.report-content').html()];
            count++;
        } else {
            this.htmlString = [];
        }

        while (count < this.pageRoutes.length) {
            if (count === this.pageRoutes.length - 1) {
                await asyncNavigatePage(this.pageRoutes[count], true);
            } else {
                await asyncNavigatePage(this.pageRoutes[count]);
            }
            count++;
        }

        function asyncNavigatePage(pageUrl, flag = false) {
            // flag true表示最后一次导航马上要下载pdf
            return new Promise((resolve, reject) => {
                _this.router.navigateByUrl(pageUrl);
                if (flag) _this.exportPdfFlag = 'done';
                setTimeout(() => {
                    resolve();
                }, 1000);
            })
        }
    }

    // download pdf orderby htmlstring
    downloadPdf(cb) {
        document.body.innerHTML = '';
        document.body.innerHTML = `<div>${this.htmlString.join('')}</div>`;
        document.body.style.width = 1080+'px';

        window.print();
        window.location.reload();

        /*domToImage.toJpeg(wrap, {
            quality: 1.0,
            bgcolor: '#fff',
            style: {
                'opacity': '1',
                'top': '0',
                'left': '0'
            }
        }).then(dataUrl => {
            let img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                document.body.appendChild(img);
                let pdf = new jsPdf();
                // A4 [210mm×297mm]
                // padding y=14 y=10
                // content w 190 h 277
                img.width = 190;  // height 140
                pdf.addImage(dataUrl, 'JPEG', 14, 10, img.width, img.height);
                pdf.save(`download.pdf`);
                wrap.parentNode.removeChild(wrap);
                img.parentNode.removeChild(img);
                cb && cb();
            }
        }, error => {
            console.log(error);
            wrap.parentNode.removeChild(wrap);
            cb && cb();
        })*/
    }
}
