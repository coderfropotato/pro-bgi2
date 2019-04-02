import { Component, OnInit, Input, Output, OnChanges, SimpleChanges, EventEmitter } from "@angular/core";
import { AjaxService } from './../service/ajaxService';
import { TranslateService } from '@ngx-translate/core';
import config from '../../../config';

declare const $: any;
@Component({
    selector: "app-new-tree",
    template: `<div class="tree-component">
                    <b class="tree-head">当前匹配的头:{{selectComposeThead.length?selectComposeThead[0]:"暂无"}}</b>
                    <div class="tree-content">
                    <p>
                        <button class="mr12" *ngIf="showExpandAll" nz-button nzType="default" nzSize="small" (click)="handlerExpandAll()">Toggle expand</button>
                        <button *ngIf="selectComposeThead.length" nz-button nzType="default" nzSize="small" (click)="reChoose()">重新选择</button>
                    </p>
                    <div class="tree">
                            <ul *ngFor="let root of treeData;index as i">
                                <app-tree-item [floder]="root" (treeItemCheckedChange)="checkedChange($event)" (treeItemExpandChange)="expandChange($event)"></app-tree-item>
                            </ul>
                        </div>
                    </div>
                </div>`,
    styles: []
})
export class NewTreeComponent implements OnInit, OnChanges {
    // 树元数据
    @Input() treeData: Array<object> = [];
    // 选中的数据
    @Input() selectData: any = [];
    // 选中的数据变化的时候  发出的事件
    @Output() selectDataChange: EventEmitter<any> = new EventEmitter();
    // 展开收起变化的时候 发出的事件
    @Output() expandChangeEvent: EventEmitter<any> = new EventEmitter();
    // 选中变化的时候 发出的事件
    @Output() checkedChangeEvent: EventEmitter<any> = new EventEmitter();
    // 树中选中的项 可组成表头并且变化了 发出的事件
    @Output() composeTheadChange: EventEmitter<any> = new EventEmitter();
    // 默认展开所有 false
    @Input() defaultExpandAll:boolean = false;
    // 是否显示”展开所有“ 按钮
    @Input() showExpandAll:boolean = true;
    // 展开所有  发生改变的时候发出的事件
    @Output() expandAllChange: EventEmitter<any> = new EventEmitter();
    // 是否重置树状态
    @Input() reset:boolean = false;

    beforeTreeData:any; // 保存初始化的树

    selectComposeThead = [];  // 当前选择的头 组合成的表头
    theadReflactMap:object = {};
    expandAll:boolean = false;

    constructor(
        private ajaxService:AjaxService
    ) {}

    ngOnInit() {
        this.beforeTreeData = JSON.parse(JSON.stringify(this.treeData));
        if(this.selectData.length) this.treeApplySelectData(this.treeData, this.selectData);
        if(this.defaultExpandAll) this.handlerExpandAll(this.defaultExpandAll);
    }

    ngOnChanges(simpleChanges: SimpleChanges) {
        // selectData不是第一次改变的时候 重新应用树数据
        if ( "selectData" in simpleChanges && !simpleChanges["selectData"].firstChange ) {
            this.treeApplySelectData(this.treeData, this.selectData);
        }

        // 重置树状态 后初始化重置状态
        if ( "reset" in simpleChanges && !simpleChanges["reset"].firstChange && simpleChanges["reset"].currentValue ) {
            this._reset();
            setTimeout(() => { this.reset = false; }, 30);
        }


        if ( "treeData" in simpleChanges && !simpleChanges["treeData"].firstChange && simpleChanges["treeData"].currentValue ) {
           this.beforeTreeData = JSON.parse(JSON.stringify(this.treeData));
        }

    }

    checkedChange(floder) {
        this.checkedChangeEvent.emit(floder);
        if (floder.isChecked) {
            this.selectData.push(floder);
        } else {
            this.selectData.forEach((val, index) => {
                if (val["name"] === floder["name"]) {
                    this.selectData.splice(index, 1);
                }
            });
        }

        // 把选中的数据发射出去
        this.selectDataChange.emit(this.selectData);
        this.getKey();
    }

