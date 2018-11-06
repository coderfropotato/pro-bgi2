import { StoreService } from "./../../super/service/storeService";
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

declare const window: any;
@Component({
    selector: "login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
    validateForm: FormGroup;
    uuid: string;
    LCType: string;
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private globalService: GlobalService,
        private ajaxService: AjaxService,
        private nzMessageService: NzMessageService,
        private storeService: StoreService
    ) {}

    ngOnInit(): void {
        this.uuid = this.generateUuid();
        window.localStorage.clear();
        window.sessionStorage.clear();

        this.validateForm = this.fb.group({
            userName: [null, [Validators.required]],
            password: [null, [Validators.required]],
            verificationCode: [null, [Validators.required]]
        });
    }

    generateUuid() {
        let s = [];
        let hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
        s[8] = s[13] = s[18] = s[23] = "-";
        let uuid = s.join("");
        return uuid;
    }

    handlerVerificationClick() {
        this.uuid = this.generateUuid();
    }

    // 登录
    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }
        if (
            this.validateForm.controls["password"]["valid"] &&
            this.validateForm.controls["userName"]["valid"] &&
            this.validateForm.controls["verificationCode"]["valid"]
        ) {
            this.ajaxService
                .getDeferDataNoAuth({
                    data: {
                        LCID: this.validateForm.value.userName,
                        Password: this.validateForm.value.password,
                        code: this.validateForm.value.verificationCode,
                        uuid: this.uuid
                    },
                    url: `${config["javaPath"]}/login`
                })
                .subscribe(
                    data => {
                        if (data["status"] == "0") {
                            sessionStorage.setItem(
                                "LCID",
                                this.validateForm.value.userName
                            );
                            localStorage.setItem("token", data["data"].token);
                            this.LCType = data["data"].LCType;
                            this.router.navigateByUrl(
                                `/report/${data["data"].LCType}`
                            );

                            this.storeService.setStore("LCType", this.LCType);
                        } else {
                            this.nzMessageService.warning(data["message"]);
                            // 重新生成验证码
                            this.handlerVerificationClick();
                        }
                    },
                    err => {
                        console.log(err);
                    }
                );
        }
    }
}
