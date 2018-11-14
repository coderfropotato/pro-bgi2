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

    relationList: string[] = [];
    curRelation: string;

    infoList: object[] = [];

    isShowRationClassify: boolean = false;

    constructor(
        private ajaxService: AjaxService
    ) { }

    ngOnInit() {
        this.getRationClassify();
        this.getRelations();
    }

    //点击“设置”icon
    setClick() {
        this.isShowRationClassify = false;
    }

    //获取关联基因列表
    getRelations() {
        this.relationList = ["false", 'ggi', 'ppi', 'cp_exp'];
        this.curRelation = this.relationList[0];
    }

    relationChange() {
        console.log(this.curRelation)
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

        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = d['data'];
            }
        })
    }

    //点击“添加定量信息”
    addInfo() {
        this.isShowRationClassify = true;
    }

    //定量分类change
    rationClassifyChange() {
        this.rations = [];
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = d['data'];
            }
        })
    }

    // 选择定量列数据
    rationColSelect(item) {
        this.curRationCol = item;
    }

    //选择定量列 确定
    rationColConfirm() {
        let infoObj = {
            relation: this.curRelation,
            rationCol: this.curRationCol
        }

        if (!this.isInArray(this.curRationCol, this.infoList, 'rationCol') && this.infoList.length < 5) {
            this.infoList.push(infoObj);
        }

        this.isShowRationClassify = false;
    }

    //选择定量列 取消
    rationColCance() {
        this.isShowRationClassify = false;
    }

    //数组去重
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
