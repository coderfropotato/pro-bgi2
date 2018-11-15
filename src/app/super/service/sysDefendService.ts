import { Injectable } from "@angular/core";
import { Router, CanActivate, CanActivateChild } from "@angular/router";
import config from ".././../../config";

/**
 * @description 系统维护路由守卫
 * @author Yangwd<277637411@qq.com>
 * @date 2018-11-15
 * @export
 * @class sysDefendService
 * @implements {CanActivate}
 */
@Injectable()
export class SysDefendService implements CanActivate {
    constructor(public router: Router) {}

    canActivate(): boolean {
        if (config["sysDefend"]) {
            this.router.navigateByUrl("/report/sysDefend");
            return false;
        }
        return true;
    }

    canActivateChild(): boolean {
        if (config["sysDefend"]) {
            this.router.navigateByUrl("/report/sysDefend");
            return false;
        }
        return true;
    }
}
