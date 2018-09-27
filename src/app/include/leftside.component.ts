import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-leftside',
    templateUrl: './leftside.component.html',
    styleUrls: ['./leftside.component.css']
})
export class LeftsideComponent implements OnInit {
    list: any[];
    constructor() { }

    ngOnInit() {
        this.list = [
            "cxzk1",
            "cxzk2",
            "cxzk3"
        ]
    }

}
