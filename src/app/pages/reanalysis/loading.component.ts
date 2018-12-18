import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styles: []
})
export class LoadingComponent implements OnInit {

  constructor(
      private spinnerService:NgxSpinnerService
  ) { }

  ngOnInit() {
  }

}
