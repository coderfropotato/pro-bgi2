import { Component, OnInit, Input } from '@angular/core';

declare const $: any;

@Component({
    selector: 'app-chart-export',
    template: `
        <nz-dropdown [nzPlacement]="'bottomRight'">
            <i nz-dropdown class="anticon anticon-picture" nz-tooltip nzTitle="导出"></i>
            <ul nz-menu>
                <li nz-menu-item (click)="downLoadImage('image/png')">导出 PNG 格式图片</li>
                <li nz-menu-item (click)="downLoadImage('image/jpeg')">导出 JPG 格式图片 </li>
                <li nz-menu-item (click)="downLoadImage('svg')">导出 SVG 格式文件 </li>
            </ul>
        </nz-dropdown>`,
    styles: []
})

export class ChartExportComponent implements OnInit {
    @Input() chartId: string;
    @Input() chartName: any;

    ngOnInit() { }

    downLoadImage(type) {
        type = type ? type : "image/png";
        var chartDiv = $("#" + this.chartId);
        var svgObj = chartDiv.find("svg:eq(0)");
        svgObj.attr('version', '1.1');
        svgObj.attr('xmlns', 'http://www.w3.org/2000/svg');
        svgObj.css('font-family', " 'Helvetica Neue', 'Luxi Sans', 'DejaVu Sans', Tahoma, 'Hiragino Sans GB', STHeiti, 'Microsoft YaHei'");

        var svgXml = svgObj.prop("outerHTML");
        var oDate = new Date();
        var date = oDate.getFullYear() + this.addZero(oDate.getMonth() + 1) + this.addZero(oDate.getDate()) + this.addZero(oDate.getHours()) + this.addZero(oDate.getMinutes());

        if (type != "svg") {
            var image = new Image();
            var canvas = document.createElement('canvas');
            canvas.width = svgObj.width();
            canvas.height = svgObj.height();

            var context = canvas.getContext('2d');
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);

            var svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
            image.src = URL.createObjectURL(svgBlob);

            image.onload =  () =>{
                context.drawImage(image, 0, 0);
                var a = document.createElement('a');
                document.body.appendChild(a);
                canvas.toBlob((blob) =>{
                    a.href = URL.createObjectURL(blob);
                    type == "image/png" ? a.download = this.chartName + '_' + date + ".png" : a.download = this.chartName + '_' + date + ".jpg";
                    a.click();
                    a.remove();
                }, type, 1);
            }
        } else {
            var svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
            var href = URL.createObjectURL(svgBlob);
            var a = document.createElement('a');
            document.body.appendChild(a);
            a.href = href;
            a.download = this.chartName + '_' + date + ".svg";
            setTimeout( ()=> {
                a.click();
                a.remove();
            }, 200);
        }
    }

    addZero(n) {
        return n < 10 ? '0' + n : n;
    }

}
