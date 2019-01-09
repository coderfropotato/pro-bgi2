/**
 * @description 全局消息通信
 * @author Yangwd<277637411@qq.com>
 * @date 2018-09-29
 * @export
 * @class MessageService
 */
import { Injectable } from "@angular/core";
import { Observable, Subject, fromEvent } from "rxjs";
@Injectable({
    providedIn: "root"
})
export class MessageService {
    // 实例消息订阅
    subject = new Subject<any>();
    // 获取增删列的消息订阅
    addTheadSubject = new Subject<any>();
    // windowResize 主题
    windowResize = new Subject<any>();

    send(message) {
        this.subject.next({ message });
    }

    get(): Observable<any> {
        return this.subject.asObservable();
    }

    sendAddThead(thead) {
        this.addTheadSubject.next({ thead });
    }

    getAddThead(): Observable<any> {
        return this.addTheadSubject.asObservable();
    }

    sendResize(){
        this.windowResize.next({message:"resize"});
    }

    getResize(){
        return this.windowResize.asObservable();
    }

   
}
