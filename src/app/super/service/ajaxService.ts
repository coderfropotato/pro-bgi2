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

                // 如果系统维护了 那就跳系统维护
                if (config["sysDefend"]) {
                    this.router.navigateByUrl("/report/sysDefend");
                    return;
                }
                // 验证token的合法性
                this.http
                    .post(`${config["javaPath"]}/swap_token`, { LCID }, head)
                    .subscribe(
                        res => {
                            if (res["status"] != "0") {
                                observer.error('swap token status error');
                                observer.complete();
                                this.router.navigateByUrl("/reprot/sysError");
                            } else {
                                let curToken = res["data"][0];
                                localStorage.setItem("token", curToken);
                                let curHead = {
                                    headers: new HttpHeaders({
                                        "Content-Type": "application/json",
                                        Authorization: `token ${curToken}` // curToken
                                    })
                                };
                                return this.http
                                    .post(
                                        params["url"],
                                        params["data"],
                                        curHead
                                    )
                                    .subscribe(
                                        data => {
                                            observer.next(data);
                                            observer.complete();
                                        },
                                        error => {
                                            observer.error(`inner request error ${error}`);
                                            observer.complete();
                                        }
                                    );
                            }
                        },
                        error => {
                            observer.error('swap token request error');
                            observer.complete();
                            this.router.navigateByUrl("/reprot/sysError");
                        }
                    );
            } else {
                observer.error('local no token');
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
        return (
            !!localStorage.getItem("token") && !!sessionStorage.getItem("LCID")
        );
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

    validToken() {
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
                // 如果系统维护了 那就跳系统维护
                if (config["sysDefend"]) {
                    this.router.navigateByUrl("/report/sysDefend");
                    return;
                }
                // 验证token的合法性
                this.http
                    .post(`${config["javaPath"]}/swap_token`, { LCID }, head)
                    .subscribe(
                        res => {
                            if (res["status"] != "0") {
                                observer.error('swap token status error');
                                observer.complete();
                                this.router.navigateByUrl("/reprot/sysError");
                            } else {
                                let curToken = res["data"][0];
                                localStorage.setItem("token", curToken);
                                observer.next(200);
                                observer.complete();
                            }
                        },
                        error => {
                            observer.error('swap token request error');
                            observer.complete();
                            this.router.navigateByUrl("/reprot/sysError");
                        }
                    );
            } else {
                observer.error('local no token');
                observer.complete();
                this.router.navigateByUrl("/reprot/sysError");
            }
        });
    }
}
