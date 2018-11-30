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
    @Output() confirm: EventEmitter<any> = new EventEmitter();

    confirmData:object;

    isShowSetPanel:boolean=false;

    width:number=0;
    height:number=0;

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
    horizontalClassList:object[]=[];
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

    //修改面板数据
    verticalEditList:object[]=[];
    curVEditItem_i:number;
    horizontalEditList:string[]=[];
    curHEditItem_i:number;

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

        this.width=this.confirmData['width'];
        this.height=this.confirmData['height'];
        this.rangeValue=[...this.confirmData['domainRange']];
        this.selectedGene=this.confirmData['yName'];
        this.isHorizontalCluster=this.confirmData['isCluster'];
        this.horizontalInfos=[...this.confirmData['horizontalList']];
        this.verticalInfos=[...this.confirmData['verticalList']];

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
                    this.height=480;

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

                    this.confirmData={
                        width:this.width,
                        height:this.height,
                        domainRange:[...this.rangeValue],
                        yName:this.selectedGene,
                        isCluster:this.isHorizontalCluster,
                        verticalList:[...this.verticalInfos],
                        horizontalList:[...this.horizontalInfos]
                    }

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
                    //横向
                    let horizontalClassList=trueData.horizontal;
                    horizontalClassList.forEach(d=>{
                        this.horizontalClassList.push({
                            key:d,
                            isChecked:false
                        });
                    })
                    this.horizontalEditList=horizontalClassList;

                    //纵向
                    this.verticalClassList=trueData.vertical;
                    this.verticalEditList=trueData.vertical;
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

    // 纵向分类 修改
    editVclass(index){
        this.isShowEditVertical=true;
        this.isShowEditHorizontal=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;
        this.curVEditItem_i=index;
    }

    editVBtnClick(item){
        this.verticalInfos.splice(this.curVEditItem_i,1,item);
        this.isShowEditVertical=false;
    }

    //纵向分类 删除
    deleteVclass(i){
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;

        this.verticalInfos.splice(i,1);
    }

    // 横向分类 添加
    addHclass(){
        this.isShowAddHorizontal=true;
        this.isShowAddVertical=false;
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;

        this.horizontalClassList.forEach(d=>{
            d['isChecked']=false;
            if(this.horizontalInfos.length){
                this.horizontalInfos.forEach(m=>{
                    if(d['key']===m){
                        d['isChecked']=true;
                    }
                })
            }
        })
    }

    addHBtnClick(item){
        item['isChecked'] = !item['isChecked'];
    }

    addHConfirm(){
        let count=0;
        this.horizontalClassList.forEach(d => {
            if (d['isChecked']) {
                count++;
            }
        })

        if(count>2){
            this.notification.warning('添加横向分类','最多允许添加2个'); 
        }else{
            this.horizontalInfos=[];
            this.horizontalClassList.forEach(d => {
                if (d['isChecked']) {
                    this.horizontalInfos.push(d['key']);
                }
            })
            this.isShowAddHorizontal=false; 
        }
    }

    addHCance(){
       this.isShowAddHorizontal=false; 
    }

     // 横向分类 修改
     editHclass(index){
        this.isShowEditHorizontal=true;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;
        this.curHEditItem_i=index;
    }

    editHBtnClick(item){
        this.horizontalInfos.splice(this.curHEditItem_i,1,item);
        this.isShowEditHorizontal=false;
    }

    //横向分类 删除
    deleteHclass(i){
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;

        this.horizontalInfos.splice(i,1);
    }

    //设置 确定
    setConfirm(){
        this.isShowSetPanel=false;

        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;

        this.confirmData['width']=this.width;
        this.confirmData['height']=this.height;
        this.confirmData['domainRange']=[...this.rangeValue];
        this.confirmData['yName']=this.selectedGene;
        this.confirmData['isCluster']=this.isHorizontalCluster;
        this.confirmData['verticalList']=[...this.verticalInfos];
        this.confirmData['horizontalList']=[...this.horizontalInfos];

        this.confirm.emit(this.confirmData);
    }

    //设置 取消
    setCance(){
        this.isShowSetPanel=false;

        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;

        this.width=this.confirmData['width'];
        this.height=this.confirmData['height'];
        this.rangeValue=[...this.confirmData['domainRange']];
        this.selectedGene=this.confirmData['yName'];
        this.isHorizontalCluster=this.confirmData['isCluster'];
        this.horizontalInfos=[...this.confirmData['horizontalList']];
        this.verticalInfos=[...this.confirmData['verticalList']];
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
