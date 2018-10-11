import { GlobalService } from "../../super/service/globalService";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    Validators
} from "@angular/forms";

@Component({
    selector: "login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
    validateForm: FormGroup;

    submitForm(): void {
        for (const i in this.validateForm.controls) {
            this.validateForm.controls[i].markAsDirty();
            this.validateForm.controls[i].updateValueAndValidity();
        }

        sessionStorage.setItem('LCID',this.validateForm.value.userName);
        sessionStorage.setItem('PROJECT_TYPE',this.validateForm.value.userName);

        this.router.navigate([`/report/${this.validateForm.value.userName}`]);
    }

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private globalService: GlobalService
    ) {
    }

    ngOnInit(): void {
        this.validateForm = this.fb.group({
            userName: [null, [Validators.required]],
            password: [null, [Validators.required]],
            remember: [true]
        });
    }
}
