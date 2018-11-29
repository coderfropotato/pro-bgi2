import { Component, OnInit } from '@angular/core';
import { NzModalService,UploadFile } from 'ng-zorro-antd';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styles: []
})
export class UploadComponent implements OnInit {

  resultList:object;
  isShowTab: boolean = true;
  isVisible: boolean = false;
  fileList: UploadFile[] = [];
  fileList2: UploadFile[] = [];
  fileList3: UploadFile[] = [];
  nfileList: UploadFile[] = [];
  index:number=0;
  tab1:object;

  constructor(private modalService: NzModalService) {}

  ngOnInit() {
      
  }


  beforeUpload = (file: UploadFile): boolean => {
    // this.fileList.push(file);
    // console.log(this.fileList)
    // return false;
    if(this.index==0){
      this.fileList.push(file);
      this.nfileList = this.fileList;
    }else if(this.index==1){
      this.fileList2.push(file);
      this.nfileList = this.fileList2;
    }else if(this.index==2){
      this.fileList3.push(file);
      this.nfileList = this.fileList3;
    }
    //console.log(this.nfileList);
    return false;
  }
  // beforeUpload2 = (file: UploadFile): boolean => {
  //   this.fileList2.push(file);
  //   console.log(this.fileList2[0]['name'])
  //   return false;
  // }
  // beforeUpload3 = (file: UploadFile): boolean => {
  //   this.fileList3.push(file);
  //   console.log(this.fileList3[0]['name'])
  //   return false;
  // }

  fileListChange(){

  }

  SelectedIndexChange(num){
    this.index=num;
  }

  goResult() {
    let temp = '';
    if(this.index==0){
      let t_name = '';
      this.fileList.forEach(element => {
        t_name += element.name+"/";
      });
      temp=t_name+"上传成功!!!"
    }else if(this.index==1){
      let t_name = '';
      this.fileList2.forEach(element => {
        t_name += element.name+"/";
      });
      temp=t_name+"上传成功!!!"
    }else if(this.index==2){
      let t_name = '';
      this.fileList3.forEach(element => {
        t_name += element.name+"/";
      });
      temp=t_name+"上传成功!!!"
    }
    this.modalService.success({
      nzTitle: '上传结果',
      nzContent: temp
    });
    this.isShowTab = true;
  }

  updateLoad(){
    this.isShowTab = false;
  }

}
