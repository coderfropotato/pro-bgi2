import { Component, OnInit } from '@angular/core';
import config from '../../config';

@Component({
    selector: 'app-leftside',
    templateUrl: './leftside.component.html',
    styleUrls: ['./leftside.component.css']
})
export class LeftsideComponent implements OnInit {
    list: any[];
    prefix:string;
    constructor() { }

    ngOnInit() {
        this.prefix = config['projectName'];
        this.list = [
            "cxzk1",
            "cxzk2",
            "cxzk3"
        ]
    }

}
