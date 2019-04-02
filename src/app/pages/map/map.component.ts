import { DomSanitizer } from '@angular/platform-browser';
import { AddColumnService } from './../../super/service/addColumnService';
import { StoreService } from './../../super/service/storeService';
import { PageModuleService } from './../../super/service/pageModuleService';
import { MessageService } from './../../super/service/messageService';
import { AjaxService } from 'src/app/super/service/ajaxService';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from 'src/app/super/service/globalService';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from './../../super/service/promptService';
import config from '../../../config';
import { GeneService } from './../../super/service/geneService';
import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

declare const d3: any;
declare const d4: any;
declare const Venn: any;
declare const $:any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styles: []
})
export class MapComponent{
	mapid:string = '';
	compareGroup:string = '';
	dirtyPathWayIframeUrl:string;
	pathWayIframeUrl:any;
	params:object = {};

	constructor(
		private message: MessageService,
			private ajaxService: AjaxService,
			private globalService: GlobalService,
			private storeService: StoreService,
			public pageModuleService: PageModuleService,
			private translate: TranslateService,
			private promptService: PromptService,
			private addColumnService: AddColumnService,
			private router: Router,
			private routes:ActivatedRoute,
			private geneService: GeneService,
			private sanitizer: DomSanitizer
	) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);

		this.routes.paramMap.subscribe((params) => {
			// {"lcid":"develop" ,"mapid": "04020", "compareGroup": "undefined", "tid": "c52f2af6134e431e88d75b72053554de", "geneType": "gene" }
			this.params = params['params'];
			let lcid = this.params['lcid'];
			let mapid = this.params['mapid'];
			let compareGroup = this.params['compareGroup'];
			let tid = this.params['tid'];
			let geneType = this.params['geneType'];
			this.mapid = mapid;
			if(tid!='undefined'){
				// 重分析内的map跳转
			}else{
				// 非重分析的map跳转   production test
				this.dirtyPathWayIframeUrl = `http://biosys.bgi.com/project/test/BGI_${lcid}/KEGG_PATHWAY/Pathway_enrichment/${compareGroup}/${compareGroup}_${geneType}_kegg_pathway_map/map${mapid}.html`
			}

			this.initIframe();
		});
	}

	initIframe(){
		this.pathWayIframeUrl = this.cleanUrl(this.dirtyPathWayIframeUrl);
		let oIframe = $("#mapIdIframe");
        oIframe.on("load", function() {
            let areas = oIframe.contents().find("map").children("area[target_gene]");
            areas.on("click", function() {
                let selectList = [];
                let select = $(this).attr("target_gene");
                if (select.indexOf(",") != -1) {
                    selectList = select.split(",");
                } else if (!select) {
                    selectList = [];
                } else {
                    selectList.push(select);
                }
            })
        })
	}

	cleanUrl(url:string):SafeUrl{
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

}
