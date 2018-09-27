import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {

    constructor(
        private routes: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.router.navigate(['/report/cxzk1']);
    }

}
