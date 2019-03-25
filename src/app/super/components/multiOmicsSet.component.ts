import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { AjaxService } from '../service/ajaxService';
import config from '../../../config';
import { StoreService } from '../service/storeService';
import { NzNotificationService } from 'ng-zorro-antd';
import { PageModuleService } from '../service/pageModuleService';

declare const $: any;

@Component({
    selector: 'app-multiOmicsSet',
    templateUrl: './multiOmicsSet.component.html',
    styles: [
        `
        .setPanelTitle {
            border-bottom: 1px solid rgba(234, 234, 235, 0.95);
        }

        .addInfo {
            padding: 10px;
        }

        .infoTitle{
            margin-left: 32px;
        }

        .infoCol.rationColInfo{
            width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space:nowrap
        }
        .infoCol{
            float:left;
            margin-right:10px;
            margin-bottom: 8px;
        }
        .infoCol::after{
            content:'';
            display:block;
            clear:both;
        }
        .infoContent::after{
            content:'';
            display:block;
            clear:both;
        }
        .relationRow{
            margin-bottom:10px;
        }
        `
    ]
})

export class MultiOmicsSetComponent implements OnInit {
    @Output() confirm: EventEmitter<any> = new EventEmitter();
    @Input() num:number;

    geneType:string;

    // 添加、修改分类数据
    rationClassifyList: object[] = [];

    //添加面板数据
    rations: object[] = [];
    curRationClassify: string;  //当前定量类型
    curAddRation:string; //当前添加的定量列

    //关联基因
    relationList: object[] = [];
    curRelation: object = {};

    //设置面板数据
    infoList: object[] = [];
    confirmInfoList: object[] = [];

    //显示 隐藏
    isShowAddPanel: boolean = false;

    isShowUpdatePanel: boolean = false;

    isShowSetPanel: boolean = false;

    isShowRelationPanel:boolean=false;

