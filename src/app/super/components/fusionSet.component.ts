import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";
import { PageModuleService } from "../service/pageModuleService";

declare const $: any;

@Component({
    selector: "app-fusionSet",
    templateUrl: "./fusionSet.component.html",
    styles: [
        `
        nz-input-number{
            margin-left: 6px;
        }
        
        .fusionRow {
            line-height: 40px;
            margin:10px;
            margin-top:0;
        }

        .fusionRow nz-switch{
            margin-left:16px;
        }

        `
    ]
})
export class FusionSetComponent implements OnInit {
    @Output() confirm :EventEmitter<any>=new EventEmitter();
    confirmData:object;

    isShowSetPanel:boolean=false;
    isShowGene:boolean=true;
    isShowColumn:boolean=true;

    linkSerach:string;
    linkSerachList:any[]=[];

    score:number;
    linkIdText:string="";
    
    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService,
        private pageModuleService:PageModuleService
    ) {}

    ngOnInit() {
       this.linkSerachList=[
           {
               key:"score",
               name:"Score"
           },
           {
               key:"linkId",
               name:"linkID"
           }
       ];
       this.linkSerach=this.linkSerachList[0].key;
       this.score=1;

       this.confirmData={
            isShowGene:this.isShowGene,
            isShowColumn:this.isShowColumn,
            linkSerach:this.linkSerach,
            score:this.score,
            linkIdText:this.linkIdText
        }
    }

    //设置、空白区点击
    setClick(){
        this.isShowGene=this.confirmData['isShowGene'];
        this.isShowColumn=this.confirmData['isShowColumn'];
        this.linkSerach=this.confirmData['linkSerach'];
        this.score=this.confirmData['score'];
        this.linkIdText=this.confirmData['linkIdText'];
    }

    setConfirm(){
        this.isShowSetPanel=false;

        this.confirmData["isShowGene"]=this.isShowGene;
        this.confirmData["isShowColumn"]=this.isShowColumn;
        this.confirmData['linkSerach']=this.linkSerach;
        this.confirmData["score"]=this.score;
        this.confirmData["linkIdText"]=this.linkIdText;

        this.confirm.emit(this.confirmData);
    }

    setCance(){
        this.isShowSetPanel=false;

        this.isShowGene=this.confirmData['isShowGene'];
        this.isShowColumn=this.confirmData['isShowColumn'];
        this.linkSerach=this.confirmData['linkSerach'];
        this.score=this.confirmData['score'];
        this.linkIdText=this.confirmData['linkIdText'];
    }
   

}
