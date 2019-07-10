import { StoreService } from './../../super/service/storeService';
import { AjaxService } from './../../super/service/ajaxService';
import { GlobalService } from '../../super/service/globalService';
import { ToolsService } from '../../super/service/toolsService';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';
import { AbstractControl, FormBuilder, FormGroup, Validators, EmailValidator } from '@angular/forms';
import config from '../../../config';
import { TranslateService } from '@ngx-translate/core';

declare const window: any;
declare const $:any;
@Component({
	selector: 'login',
	templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
    validateForm: FormGroup;
    validateEmailForm:FormGroup;

	uuid: string;
	LCType: string;
	config: object;
	imgUrl: string;
	menuShow: boolean = false;
	login: boolean = false;
	mask: boolean = false;
    bannerIndex: number = 0;
    tabIndex:number = 0;
	constructor(
		private fb: FormBuilder,
		private router: Router,
		private globalService: GlobalService,
		private ajaxService: AjaxService,
		private nzMessageService: NzMessageService,
		private storeService: StoreService,
		private translate: TranslateService,
		private routes: ActivatedRoute,
		public toolsService: ToolsService
	) {
		let langs = [ 'zh', 'en' ];
		this.translate.addLangs(langs);
		this.translate.setDefaultLang('zh');
		let curLang = localStorage.getItem('lang');
		if (langs.includes(curLang)) {
			this.translate.use(curLang);
		} else {
			this.translate.use('zh');
		}

		this.routes.queryParams.subscribe((params) => {
			let { LCID, LCTYPE, TOKEN } = params;
			if (LCID && LCTYPE && TOKEN) {
				sessionStorage.setItem('LCID', LCID);
				localStorage.setItem('token_'+LCID, TOKEN);
				sessionStorage.setItem('LCTYPE', LCTYPE);
				this.LCType = LCTYPE;
				this.router.navigateByUrl(`/report/${LCTYPE}`);
			}
		});
	}

	ngOnInit(): void {
		// this.router.navigateByUrl('/report/project');
		this.toolsService['visible']=false;
		this.toolsService.baseThead.length=0;
		this.toolsService.geneCount=0;
		this.toolsService.geneType='';
		this.toolsService.isRelation=false;
		this.toolsService.mongoId='';
		this.toolsService.relativeGeneCount=0;
		this.toolsService.srcTotal=0;
		this.toolsService.tableEntity={};
		this.toolsService.tableUrl='';
		$('.cdk-overlay-pane').remove();
		$('.ant-drawer').removeClass('ant-drawer-open');

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

        this.validateEmailForm = this.fb.group({
            email: [ null, [ Validators.required ,Validators.email] ],
			password: [ null, [ Validators.required ] ],
			verificationCode: [ null, [ Validators.required ] ]
        })
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

	// LCID登录
	submitLCIDForm() {
		for (const i in this.validateForm.controls) {
			this.validateForm.controls[i].markAsDirty();
			this.validateForm.controls[i].updateValueAndValidity();
		}

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
							localStorage.setItem('token_'+this.validateForm.value.userName, data['data'].token);
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

    // 邮箱
    submitEmailForm() {
		for (const i in this.validateEmailForm.controls) {
			this.validateEmailForm.controls[i].markAsDirty();
			this.validateEmailForm.controls[i].updateValueAndValidity();
		}

		// sessionStorage.setItem( "LCID", this.validateEmailForm.value.userName );
		// localStorage.setItem("token",'123');
		// this.LCType = 'mrna';
		// this.router.navigateByUrl(`/report/mrna`);
		// this.storeService.setStore("LCType", this.LCType);

		if (
			this.validateEmailForm.controls['password']['valid'] &&
			this.validateEmailForm.controls['email']['valid'] &&
			this.validateEmailForm.controls['verificationCode']['valid']
		) {
			this.ajaxService
				.getDeferDataNoAuth({
					data: {
						LCID: this.validateEmailForm.value.email,
						Password: this.validateEmailForm.value.password,
						code: this.validateEmailForm.value.verificationCode,
						uuid: this.uuid
					},
					url: `${config['javaPath']}/login`
				})
				.subscribe(
					(data) => {
						if (data['status'] == '0') {
							sessionStorage.setItem('LCID', this.validateEmailForm.value.email);
							localStorage.setItem('token_'+this.validateEmailForm.value.email, data['data'].token);
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
