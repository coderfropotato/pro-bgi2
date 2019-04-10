import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
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
        .domainRange nz-input-number{
            width:50px;
            margin-top: 3px;
        }
        nz-input-number input{
            padding:0 4px;
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
    @Input() defaultSetData:any;
    @Input() setData:any;

    @Input() type:string;

    confirmData:object;

    isShowSetPanel:boolean=false;

    geneType:string;

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
    isHorizontalCluster:boolean;

    //横纵向分类数据
    horizontalClassList:object[]=[];
    verticalClassList:object[]=[];

    //选择的横纵向分类信息
    horizontalInfos:object[]=[];
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
    horizontalEditList:object[]=[];
    curHEditItem_i:number;

    config=config;

    treeTempSelect:any[] = [];
    treeTempSelectKey:any[] = [];

    isVhasTitle:boolean;
    isHhasTitle:boolean;

    isLoading:boolean = false;

    constructor(
        private ajaxService: AjaxService,
        private storeService: StoreService,
        private notification: NzNotificationService,
        private pageModuleService:PageModuleService
    ) {}

    ngOnInit() {
        this.getDefaultSet();
        this.getClassification();
        // console.log(this.pageModuleService['defaultModule']);
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

    //获取默认值
    getDefaultSet(){
        let trueData=this.defaultSetData;

        let xNum=trueData.xNum;
        if (xNum <= 20) {
            this.width = 400;
        } else {
            let single_width = 20;
            this.width = single_width * xNum;
        }
        this.height=400;

        this.isHorizontalCluster=true;

        this.min=trueData.min;
        this.max=trueData.max;
        this.rangeValue=[this.min,this.max];

        this.geneType=trueData.geneType;
        if(this.geneType=="gene"){
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
        this.selectedGene=this.type && this.type==='relation' ? this.geneList[2]['key'] : this.geneList[0]['key'];

        if(trueData.verticalDefault){
            this.verticalInfos=trueData.verticalDefault;
        }

        if(trueData.horizontalDefault){
            this.horizontalInfos=trueData.horizontalDefault;
        }

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

    //获取分类
    getClassification(){
        let trueData=this.setData;

        //横向
        this.horizontalClassList=trueData.horizontal;
        this.horizontalEditList=trueData.horizontal;

        let htitle=false;
        if(this.horizontalClassList.length){
            this.horizontalClassList.forEach(d=>{
                d['children'].forEach(m=>{
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                    })
                })
    
                if(d['category']){
                    if(d['category']===config['outerDataBaseIndex']){
                        d['children'].forEach(v=>{
                            if(!('children' in v)) v['children'] = [];
                            v['modalVisible'] = false;
                            v['children'].forEach(item=>{
                                this.initTreeData(item['treeData']);
                            })
                        })
                    }
                }

                if(d['category']){
                    htitle=true;
                    return;
                }
            })
        }

        this.isHhasTitle= htitle ? true : false;

        //纵向
        this.verticalClassList=trueData.vertical;
        this.verticalEditList=trueData.vertical;

        let vtitle=false;
        if(this.verticalClassList.length){
            this.verticalClassList.forEach(d=>{
                d['children'].forEach(m=>{
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                    })
                })
    
                if(d['category']===config['outerDataBaseIndex']){
                    d['children'].forEach(v=>{
                        if(!('children' in v)) v['children'] = [];
                        v['modalVisible'] = false;
                        v['children'].forEach(item=>{
                            this.initTreeData(item['treeData']);
                        })
                    })
                }

                if(d['category']){
                    vtitle=true;
                    return;
                }
            })
        }

        this.isVhasTitle=vtitle ? true : false;
        
    }

    //纵向分类 添加
    addVclass(){
        this.isShowSetPanel=false;
        this.isShowAddVertical=true;
        this.isShowAddHorizontal=false;
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;

        if(this.verticalClassList){
            this.verticalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                        if(this.verticalInfos.length){
                            this.verticalInfos.forEach(n=>{
                                if(v['key']===n['key']){
                                    v['isChecked']=true;
                                }
                            })
                        }
                    })
                });
            })
        }
    }

    addVBtnClick(item){
        if(this.verticalClassList.length){
            this.verticalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                    })
                });
            })
        }
        item['isChecked'] = true;
    }

    addVConfirm(){
        this.isShowAddVertical=false;
        this.isShowSetPanel=true;
        this.verticalInfos=[];

        if(this.verticalClassList.length){
            this.verticalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        if (v['isChecked']) {
                            this.verticalInfos.push(v);
                        }
                    })
                });
            })
        }

    }

    addVCance(){
        this.isShowAddVertical=false;
        this.isShowSetPanel=true;
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
        this.isShowSetPanel=false;
        this.isShowAddHorizontal=true;
        this.isShowAddVertical=false;
        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;

        if(this.horizontalClassList){
            this.horizontalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                        if(this.horizontalInfos.length){
                            this.horizontalInfos.forEach(n=>{
                                if(v['key']===n['key']){
                                    v['isChecked']=true;
                                }
                            })
                        }
                    })
                });
            })
        }

    }

    addHBtnClick(item){
        if(this.horizontalClassList.length){
            this.horizontalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        v['isChecked']=false;
                    })
                });
            })
        }
        item['isChecked'] = true;
    }

    addHConfirm(){
        this.isShowAddHorizontal=false;
        this.isShowSetPanel=true;
        this.horizontalInfos=[];

        if(this.horizontalClassList.length){
            this.horizontalClassList.forEach(d=>{
                d['children'].forEach(m => {
                    m['children'].forEach(v=>{
                        if (v['isChecked']) {
                            this.horizontalInfos.push(v);
                        }
                    })
                });
            })
        }
    }

    addHCance(){
       this.isShowAddHorizontal=false;
       this.isShowSetPanel=true;
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

    // 初始化 树节点数据
    initTreeData(treeData){
        if (!treeData || !treeData.length) return;
        let stack = [];
        for (var i = 0, len = treeData.length; i < len; i++) {
            stack.push(treeData[i]);
        }
        let item;
        while (stack.length) {
            item = stack.shift();

            if(item['isRoot']) item['isExpand'] = true;
            item['isExpand'] = true;
            item['expandDisabled'] = false;
            item['isChecked'] = false;
            item['disabled'] = false;
            item['hidden'] = false;

            if (item.children && item.children.length) {
                stack = stack.concat(item.children);
            }
        }
    }

    addTreeThead(it) {
		it['modalVisible'] = true;
    }

    // 树选择可匹配的头 改变
	handlerSelectDataChange(thead) {
        this.treeTempSelect = thead[0];
        this.treeTempSelectKey = thead[1];
	}
    
    handleCancel(it) {
		it['modalVisible'] = false;
	}

	handleOk(it) {
        it['modalVisible'] = false;

        // 选择的头是不是重复选择
        let n = it['children'].findIndex((val,index)=>{
            return val['key'] === this.treeTempSelectKey[0];
        })
        if(n!=-1) {
            this.notification.create('warning','Reprot notification', `重复选择 ${this.treeTempSelect[0]}`);
            this.treeTempSelect.length = 0;
            return;
        }else{
            (async ()=>{
                if(this.treeTempSelect.length){
                    let res = await this.saveThead({
                        "category":it['category'],
                        "key":this.treeTempSelectKey[0],
						"name":this.treeTempSelect[0],
						"geneType":this.geneType['type']
                    });
                    if(res!=='error'){
                        let tempIt = JSON.parse(JSON.stringify(it));
                        it.children.length = 0;
                        it.children.push(...res['data']);

                        if(tempIt['children'].length){
                            it['children'].forEach(val=>{
                                let index = tempIt['children'].findIndex((v,i)=>{
                                    return val['key'] === v['key'];
                                })

                                if(index!=-1){
                                    it['children'][index]['checked'] = tempIt['children'][index]['checked'];
                                    tempIt['children'].splice(index,1);
                                }
                            })
                        }

                        // this.initIndex(this.verticalClassList);

                        this.notification.create('success','Reprot notification', `${this.treeTempSelect[0]} 添加成功`);
                    }else{
                        this.notification.create('warning','Reprot notification', `${this.treeTempSelect[0]} 添加失败`);
                    }
                    this.treeTempSelect.length = 0;
                    this.treeTempSelectKey.length = 0;
                }
            })()
        }
    }

    // 初始化索引
	initIndex(data) {
		data.forEach((val, index) => {
			if (val['children'] && val['children'].length) {
				val['children'].forEach((v, i) => {
					if (v['children'] && v['children'].length) {
						for (let m = 0; m < v['children'].length; m++) {
							v['children'][m]['index'] = index;
						}
					}
				});
			}
		});
	}
    
    // 保存树选择的头
	async saveThead(thead: object) {
		return new Promise((resolve, reject) => {
			this.ajaxService
				.getDeferData({
					data: {
						LCID: sessionStorage.getItem('LCID'),
						columns: [ thead ]
					},
					url: `${config['javaPath']}/savePublicColumns`
				})
				.subscribe(
					(res) => {
						res['status'] === '0' ? resolve(res) : reject('error');
					},
					(error) => {
						reject('error');
					}
				);
		});
	}

    //设置 确定
    setConfirm(){

        if(this.horizontalInfos.length){
            let horizontalInfoList=[];
            this.horizontalInfos.forEach(d=>{
                horizontalInfoList.push(d['key']);
            })

            if((new Set(horizontalInfoList)).size !== this.horizontalInfos.length){
                this.notification.warning('横向分类','分类重复！');
                return;
            }
        }

        if(this.verticalInfos.length){
            let verticalInfoList=[];
            this.verticalInfos.forEach(d=>{
                verticalInfoList.push(d['key']);
            })

            if((new Set(verticalInfoList)).size !== this.verticalInfos.length){
                this.notification.warning('纵向分类','分类重复！');
                return;
            }
        }

        this.isShowSetPanel=false;

        this.isShowEditHorizontal=false;
        this.isShowEditVertical=false;
        this.isShowAddHorizontal=false;
        this.isShowAddVertical=false;

        this.confirmData['width']=this.width;
        this.confirmData['height']=this.height;
        this.confirmData['domainRange']=[Math.min(this.rangeValue[0],this.rangeValue[1]),Math.max(this.rangeValue[0],this.rangeValue[1])];
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

}
