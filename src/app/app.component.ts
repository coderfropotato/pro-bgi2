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
        console.log("%cRebuild-Success:2019-03-12"," color:green;;font-size:1.0em");
        fromEvent(window, "resize")
            .pipe(debounceTime(300))
            .subscribe(event => {
                this.message.sendResize();
            });
    }
}
