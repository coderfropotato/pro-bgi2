import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef,
    Output,
    EventEmitter,
    HostListener
} from "@angular/core";
import { AjaxService } from "../../super/service/ajaxService";
import { LoadingService } from "../../super/service/loadingService";

declare const $: any;

@Component({
    selector: "app-little-table",
    templateUrl: "./little-table.component.html",
    styles: []
})
export class LittleTableComponent implements OnInit {
    @Input() url: string;
    @Input() pageEntity: object;
    @Input() inRefreshShow: boolean = true;

    @Input() targetID: string;
    @Input() targetID2: string;
    @Input() targetID2_ID:string;
    @Input() targetID2Type:string;

    @Input() targetURL: string;
    @Input() targetFlag: boolean = false;
    goTarget: string;

    @Input() type: string;

    @Output() drawTableEmit: EventEmitter<any> = new EventEmitter();

    //this.drawChartEmit.emit(data);

    tableError: string;

    isLoading: boolean = false;

    tableData: any[] = [];
    rows: any[] = [];
    thead: any[] = [];

    targetID2Url:string;
    constructor(
        private ajaxService: AjaxService,
        private loadingService: LoadingService
    ) {}

    ngOnInit() {
        if(this.targetFlag){
            this.goTarget = this.targetURL;
        }else{
            this.goTarget = this.targetURL + this.targetID;
        }
        if(this.targetID2){
            this.targetID2Url = `${location.href.split('/report')[0]}/report/gene-detail/${sessionStorage.getItem('LCID')}/${this.targetID2_ID}/${this.targetID2Type}`;
        }
        this.getData();
    }

    getData() {
        this.isLoading = true;
        this.ajaxService
            .getDeferData({
                url: this.url,
                data: this.pageEntity
            })
            .subscribe(
                (data: any) => {
                    if (data.status == "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.tableError = "nodata";
                    } else if (data.status == "-1") {
                        this.tableError = "error";
                    } else if (data.status == "-2") {
                        this.tableError = "dataOver";
                    } else {
                       this.tableError = "";
                       this.tableData = data.data;
                       this.rows = data["rows"];
                       this.thead = data["baseThead"];

                       this.drawTableEmit.emit({
                            type:this.type,
                            data:data.data
                       });
                    }
                    this.isLoading = false;
                    //console.log(data)

                },
                error => {
                    this.tableError = error;
                    this.isLoading = false;
                }
            );
    }

    refresh() {
        this.getData();
    }

    down(){

    }
}
