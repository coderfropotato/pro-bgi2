import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {MessageService} from '../../super/service/messageService';
import config from '../../../config';

@Component({
    selector: 'app-mrna-index',
    templateUrl: './index.component.html'
})
export class IndexComponent implements OnInit {

    constructor(
        private routes: ActivatedRoute,
        private router: Router,
        private message:MessageService
    ) { }

    ngOnInit() {
        this.router.navigate(['/report/mrna/cxzk1']);

        setTimeout(()=>{
            this.message.send('message from app');
        },5000);
    }

}
