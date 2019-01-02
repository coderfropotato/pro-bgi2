import { AddColumnService } from './../service/addColumnService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { TranslateService } from '@ngx-translate/core';
import { StoreService } from './../service/storeService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd';
import config from '../../../config';
/**
 * @description 增删列
 * @author Yangwd<277637411@qq.com>
 * @export
 * @class AddColumnComponent
 * @implements {OnInit}
 */
@Component({
	selector: 'app-add-column',
	templateUrl: './add-column.component.html',
	styles: []
})
export class AddColumnComponent implements OnInit {
	// @Input() thead: Array<object>; // 默认显示的表头
	@Input() baseThead: Array<string> = []; // 基础的表头  （需要默认激活)
	@Output() toggle: EventEmitter<any> = new EventEmitter(); // 显示隐藏
	@Output() addThead: EventEmitter<any> = new EventEmitter(); // 添加头的时候发出的事件
	@Output() clearThead: EventEmitter<any> = new EventEmitter(); // 清除头的时候发出的事件 (没用  现在清除默认发出addThead事件)
	@Output() computedTableEvent: EventEmitter<any> = new EventEmitter(); // 在树选择表头的时候，有选择的项需要重新计算表格的高度
	@Input() geneType:object = {};
	show: boolean = false;

    thead:Array<object> = [];
	selected: Array<any> = [];
	selectCount: Array<any> = [];
	beforeSelected: Array<any> = [];
	theadInBase: string[] = []; // 哪些基础表头在增删列的数据里面
	treeTempSelect:any[] = [];
	public sortThead:any[] = [];

	config = config;

