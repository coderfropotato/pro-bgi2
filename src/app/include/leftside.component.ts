import { GlobalService } from './../super/service/globalService';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
@Component({
    selector: 'app-leftside',
    templateUrl: './leftside.component.html',
    styleUrls: ['./leftside.component.css']
})
export class LeftsideComponent implements OnInit {
    list: any[];
    projectName:string;
    constructor(
        private globalService:GlobalService,
    ) {
    }

    ngOnInit() {
        this.list = [
            "cxzk1",
            "cxzk2",
            "cxzk3"
        ]
        this.projectName = sessionStorage.getItem('PROJECT_TYPE')
    }

}
