import { StoreService } from "./../service/storeService";
import { TranslateService } from "@ngx-translate/core";
import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    ViewChild
} from "@angular/core";

/**
 * @description 分页
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class PaginationComponent
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Component({
    selector: "app-pagination",
    templateUrl: "./pagination.component.html",
    styles: []
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input()
    total: number;
    @Input()
    maxLimit: number;

    @Input()
    pageIndex: number;
    @Output()
    pageIndexChange = new EventEmitter();

    @Input()
    pageSize: number;
    @Output()
    pageSizeChange = new EventEmitter();

    @ViewChild("pageIndexInput")
    pageIndexInput;

    pageCount: number = 0;
    defaultPageIndexSize: number = 5;
    pageIndexList: number[] = [];
    inputPageIndex: number;
    isLeft: boolean = false;
    isRight: boolean = false;

    constructor(
        private translate: TranslateService,
        private storeService: StoreService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        this.indexCenterGenerator();
    }

    ngOnChanges(changes: SimpleChanges) {
        for (let key in changes) {
            if (!changes[key]["firstChange"]) {
                this[key] = changes[key]["currentValue"];
            }
        }
        this.indexCenterGenerator();
    }

    handlerPageSizeChange() {
        this.indexCenterGenerator();
        this.pageSizeChange.emit(this.pageSize);
    }

    handlerPageIndexClick(index) {
        if (this.pageIndex == index) return;
        this.pageIndex = index;
        this.indexCenterGenerator();
        this.pageIndexChange.emit(this.pageIndex);
    }

    handlerBackward() {
        this.pageIndex--;
        this.pageIndexChange.emit(this.pageIndex);
        this.indexCenterGenerator();
    }

    handlerForward() {
        this.pageIndex++;
        this.pageIndexChange.emit(this.pageIndex);
        this.indexCenterGenerator();
    }

    handlerKeyUp(event) {
        if (event.keyCode === 13) {
            if (/^\d*$/.test("" + this.inputPageIndex)) {
                if (this.inputPageIndex <= 0) {
                    if (this.pageIndex != 1) {
                        this.pageIndex = 1;
                        this.pageIndexChange.emit(this.pageIndex);
                    }
                } else {
                    let tempIndex =
                        this.inputPageIndex > this.pageCount
                            ? this.pageCount
                            : this.inputPageIndex;
                    if (tempIndex > this.maxLimit) tempIndex = this.maxLimit;
                    if (this.pageIndex != tempIndex) {
                        this.pageIndex = +tempIndex;
                        this.pageIndexChange.emit(this.pageIndex);
                    }
                }
            } else {
                if (this.pageIndex != 1) {
                    this.pageIndex = 1;
                    this.pageIndexChange.emit(this.pageIndex);
                }
            }

            this.pageIndexInput.nativeElement.blur();
            this.inputPageIndex = null;
            this.indexCenterGenerator();
        }
    }
    /**
     * @description 以当前索引为中心 生成defaultPageIndexSize个按钮
     * @author Yangwd<277637411@qq.com>
     * @memberof PaginationComponent
     */
    indexCenterGenerator() {
        this.pageIndexList = [];
        if (!this.total) {
            return this.pageIndexList;
        } else {
            this.pageCount = Math.ceil(this.total / this.pageSize);
            let range = [];
            if (!this.pageIndex || this.pageIndex < 0) {
                this.pageIndex = 1;
                this.pageIndexChange.emit(this.pageIndex);
            }
            if (this.pageIndex > this.pageCount) {
                this.pageIndex = this.pageCount;
                this.pageIndexChange.emit(this.pageIndex);
            }

            if (this.pageCount > this.defaultPageIndexSize) {
                // 靠右
                if (this.pageCount - this.pageIndex <= 2) {
                    for (let i = this.defaultPageIndexSize - 1; i > -1; i--) {
                        this.pageIndexList.push(this.pageCount - i);
                    }
                    this.isLeft = false;
                    this.isRight = true;
                } else if (this.pageIndex <= 3) {
                    // 靠左
                    for (let i = 1; i < this.defaultPageIndexSize + 1; i++) {
                        this.pageIndexList.push(i);
                    }
                    this.isLeft = true;
                    this.isRight = false;
                } else {
                    // 正常情况 不靠边
                    this.pageIndexList = [
                        +this.pageIndex - 2,
                        +this.pageIndex - 1,
                        +this.pageIndex,
                        +this.pageIndex + 1,
                        +this.pageIndex + 2
                    ];
                    this.isLeft = this.isRight = false;
                }
            } else {
                for (let i = 1; i < this.pageCount + 1; i++) {
                    this.pageIndexList.push(i);
                }
                this.isLeft = true;
                this.isRight = true;
            }
        }
    }
}
