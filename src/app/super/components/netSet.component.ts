import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";
import { PageModuleService } from "../service/pageModuleService";

declare const $: any;

@Component({
    selector: "app-netSet",
    templateUrl: "./netSet.component.html",
    styles: [
        `
        .textCol{
            margin-top:6px;
        }

        .netSet{
            border-bottom:1px solid #eeeeee;
            padding:10px 0;
        }

        .netSet .ant-row{
            margin:10px;
        }
        .netSet .ant-input-number{
            width:100% !important;
        }
        .netSet .ant-select{
            width:100%;
        }
        `
    ]
})
export class NetSetComponent implements OnInit {
    @Output() defaultSet:EventEmitter<any> = new EventEmitter();
    @Output() confirm: EventEmitter<any> = new EventEmitter();
    @Input() setData:any;
    
    defaultData:object;
    confirmData:object;

    geneType:string;

    isShowSetPanel:boolean=false;
    isShowAddPanel:boolean=false;

    force:number=100; //斥力
    radian:number=10; //弧度

    symbolType:string; //symbol
    symbolTypeList:any[]=[];

    //特征值 默认
    isDefaultValue:boolean=true;
    defaultValue:object={
        key:'linkNum',
        name:"node连接数"
    };

    //特征值 定量信息
    rationClassifyList:any[]=[];
    curRationClassify:string;
    rations:any[]=[];
    curRation:object={}; //当前选中的  定量信息
    rationInfo:object={}; //确定的  定量信息

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService,
        private pageModuleService:PageModuleService
    ) {}

    ngOnInit() {
        this.geneType=this.pageModuleService['defaultModule'];

        this.symbolTypeList=[{
            key:'hidden',
            name:'hidden'
        },{
            key:'all',
            name:'showAll'
        },{
            key:'selected',
            name:'showSelected'
        }];

        this.symbolType=this.symbolTypeList[0]['key'];

        this.getRationClassify();

        this.defaultData={
            force:this.force,  
            radian:this.radian, 
            symbolType:this.symbolType, 
            value:{}
        }
        this.defaultSet.emit(this.defaultData);

        this.confirmData={...this.defaultData};
         
    }

    //获取定量信息
    getRationClassify() {
        this.rationClassifyList = this.setData;

        this.curRationClassify = this.rationClassifyList[0]['name'];

        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = [...d['data']];
            }
        })

        this.rations.forEach(d=>{
            d['isChecked']=false;
        })

        this.rations[0]['isChecked']=true;
        this.curRation={...this.rations[0]};

    }

    // 判断当前选中
    judgeChecked(){
        this.rations.forEach(d=>{
            d['isChecked']=false;
        })

        if($.isEmptyObject(this.rationInfo)){
            this.rations[0]['isChecked']=true;
            this.curRation={...this.rations[0]};
        }else{
            this.rations.forEach(d=>{
                if(d['key']===this.rationInfo['key']){
                    d['isChecked']=true;
                }
            })
        }
    }

     // 点击 选择定量信息
     addRation(){
        this.isShowAddPanel=true;
        this.isShowSetPanel=false;
        
        this.judgeChecked();
    }

    //选择定量信息，定量分类change
    rationClassifyChange() {
        this.rationClassifyList.forEach((d) => {
            if (d['name'] === this.curRationClassify) {
                this.rations = [...d['data']];
            }
        })

        this.judgeChecked();
    }

    // 选择定量信息，选择定量列
    rationColSelect(item) {
        this.rations.forEach(d=>{
           d['isChecked']=false;
        })

        item.isChecked=true;
        this.curRation={...item};
    }

    //选择定量信息， 确定
    addConfirm() {
        this.isShowAddPanel = false;
        this.isShowSetPanel=true;

        this.isDefaultValue=false;
        this.rationInfo={...this.curRation};
    }

    //选择定量信息， 取消
    addCancel() {
        this.isShowAddPanel = false;
        this.isShowSetPanel=true;

        if($.isEmptyObject(this.rationInfo)){
            this.isDefaultValue=true;
        }else{
            this.isDefaultValue=false;
            this.curRation={...this.rationInfo};
        }
    }

    //设置、空白区点击
    setClick(){
        this.isShowAddPanel=false;

        this.cancel();
      
    }

    //设置 确定
    setConfirm(){
        this.isShowSetPanel=false;
        this.isShowAddPanel=false;

        this.confirmData['force']=this.force;
        this.confirmData['radian']=this.radian;
        this.confirmData['symbolType']=this.symbolType;

        if($.isEmptyObject(this.rationInfo)){
            this.isDefaultValue=true;
            this.confirmData['value']={};  
        }else{
            this.isDefaultValue=false;
            this.confirmData['value']={...this.rationInfo}; 
        }

        this.confirm.emit(this.confirmData);
    }

    //设置 取消
    setCancel(){
        this.isShowSetPanel=false;
        this.isShowAddPanel=false;

        this.cancel();
       
    }

    cancel(){
        this.force=this.confirmData['force'];
        this.radian=this.confirmData['radian'];
        this.symbolType=this.confirmData['symbolType'];

        if(!$.isEmptyObject(this.confirmData['value'])){
            this.isDefaultValue=false;
            this.rationInfo={...this.confirmData['value']};
        }else{
            this.isDefaultValue=true;
            this.rationInfo={};
        }
    }

    //重置
    reSet(){
        this.isDefaultValue=true;
        this.curRation={};
        this.rationInfo={};
    }

}
