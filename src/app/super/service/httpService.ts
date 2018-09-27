import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import config from '../../../config';

@Injectable()
export class HttpInterService implements HttpInterceptor {
    skipAuth: string[];
    constructor() {
        // 需要跳过的拦截列表
        this.skipAuth = [
            `${config['url']}/User/login`,
        ];
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authReq;
        if (this.isSkipAuth(req.url)) {
            authReq = req.clone();
        } else {
            authReq = req.clone({
                headers: req.headers.set('Authorization', 'token 123')
            });
        }
        return next.handle(authReq);
    }

    isSkipAuth(url) {
        let isMatch = false;
        this.skipAuth.forEach(val => {
            if (!isMatch) {
                if (val == url) {
                    isMatch = true;
                }
            }
        })
        return isMatch;
    }
}
