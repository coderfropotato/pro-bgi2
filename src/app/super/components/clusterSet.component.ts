import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AjaxService } from "../service/ajaxService";
import config from "../../../config";
import { StoreService } from "../service/storeService";
import { NzNotificationService } from "ng-zorro-antd";

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

        .rangeSet,.dataSet{
            border-bottom:1px solid #eeeeee;
            padding:10px 0;
        }
        .dataSet{
            margin:10px 0;
            margin-top:0px;
        }

        .dataSet nz-row{
            margin-top:10px;
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

    constructor(
        private ajaxservice: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.getDefaultSet();
    }

    //设置、空白区点击
    setClick(){

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
        // this.ajaxservice
        // .getDeferData({
        //     url:`${config['javaPath']}/Cluster/defaultSet`,
        //     data:{
        //         "tid": "20783e1576b84867aee1a63e22716fed"
        //     }
        // })
        // .subscribe(
        //     (data:any)=>{
        //         if (data.status === "0" && (data.data.length == 0 || $.isEmptyObject(data.data))) {
        //             return;
        //         } else if (data.status === "-1") {
        //             return;
        //         } else if (data.status === "-2") {
        //             return;
        //         } else {
                  let data={
                        data:{
                           "horizontalDefault": ["cellType","time"],
                           "min": 0,
                           "max": 18662,
                           "xNum": 2,
                           "geneType": "gene"
                       },
                       "message": "成功",
                       "status": "0"
                    }
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

    //             }
    //         }
    //     )
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
        let data={
            "data": {
                "vertical": [
                    {
                        "key": "gene_type",
                        "name": "gene_type",
                        "category": "aisdb.gene"
                    },
                    {
                        "key": "gene_coding_type",
                        "name": "gene_coding_type",
                        "category": "aisdb.gene"
                    },
                    {
                        "key": "gene_source",
                        "name": "gene_source",
                        "category": "aisdb.gene"
                    },
                    {
                        "key": "Blood",
                        "name": "Blood",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Lung",
                        "name": "Lung",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Skin",
                        "name": "Skin",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Prostate",
                        "name": "Prostate",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Bone",
                        "name": "Bone",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Cervix",
                        "name": "Cervix",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Rectum",
                        "name": "Rectum",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Testis",
                        "name": "Testis",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Eye",
                        "name": "Eye",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Eye and adnexa",
                        "name": "Eye and adnexa",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Vulva",
                        "name": "Vulva",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Gliomas",
                        "name": "Gliomas",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "Nevi and Melanomas",
                        "name": "Nevi and Melanomas",
                        "category": "aisdb.gene_exp_tcga_3.0"
                    },
                    {
                        "key": "GO Term",
                        "name": "GO Term",
                        "category": "aisdb.gene_go_3.0"
                    }
                ],
                "horizontal": ["cellType","time","geneClass","geneType"]
            },
            "message": "成功",
            "status": "0"
        }

        let trueData=data.data;
        this.horizontalClassList=trueData.horizontal;
        this.verticalClassList=trueData.vertical;
    }

    addVclass(){
        console.log('add v')
    }

    addHclass(){
        console.log('add h')
    }
}
