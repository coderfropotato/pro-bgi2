import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import config from '../../../config';

@Component({
    selector: 'app-dna-index',
    templateUrl: './index.component.html'
})
export class DnaIndexComponent implements OnInit {

    constructor(
        private routes: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.router.navigate(['/report/dna/jyzbd']);
    }

}
