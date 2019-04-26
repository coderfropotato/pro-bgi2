import { Component, OnInit, Input } from '@angular/core';
import { StoreService } from './../../super/service/storeService';
import { TranslateService } from '@ngx-translate/core';

declare const $: any;

@Component({
	selector: 'app-chart-export',
	template: `
        <nz-dropdown [nzPlacement]="'bottomRight'">  <!-- anticon-picture -->
            <i nz-dropdown class="iconfont  icon-xiazai" nz-tooltip nzTitle="{{'tableButton.export' | translate}}"></i>
            <ul nz-menu>
                <li nz-menu-item (click)="downLoadImage('image/png')">{{'tableButton.export_png' | translate}}</li>
                <li nz-menu-item (click)="downLoadImage('image/jpeg')">{{'tableButton.export_jpg' | translate}}</li>
                <li nz-menu-item (click)="downLoadImage('svg')">{{'tableButton.export_svg' | translate}}</li>
            </ul>
        </nz-dropdown>`,
	styles: []
})
export class ChartExportComponent implements OnInit {
	@Input() chartId: string;
    @Input() chartName: any;
    @Input() scale:boolean = true;

	constructor(private storeService: StoreService, private translate: TranslateService) {
		let browserLang = this.storeService.getLang();
		this.translate.use(browserLang);
	}

	ngOnInit() {}

	downLoadImage(type) {
		type = type ? type : 'image/png';
		var chartDiv = $('#' + this.chartId);
		var svgObj = chartDiv.children('svg');
		
		var svgArr=[];
		svgObj.each((i,d)=>{
			svgArr.push($(d).prop('outerHTML'));
		})

		var svgXml = chartDiv.prop('innerHTML');

		if(svgArr.length > 1){
			svgXml = `<svg style="font-family:Arial;" width='${chartDiv.width()}' height='${chartDiv.height()}' version="1.1" xmlns="http://www.w3.org/2000/svg">${chartDiv.prop('innerHTML')}</svg>`;
		}else{
			svgObj.attr('version', '1.1');
			svgObj.attr('xmlns', 'http://www.w3.org/2000/svg');
			svgObj.css('font-family', "Arial" );
		}

		var oDate = new Date();
		var date =
			oDate.getFullYear() +
			this.addZero(oDate.getMonth() + 1) +
			this.addZero(oDate.getDate()) +
			this.addZero(oDate.getHours()) +
			this.addZero(oDate.getMinutes());

		if (type != 'svg') {
			var image = new Image();
            var canvas = document.createElement('canvas');

            let scaleVal = 1;
            if(this.scale){
                if (chartDiv.width() + chartDiv.height() < 3000) scaleVal = 1.5;
            }

			canvas.width = chartDiv.width()*scaleVal;
            canvas.height = chartDiv.height()*scaleVal;

			var context = canvas.getContext('2d');
			context.fillStyle = '#ffffff';
			context.fillRect(0, 0, canvas.width, canvas.height);

			var svgBlob = new Blob([ svgXml ], { type: 'image/svg+xml;charset=utf-8' });
			image.src = URL.createObjectURL(svgBlob);

			image.onload = () => {
                context.drawImage(image, 0, 0, image.width, image.height,0, 0,image.width * scaleVal, image.height * scaleVal)
				var a = document.createElement('a');
				document.body.appendChild(a);
				canvas.toBlob(
					(blob) => {
						a.href = URL.createObjectURL(blob);
						type == 'image/png'
							? (a.download = this.chartName + '_' + date + '.png')
							: (a.download = this.chartName + '_' + date + '.jpg');
						a.click();
						a.remove();
					},
					type,
					1
				);
            };
		} else {
			var svgBlob = new Blob([ svgXml ], { type: 'image/svg+xml;charset=utf-8' });
			var href = URL.createObjectURL(svgBlob);
			var a = document.createElement('a');
			document.body.appendChild(a);
			a.href = href;
			a.download = this.chartName + '_' + date + '.svg';
			setTimeout(() => {
				a.click();
				a.remove();
			}, 200);
		}
	}

	addZero(n) {
		return n < 10 ? '0' + n : n;
	}
}
