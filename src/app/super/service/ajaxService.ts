import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import config from "../../../config";

@Injectable({
    providedIn: "root"
})
export class AjaxService {
    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    /**
     * @description 封装http请求 发起正式请求前先验证token
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-10
     * @param {*} params
     * @memberof ajaxService
     * new Promise(resolve,reject)
     */
    getDeferData(params: object): Observable<{}> {
        // 验证本地有没有token
        return new Observable(observer => {
            if (this.validTokenInLocal()) {
                let token = localStorage.getItem("token");
                let LCID = sessionStorage.getItem("LCID");
                let head = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        Authorization: `token ${token}`
                    })
                };
                // 验证token的合法性
                this.http
                    .post(`${config["javaPath"]}/swap_token`, { LCID }, head)
                    .subscribe(
                        res => {
                            if(res['status']!='0'){
                                observer.complete();
                                this.router.navigateByUrl("/reprot/sysError");
                            }else{
                                let curToken = res['data'][0]
                                localStorage.setItem("token", curToken);
                                let curHead = {
                                    headers: new HttpHeaders({
                                        "Content-Type": "application/json",
                                        Authorization: `token ${curToken}`
                                    })
                                };
                                return this.http
                                    .post(params["url"], params["data"], curHead)
                                    .subscribe(
                                        data => {
                                            observer.next(data);
                                            observer.complete();
                                        },
                                        error => {
                                            observer.error(error);
                                            observer.complete();
                                        }
                                    );
                            }
                        },
                        error => {
                            observer.complete();
                        }
                    );
            } else {
                observer.complete();
                this.router.navigateByUrl("/reprot/sysError");
            }
        });
    }

    /**
     * @description  每次请求验证 用户名 token 任一无效都error
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-11
     * @returns
     * @memberof AjaxService
     */
    validTokenInLocal() {
        return !!localStorage.getItem("token") && !!sessionStorage.getItem("LCID");

    }

    /**
     * @description 发起http请求 不验证token
     * @author Yangwd<277637411@qq.com>
     * @date 2018-10-10
     * @param {*} params
     * @returns
     * @memberof ajaxService
     */
    getDeferDataNoAuth(params) {
        let head = {
            headers: new HttpHeaders({
                "Content-Type": "application/json"
            })
        };
        return this.http.post(params["url"], params["data"], head);
    }
}
