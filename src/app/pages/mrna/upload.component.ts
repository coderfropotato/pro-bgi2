import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { NzModalService, UploadFile } from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd';
import { StoreService } from "./../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import { NzNotificationService } from 'ng-zorro-antd';
import config from "../../../config";
declare const $: any;
declare const SparkMD5:any;

@Component({
    selector: "app-upload",
    templateUrl: "./upload.component.html",
    styles: []
})
export class UploadComponent implements OnInit {

	f_index: number = 0;
	tableFlag: boolean = false;

	geneExplainFlag: boolean = true;
	geneDemoFlag: boolean = false;

	rnaExplainFlag: boolean = true;
	rnaDemoFlag: boolean = false;

	sampleExplainFlag: boolean = true;
	sampleDemoFlag: boolean = false;

    resultList: any[] = [];
    isShowTab: boolean = true;
    isVisible: boolean = false;
    fileList: UploadFile[] = [];
    fileList2: UploadFile[] = [];
    fileList3: UploadFile[] = [];
    nfileList: UploadFile[] = [];
    m_index: number = 0;
    tab1: object;
    PercentNum: number;
    T_progress: any;
	defaultSetEntity: object;
	go_ResponseText:object={};
	now_page:number;//当前页
	total_page:number;
	pageSize: number;
	selectAble:boolean;
	//fristFlag:boolean;
	colors: string [] = [];
	file_obj:object={
		name:'',
		time:''
	};

	downUrl: string;
	downUrlOne: string;
	downUrlTwo: string;
	downUrlThree: string;

	goDetailFlag: boolean = true;
	goDetailId: string;
	goDetailSObj:object={
		id:"",
		yCRNumber:"",
		yColoumnName:"",
		wColoumnName:"",
		yRowNumber:0,
		wRowNumber:0,
		error_elements:[],
        error:''
	};

	goDetailFObj:object={};

    constructor(
        private modalService: NzModalService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
		private http: HttpClient,
		private message: NzMessageService,
		private notification: NzNotificationService
    ) {}

    ngOnInit() {
		this.downUrl = window.location.host;
		this.downUrlOne = "/project/upload/upload_gene.txt";
		this.downUrlTwo = "/project/upload/upload_rna.txt";
		this.downUrlThree = "/project/upload/upload_sample.txt";

        this.PercentNum = 0;
        this.defaultSetEntity = {
            LCID: this.storeService.getStore("LCID"),
            type: this.m_index + 1,
            file: ""
		};
		this.selectAble = false;

		this.getHeight();
		//this.fristFlag = true;
		this.now_page = 1;
		this.total_page = 0;
		//this.pageSize = 10;
		this.file_obj={
			name:'',
			time:''
		};
		this.getHistoryList();
		//this.updateLoad();
		
    }

    beforeUpload = (file: UploadFile): boolean => {

		if(file.size / 1024 / 1024>20)
		{
			this.modalService.warning({
				nzTitle: "提示",
				nzContent: "单次上传文件需小于20M。"
			});
		}else{
			this.nfileList = [];
			this.nfileList.push(file);
		}
		
        // if (this.m_index == 0) {
        //     this.fileList.push(file);
        //     this.nfileList = this.fileList;
        // } else if (this.m_index == 1) {
        //     this.fileList2.push(file);
        //     this.nfileList = this.fileList2;
        // } else if (this.m_index == 2) {
        //     this.fileList3.push(file);
        //     this.nfileList = this.fileList3;
		// }
        return false;
    };

    SelectedIndexChange(num) {
        this.m_index = num;
    }

	leftPage(){
		if(this.now_page==1){
			this.message.info('已经到第一页了');
		}else{
			this.now_page -=1;
			this.getHistoryList();
		}

	}

	rightPage(){
		// console.log(this.now_page)
		// console.log(this.total_page)
		if(this.now_page==this.total_page){
			this.message.info('已经最后一页了');
		}else{
			this.now_page +=1;
			this.getHistoryList();
		}

	}

	getHistoryList(){//查看历史信息列表
		let self = this;
		self.resultList.length = 0;
		self.ajaxService
		.getDeferData(
			{
				url: `${config["javaPath"]}/upload/history`,
				data: {
					"LCID": self.storeService.getStore("LCID"),
					"page": self.now_page,
					"pageSize": self.pageSize
				}
			}
		)
		.subscribe(
			(data: any) => {
				if(data.status==0){
					let tempArray = data["data"].result;
					//self.total_page = Math.floor(data["data"].total/self.pageSize) +1;
					self.total_page =Math.floor((data["data"].total + self.pageSize-1) / self.pageSize);
					//console.log(self.total_page)

					for (let index = 0; index < tempArray.length; index++) {
						const element = tempArray[index];
						let tempobj = {
							time:self.pattern(element.uploadTime),
							info:self.getType(element.type),
							status:self.getProgress(element.result),
							color:self.getProgressColor(element.result),
							id:element.id,
							md5:element.md5,
							detail:element.detail,
							hidden:element.hidden,
							index:element.index
						};
						self.resultList.push(tempobj)
					}
				}
			},
			error => {
				console.log(error)
			}
		)
	}

