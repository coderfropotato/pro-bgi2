import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import config from '../../../config';

@Component({
    selector: 'dna-jyzbd',
    templateUrl: './jyzbd.component.html'
})
export class JyzbdComponent implements OnInit {

    constructor(
        private routes: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
    }

}
