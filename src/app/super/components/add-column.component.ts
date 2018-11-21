import { TranslateService } from "@ngx-translate/core";
import { StoreService } from "./../service/storeService";
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges
} from "@angular/core";
/**
 * @description 增删列
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class AddColumnComponent
 * @implements {OnInit}
 */
@Component({
    selector: "app-add-column",
    templateUrl: "./add-column.component.html",
    styles: []
})
export class AddColumnComponent implements OnInit {
    @Input() thead: Array<object>; // 默认显示的表头
    @Output() toggle: EventEmitter<any> = new EventEmitter(); // 显示隐藏
    @Input() baseThead: Array<string>; // 基础的表头  （需要默认激活)

    show: boolean = false;
    selected: Array<object> = [];
    beforeSelected: Array<object> = [];
    selectCount: Array<number> = [];
    theadInBase:string[] = []; // 哪些基础表头在增删列的数据里面

    @Output() addThead: EventEmitter<any> = new EventEmitter(); // 添加头的时候发出的事件
    @Output() clearThead: EventEmitter<any> = new EventEmitter(); // 清除头的时候发出的事件

    constructor(
        private storeService: StoreService,
        private translate: TranslateService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        this.thead.forEach(val => {
            val["checked"] = false;
        });
        this.applyCheckedStatus();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            "baseThead" in changes &&
            !changes["baseThead"].firstChange &&
            changes["baseThead"].currentValue.length
        ) {
            this.theadInBase = [];
            this.thead.forEach(v => {
                v["children"].forEach(val => {
                    if (this.baseThead.includes(val["key"])) {
                        val["checked"] = true;
                        this.theadInBase.push(val['key']);
                    }
                });
            });
            this.computedStatus();
            this.getCheckCount();
            this.beforeSelected = this.selected.concat([]);
        }
    }

    toggleShow() {
        this.show = !this.show;
        setTimeout(() => {
            this.toggle.emit(this.show);
        }, 0);
    }

    toggleSelect(item): void {
        item.checked = !item.checked;
        this.computedStatus();
        this.getCheckCount();
    }

    applyCheckedStatus() {
        if (this.beforeSelected.length) {
            let status = false;
            this.thead.forEach(val => {
                for (let i = 0; i < val["children"].length; i++) {
                    if (
                        this.isInArr(
                            val["children"][i],
                            this.beforeSelected,
                            "key"
                        )
                    ) {
                        status = true;
                    } else {
                        status = false;
                    }

                    val["children"][i]["checked"] = status;
                }
            });
        } else {
            this.initTheadStatus();
        }
        this.getCheckCount();
    }

    isInArr(x, arr, key): boolean {
        for (let i = 0; i < arr.length; i++) {
            if (x[key] === arr[i][key]) {
                return true;
            }
        }
        return false;
    }

    computedStatus() {
        this.selected = [];
        this.thead.forEach(val => {
            val["children"].forEach(v => {
                if (v.checked) this.selected.push(v);
            });
        });
    }

    getCheckCount() {
        this.thead.forEach((v, i) => {
            let count = 0;
            v["children"].forEach(val => {
                if (val["checked"]) count++;
            });
            this.selectCount[i] = count;
        });
    }

    initTheadStatus() {
        this.thead.forEach(val => {
            val["children"].forEach(v => {
                v.checked = false;
                v["category"] = val["category"];
            });
        });
    }

    confirm() {
        this.beforeSelected = this.selected.concat([]);
        // 记录基础表头 过滤掉基础表头的信息 才是正确的增加的列
        let add = [];
        let remove = [];

        let tempTheadInBase = this.theadInBase.concat([]);
        this.selected.forEach(v=>{
            if(!this.baseThead.includes(v['key'])){
                add.push(v);
            }

            let index = tempTheadInBase.findIndex((val,index)=>{
                return val===v['key'];
            })
            if(index!=-1) tempTheadInBase.splice(index,1);
        })

        // 有删除的就放在remove里面
        if(tempTheadInBase.length) tempTheadInBase.forEach(v=>remove.push({ category:null, key:v }))
        this.addThead.emit({add,remove});
    }

    clear() {
        this.selected = [];
        this.beforeSelected = [];
        this.initTheadStatus();
        this.getCheckCount();
        this.clearThead.emit([]);
    }

    cancel() {
        this.selected = this.beforeSelected.concat([]);
        this.applyCheckedStatus();
    }

    closeTag(d) {
        this.toggleSelect(d);
    }

    /**
     * @description 外部清空
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-12
     * @memberof AddColumnComponent
     */
    _resetStatus() {
        this.clear();
    }

    /**
     * @description 外部清空不发出事件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-12
     * @memberof AddColumnComponent
     */
    _resetStatusWithoutEmit() {
        this.selected = [];
        this.beforeSelected = [];
        this.initTheadStatus();
        this.getCheckCount();
    }
}
