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
        if(!value && value!=0) return this.globalService.trustStringHtml(`<span>NA</span>`);

        if(thead==='splie_site'){
            if(value.indexOf('-')!=-1){
                let strArr = value.split('-');
                let htmlstring = '';
                strArr.forEach((v,index)=>{
                    htmlstring+=`<span>${v}</span>`;
                    if(index!=strArr.length-1) htmlstring+='<br>'
                })
                return this.globalService.trustStringHtml(htmlstring);
            }else{
                return this.globalService.trustStringHtml(`<span>${value}</span>`);
            }
        }else{
            return this.globalService.trustStringHtml(`<span>${value}</span>`);
        }
    }
}
