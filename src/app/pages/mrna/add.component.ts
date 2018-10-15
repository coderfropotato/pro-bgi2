import { MessageService } from "./../../super/service/messageService";
import { Component, OnInit } from "@angular/core";
@Component({
    selector: "app-add",
    templateUrl: "./add.component.html",
    styles: []
})
export class AddComponent implements OnInit {
    allThead: [] = [];
    constructor(private messageService: MessageService) {}

    ngOnInit() {
        this.messageService.getAddThead().subscribe(data => {
            this.allThead = data.thead;
        });
    }
}