    getKey(){
        let selectedKeys = this.selectData.map(v=>v['key']);
        this.ajaxService.getDeferData({
            data:{
                selectedKeys,
                LCID:sessionStorage.getItem('LCID')
            },
            url:`${config['javaPath']}/validKeyForTCGA`
        }).subscribe(res=>{
            if(res['status'] == 0){
                this.treeData = res['data']['treeData'];

                if(this.selectComposeThead[0] !== res['data']['currentName']){
                    this.selectComposeThead = [res['data']['currentName']];
                    this.composeTheadChange.emit([this.selectComposeThead,[res['data']['currentKey']]]);
                }
        
                if (!this.treeData || !this.treeData.length) return;
                let stack = [];
                for (var i = 0, len = this.treeData.length; i < len; i++) {
                    stack.push(this.treeData[i]);
                }

                let item;
                while (stack.length) {
                    item = stack.shift();
                    item.isChecked = selectedKeys.includes(item.key);
                    item.isExpand = this.expandAll || this.defaultExpandAll; 
                    item.disabled = false;
                    item.hidden = false;
                    item.expandDisabled = false;
                    if (item.children && item.children.length) {
                        stack = stack.concat(item.children);
                    }
                }

                this.forTree(this.treeData,(item)=>{
                    if(item['children'].length) {
                        let flag = (()=>{
                            for(let m=0;m<item['children'].length;m++){
                                if(item['children'][m]['isChecked']) {
                                    return true;
                                }
                            }
                            return false;
                        })()
                        item['isExpand'] = this.expandAll || flag;
                    }
                        
                })
            }
        },error=>{
            console.log(error);
        })
    }

    expandChange(floder) {
        this.expandChangeEvent.emit(floder);
    }

    reChoose(){
        this._reset();
        setTimeout(() => { this.reset = false; }, 30);
    }

    forTree(data, callback) {
		if (!data || !data.length) return;
		let stack = [];
		for (var i = 0, len = data.length; i < len; i++) {
			stack.push(data[i]);
		}
		let item;
		while (stack.length) {
            item = stack.shift();
			callback && callback(item);
			if (item.children && item.children.length) {
				stack = stack.concat(item.children);
			}
		}
	}

    /**
     * @description 树数据应用默认选中的数据
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-26
     * @param {*} treeNodes
     * @param {*} selectData  namelist
     * @returns
     * @memberof TreeComponent
     */
    treeApplySelectData(treeNodes, selectData) {
        if (!treeNodes || !treeNodes.length) return;
        let stack = [];
        for (var i = 0, len = treeNodes.length; i < len; i++) {
            stack.push(treeNodes[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            if (selectData.includes(item.name)) item.isChecked = true;
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

    handlerExpandAll(flag?:boolean){
        this.expandAll = arguments.length?flag:!this.expandAll;
        this.forLeaves(this.treeData,(item)=>{
            item.isExpand = this.expandAll;
        })
        this.expandAllChange.emit(this.expandAll);
    }

    /**
     * @description 数组是否包含某一项
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-30
     * @param {*} arr
     * @param {*} item
     * @returns
     * @memberof TreeComponent
     */
    arrIncludeItem(arr, item) {
        return arr.includes(item);
    }

    stringing(obj) {
        return JSON.stringify(obj);
    }

    forLeaves(data, callback) {
		if (!data || !data.length) return;
		let stack = [];
		for (var i = 0, len = data.length; i < len; i++) {
			stack.push(data[i]);
		}

		let item;
		while (stack.length) {
			item = stack.shift();
			if (item['children'].length) {
				callback && callback(item);
			}
			if (item.children && item.children.length) {
				stack = item.children.concat(stack);
			}
		}
	}

    /**
     * @description 重置树状态
     * 默认 不选中  展开  不禁用
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-31
     * @returns
     * @memberof TreeComponent
     */
    _reset() {
        this.selectComposeThead = [];
        this.selectData.length = 0;
        this.treeData = JSON.parse(JSON.stringify(this.beforeTreeData));

        if (!this.treeData || !this.treeData.length) return;
        let stack = [];
        for (var i = 0, len = this.treeData.length; i < len; i++) {
            stack.push(this.treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            item.isChecked = false;
            item.isExpand = this.defaultExpandAll || this.expandAll;
            item.disabled = false;
            item.hidden = false;
            item.expandDisabled = false;
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }
}
