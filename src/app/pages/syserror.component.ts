import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
    selector: "app-syserror",
    templateUrl: "./syserror.component.html",
    styles: []
})
export class SyserrorComponent implements OnInit {
    count: number;
    constructor(
        private router:Router,
    ) {}

    ngOnInit() {
        this.count = 3;
        setInterval(() => {
            this.count--;
            if(this.count==0) this.router.navigate([`/report/login`])
        }, 1000);
    }
}
