import { MessageService } from "./super/service/messageService";
import { debounceTime } from "rxjs/operators";
import { Component, OnInit } from "@angular/core";
import { fromEvent, Observable } from "rxjs";
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private message: MessageService) {}

    ngOnInit() {
        fromEvent(window, "resize")
            .pipe(debounceTime(300))
            .subscribe(event => {
                this.message.sendResize();
            });
    }
}
