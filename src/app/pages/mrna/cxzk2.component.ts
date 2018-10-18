import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: "app-cxzk2",
    templateUrl: "./cxzk2.component.html"
})

export class cxzk2Component implements OnInit {
    url: string;
    tableEntity: object;

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.url = "";
        this.tableEntity = {
            LCID : sessionStorage.getItem("LCID"),
            sample  : "HBRR1"
        };
    }


}

