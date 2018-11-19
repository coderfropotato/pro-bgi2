import { Component,OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-error',
  template:  `<div class="error-component">
                    <div *ngIf="error" class="table-error">
                        <p *ngIf="error=='nodata'">对不起，没有可显示的数据！</p>
                        <p *ngIf="error=='dataOver'">对不起，数据量过大，无法正常显示！</p>
                        <p *ngIf="error=='error'">对不起，系统错误！</p>
                    </div>
                </div>`
})
export class ErrorComponent implements OnInit {
  @Input() error:any;

  constructor() { }

  ngOnInit() {}

}
