import { AjaxService } from "./../../super/service/ajaxService";
import { GlobalService } from "../../super/service/globalService";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators
} from "@angular/forms";

import config from '../../../config';
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
        private ajaxService: AjaxService
    ) {}

    ngOnInit(): void {
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

        // let LCTYPE = 'mrna';
        // sessionStorage.setItem("LCID", this.validateForm.value.userName);
        // localStorage.setItem("token", "123456");
        // this.router.navigateByUrl(`/report/${LCTYPE}`);

        this.ajaxService.getDeferDataNoAuth({
            data: {
                LCID: "demo",
                Pssword: "123456"
            },
            url:`${config['javaPath']}/login`
        }).subscribe(data=>{
            console.log(data);
            return;
        })
    }
}
