import { TranslateService } from "@ngx-translate/core";
import { StoreService } from "./../service/storeService";
import { OuterDataBaseService} from "./../service/outerDataBaseService";
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";
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
    @Input() baseThead: Array<string> = []; // 基础的表头  （需要默认激活)
    @Output() toggle: EventEmitter<any> = new EventEmitter(); // 显示隐藏
    @Output() addThead: EventEmitter<any> = new EventEmitter(); // 添加头的时候发出的事件
    @Output() clearThead: EventEmitter<any> = new EventEmitter(); // 清除头的时候发出的事件 (没用  现在清除默认发出addThead事件)


    show: boolean = false;
    selected: Array<any> = [];
    beforeSelected: Array<any> = [];
    theadInBase:string[] = []; // 哪些基础表头在增删列的数据里面
    outerIndex:number = 0; // 当前的外部数据库索引
    modalVisible:boolean = false;

    generatedThead:object = {};
    modalVisibleList:boolean[] = [];
    outerSelected:any[] = [];
    outerBeforeSelected:any[] = [];

    constructor(
        private storeService: StoreService,
        private translate: TranslateService,
        public outerDataBaseService:OuterDataBaseService
    ) {
        let browserLang = this.storeService.getLang();
        this.translate.use(browserLang);
    }

    ngOnInit() {
        this.initIndexAndChecked();
        // 生成 点击选择 容器
        this.initSelected();
        this.initBeforeSelected();
        this.initSelectCount();
        let outerTemp = this.outerDataBaseService.get();
        if(outerTemp['children'].length){
            outerTemp['children'].forEach((val,index)=>{
                this.generatedThead[index] = [];
                this.modalVisibleList[index] = false;
            })
        }

    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            "baseThead" in changes &&
            !changes["baseThead"].firstChange &&
            changes["baseThead"].currentValue.length
        ) {
            this.theadInBase = [];
            this.initSelected();
            this.forLeaves(this.thead,item=>{
                if (this.baseThead.includes(item["key"])) {
                    item["checked"] = true;
                    this.selected[item['index']].push(item);
                    this.theadInBase.push(item);
                }else{
                    item['checked'] = false;
                }
            })
            
            this.getCheckCount();
            this.beforeSelected = this.copy(this.selected);
        }
    }

    initIndexAndChecked(){
        this.thead.forEach((val,index)=>{
            if(val['children'] && val['children'].length){
                val['children'].forEach((v,i)=>{
                    if(v['children'] && v['children'].length){
                        for(let m=0;m<v['children'].length;m++){
                            v['children'][m]['index'] = index;
                            v['children'][m]['checked'] = false;
                        }
                    }
                })
            }
        })
    }

    // 切换显示面板
    toggleShow() {
        this.show = !this.show;
        setTimeout(() => {
            this.toggle.emit(this.show);
        }, 0);
    }

    // 点击选择或者取消选择
    toggleSelect(item,index): void {
        item.checked = !item.checked;
        if(item.checked){
            item['index'] = index;
            if(this.isInArr(item,this.selected[index],'key')) return;
            this.selected[index].push(item);
        }else{
            let idt = this.selected[index].findIndex((val,index)=>{
                return val['key'] === item['key'];
            })
            if(idt!=-1) this.selected[index].splice(idt,1);
        }
        this.getCheckCount();
    }

    // 把之前选择的数据  应用在状态里
    applyCheckedStatus() {
        if(this.beforeSelected.every(everySuit)){
            this.initTheadStatus();
        }else{
            this.beforeSelected.forEach(v=>{
                if(v.length){
                    let status = false;
                    this.forLeaves(this.thead,item=>{
                        status = this.isInArr(item,v,'key')?true:false;
                        item['checked'] = status;
                    })
                }
            })
        }
        this.getCheckCount();

        function everySuit(item){
            return item.length==0;
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
        this.selectCount = this.selected.map(v=>v.length);
    }

    // 初始化头的状态
    initTheadStatus() {
        this.forLeaves(this.thead,item=>{
            item['checked'] = false;
        })
    }

    confirm() {
        this.beforeSelected = this.copy(this.selected);

        let selectedCollection  = this.classifyCollection(this.selected);
        // 记录基础表头 过滤掉基础表头的信息 才是正确的增加的列
        let add = [];
        let remove = [];

        let tempTheadInBase = this.theadInBase.concat([]);

        selectedCollection.forEach(v=>{
            // 不再基础头里 就是新增的
            if(!this.baseThead.includes(v['key'])){
                add.push(v);
            }
            // 选中的在base头里 就留下  不再base里就是删除的项
            let index = tempTheadInBase.findIndex((val,index)=>{
                return val['key']===v['key'];
            })
            if(index!=-1) tempTheadInBase.splice(index,1);
        })
        // 有删除的就放在remove里面
        // tempTheadInBase.forEach(v=>remove.push({ category:null, key:v }))
        if(tempTheadInBase.length)  remove = tempTheadInBase.concat([]);

        // 把外部数据库添加的放进add
        if(this.outerSelected.length){
            add.push(...this.outerSelected);
            this.outerBeforeSelected = this.outerSelected.concat([]);
        }
        console.log(add)
        this.addThead.emit({add,remove});
    }

    copy(arr){
        let temp = [];
        arr.forEach((val,index)=>{
            temp.push([]);
            if(val.length) temp[index].push(...val);
        })
        return temp;
    }

    initSelected(){
        this.selected = this.thead.map(v=>[]);
        if(this.outerDataBaseService.get()['children'].length) this.selected.push([]);
    }

    initBeforeSelected(){
        this.beforeSelected = this.thead.map(v=>[]);
        if(this.outerDataBaseService.get()['children'].length) this.beforeSelected.push([]);
    }

    initSelectCount(){
        this.selectCount = this.thead.map(v=>0);
        if(this.outerDataBaseService.get()['children'].length) this.selectCount.push(0);
    }

    classifyCollection(collection){
        let temp = [] ;
        collection.forEach(v=>temp = temp.concat(v));
        return temp;
    }


    clear() {
        this.initSelected();
        this.initBeforeSelected();
        this.initTheadStatus();
        this.getCheckCount();
        // 清除外部数据库
        this.outerSelected = [];
        this.outerBeforeSelected = [];
        this.confirm();
    }

    cancel() {
        this.selected = this.copy(this.beforeSelected);
        this.applyCheckedStatus();
        // 外部数据库取消
        this.outerSelected = this.outerBeforeSelected.concat([]);
    }

    closeTag(d) {
        this.toggleSelect(d,d['index']);
    }

    // 外部数据库逻辑
    // 外部数据库点击选择
    outerClick(item,index){
        if(this.outerSelected.length){
            if(this.isInArr(item,this.outerSelected,'key')) return;
            this.outerSelected.push(item);
        }else{
            this.outerSelected.push(item);
        }
    }

    outerClose(item){
        let index = this.outerSelected.findIndex((val,i)=>{
            return val['key']===item['key'];
        })
        if(index!=-1) this.outerSelected.splice(index,1);
    }

    addTreeThead(index){
        this.modalVisibleList[index] = true;
    }

    // 树选择可匹配的头 改变
    handlerSelectDataChange(thead,index){
        this.generatedThead[index] = thead;
    }

    handleCancel(index){
        this.modalVisibleList[index]  = false;
    }

    handleOk(index,curObj){
        if(this.generatedThead[index][0]){
            curObj['generatedThead'].push({
                category:curObj['category'],
                checked:false,
                key:this.generatedThead[index][0],
                name:this.generatedThead[index][0],
                index:this.thead.length
            });
        }
        this.initGeneratedThead();
    }

    // 初始化临时产生的组合头 generatedThead
    initGeneratedThead(){
        for(let name in this.generatedThead){
            this.generatedThead[name] = [];
        }
        for(let i=0;i<this.modalVisibleList.length;i++){
            this.modalVisibleList[i] = false;
        }
    }

    forTree(data,callback){
        if (!data || !data.length) return;
        let stack = [];
        for (var i = 0, len = data.length; i < len; i++) {
            stack.push(data[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();
            callback && callback(item)
            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

    forLeaves(data,callback){
        if (!data || !data.length) return;
        let stack = [];
        for (var i = 0, len = data.length; i < len; i++) {
            stack.push(data[i]);
        }
        
        let item;
        while (stack.length) {
            item = stack.shift();
            if(!('children' in item)) {
                callback && callback(item)
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
     * @description 外部清空不发出事件
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-12
     * @memberof AddColumnComponent
     */
    _resetStatusWithoutEmit() {
        this.initSelected();
        this.initBeforeSelected();
        this.initTheadStatus();
        this.getCheckCount();
    }
}
