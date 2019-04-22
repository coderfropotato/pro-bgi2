import { StoreService } from './../../super/service/storeService';
import { AjaxService } from './../../super/service/ajaxService';
import { GlobalService } from '../../super/service/globalService';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import config from '../../../config';
import { TranslateService } from '@ngx-translate/core';

declare const window: any;
@Component({
	selector: 'login',
	templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
	@ViewChild('form') form: ElementRef;

	validateForm: FormGroup;
	uuid: string;
	LCType: string;
	config: object;
	imgUrl: string;
	menuShow: boolean = false;
	login: boolean = false;
    mask: boolean = false;
    bannerIndex:number = 0;
	constructor(
		private fb: FormBuilder,
		private router: Router,
		private globalService: GlobalService,
		private ajaxService: AjaxService,
		private nzMessageService: NzMessageService,
		private storeService: StoreService,
        private translate:TranslateService,
        private routes:ActivatedRoute,
	) {
		let langs = ['zh', 'en'];
		this.translate.addLangs(langs);
		this.translate.setDefaultLang('zh');
		let curLang = localStorage.getItem('lang');
		if(langs.includes(curLang)){
			this.translate.use(curLang)
		}else{
			this.translate.use('zh')
        }

        this.routes.queryParams.subscribe((params)=>{
            let {LCID,LCTYPE,TOKEN}  = params;
            if(LCID && LCTYPE && TOKEN) {
                sessionStorage.setItem('LCID', LCID);
                localStorage.setItem('token', TOKEN);
                sessionStorage.setItem('LCTYPE',LCTYPE);
                this.LCType = LCTYPE;
                this.router.navigateByUrl(`/report/${LCTYPE}`);
            }
        })
	}

	ngOnInit(): void {
		this.uuid = this.generateUuid();
		this.config = config;
		this.imgUrl = `${this.config['javaPath']}/checkImg/${this.uuid}`;
		window.localStorage.removeItem('token');
		window.sessionStorage.clear();

		this.validateForm = this.fb.group({
			userName: [ null, [ Validators.required ] ],
			password: [ null, [ Validators.required ] ],
			verificationCode: [ null, [ Validators.required ] ]
		});
	}

	generateUuid() {
		let s = [];
		let hexDigits = '0123456789abcdef';
		for (let i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = '4';
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
		s[8] = s[13] = s[18] = s[23] = '-';
		let uuid = s.join('');
		return uuid;
	}

	handlerVerificationClick() {
		this.uuid = this.generateUuid();
		this.imgUrl = `${this.config['javaPath']}/checkImg/${this.uuid}`;
	}

	// 登录
	submitForm() {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}

		// sessionStorage.setItem( "LCID", this.validateForm.value.userName );
		// localStorage.setItem("token",'123');
		// this.LCType = 'mrna';
		// this.router.navigateByUrl(`/report/mrna`);
		// this.storeService.setStore("LCType", this.LCType);

		if (
			this.validateForm.controls['password']['valid'] &&
			this.validateForm.controls['userName']['valid'] &&
			this.validateForm.controls['verificationCode']['valid']
		) {
			this.ajaxService
				.getDeferDataNoAuth({
					data: {
						LCID: this.validateForm.value.userName,
						Password: this.validateForm.value.password,
						code: this.validateForm.value.verificationCode,
						uuid: this.uuid
					},
					url: `${config['javaPath']}/login`
				})
				.subscribe(
					(data) => {
						if (data['status'] == '0') {
							sessionStorage.setItem('LCID', this.validateForm.value.userName);
							localStorage.setItem('token', data['data'].token);
							sessionStorage.setItem('LCTYPE', data['data'].LCType);
							this.LCType = data['data'].LCType;
							this.router.navigateByUrl(`/report/${data['data'].LCType}`);
						} else {
							this.nzMessageService.warning(data['message']);
							// 重新生成验证码
							this.handlerVerificationClick();
						}
					},
					(err) => {
						console.log(err);
					}
				);
		}
	}

	open() {
		this.mask = this.login = true;
	}

	close() {
		this.login = false;
		setTimeout(() => {
			this.mask = false;
		}, 300);
	}

	scroll(event) {
		if (event.target.scrollTop >= 200) {
			this.menuShow = true;
		} else {
			this.menuShow = false;
		}
	}

	boxClick(event) {
		event.stopPropagation();
	}
}
