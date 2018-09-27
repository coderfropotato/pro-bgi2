import { Component,OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html'
})
export class ErrorComponent implements OnInit {
  @Input() error:any;

  constructor() { }

  ngOnInit() {
    console.log(this.error)
  }

}
