import { Component, OnInit, OnDestroy,ViewChild } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { MessageService } from "../../super/service/messageService";

@Component({
    selector: "app-table",
    templateUrl: "./table.component.html"
})
export class tableComponent implements OnInit {
    subscription: Subscription;
    @ViewChild('geneTable') geneTable;
    pageEntity: object = {
        pageSize: 10,
        pageIndex: 1,
        sortValue: null,
        sortKey: null,
        sample:'mrna',
        searchList: [],
        rootSearchContentList: []
    };

    constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private message: MessageService
    ) {
        let browserLang = this.translate.getBrowserLang();
        this.translate.use(browserLang.match(/en|zh/) ? browserLang : "zh");
    }

    ngOnInit() {}

    selectOneChange(){
        this.geneTable._setParamsOfEntity('sample',this.pageEntity['sample']);
    }

    ngOnDestory() {}
}
