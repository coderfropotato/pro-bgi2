import { Component,OnInit, Input} from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { StoreService } from "./../service/storeService";

@Component({
  selector: 'app-error',
  template:  `<div class="error-component">
                    <div *ngIf="error" class="table-error" [class.curNodata]="error=='curNodata'">
                        <p *ngIf="error=='nodata'">{{'errorTips.nodata' | translate}}</p>
                        <p *ngIf="error=='dataOver'">{{'errorTips.maxOver' | translate}}</p>
                        <p *ngIf="error=='error'">{{'errorTips.error' | translate}}</p>
                        <p *ngIf="error=='curNodata'">{{'errorTips.curNodata' | translate}}</p>
                    </div>
                </div>`
})

export class ErrorComponent implements OnInit {
  @Input() error:any;

  constructor(
      private translate: TranslateService,
      private storeService: StoreService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

  ngOnInit() {}

}