    //修改面板数据
    rationList: object[] = [];
    curUpdateClassify: string;  //当前定量类型
    curUpdateInfo: object; //当前修改项

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService,
        private pageModuleService: PageModuleService
    ) { }

    ngOnInit() {
        this.geneType=this.pageModuleService['defaultModule'];
        this.getRationClassify();
        this.getRelations();
    }

    //点击“设置”、“面板以外区域”
    setClick() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.infoList = [...this.confirmInfoList];
    }

    //获取关联基因
    getRelations() {
        let data = this.storeService.getStore('relations');
        this.relationList=[...data];
        this.relationList.unshift({
            key: "false",
            name: "false"
        })
        this.relationList.forEach(d => {
            d['isDisabled']= false;
            d['isSelected']=false;
            // if(d['key']!=="false"){
            //     d['limit']=true;
            // }
        })

        this.relationList[0]['isSelected']=true;
        this.curRelation = {...this.relationList[0]};

    }

    //获取定量信息
    getRationClassify() {
        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/multiOmics/quantity`,
                data: {
                    "LCID": this.storeService.getStore('LCID'),
                    "genome":sessionStorage.getItem('genome'),
                    "geneType": this.geneType  // gene 或 transcript
                }
            })
            .subscribe(
                (data: any) => {
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        return;
                    } else if (data.status === "-1") {
                        return;
                    } else if (data.status === "-2") {
                        return;
                    } else {
                        this.rationClassifyList = data.data;

                        this.curRationClassify = this.rationClassifyList[0]['name'];
                        this.curUpdateClassify = this.rationClassifyList[0]['name'];

                        this.rationClassifyList.forEach((d) => {
                            if (d['name'] === this.curRationClassify) {
                                this.rations = [...d['data']];
                            }

                            if (d['name'] === this.curUpdateClassify) {
                                this.rationList = [...d['data']];
                            }

                        })

                        this.rations.forEach(d=>{
                            d['isChecked']=false;
                        })

                    }
                },
                error => {
                    console.log(error);
                }
            )
    }

    //点击“添加定量信息”
    addInfo() {

        if(this.infoList.length>=5){
            this.notification.warning('添加定量信息','最多允许有5个定量信息');
            return;
        }

        this.isShowRelationPanel=true;
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.isShowSetPanel=false;

        // 关联关系若存在，下拉框不可选择此关联关系
        this.relationList.forEach(d => {
            if(this.num>200){
                if(d['key'] === 'false'){
                    d['isDisabled'] = false;
                }else{
                    d['isDisabled'] = true;
                }
            }else{
                d['isDisabled'] = false;
                this.infoList.forEach(m => {
                    if (d['key'] !== 'false') {
                        if (d['key'] === m['relation']) {
                            d['isDisabled'] = true;
                        }
                    }
                });
            }

        })

        //清空之前的选择定量列
        this.rations.forEach(d=>{
            d['isChecked']=false;
        })

        //关联关系恢复默认
        this.relationList.forEach(d=>{
            d['isSelected']=false;
        })
        this.relationList[0]['isSelected']=true;
        this.curRelation = {...this.relationList[0]};

    }

    // 添加关联关系

     //关联基因change
     relationChange(item) {
         this.isShowAddPanel = false;
         this.isShowUpdatePanel = false;

         this.relationList.forEach(d => {
            //改变当前关联关系对应obj
            // if (this.curRelation['key'] === d['key']){
            //     this.curRelation = {...d};
            // }
            d['isSelected']=false;

       })

       item['isSelected']=true;

       this.curRelation = {...item};

   }

   //关联关系 确定
    relationOk(){
        this.isShowAddPanel=true;
        this.isShowRelationPanel=false;
    }

    //关联关系 取消
    relationCancel(){
        this.isShowRelationPanel=false;
    }


    //添加定量信息

    //添加面板，定量分类change
    rationClassifyChange() {
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = [...d['data']];
            }
        })

        this.rations.forEach(d=>{
            d['isChecked']=false;
        })
    }

    // 添加面板，选择定量列
    rationColSelect(item) {
        this.rations.forEach(d=>{
           d['isChecked']=false;
        })

        item.isChecked=true;
        this.curAddRation=item['key'];
    }

    //添加面板， 确定
    addConfirm() {
        let fasleArr=[];
        this.infoList.forEach(d=>{
            if(d['relation']==='false'){
                fasleArr.push(d['key']);
            }
        })

        if(this.isInArray(this.curAddRation,fasleArr,'') && this.curRelation['key']==='false'){
            this.notification.warning('添加定量信息','请不要重复添加');
            return;
        }

        if(this.curRelation['key']==='false'){
            this.rations.forEach(d=>{
                if(d['isChecked']){
                    this.infoList.push({
                        key:d['key'],
                        category:d['category'],
                        name:d['name'],
                        relation:this.curRelation['key'],
                        relationName:this.curRelation['name'],
                    });

                }
            })
        }else{
            this.rations.forEach(d=>{
                if(d['isChecked']){
                    this.infoList.push({
                        key:d['key'],
                        category:d['category'],
                        name:d['name'],
                        relation:this.curRelation['key'],
                        relationName:this.curRelation['name'],
                        score:[...this.curRelation['score']],
                        max:[...this.curRelation['max']],
                        limit:this.curRelation['limit']
                    });

                }
            })

        }

        this.isShowAddPanel = false;
        this.isShowSetPanel=true;

    }

    //添加面板， 取消
    addCancel() {
        this.isShowAddPanel = false;
    }


    //点击“修改”
    updateInfo(info) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = true;
        this.isShowSetPanel=false;
        this.curUpdateInfo = info;
    }

    //修改面板，定量分类change
    updateClassifyChange() {
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curUpdateClassify) {
                this.rationList = [...d['data']];
            }
        })
    }

    //修改面板，定量列选择
    updateRationColSelect(item) {
        this.curUpdateInfo['key'] = item['key'];
        this.curUpdateInfo['category'] = item['category'];
        this.curUpdateInfo['name'] = item['name'];

        this.isShowUpdatePanel = false;
        this.isShowSetPanel=true;

    }

    updateCancel(){
        this.isShowUpdatePanel=false;
        this.isShowSetPanel=true;
    }

    //点击“删除”
    deleteInfo(i) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.infoList.splice(i, 1);
    }

    // 设置 确定
    setConfirm() {
        let rationinfos=[];
        this.infoList.forEach(d=>{
            if(d['relation']==='false'){
                rationinfos.push(d['key']);
            }
        })

        if((new Set(rationinfos)).size !== rationinfos.length){
            this.notification.warning('定量信息','定量信息重复');
            return;
        }

        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.isShowSetPanel = false;
        this.confirmInfoList = [...this.infoList];
        this.confirm.emit(this.confirmInfoList);
    }

    //设置 取消
    setCance() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.isShowSetPanel = false;
        this.infoList = [...this.confirmInfoList];
    }

    //判断item是否在数组中
    isInArray(item, arr, key) {
        if (key) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i][key] === item) {
                    return true;
                }
            }

        } else {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    return true;
                }
            }
        }
        return false;
    }
}
