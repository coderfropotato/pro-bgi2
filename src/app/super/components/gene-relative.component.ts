import { StoreService } from './../service/storeService';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
	@Output() confirmEvent: EventEmitter<any> = new EventEmitter();

	isVisible: boolean = false;
	selectRelations: string[] = [];
	relations: object[] = [];
	beforeRelation: object[] = [];
	constructor() {}

	ngOnInit() {
		/*
            [{"key":"cerna","name":"cerna"},{"key":"coexpression","name":"coexpression"},{"key":"ppi","name":"ppi"},{"key":"rbp","name":"rbp"},{"key":"target","name":"target"}]
        */
		this.relations = [
			{ key: 'cerna', name: 'cerna', limit: true, score: [ 0, 100, 30 ], max: [ 100, 500, 200 ] },
			{ key: 'coexpression', name: 'coexpression', limit: true, score: [ 0, 100, 20 ], max: [ 100, 500, 120 ] },
			{ key: 'ppi', name: 'ppi', limit: true, score: [ 0, 100, 60 ], max: [ 100, 500, 152 ] },
			{ key: 'rbp', name: 'rbp', limit: true, score: [ 0, 100, 90 ], max: [ 100, 500, 200 ] },
			{ key: 'target', name: 'target', limit: true, score: [ 0, 100, 32 ], max: [ 100, 500, 459 ] }
		];

		this.relations.forEach((v,index) => {
			index?v['checked'] = false:v['checked'] = true;
        });

		this.beforeRelation = JSON.parse(JSON.stringify(this.relations));
	}

	// 选择关系
	select(r) {
		r['checked'] = !r['checked'];
		if (r['checked']) {
			this.selectRelations.push(r['key']);
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
	}

	confirm(): void {
		this.isVisible = false;
		this.confirmEvent.emit(this.selectRelations);
	}

	initRelations() {
		this.relations.forEach((v) => {
			v['checked'] = false;
		});
		this.selectRelations.length = 0;
	}

	_getRelative() {
		return this.selectRelations;
	}
}
