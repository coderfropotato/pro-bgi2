import { Component, OnInit } from '@angular/core';
import { AjaxService } from '../../super/service/ajaxService';

@Component({
  selector: 'app-little-table-test',
  templateUrl: './little-table-test.component.html',
  styles: []
})
export class LittleTableTestComponent implements OnInit {
  url: string = "http://localhost:8086/littleTable";
  constructor(
    private ajaxService: AjaxService
  ) { }

  ngOnInit() {

  }

}
