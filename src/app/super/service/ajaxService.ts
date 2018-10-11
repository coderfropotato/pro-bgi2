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
                let head = {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                        "Authorization": `token ${token}`
                    })
                };
                this.http
                    .post(`${config["url"]}/swap_token`, null, head).subscribe(
                        res => {
                            localStorage.setItem("token", res["token"]);
                            let curHead = {
                                headers: new HttpHeaders({
                                    "Content-Type": "application/json",
                                    "Authorization": `token ${res["token"]}`
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
                        },
                        error => {
                            observer.complete();
                            console.log(error);
                        }
                    );
            } else {
                observer.complete();
                this.router.navigate(["sysError"]);
            }
        });
    }

    validTokenInLocal() {
        return !!localStorage.getItem("token");
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
