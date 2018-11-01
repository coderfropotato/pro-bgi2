import { GlobalService } from "./../super/service/globalService";
import {
    Component,
    OnInit,
    Input
} from "@angular/core";
@Component({
    selector: "app-leftside",
    templateUrl: "./leftside.component.html",
    styleUrls: ["./leftside.component.css"]
})
export class LeftsideComponent implements OnInit {
    list: any[];
    @Input()
    menu: object[];
    constructor(private globalService: GlobalService) {}

    ngOnInit() {}

}
