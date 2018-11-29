import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AjaxService } from '../service/ajaxService';
import config from '../../../config';
import { StoreService } from '../service/storeService';
import { NzNotificationService } from 'ng-zorro-antd';

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
        `
    ]
})

export class MultiOmicsSetComponent implements OnInit {
    @Output() confirm: EventEmitter<any> = new EventEmitter();

    rationClassifyList: object[] = [];
    curRationClassify: string;

    rations: string[] = [];
    curRation: object = {};

    relationList: object[] = [];
    curRelation: object = {};

    infoList: object[] = [];
    confirmInfoList: object[] = [];

    isShowAddPanel: boolean = false;

    isShowUpdatePanel: boolean = false;

    isShowSetPanel: boolean = false;

    curUpdateClassify: string;
    rationList: string[] = [];

    curUpdateInfo: object = {};

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService
    ) { }

    ngOnInit() {
        this.getRationClassify();
        this.getRelations();
    }

    //点击“设置”、“面板以外区域”
    setClick() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.infoList = [...this.confirmInfoList];
    }

    //获取定量信息
    getRationClassify() {
        this.ajaxService
            .getDeferData({
                url: `${config['javaPath']}/addQuantity`,
                data: {
                    "LCID": this.storeService.getStore('LCID'),
                    "geneType": "gene"  // gene 或 transcript
                }
            })
            .subscribe(
                (data: any) => {
                    if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                        this.rationClassifyList = [];
                    } else if (data.status === "-1") {
                        this.rationClassifyList = [];
                    } else if (data.status === "-2") {
                        this.rationClassifyList = [];
                    } else {
                        this.rationClassifyList = data.data;

                        this.curRationClassify = this.rationClassifyList[0]['name'];
                        this.curUpdateClassify = this.rationClassifyList[0]['name'];

                        this.rationClassifyList.forEach((d) => {
                            if (d['name'] === this.curRationClassify) {
                                this.rations = d['data'];
                            }

                            if (d['name'] === this.curUpdateClassify) {
                                this.rationList = d['data'];
                            }

                        })
                    }
                },
                error => {
                    this.rationClassifyList = [];
                }
            )
    }

    //获取关联基因列表
    getRelations() {
        let data = this.storeService.getStore('relations');
        data.unshift({
            key: "false",
            name: "false"
        })

        data.forEach(d => {
            this.relationList.push({
                key: d['key'],
                name: d['name'],
                isDisabled: false
            })
        })

        this.curRelation = this.relationList[0];

    }

    //关联基因change
    relationChange(info) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;

        this.relationList.forEach(d => {
            d['isDisabled'] = false;
            this.infoList.forEach(m => {
                if (d['key'] !== 'false') {
                    if (d['key'] === m['relation']) {
                        d['isDisabled'] = true;
                    }
                }
            });

            if (info['relation'] === d['key']) info['relationName'] = d['name'];

        })

    }

    //点击“添加定量信息”
    addInfo() {
        this.isShowAddPanel = true;
        this.isShowUpdatePanel = false;
    }

    //添加面板，定量分类change
    rationClassifyChange() {
        this.rations = [];
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = d['data'];
            }
        })
    }

    // 添加面板，选择定量列
    rationColSelect(item) {
        this.curRation = item;
    }

    //添加面板， 确定
    addConfirm() {
        if ($.isEmptyObject(this.curRation)) {
            this.notification.warning('添加定量信息', '请选择一个定量列');
            return;
        }

        let infoObj = {
            relation: this.curRelation['key'],
            relationName: this.curRelation['name'],
            key: this.curRation['key'],
            category: this.curRation['category'],
            name: this.curRation['name']
        }

        if (this.infoList.length >= 5) {
            this.notification.warning('添加定量信息', '最多添加5项');
            this.isShowAddPanel = false;
            return;
        }

        let falseRelationArr = [];
        if(this.infoList.length){
            this.infoList.forEach(d => {
                if (d['relation'] === 'false') {
                    falseRelationArr.push(d['key']);
                }
            })
        }

        if(this.isInArray(this.curRation['key'],falseRelationArr,'')){
            this.notification.warning('添加定量信息', '不能重复添加');
        }else{
            this.infoList.push(infoObj);
        }

        this.isShowAddPanel = false;
    }

    //添加面板， 取消
    addCance() {
        this.curRation = {};
        this.isShowAddPanel = false;
    }

    //点击“修改”
    updateInfo(info) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = true;
        this.curUpdateInfo = info;
    }

    //修改面板，定量分类change
    updateClassifyChange() {
        this.rationList = [];
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curUpdateClassify) {
                this.rationList = d['data'];
            }
        })
    }

    //修改面板，定量列选择
    updateRationColSelect(item) {
        this.curUpdateInfo['key'] = item['key'];
        this.curUpdateInfo['category'] = item['category'];
        this.curUpdateInfo['name'] = item['name'];
        this.isShowUpdatePanel = false;
    }

    //点击“删除”
    deleteInfo(i) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.infoList.splice(i, 1);
    }

    // 设置 确定
    setConfirm() {
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
