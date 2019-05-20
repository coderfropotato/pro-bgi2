import  config  from 'src/config';
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
	styles: [
		`
			.ant-slider{
				margin:7px 6px 0;
			}
		`
	]
})
export class GeneRelativeComponent implements OnInit {
	@Input() disabled: boolean = true;
	@Output() confirmEvent: EventEmitter<any> = new EventEmitter();
	@Input() relative: any[] = [];
	@Input() geneCount : number = 0;
	@Input() geneType:string;

	isVisible: boolean = false;
	selectRelations: object[] = [];
	relations: object[] = [];
	beforeRelation: object[] = [];
	disabledRelative: string[] = [];
	currentTableRelative: string[] = [];
	targetGeneLimit:number = config['targetRelativeGeneLimit'];

	selectType: string[] = [ '互作关系', '位置关系' ];
	selectedType: string = '互作关系';
	PosRange: number[] = [ 1, 100000 ];

	posRelative: object = {
		key: 'updown',
		up: 100,
		down: 100,
		slink: true,
		alink: true
	};

	unit: string = 'BP';
	link: object[] = [ { name: '同义链', checked: true }, { name: '反义链', checked: true } ];

	constructor(private storeService: StoreService,private translate:TranslateService) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

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

		this.relations = JSON.parse(JSON.stringify(this.storeService.getStore('relations')))
		// this.beforeRelation = JSON.parse(JSON.stringify(this.relations));
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
	}

	initPosRelation() {
		this.selectType = [ '互作关系', '位置关系' ];
		this.PosRange = [ 1, 100000 ];

		this.posRelative = {
			key: 'updown',
			up: 100,
			down: 100,
			slink: true,
			alink: true
		};
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
		this.selectedType = '互作关系';
		this.initRelations();
	}

	handleCancel() {
		this.isVisible = false;
		// this.relations = JSON.parse(JSON.stringify(this.beforeRelation));
	}

	confirm(): void {
		this.isVisible = false;
		this.confirmEvent.emit(this.selectRelations);
        // this.relations = JSON.parse(JSON.stringify(this.beforeRelation));
	}

	selectChange() {
        this.initRelations();
	}

	initRelations() {
        this.selectRelations.length = 0;
        this.relations = JSON.parse(JSON.stringify(this.storeService.getStore('relations')));
        this.initPosRelation();
		// console.log(this.relations);
		if (this.selectedType === '互作关系') {
			this.relations.forEach((v) => {
				v['checked'] = false;
				let include = this.disabledRelative.includes(v['name']);
				v['checked'] = include;
				v['disabled'] = include;
			});

			for (let i = 0; i < this.relations.length; i++) {
				if (!this.relations[i]['checked'] && !this.relations[i]['disabled']) {
					this.relations[i]['checked'] = true;
					this.selectRelations.push(this.relations[i]);
					break;
				}
			}
		} else {
			this.selectRelations.push(this.posRelative);
		}
	}

	_getRelative() {
		return this.selectRelations;
	}
}
