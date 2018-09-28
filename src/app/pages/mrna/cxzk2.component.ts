import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: "app-cxzk2",
    templateUrl: "./cxzk2.component.html"
})

export class cxzk2Component implements OnInit {
    title: string;
    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.title = 'test';
    }

    handlerClick() {
        this.title = 'clicked'
    }

}

