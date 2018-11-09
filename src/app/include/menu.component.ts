import { GlobalService } from "../super/service/globalService";
import {
    Component,
    OnInit,
    Input
} from "@angular/core";
@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html"
})
export class MenuComponent implements OnInit {
    list: any[];
    @Input()
    menu: object[];
    constructor(private globalService: GlobalService) {}

    ngOnInit() {}

}
