import { Router } from "@angular/router";
import { GlobalService } from "../super/service/globalService";
import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges
} from "@angular/core";
@Component({
    selector: "app-menu",
    templateUrl: "./menu.component.html"
})
export class MenuComponent implements OnChanges {
    list: any[];
    expandItem: any = [];
    expand: boolean = false;
    timer: any = null;
    index: number = 0;

    @Input()
    menu: object[];

    constructor(private router: Router, private globalService: GlobalService) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes["menu"].currentValue.length) {
            // 给所有的分类和页面加上active字段
            this.initMenuStatus();
            // 默认第0个激活
            changes["menu"].currentValue[0]["active"] = true;
            changes["menu"].currentValue[0]["children"][0]["active"] = true;
        }
    }

    // 初始化菜单状态
    initMenuStatus() {
        this.menu.forEach(val => {
            val["active"] = false;
            if (val["children"].length) {
                val["children"].forEach(v => {
                    v["active"] = false;
                });
            }
        });
    }

    menuMouseOver(menu, index) {
        if (this.timer) clearTimeout(this.timer);
        this.index = index;
        this.expandItem = menu["children"];
    }

    menuMouseLeave() {
        this.timer = null;
        this.timer = setTimeout(() => {
            this.expand = false;
        }, 300);
    }

    subMenuMouseEnter() {
        if (this.timer) clearTimeout(this.timer);
    }

    subMenuMouseLeave() {
        this.expand = false;
    }

    jump(submenu) {
        this.initMenuStatus();
        submenu["active"] = true;
        this.menu[this.index]["active"] = true;
        this.router.navigateByUrl(`/report/mrna/${submenu["url"]}`);
        this.expand = false;
    }
}
