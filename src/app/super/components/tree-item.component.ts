import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-tree-item',
	template: `<li [hidden]="floder['hidden'] && !floder['isChecked']">
                    <i *ngIf="floder['children'].length" class="expand-icon" (click)="expandChange(floder)"
                    [ngClass]="{'anticon-caret-down':floder['isExpand'],'anticon-caret-right':!floder['isExpand'],'icon-disabled':floder['expandDisabled']}
                    " class="anticon" ></i>
                    <label>
                        <label *ngIf="!floder['isRoot']" nz-checkbox [(ngModel)]="floder.isChecked" [nzDisabled]="floder['disabled']" (ngModelChange)="checkedChange(floder)"></label>
                        <span [class.disabled]="floder['disabled'] && !floder['isRoot']" (click)="labelClick(floder)">{{floder['name']}}</span>
                    </label>
                    <ul *ngIf="floder['children'] && floder['children'].length && floder['isExpand']">
                        <app-tree-item *ngFor="let item of floder['children'];index as i;" [hidden]="item['hidden'] && !item['isChecked']" [floder]="item" (treeItemCheckedChange)="innerCheckedChange($event)" (treeItemExpandChange)="innerExpandChange($event)"></app-tree-item>
                    </ul>
                </li>`,
	styles: []
})
export class TreeItemComponent implements OnInit {
	@Input() floder: Array<object>;
	@Output() treeItemCheckedChange: EventEmitter<any> = new EventEmitter();
	@Output() treeItemExpandChange: EventEmitter<any> = new EventEmitter();

	constructor() {}

	ngOnInit() {}

	checkedChange(floder) {
		this.treeItemCheckedChange.emit(floder);
	}

	innerCheckedChange(floder) {
		this.treeItemCheckedChange.emit(floder);
	}

	expandChange(floder) {
		if (!floder['expandDisabled']) {
			floder['isExpand'] = !floder['isExpand'];
			this.treeItemExpandChange.emit(floder);
		}
	}

	innerExpandChange(floder) {
		if (!floder['expandDisabled']) {
			this.treeItemExpandChange.emit(floder);
		}
	}

	labelClick(floder) {
		if (floder['isRoot'] && !floder['expandDisabled']) {
			floder['isExpand'] = !floder['isExpand'];
			this.treeItemExpandChange.emit(floder);
		}
	}
}
