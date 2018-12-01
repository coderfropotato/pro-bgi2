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
    relations: any[] = [];
    selectRelations:string[] = [];
	constructor() {}

	ngOnInit() {
		/*
            [{"key":"cerna","name":"cerna"},{"key":"coexpression","name":"coexpression"},{"key":"ppi","name":"ppi"},{"key":"rbp","name":"rbp"},{"key":"target","name":"target"}]
        */
        this.relations = JSON.parse(sessionStorage.getItem('relations')).map(v=>{
            v['checked'] = false;
            return v;
        });
    }

    // 选择关系
    select(r){
        r['checked'] = !r['checked'];
        if(r['checked']){
            this.selectRelations.push(r['key']);
        }else{
            let index = this.selectRelations.findIndex((v,i)=>{
                return v['key'] === r['key'];
            })
            if(index!=-1) this.selectRelations.splice(index,1);
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
        this.relations.forEach(v=>{
            v['checked'] = false;
        })
        this.selectRelations.length = 0;
    }

	_getRelative() {
		return this.selectRelations;
	}
}
