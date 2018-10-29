import { AjaxService } from "./../../super/service/ajaxService";
import { GlobalService } from "../../super/service/globalService";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NzMessageService } from "ng-zorro-antd";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators
} from "@angular/forms";

import config from "../../../config";
@Component({
    selector: "login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
    validateForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private globalService: GlobalService,
        private ajaxService: AjaxService,
        private nzMessageService: NzMessageService
    ) {}

    ngOnInit(): void {
        window.localStorage.clear();
        window.sessionStorage.clear();

        this.validateForm = this.fb.group({
            userName: [null, [Validators.required]],
            password: [null, [Validators.required]],
            remember: [true]
        });
    }

    // 登录
    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }


        sessionStorage.setItem("LCID", 'demo');
        localStorage.setItem("token", '123456');
        this.router.navigateByUrl(`/report/mrna`);

        // this.ajaxService
        //     .getDeferDataNoAuth({
        //         data: {
        //             LCID: this.validateForm.value.userName,
        //             Password: this.validateForm.value.password
        //         },
        //         url: `${config["javaPath"]}/login`
        //     })
        //     .subscribe(
        //         (data) => {
        //             if(data['status']=='0'){
        //                 sessionStorage.setItem("LCID", this.validateForm.value.userName);
        //                 localStorage.setItem("token", data['data'].token);
        //                 this.router.navigateByUrl(`/report/${data['data'].LCType}`);
        //             }else{
        //                 this.nzMessageService.warning('账号或密码错误')
        //             }
        //         },
        //         err => {
        //             console.log(err);
        //         }
        //     );
    }
}
