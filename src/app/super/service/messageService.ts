/**
 * @description 全局消息通信
 * @author Yangwd<277637411@qq.com>
 * @date 2018-09-29
 * @export
 * @class MessageService
 */
import {Injectable} from '@angular/core';
import {Observable,Subject} from 'rxjs';

@Injectable({
    providedIn: "root"
})
export class MessageService{
    subject = new Subject<any>();

    send(message){
        this.subject.next({'message':message});
    }

    get():Observable<any>{
        return this.subject.asObservable();
    }
}