	//upload - 上传数据-5.切换隐藏状态
	goSwitch(e,id){
		let tempIndex = e.index;

		let self = this;
		self.ajaxService
		.getDeferData(
			{
				url: `${config["javaPath"]}/upload/hidden`,
				data: {
					"id": id,
				}
			}
		)
		.subscribe(
			(data: any) => {
				if(data.status==0){
					self.resultList.forEach((d) => {
						if(d.index == tempIndex){
							d["hidden"] = !d["hidden"];
						}
					});
					//this.getHistoryList()
				}
			},
			error => {
				console.log(error)
			}
		)
	}

	goResult() {//根据id查看结果
		// console.log(this.m_index);
		let tempNum = this.m_index;
		let self = this;
		self.ajaxService
		.getDeferData(
			{
				url: `${config["javaPath"]}/upload/result`,
				data: {
					"id": self.go_ResponseText['data'].id
				}
			}
		)
		.subscribe(
			(data: any) => {
				this.modalService.warning({
					nzTitle: "上传成功",
					nzContent: ""
				});

				self.isShowTab = true;
				self.PercentNum = 0;
				self.go_ResponseText = {};
				self.m_index = tempNum;

				this.fileList.length = 0;
				this.fileList2.length = 0;
				this.fileList3.length = 0;
			},
			error => {
				console.log(error)
			}
		)

    }

	//先判断上一次文件是否传递完成
    updateLoad() {
		this.selectAble = true;
		let self = this;
		this.ajaxService
		.getDeferData(
			{
				url: `${config["javaPath"]}/upload/last`,
				data: {
					"LCID":this.storeService.getStore("LCID")
				}
			}
		)
		.subscribe(
			(data: any) => {
				if(data.data.result>0){
					self.modalService.warning({
						nzTitle: "提示",
						nzContent: self.getProgress(data.data.result)+"...(上个文件正在录入中，请等稍后再试！)"
					});
					self.selectAble = false;
				}else{
					self.uploadTask()
				}
			},
			error => {
				console.log(error)
			}
		)
	}

