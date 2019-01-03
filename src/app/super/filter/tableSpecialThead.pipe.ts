import { GlobalService } from 'src/app/super/service/globalService';
import { Pipe, PipeTransform } from "@angular/core";
/**
 *  表格特殊字段过滤
 */
@Pipe({
    name: "tableSpecialTheadFilter",
    pure: true
})
export class TableSpecialTheadFilter implements PipeTransform {
    constructor(private globalService:GlobalService){}

    transform(value: any,thead:any): any {
       if(thead==='splie_site'){
           if(!value && value!=0) return this.globalService.trustStringHtml(`<span>NA</span>`);

           if(value.indexOf('-')!=-1){
                let strArr = value.split('-');
                let htmlstring = '';
                strArr.forEach((v,index)=>{
                    if(index!=strArr.length-1) htmlstring+='<br>'
                    htmlstring+='<span></span>'
                })
                return this.globalService.trustStringHtml(htmlstring);
           }else{
                return this.globalService.trustStringHtml(`<span>${value}</span>`);
           }
       }else{
           if(!value && value!=0){
                return this.globalService.trustStringHtml(`<span>NA</span>`);
           }else{
                return this.globalService.trustStringHtml(`<span>${value}</span>`);
           }
       }
    }
}
