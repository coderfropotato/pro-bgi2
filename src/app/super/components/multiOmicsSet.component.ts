import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AjaxService } from '../service/ajaxService';
import config from '../../../config';
import { StoreService } from '../service/storeService';

@Component({
    selector: 'app-multiOmicsSet',
    templateUrl: './multiOmicsSet.component.html',
    styles: [
        `
        .setPanel {
            top: 11px;
            right: 0;
            width: 300px;
            padding:10px;
        }

        .setPanelTitle {
            border-bottom: 1px solid rgba(234, 234, 235, 0.95);
        }

        .addInfo {
            padding: 10px;
        }
        .setBtns{
            padding: 10px;
            border-top: 1px solid rgba(234, 234, 235, 0.95);
        }
        .right{
            text-align:right;
        }
        .rationClassify{
            position: absolute;
            width: 300px;
            background: #fff;
            border: 1px solid #ddd;
            top: 36px;
            left: -300px;
            padding: 10px;
        }
        .infoTitle{
            margin-left: 32px;
        }
        .rationClassifyRow{
            margin-bottom:10px;
            max-height: 400px;
            overflow: auto;
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
    curRationCol: string;
    curRationColCategory: string;

    relationList: object[] = [];
    curRelation: string;

    infoList: object[] = [];
    confirmInfoList: object[] = [];

    isShowAddPanel: boolean = false;

    isShowUpdatePanel: boolean = false;

    isShowSetPanel: boolean = false;

    curUpdateClassify: string;
    rationList: string[] = [];

    curUpdateInfo: object;

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService
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
                    console.log(error);
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
        this.curRelation = this.relationList[0]['key'];
    }

    //关联基因change
    relationChange() {
        this.relationList.forEach(d => {
            d['isDisabled'] = false;
            this.infoList.forEach(m => {
                if (d['key'] !== 'false') {
                    if (d['key'] === m['relation']) {
                        d['isDisabled'] = true;
                    }
                }
            });
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
        this.curRationCol = item['key'];
        this.curRationColCategory = item['category'];
    }

    //添加面板， 确定
    addConfirm() {
        let infoObj = {
            relation: this.curRelation,
            key: this.curRationCol,
            category: this.curRationColCategory
        }

        if (!this.isInArray(this.curRationCol, this.infoList, 'key')['status'] && this.infoList.length < 5 && this.curRationCol) {
            this.infoList.push(infoObj);
        }

        this.isShowAddPanel = false;
    }

    //添加面板， 取消
    addCance() {
        this.curRationCol = '';
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
                    return {
                        index: i,
                        status: true
                    };
                }
            }

        } else {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === item) {
                    return {
                        index: i,
                        status: true
                    };
                }
            }
        }
        return false;
    }
}