	constructor(
		private storeService: StoreService,
		private translate: TranslateService,
        private ajaxService: AjaxService,
        private addColumnService:AddColumnService,
        private router:Router,
        private notification:NzNotificationService,
	){
		let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
        // 每次进入路由重新获取增删列 并应用之前的选中状态
        this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				(async ()=>{
					await this.getAddThead();
					this.applyCheckedStatus(); // 每次进路由 把当前选中的增删列的顺序保存到服务
				})()
				// this.thead = this.addColumnService.get();
            }
		});
	}

	ngOnInit() {
		// this.thead = this.addColumnService.get();
		(async ()=>{
			try {
				await this.getAddThead();
			} catch (error) {}
			this.setSortThead([]);
			this.initIndexAndChecked();
			// 生成 点击选择 容器
			this.initSelected();
			this.initBeforeSelected();
			this.initSelectCount();
		})()
	}

	ngOnChanges(changes: SimpleChanges) {
		if ('baseThead' in changes && !changes['baseThead'].firstChange && changes['baseThead'].currentValue.length) {
			this.theadInBase = [];
            this.initSelected();

            this.forLeaves(this.thead, (item) => {
                item['checked'] = false;
            });

            this.baseThead.forEach(v=>{
                this.forLeaves(this.thead,item=>{
                    if (v.includes(item['key'])) {
                        item['checked'] = true;
                        this.selected[item['index']].push(item);
                        this.theadInBase.push(item);
                        return;
                    }
                })
            })

			this.getCheckCount();
			this.beforeSelected = this.copy(this.selected);
			this.setSortThead(this.selected);
		}
	}

	async getAddThead() {
        return new Promise((resolve, reject) => {
            let LCID = sessionStorage.getItem("LCID");
            this.ajaxService
                .getDeferData({
                    data: {
						geneType:this.geneType['type']
					},
                    url: `${config['javaPath']}/addColumn/${LCID}`
                })
                .subscribe(
                    data => {
                        if(data['status']==='0'){
                            let d = data['data'];
                            d.forEach((val,index)=>{
                                if(val['category']===config['outerDataBaseIndex']){
                                    val['children'].forEach(v=>{
                                        if(!('children' in v)) v['children'] = [];
                                        v['modalVisible'] = false;
                                        v['children'].forEach(item=>{
                                            this.initTreeData(item['treeData']);
                                        })
                                    })
                                }
							})
							this.thead = d;
                            resolve("success");
                        }else{
                            reject('error');
                        }
                    },
                    () => reject("error")
                );
        });
	}
	
	// 初始化 增删列树节点数据
    initTreeData(treeData){
        if (!treeData || !treeData.length) return;
        let stack = [];
        for (var i = 0, len = treeData.length; i < len; i++) {
            stack.push(treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();

            if(item['isRoot']) item['isExpand'] = true;
            item['isExpand'] = true;
            item['isChecked'] = false;
            item['disabled'] = false;

            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

	setSortThead(thead){  // thead:[[],[],[]]
        this.sortThead.length = 0;
        if(thead.length){
            let temp = [];
            thead.forEach(v=>temp = temp.concat(v));
            temp.forEach(v=>{
                this.sortThead.push(v['key']);
            })
        }
    }

	// 初始化索引和选中状态
	initIndexAndChecked() {
		this.thead.forEach((val, index) => {
			if (val['children'] && val['children'].length) {
				val['children'].forEach((v, i) => {
					if (v['children'] && v['children'].length) {
						for (let m = 0; m < v['children'].length; m++) {
							v['children'][m]['index'] = index;
							v['children'][m]['checked'] = false;
						}
					}
				});
			}
        });
	}

	// 初始化索引
	initIndex() {
		this.thead.forEach((val, index) => {
			if (val['children'] && val['children'].length) {
				val['children'].forEach((v, i) => {
					if (v['children'] && v['children'].length) {
						for (let m = 0; m < v['children'].length; m++) {
							v['children'][m]['index'] = index;
						}
					}
				});
			}
		});
	}

	// 切换显示面板
	toggleShow() {
		this.show = !this.show;
		setTimeout(() => {
			this.toggle.emit(this.show);
		}, 0);

		if(this.show){
			(async ()=>{
				await this.getAddThead();
				this.applyCheckedStatus();
			})()
		}
		this.cancelStatus();
	}

	// 点击选择或者取消选择
	toggleSelect(item, index): void {
		item.checked = !item.checked;
		if (item.checked) {
			item['index'] = index;
			if (this.isInArr(item, this.selected[index], 'key')) return;
			this.selected[index].push(item);
		} else {
			let idt = this.selected[index].findIndex((val, index) => {
				return val['key'] === item['key'];
			});
			if (idt != -1) this.selected[index].splice(idt, 1);
		}
		this.getCheckCount();
	}

	// 把之前选择的数据  应用在状态里
	applyCheckedStatus() {
		if (this.beforeSelected.every(everySuit)) {
			this.initTheadStatus();
		} else {
			let classifyBeforeSelected = this.classifyCollection(this.beforeSelected);

            this.forLeaves(this.thead, (item) => {
                let index = classifyBeforeSelected.findIndex((val,index)=>{
                    return val['key'] === item['key'];
                })
                item['checked'] = index!=-1;
            })
        }

        this.setSortThead(this.beforeSelected);
		this.getCheckCount();

		function everySuit(item) {
			return item.length == 0;
		}
	}

	isInArr(x, arr, key): boolean {
		for (let i = 0; i < arr.length; i++) {
			if (x[key] === arr[i][key]) {
				return true;
			}
		}
		return false;
	}

	// 获取每个分类选中的个数
	getCheckCount() {
		this.selectCount = this.selected.map((v) => v.length);
	}

	// 初始化头的选中状态
	initTheadStatus() {
		this.forLeaves(this.thead, (item) => {
			item['checked'] = false;
		});
	}

	confirm() {
		this.beforeSelected = this.copy(this.selected);

		let selectedCollection = this.classifyCollection(this.selected);
		// 记录基础表头 过滤掉基础表头的信息 才是正确的增加的列
		let add = [];
		let remove = [];

		let tempTheadInBase = this.theadInBase.concat([]);

		selectedCollection.forEach((v) => {
			// 不再基础头里 就是新增的
			if (!this.baseThead.includes(v['key'])) {
				add.push(v);
			}
			// 选中的在base头里 就留下  不再base里就是删除的项
			let index = tempTheadInBase.findIndex((val, index) => {
				return val['key'] === v['key'];
			});
			if (index != -1) tempTheadInBase.splice(index, 1);
		});
		// 有删除的就放在remove里面
		// tempTheadInBase.forEach(v=>remove.push({ category:null, key:v }))
		if (tempTheadInBase.length) remove = tempTheadInBase.concat([]);

		this.addThead.emit({ add, remove });

        // 保存已经添加的列的顺序
        this.setSortThead(this.selected);

        this.show = false;
		setTimeout(() => {
			this.toggle.emit(this.show);
		}, 0);
	}

	copy(arr) {
		let temp = [];
		arr.forEach((val, index) => {
			temp.push([]);
			if (val.length) temp[index].push(...val);
		});
		return temp;
	}

	initSelected() {
        this.selected = this.thead.map((v) => []);
        this.setSortThead([]);
	}

	initBeforeSelected() {
		this.beforeSelected = this.thead.map((v) => []);
	}

	initSelectCount() {
		this.selectCount = this.thead.map((v) => 0);
	}

	classifyCollection(collection) {
		let temp = [];
		collection.forEach((v) => (temp = temp.concat(v)));
		return temp;
	}

	// 清除按钮
	clear() {
		this.initSelected();
		this.initBeforeSelected();
		this.initTheadStatus();
		this.getCheckCount();
		this.confirm();
    }

    // 重置按钮  （重置到基础头激活的状态）
    reset(){
        this.theadInBase = [];
        this.initSelected();

        this.forLeaves(this.thead, (item) => {
            item['checked'] = false;
        });

        this.baseThead.forEach(v=>{
            this.forLeaves(this.thead,item=>{
                if (v.includes(item['key'])) {
                    item['checked'] = true;
                    this.selected[item['index']].push(item);
                    this.theadInBase.push(item);
                    return;
                }
            })
        })

        // this.forLeaves(this.thead, (item) => {
        //     if (this.baseThead.includes(item['key'])) {
        //         item['checked'] = true;
        //         this.selected[item['index']].push(item);
        //         this.theadInBase.push(item);
        //     } else {
        //         item['checked'] = false;
        //     }
        // });

        this.getCheckCount();
		this.beforeSelected = this.copy(this.selected);

        this.confirm();
    }

	// 取消按钮
	cancel() {
		this.show = false;
		this.cancelStatus();
	}

	// 清除内部状态
	cancelStatus() {
		this.selected = this.copy(this.beforeSelected);
		this.applyCheckedStatus();
		// 外部数据库取消
		// this.outerSelected = this.outerBeforeSelected.concat([]);
		setTimeout(() => {
			this.toggle.emit(this.show);
		}, 0);
    }

    // 分类全选 不确定
    categoryCheckAll(categorys){
        categorys.forEach(v=>{
            if(v['children'].length){
                v['children'].forEach(val=>{
                    val['checked'] = false;
                    this.toggleSelect(val,val['index']);
                })
            }
        })
    }

    // 分类清空 不确定
    categoryClear(categorys){
        console.log(categorys);
        categorys.forEach(v=>{
            if(v['children'].length){
                v['children'].forEach(val=>{
                    val['checked'] = true;
                    this.toggleSelect(val,val['index']);
                })
            }
        })
    }

	// 删除单个头
	closeTag(d) {
		this.toggleSelect(d, d['index']);
	}

	addTreeThead(it) {
		it['modalVisible'] = true;
	}

	// 树选择可匹配的头 改变
	handlerSelectDataChange(thead, index) {
		this.treeTempSelect = thead;
	}

	handleCancel(it) {
		it['modalVisible'] = false;
	}

	handleOk(it) {
        it['modalVisible'] = false;

        // 选择的头是不是重复选择
        let n = it['children'].findIndex((val,index)=>{
            return val['key'] === this.treeTempSelect[0];
        })
        if(n!=-1) {
            this.notification.create('warning','Reprot notification', `重复选择 ${this.treeTempSelect[0]}`);
            this.treeTempSelect.length = 0;
            return;
        }else{
            (async ()=>{
                if(this.treeTempSelect.length){
                    let res = await this.saveThead({
                        "category":it['category'],
                        "key":this.treeTempSelect[0],
						"name":this.treeTempSelect[0],
						"geneType":this.geneType['type']
                    });
                    if(res!=='error'){
                        let tempIt = JSON.parse(JSON.stringify(it));
                        it.children.length = 0;
                        it.children.push(...res['data']);

                        if(tempIt['children'].length){
                            it['children'].forEach(val=>{
                                let index = tempIt['children'].findIndex((v,i)=>{
                                    return val['key'] === v['key'];
                                })

                                if(index!=-1){
                                    it['children'][index]['checked'] = tempIt['children'][index]['checked'];
                                    tempIt['children'].splice(index,1);
                                }
                            })
                        }

                        this.initIndex();
                        this.addColumnService.set(this.thead);

                        setTimeout(() => { this.computedTableEvent.emit()}, 30);
                        this.notification.create('success','Reprot notification', `${this.treeTempSelect[0]} 添加成功`);
                    }else{
                        this.notification.create('warning','Reprot notification', `${this.treeTempSelect[0]} 添加失败`);
                    }
                    this.treeTempSelect.length = 0;
                }
            })()
        }
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

	forLeaves(data, callback) {
		if (!data || !data.length) return;
		let stack = [];
		for (var i = 0, len = data.length; i < len; i++) {
			stack.push(data[i]);
		}

		let item;
		while (stack.length) {
			item = stack.shift();
			if (!('children' in item)) {
				callback && callback(item);
			}
			if (item.children && item.children.length) {
				stack = item.children.concat(stack);
			}
		}
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
     * @description 外部清除表头
     * @author Yangwd<277637411@qq.com>
     * @date 2018-11-29
     * @memberof AddColumnComponent
     */
	_clearThead() {
		this.initSelected();
		this.initBeforeSelected();
		// 清空头的选中状态 不清空索引  需要两者清空 参考 initIndexAndChecked
		this.initTheadStatus();
		this.initSelectCount();
        this.getCheckCount();
	}

	_addThead(head) {
		if (head instanceof Array) {
			head.forEach((val) => {
				this.forLeaves(this.thead, (item) => {
					if (item['key'] === val['key']) {
						item['checked'] = true;
						let index = item['index'];
						if (this.isInArr(item, this.selected[index], 'key')) return;
						this.selected[index].push(item);
						this.beforeSelected = this.copy(this.selected);
					}
				});
			});
		} else {
			this.forLeaves(this.thead, (item) => {
				if (item['key'] === head['key']) {
					item['checked'] = true;
					let index = item['index'];
					if (this.isInArr(item, this.selected[index], 'key')) return;
					this.selected[index].push(item);
					this.beforeSelected = this.copy(this.selected);
				}
			});
		}
		this.setSortThead(this.selected);
		this.getCheckCount();
	}

	_deleteThead(head) {
		if (head instanceof Array) {
			head.forEach((val) => {
				this.forLeaves(this.thead, (item) => {
					if (item['key'] === val['key']) {
						item['checked'] = false;
						let index = item['index'];
						let i = this.selected[index].findIndex((v, m) => {
							return v['key'] === val['key'];
						});
						if (i != -1) this.selected[index].splice(i, 1);
						this.beforeSelected = this.copy(this.selected);
					}
				});
			});
		} else {
			this.forLeaves(this.thead, (item) => {
				if (item['key'] === head['key']) {
					item['checked'] = true;
					let index = item['index'];
					let i = this.selected[index].findIndex((v, m) => {
						return v['key'] === head['key'];
					});
					if (i != -1) this.selected[index].splice(i, 1);
					this.beforeSelected = this.copy(this.selected);
				}
			});
		}

		this.setSortThead(this.beforeSelected);
		this.getCheckCount();
	}

	_confirm() {
		this.confirm();
	}

	_confirmWithoutEvent() {
		this.beforeSelected = this.copy(this.selected);

		let selectedCollection = this.classifyCollection(this.selected);
		// 记录基础表头 过滤掉基础表头的信息 才是正确的增加的列
		let add = [];
		let remove = [];

		let tempTheadInBase = this.theadInBase.concat([]);

		selectedCollection.forEach((v) => {
			// 不再基础头里 就是新增的
			if (!this.baseThead.includes(v['key'])) {
				add.push(v);
			}
			// 选中的在base头里 就留下  不再base里就是删除的项
			let index = tempTheadInBase.findIndex((val, index) => {
				return val['key'] === v['key'];
			});
			if (index != -1) tempTheadInBase.splice(index, 1);
		});
		// 有删除的就放在remove里面
		// tempTheadInBase.forEach(v=>remove.push({ category:null, key:v }))
		if (tempTheadInBase.length) remove = tempTheadInBase.concat([]);

		this.setSortThead(this.selected);
		return { add, remove };
	}

	// 保存树选择的头
	async saveThead(thead: object) {
		return new Promise((resolve, reject) => {
			this.ajaxService
				.getDeferData({
					data: {
						LCID: sessionStorage.getItem('LCID'),
						columns: [ thead ]
					},
					url: `${config['javaPath']}/savePublicColumns`
				})
				.subscribe(
					(res) => {
						res['status'] === '0' ? resolve(res) : reject('error');
					},
					(error) => {
						reject('error');
					}
				);
		});
	}
}
