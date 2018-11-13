import { ToolsService } from './../super/service/toolsService';
import { StoreService } from "../super/service/storeService";
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
declare const $: any;

@Component({
    selector: "app-top",
    templateUrl: "./top.component.html"
})
export class TopComponent implements OnInit {
    @ViewChild("reportContent")
    reportContent: ElementRef;

    pageRoutes: string[];
    htmlString: string[] = [];
    exportPdfFlag: any = false;
    browserLang: string;
    navigatedRoutes: Array<string> = [];

    constructor(
        private el: ElementRef,
        private route: ActivatedRoute,
        private translate: TranslateService,
        private router: Router,
        private storeService: StoreService,
        private toolService:ToolsService
    ) {
        this.translate.addLangs(["zh", "en"]);
        this.translate.setDefaultLang("zh");
        this.browserLang = this.translate.getBrowserLang();
        this.translate.use(
            this.browserLang.match(/zh|en/) ? this.browserLang : "zh"
        );
        this.storeService.setLang(this.browserLang);
    }

    changeLan() {
        if (this.browserLang == "zh") {
            this.translate.use("en");
            this.browserLang = "en";
        } else {
            this.translate.use("zh");
            this.browserLang = "zh";
        }
        this.storeService.setLang(this.browserLang);
    }

    ngOnInit() {
        // 所有当前需要导出pdf的页面的路由  组合在一起导出
        this.pageRoutes = ["/report/mrna/layout1"];

        // 路由导航完成钩子 仅仅针对导出pdf的时候收集dom元素内容使用
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && this.exportPdfFlag) {
                // 给一个导航完成跳转的时间
                setTimeout(() => {
                    this.htmlString.push($(".report-content").html());
                    if (this.exportPdfFlag === "done") {
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

        if (
            this.route["_routerState"].snapshot.url === this.pageRoutes[0] &&
            this.pageRoutes.length > 1
        ) {
            this.htmlString = [$(".report-content").html()];
            count++;
        } else if (this.pageRoutes.length == 1) {
            this.htmlString = [$(".report-content").html()];
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

        async function asyncNavigatePage (pageUrl, flag = false){
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
                if (flag) _self.exportPdfFlag = "done";
            });
        };
    }

    // download pdf orderby htmlstring
    downloadPdf(cb) {
        // document.body.innerHTML = "";
        // document.body.innerHTML = `<div>${this.htmlString.join("")}</div>`;
        $(".report-content").html(`<div>${this.htmlString.join("")}</div>`);
        document.body.style.width = window.screen.width + "px";

        window.print();
        window.location.reload();
    }

    analysis() {
        // let url = `${location.href.substring(
        //     0,
        //     location.href.indexOf("/report")
        // )}/report/reanalysis/index`;
        // window.open(url);
        this.toolService.showTools(100);
    }
}
