import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";
import { PageModuleService } from "../service/pageModuleService";

declare const $: any;

@Component({
    selector: "app-clusterSet",
    templateUrl: "./clusterSet.component.html",
    styles: [
        `
        nz-input-number{
            width:70px;
            margin-left: 6px;
        }
        .textCol{
            margin-top:8px;
        }

        .rangeSet{
            border-bottom:1px solid #eeeeee;
            padding:10px 0;
        }
        .dataSet{
            margin:10px 0;
        }

        .dataSet nz-row{
            margin-top:10px;
        }

        .addTitle{
            margin:10px 0;
        }
        `
    ]
})
export class ClusterSetComponent implements OnInit {
    isShowSetPanel:boolean=false;

    width:number=0;
    height:number=480;

    //值域 domain
    min:number=0;
    max:number=0;
    rangeValue:number[]=[];

    //行名称
    selectedGene:string;
    geneList:object[]=[];

    //列聚类
    isHorizontalCluster:boolean=true;

    //横纵向分类数据
    horizontalClassList:string[]=[];
    verticalClassList:object[]=[];

    //选择的横纵向分类信息
    horizontalInfos:string[]=[];
    verticalInfos:object[]=[];

    //添加面板 显示
    isShowAddVertical:boolean=false;  
    isShowAddHorizontal:boolean=false;  

    //修改面板 显示
    isShowEditVertical:boolean=false;
    isShowEditHorizontal:boolean=false;

    constructor(
        private ajaxservice: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService,
        private pageModuleService:PageModuleService
    ) {}

    ngOnInit() {
        this.getDefaultSet();
        this.getClassification();
        console.log(this.pageModuleService['defaultModule']);
    }

    //设置、空白区点击
    setClick(){
        this.isShowAddVertical=false;  
        this.isShowAddHorizontal=false;  
    
        this.isShowEditVertical=false;
        this.isShowEditHorizontal=false;
    }

    //width change
    onAfterChangeWidth(width){
        console.log(width);
        console.log(this.width)
    }

    //height change
    onAfterChangeHeight(height){
        console.log(height);
    }

    //值域 change
    onAfterChangeDomain(domain){
        console.log(domain);
    }

    //获取默认值
    getDefaultSet(){
        this.ajaxservice
        .getDeferData({
            url:`${config['javaPath']}/Cluster/defaultSet`,
            data:{
                "tid": "20783e1576b84867aee1a63e22716fed"
            }
        })
        .subscribe(
            (data:any)=>{
                if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                    return;
                } else if (data.status === "-1") {
                    return;
                } else if (data.status === "-2") {
                    return;
                } else {
                    let trueData=data.data;

                    let xNum=trueData.xNum;
                    if (xNum <= 8) {
                        this.width = 480;
                    } else {
                        let single_width = 60;
                        this.width = single_width * xNum;
                    }

                    this.min=trueData.min;
                    this.max=trueData.max;
                    this.rangeValue=[this.min,this.max];
                    
                    let geneType=trueData.geneType;
                    if(geneType=="gene"){
                        this.geneList=[{
                            key:'hidden',
                            name:'隐藏'
                        },{
                            key:'id',
                            name:'基因ID'
                        },{
                            key:'symbol',
                            name:'基因symbol'
                        }];
                    }else{
                        this.geneList=[{
                            key:'hidden',
                            name:'隐藏'
                        },
                        {
                            key:'id',
                            name:'转录本ID'
                        }];
                    }
                    this.selectedGene=this.geneList[0]['key'];

                    this.horizontalInfos=trueData.horizontalDefault;

                }
            }
        )
    }

    //行名称 change
    onChangeGene(gene){
        console.log(gene);
    }

    //列聚类 change
    onChangeCluster(isCluster){
        console.log(isCluster);
    }

    //获取分类
    getClassification(){    
        this.ajaxservice
        .getDeferData({
            url:`${config['javaPath']}/Cluster/classification`,
            data:{
                    "geneType": "gene",
                    "LCID": "demo"
            }
        })
        .subscribe(
            (data:any)=>{
                if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
                    return;
                } else if (data.status === "-1") {
                    return;
                } else if (data.status === "-2") {
                    return;
                } else {
                    let trueData=data.data;
                    this.horizontalClassList=trueData.horizontal;

                    this.verticalClassList=trueData.vertical;
                    this.verticalClassList.forEach(d=>{
                        d['isChecked']=false;
                    })
                }
            }
        )

    }

    //纵向分类 添加
    addVclass(){
        this.isShowAddVertical=true;
        this.isShowAddHorizontal=false;
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        
        this.verticalClassList.forEach(d=>{
            d['isChecked']=false;
            if(this.verticalInfos.length){
                this.verticalInfos.forEach(m=>{
                    if(d['key']===m['key']){
                        d['isChecked']=true;
                    }
                })
            }
        })
    }

    addVBtnClick(item){
        item['isChecked'] = !item['isChecked'];
    }

    addVConfirm(){
        let count=0;
        this.verticalClassList.forEach(d => {
            if (d['isChecked']) {
                count++;
            }
        })

        if(count>2){
            this.notification.warning('添加纵向分类','最多允许添加2个'); 
        }else{
            this.verticalInfos=[];
            this.verticalClassList.forEach(d => {
                if (d['isChecked']) {
                    this.verticalInfos.push(d);
                }
            })
            this.isShowAddVertical=false;   
        }

    }

    addVCance(){
        this.isShowAddVertical=false;
    }

    // 横向分类 添加
    addHclass(){
        this.isShowAddHorizontal=true;
        this.isShowAddVertical=false;
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
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
