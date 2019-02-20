import { StoreService } from './../service/storeService';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
/**
 * @description gene 关系选择
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class GeneRelativeComponent
 * @implements {OnInit}
 */
@Component({
	selector: 'app-gene-relative',
	templateUrl: './gene-relative.component.html',
	styles: []
})
export class GeneRelativeComponent implements OnInit {
	@Input() disabled: boolean = true;
	@Output() confirmEvent: EventEmitter<any> = new EventEmitter();
	@Input() relative: any[] = [];

	isVisible: boolean = false;
	selectRelations: object[] = [];
	relations: object[] = [];
	beforeRelation: object[] = [];
	disabledRelative: string[] = [];
	currentTableRelative: string[] = [];

	constructor(private storeService: StoreService) {}

	ngOnInit() {
		/*
            [{"key":"cerna","name":"cerna"},{"key":"coexpression","name":"coexpression"},{"key":"ppi","name":"ppi"},{"key":"rbp","name":"rbp"},{"key":"target","name":"target"}]
        */
		// this.relations = [
		// 	{ key: 'cerna', name: 'cerna', limit: true, score: [ 0, 100, 30 ], max: [ 100, 500, 200 ] },
		// 	{ key: 'coexpression', name: 'coexpression', limit: true, score: [ 0, 100, 20 ], max: [ 100, 500, 120 ] },
		// 	{ key: 'ppi', name: 'ppi', limit: true, score: [ 0, 100, 60 ], max: [ 100, 500, 152 ] },
		// 	{ key: 'rbp', name: 'rbp', limit: true, score: [ 0, 100, 90 ], max: [ 100, 500, 200 ] },
		// 	{ key: 'target', name: 'target', limit: true, score: [ 0, 100, 32 ], max: [ 100, 500, 459 ] }
		// ];

		this.relations = this.storeService.getStore('relations');
		this.beforeRelation = JSON.parse(JSON.stringify(this.relations));
	}

	ngOnChanges(changes: SimpleChanges) {
		if ('relative' in changes) {
			let relative = changes['relative']['currentValue'];
			if (relative.length) {
				this.currentTableRelative.length = 0;
				changes['relative']['currentValue'].map((v) => v['name']).forEach((v) => {
					if (!this.disabledRelative.includes(v)) this.disabledRelative.push(v);
					this.currentTableRelative.push(v);
				});
			} else {
				this.disabledRelative.length = 0;
				this.currentTableRelative.length = 0;
			}
		}

		console.log(this.currentTableRelative);
		console.log(this.disabledRelative);
	}

	// 选择关系
	select(r) {
		r['checked'] = !r['checked'];
		if (r['checked']) {
			this.selectRelations.push(r);
		} else {
			let index = this.selectRelations.findIndex((v, i) => {
				return v['key'] === r['key'];
			});
			if (index != -1) this.selectRelations.splice(index, 1);
		}
	}

	showRelationModal() {
		this.isVisible = true;
		this.initRelations();
	}

	handleCancel() {
		this.isVisible = false;
		this.relations = JSON.parse(JSON.stringify(this.beforeRelation));
	}

	confirm(): void {
		this.isVisible = false;
		this.confirmEvent.emit(this.selectRelations);
		this.relations = JSON.parse(JSON.stringify(this.beforeRelation));
	}

	initRelations() {
		this.relations.forEach((v) => {
			v['checked'] = false;
			let include = this.disabledRelative.includes(v['name']);
			v['checked'] = include;
			v['disabled'] = include;
		});

		this.selectRelations.length = 0;
		for (let i = 0; i < this.relations.length; i++) {
			if (!this.relations[i]['checked'] && !this.relations[i]['disabled']) {
				this.relations[i]['checked'] = true;
				this.selectRelations.push(this.relations[i]);
				break;
			}
		}
	}

	_getRelative() {
		return this.selectRelations;
	}
}
