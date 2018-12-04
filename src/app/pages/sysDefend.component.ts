import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sys-defend',
  templateUrl: './sysDefend.component.html'
})
export class SysDefendComponent implements OnInit {

  constructor() { }

  ngOnInit() {
      sessionStorage.clear();
      localStorage.clear();
  }

}
