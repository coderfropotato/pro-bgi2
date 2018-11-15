import { Component, OnInit } from '@angular/core';
import { AjaxService } from '../service/ajaxService';

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
    rationClassifyList: object[] = [];
    curRationClassify: string;

    rations: string[] = [];
    curRationCol: string;

    relationList: object[] = [];
    curRelation: string;

    infoList: object[] = [];

    isShowAddPanel: boolean = false;

    isShowUpdatePanel: boolean = false;

    isShowSetPanel:boolean=false;

    curUpdateClassify: string;
    rationList: string[] = [];

    curUpdateInfo: object;

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.getRationClassify();
        this.getRelations();
    }

    //点击“设置”、“面板以外区域”
    setClick() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
    }

    //获取定量信息
    getRationClassify() {
        this.rationClassifyList = [{
            "name": "定量分类1",
            "data": ["s1_fpkm1", "s1_fpkm2", "s1_fpkm3", "s1_fpkm4", "s1_fpkm5", "s1_fpkm6", "s1_fpkm7", "s1_fpkm8", "s1_fpkm9"]
        },
        {
            "name": "定量分类2",
            "data": ["s2_fpkm1", "s2_fpkm2", "s2_fpkm3", "s2_fpkm4", "s2_fpkm5", "s2_fpkm6", "s2_fpkm7", "s2_fpkm8", "s2_fpkm9", "s2_fpkm10"]
        },
        {
            "name": "定量分类3",
            "data": ["s3_fpkm1", "s3_fpkm2", "s3_fpkm3", "s3_fpkm4", "s3_fpkm5"]
        },
        {
            "name": "定量分类4",
            "data": ["s4_fpkm1", "s4_fpkm2", "s4_fpkm3"]
        }
        ];

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

    //获取关联基因列表
    getRelations() {
        let data = ["false", 'ggi', 'ppi', 'cp_exp'];
        data.forEach(d => {
            this.relationList.push({
                name: d,
                isDisabled: false
            })
        })
        this.curRelation = this.relationList[0]['name'];
    }

    //关联基因change
    relationChange() {
        this.relationList.forEach(d => {
            d['isDisabled'] = false;
            this.infoList.forEach(m => {
                if (d['name'] !== 'false') {
                    if (d['name'] === m['relation']) {
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
        this.curRationCol = item;
    }

    //添加面板， 确定
    rationColConfirm() {
        let infoObj = {
            relation: this.curRelation,
            rationCol: this.curRationCol
        }

        if (!this.isInArray(this.curRationCol, this.infoList, 'rationCol')['status'] && this.infoList.length < 5 && this.curRationCol) {
            this.infoList.push(infoObj);
        }

        this.isShowAddPanel = false;
    }

    //添加面板， 取消
    rationColCance() {
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
        this.curUpdateInfo['rationCol'] = item;
        this.isShowUpdatePanel = false;
    }

    //点击“删除”
    deleteInfo(i) {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.infoList.splice(i, 1);
    }

    // 设置 确定
    rationInfoConfirm() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.isShowSetPanel=false;
        console.log(this.infoList);
    }

    //设置 取消
    rationInfoCance() {
        this.isShowAddPanel = false;
        this.isShowUpdatePanel = false;
        this.isShowSetPanel=false;
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