	uploadTask(){ //上传进行
		let self = this;
		this.isShowTab = false;
		const formData = new FormData();
		let nfileLength = this.nfileList.length;
		let fileReader = new FileReader();

        this.nfileList.forEach((file: any,index) => {
			if(nfileLength == index+1){
				formData.append("file", file);

				self.file_obj={
					name:self.getType(self.m_index+1),
					time:self.pattern(file.lastModified)
				}
				fileReader.onload = function(e){
					//console.log(e);
					//console.log(SparkMD5.hashBinary(e.target['result']));
					formData.append("md5",SparkMD5.hashBinary(e.target['result']));
				}
				// fileReader.readAsBinaryString(file);
				fileReader.readAsText(file);

			}
        });

		formData.append('LCID',this.storeService.getStore('LCID'))
		formData.append('type',(this.m_index+1)+'');

        let p_url = `${config["javaPath"]}/upload/do`;
        let head = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Authorization: `token ${localStorage.getItem("token")}` // curToken
            })
		};

        this.ajaxService.validToken().subscribe(status => {
			if(status==200){
				let xhr = new XMLHttpRequest();
				xhr.upload.addEventListener('progress',function(status){
					let temp_num = status.loaded/status.total*100;
					self.PercentNum = Math.floor(temp_num);
				},false)

				xhr.open('post',p_url,true);
				//xhr.setRequestHeader("Content-Type","multipart/form-data");
				xhr.setRequestHeader("Authorization", `token ${localStorage.getItem("token")}`);
				xhr.send(formData);

				xhr.onreadystatechange = function(){
					if(xhr.readyState==4 && xhr.status == 200){
						self.go_ResponseText = JSON.parse(xhr.responseText);
						self.selectAble = false;
						self.getHistoryList();

						// self.modalService.confirm({
						// 	nzTitle: '提示',
						// 	nzContent: '文件上传成功，请确认是否查看上传记录？',
						// 	nzOkText: '确定',
						// 	nzOkType: 'primary',
						// 	nzOnOk: () => self.f_index = 1,
						// 	nzCancelText: '取消',
						// 	nzOnCancel: () => console.log('Cancel')
						// });

						self.notification.success(
							'提示',
							'上传成功，正在效验，请在上传记录查看。',
							{
								nzDuration:3000
							}
						);

						self.nfileList.length = 0;
					}
				}


			}
        });
	}

	goDetail(e){
		if(e.status=="成功"){
			this.goDetailFlag = true;
		}else if(e.status=="失败"){
			this.goDetailFlag = false;
			this.goDetailId = e.id;
		}

		let skipColumnsName = [];
		let tempArray = e.detail.success.skipColumns;
		tempArray.forEach((d) => {
			skipColumnsName.push(d.name);
		});

		this.goDetailSObj={
			id:"",
			yCRNumber:"",
			yColoumnName:"",
			wColoumnName:"",
			yRowNumber:0,
			wRowNumber:0,
			error_elements:[],
            error:''
		};

		this.goDetailSObj={
			id:e.id,//上传编号
			yCRNumber:e.detail.flag==1?e.detail.success.rawRows+'行x'+e.detail.success.rawColumns+'列（不包括第1列和表头）':"",//原始文件行列数
			yColoumnName:e.detail.success.columns.toString(),//有效列名称
			wColoumnName:skipColumnsName.toString(),//无效列名称
			yRowNumber:e.detail.success.totalRows,//有效行数
			wRowNumber:e.detail.success.totalSkipRows,//无效行数
			error_elements:e.detail.error_elements,
            error: e.detail.flag !== 1 ? e.detail.error:''
        };
		console.log(this.goDetailSObj)
		this.isVisible = true;
	}

	handleCancel(){
		this.isVisible = false;
	}
	handleOk(){
		this.isVisible = false;
	}

	getType(num){ //基因信息or转录本信息or样本信息
		let result = "";
		switch (num) {
			case 1:
				result = "基因";
				break;
			case 2:
				result = "转录本";
				break;
			case 3:
				result = "样本";
				break;
			default:
				result = "未知"
				break;
		}
		return result;
	}

	getProgress(num){ //获取进程状态
		let result = "";
		switch (num) {
			case 0:
				result = "成功";
				break;
			case 1:
				result = "校验中";
				break;
			case 2:
				result = "录入中";
				break;
			case -1:
				result = "失败";
				break;
			default:
				break;
		}
		return result;
	}

	getProgressColor(num){ //获取进程状态
		//this.colors = ["#7AD48A","#FF6666","#5A99F","#FFA66D"];//成功，失败，录入中，校验中
		let result = "";
		switch (num) {
			case 0:
				result = "#7AD48A";
				break;
			case 1:
				result = "#FFA66D";
				break;
			case 2:
				result = "#5A99F";
				break;
			case -1:
				result = "#FF6666";
				break;
			default:
				break;
		}
		return result;
	}

	pattern(fmt){ //时间格式转换
		var dateee = new Date(fmt).toJSON();
		var date = new Date(+new Date(dateee)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'')
		return date;
	}

	SelectedFIndexChange(num) {
        this.f_index = num;
	}
	
	addmore(){
		this.tableFlag = !this.tableFlag;
	}

	geneExplainClick(){
		this.geneExplainFlag = true;
		this.geneDemoFlag = false;
	}

	geneDemoClick(){
		this.geneExplainFlag = false;
		this.geneDemoFlag = true;
	}
	rnaExplainClick(){
		this.rnaExplainFlag = true;
		this.rnaDemoFlag = false;
	}

	rnaDemoClick(){
		this.rnaExplainFlag = false;
		this.rnaDemoFlag = true;
	}
	sampleExplainClick(){
		this.sampleExplainFlag = true;
		this.sampleDemoFlag = false;
	}

	sampleDemoClick(){
		this.sampleExplainFlag = false;
		this.sampleDemoFlag = true;
	}

	switchChange(e,id){
		this.goSwitch(e,id);
	}

	deleteData(id){
		this.isVisible = false;
		let self = this;
		self.ajaxService
		.getDeferData(
			{
				url: `${config["javaPath"]}/upload/delete`,
				data: {
					"id": id,
				}
			}
		)
		.subscribe(
			(data: any) => {
				if(data.status==0){
					// self.modalService.warning({
					// 	nzTitle: "结果",
					// 	nzContent: "删除成功!"
					// });
					let temps = "*" + id.substr(id.length-10) + " 删除成功。 ";
					self.notification.success(
						'提示',
						temps,
						{
							nzDuration:3000
						}
					);
					this.getHistoryList();
				}
			},
			error => {
				console.log(error)
			}
		)
	}

	getHeight(){
		console.log(document.getElementsByClassName("t_tabset")[0].clientHeight-45);
		//计算整个表内容的高度 45位tabset 40表头 40底部 10距离头部
		let tableHeight = document.getElementsByClassName("t_tabset")[0].clientHeight-45-40-40-10;
		let numTable = Math.floor(tableHeight/40);
		this.pageSize = numTable;
		console.log(numTable);
	}
}
