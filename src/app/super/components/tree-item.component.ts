import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-tree-item",
    template: `<li>
                    <i *ngIf="floder.children.length" (click)="expandChange(floder)" [ngClass]="floder.isExpand?'anticon-caret-down':'anticon-caret-right'" class="anticon"></i>
                    <label nz-checkbox [(ngModel)]="floder.isChecked" (ngModelChange)="checkedChange(floder)">{{floder.name}}</label>
                    <ul *ngIf="floder.children && floder.children.length && floder.isExpand">
                        <app-tree-item *ngFor="let item of floder.children;index as i;" [floder]="item" (treeItemCheckedChange)="innerCheckedChange($event)" (treeItemExpandChange)="innerExpandChange($event)"></app-tree-item>
                    </ul>
                </li>`,
    styles: []
})
export class TreeItemComponent implements OnInit {
    @Input()
    floder: Array<object>;
    @Output()
    treeItemCheckedChange: EventEmitter<any> = new EventEmitter();
    @Output()
    treeItemExpandChange: EventEmitter<any> = new EventEmitter();
    constructor() {}

    ngOnInit() {}

    checkedChange(floder) {
        this.treeItemCheckedChange.emit(floder);
    }

    innerCheckedChange(floder){
        this.treeItemCheckedChange.emit(floder);
    }

    expandChange(floder) {
        floder.isExpand = !floder.isExpand;
        this.treeItemExpandChange.emit(floder);
    }

    innerExpandChange(floder){
        this.treeItemExpandChange.emit(floder);
    }
}
