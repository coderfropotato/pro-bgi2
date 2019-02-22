import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { NzModalService, UploadFile } from "ng-zorro-antd";
import { NzMessageService } from 'ng-zorro-antd';
import { StoreService } from "./../../super/service/storeService";
import { AjaxService } from "src/app/super/service/ajaxService";
import config from "../../../config";
declare const $: any;
declare const SparkMD5:any;

@Component({
    selector: "app-upload",
    templateUrl: "./upload.component.html",
    styles: []
})
export class UploadComponent implements OnInit {
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
	fristFlag:boolean;
	colors: string [] = [];
	file_obj:object={
		name:'',
		time:''
	};

    constructor(
        private modalService: NzModalService,
        private ajaxService: AjaxService,
        private storeService: StoreService,
		private http: HttpClient,
		private message: NzMessageService
    ) {}

    ngOnInit() {
        this.PercentNum = 0;
        this.defaultSetEntity = {
            LCID: this.storeService.getStore("LCID"),
            type: this.m_index + 1,
            file: ""
		};
		this.selectAble = true;
		this.fristFlag = true;
		this.now_page = 1;
		this.total_page = 0;
		this.pageSize = 10;
		this.file_obj={
			name:'',
			time:''
		};
		this.getHistoryList();
		this.updateLoad();
    }

    beforeUpload = (file: UploadFile): boolean => {
		this.nfileList = [];
        if (this.m_index == 0) {
            this.fileList.push(file);
            this.nfileList = this.fileList;
        } else if (this.m_index == 1) {
            this.fileList2.push(file);
            this.nfileList = this.fileList2;
        } else if (this.m_index == 2) {
            this.fileList3.push(file);
            this.nfileList = this.fileList3;
		}
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
			console.log(this.now_page == this.total_page)
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
							hidden:element.hidden
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
	goSwitch(id){
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
					this.getHistoryList()
				}
			},
			error => {
				console.log(error)
			}
		)
	}

	goResult() {//根据id查看结果
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
				this.modalService.success({
					nzTitle: "上传结果",
					nzContent: data.message
				});
				
				self.isShowTab = true;
				self.PercentNum = 0;
				self.go_ResponseText = {};
			},
			error => {
				console.log(error)
			}
		)
		
    }

	//先判断上一次文件是否传递完成
    updateLoad() { 
		this.selectAble = false;
		let tempflag = false;
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
					self.modalService.success({
						nzTitle: "提示",
						nzContent: self.getProgress(data.data.result)+"...(需要等上个文件上传完毕!!!)"
					});
				}else{
					//成功了进行上传
					if(self.fristFlag){
						self.fristFlag = false;
						self.selectAble = true;
					}else{
						self.uploadTask()
					}
					
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
				console.log(self.file_obj);
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

		console.log(formData.get('md5'));

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
						console.log(xhr.responseText);
						self.go_ResponseText = JSON.parse(xhr.responseText);
						self.selectAble = true;
						self.getHistoryList();
					}
				}


			}
        });
	}

	goDetail(detail,flag){
		if(flag=="成功"){
			let temp = `totalRows:${detail.success.totalRows}<br>totalSkipRows:${detail.success.totalSkipRows}`
			this.modalService.success({
				nzTitle: "结果",
				nzContent: temp
			});
		}else if(flag=="失败"){
			this.modalService.success({
				nzTitle: "结果",
				nzContent: detail.error
			});
		}
	}

	getType(num){ //基因信息or转录本信息or样本信息
		let result = "";
		switch (num) {
			case 1:
				result = "基因信息";
				break;
			case 2:
				result = "转录本信息";
				break;
			case 3:
				result = "样本信息";
				break;
			default:
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
}
