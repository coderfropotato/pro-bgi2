import { StoreService } from './../../super/service/storeService';
import { MessageService } from "./../../super/service/messageService";
import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
@Component({
    selector: "app-add",
    templateUrl: "./add.component.html"
})
export class AddComponent implements OnInit {
    allThead: Array<object> = [];
    constructor(
        private messageService: MessageService,
        private storeService:StoreService
    ) {}

    ngOnInit() {
        this.allThead = this.storeService.getThead();
    }
}
