import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import config from '../../../config';

@Component({
    selector: 'app-analysis-index',
    templateUrl: './index.component.html'
})
export class ReanalysisIndexComponent implements OnInit {

    constructor(
        private routes: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        
    }

}
